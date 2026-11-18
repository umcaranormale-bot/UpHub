package br.com.uphub.backend.service;

import br.com.uphub.backend.candidatura.EtapaDoEnvio;
import br.com.uphub.backend.dto.AutorizacaoNotaRequest;
import br.com.uphub.backend.dto.AutorizacaoNotaResponse;
import br.com.uphub.backend.model.AutorizacaoNota;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.CandidaturaParticipanteId;
import br.com.uphub.backend.model.Pessoa;
import br.com.uphub.backend.model.ResultadoProva;
import br.com.uphub.backend.model.VersaoOportunidade;
import br.com.uphub.backend.repository.AutorizacaoNotaRepository;
import br.com.uphub.backend.repository.CandidaturaParticipanteRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.ResultadoProvaRepository;
import br.com.uphub.backend.seguranca.Acesso;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Order(20)
public class AutorizacaoNotaService implements EtapaDoEnvio {

    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final AutorizacaoNotaRepository autorizacaoRepository;
    private final ResultadoProvaRepository provaRepository;
    private final CandidaturaParticipanteRepository participanteRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final PessoaRepository pessoaRepository;
    private final CandidaturaService candidaturaService;
    private final Acesso acesso;

    public AutorizacaoNotaService(AutorizacaoNotaRepository autorizacaoRepository,
                                  ResultadoProvaRepository provaRepository,
                                  CandidaturaParticipanteRepository participanteRepository,
                                  OrganizacaoRepository organizacaoRepository,
                                  PessoaRepository pessoaRepository,
                                  CandidaturaService candidaturaService,
                                  Acesso acesso) {
        this.autorizacaoRepository = autorizacaoRepository;
        this.provaRepository = provaRepository;
        this.participanteRepository = participanteRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.pessoaRepository = pessoaRepository;
        this.candidaturaService = candidaturaService;
        this.acesso = acesso;
    }

    // a dona da nota autoriza o uso dela nesta candidatura
    @Transactional
    public AutorizacaoNotaResponse autorizar(Long candidaturaId, AutorizacaoNotaRequest dados, Long pessoaId) {
        if (dados == null || dados.resultadoProvaId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo resultadoProvaId é obrigatório");
        }
        Candidatura candidatura = candidaturaService.paraLeitura(candidaturaId, pessoaId);
        if (!"RASCUNHO".equals(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "Só dá para mudar isso enquanto a candidatura é rascunho");
        }
        exigirQueParticipa(candidatura, pessoaId);
        ResultadoProva prova = provaRepository.findById(dados.resultadoProvaId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Nota não encontrada"));
        if (!prova.getPessoaId().equals(pessoaId)) {
            throw erro(HttpStatus.FORBIDDEN, "Só a dona da nota autoriza o uso dela");
        }
        VersaoOportunidade versao = candidaturaService.versaoPublicada(candidatura);
        LocalDate validaAte = validaAte(prova.getDataProva(), versao);
        if (validaAte.isBefore(LocalDate.now())) {
            throw erro(HttpStatus.BAD_REQUEST, "Esta nota venceu em " + validaAte.format(DATA)
                    + ": nesta oportunidade, a nota vale " + versao.getValidadeNotaDias() + " dias");
        }
        if (autorizacaoRepository.existsByCandidaturaIdAndResultadoProvaId(candidaturaId, prova.getId())) {
            throw erro(HttpStatus.CONFLICT, "Esta nota já está autorizada nesta candidatura");
        }
        AutorizacaoNota autorizacao = autorizacaoRepository.save(new AutorizacaoNota(candidaturaId, prova, OffsetDateTime.now()));
        return resposta(autorizacao, versao);
    }

    @Transactional
    public void revogar(Long candidaturaId, Long autorizacaoId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.paraLeitura(candidaturaId, pessoaId);
        if (!"RASCUNHO".equals(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "Só dá para mudar isso enquanto a candidatura é rascunho");
        }
        AutorizacaoNota autorizacao = autorizacaoRepository.findByIdAndCandidaturaId(autorizacaoId, candidaturaId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Autorização não encontrada"));
        ResultadoProva prova = provaRepository.findById(autorizacao.getResultadoProvaId()).orElseThrow();
        if (!prova.getPessoaId().equals(pessoaId)) {
            throw erro(HttpStatus.FORBIDDEN, "Só a dona da nota tira a autorização");
        }
        autorizacaoRepository.delete(autorizacao);
    }

    @Transactional(readOnly = true)
    public List<AutorizacaoNotaResponse> listar(Long candidaturaId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.paraLeitura(candidaturaId, pessoaId);
        VersaoOportunidade versao = candidaturaService.versaoPublicada(candidatura);
        return autorizacaoRepository.findByCandidaturaIdOrderByAutorizadaEm(candidaturaId).stream()
                .map(a -> resposta(a, versao))
                .toList();
    }

    // no envio: com nota mínima, precisa de nota autorizada, todas dentro da validade, e a média chegando lá
    @Override
    public void conferir(Candidatura candidatura, VersaoOportunidade versao) {
        List<AutorizacaoNota> autorizacoes = autorizacaoRepository.findByCandidaturaIdOrderByAutorizadaEm(candidatura.getId());
        for (AutorizacaoNota a : autorizacoes) {
            LocalDate validaAte = validaAte(a.getDataProvaCongelada(), versao);
            if (validaAte.isBefore(LocalDate.now())) {
                throw erro(HttpStatus.BAD_REQUEST, "A nota de " + nomeDaDona(a) + " venceu em " + validaAte.format(DATA)
                        + ". Tire a autorização ou use uma nota mais recente");
            }
        }
        if (versao.getNotaMinima() == null) {
            return;
        }
        if (autorizacoes.isEmpty()) {
            throw erro(HttpStatus.BAD_REQUEST, "Esta oportunidade exige nota mínima " + versao.getNotaMinima()
                    + ": autorize o uso de pelo menos uma nota antes de enviar");
        }
        BigDecimal media = autorizacoes.stream().map(AutorizacaoNota::getNotaCongelada)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(autorizacoes.size()), 2, RoundingMode.HALF_UP);
        if (media.compareTo(versao.getNotaMinima()) < 0) {
            throw erro(HttpStatus.BAD_REQUEST, "A média das notas autorizadas (" + media
                    + ") não alcança a nota mínima da oportunidade (" + versao.getNotaMinima() + ")");
        }
    }

    // squad: participante da candidatura; outras organizações: quem tem vínculo com ela
    private void exigirQueParticipa(Candidatura candidatura, Long pessoaId) {
        boolean squad = organizacaoRepository.findById(candidatura.getOrganizacaoId())
                .map(o -> "SQUAD".equals(o.getTipo())).orElse(false);
        boolean participa = squad
                ? participanteRepository.existsById(new CandidaturaParticipanteId(candidatura.getId(), pessoaId))
                : acesso.ehMembro(pessoaId, candidatura.getOrganizacaoId());
        if (!participa) {
            throw erro(HttpStatus.FORBIDDEN, "Só quem participa da candidatura autoriza o uso da nota");
        }
    }

    private LocalDate validaAte(LocalDate dataProva, VersaoOportunidade versao) {
        return dataProva.plusDays(versao.getValidadeNotaDias());
    }

    private String nomeDaDona(AutorizacaoNota a) {
        return provaRepository.findById(a.getResultadoProvaId())
                .flatMap(p -> pessoaRepository.findById(p.getPessoaId()))
                .map(Pessoa::getNome).orElse("uma pessoa");
    }

    private AutorizacaoNotaResponse resposta(AutorizacaoNota a, VersaoOportunidade versao) {
        ResultadoProva prova = provaRepository.findById(a.getResultadoProvaId()).orElseThrow();
        String nome = pessoaRepository.findById(prova.getPessoaId()).map(Pessoa::getNome).orElse(null);
        return new AutorizacaoNotaResponse(a.getId(), a.getCandidaturaId(), a.getResultadoProvaId(), prova.getPessoaId(),
                nome, prova.getArea(), a.getNotaCongelada(), a.getDataProvaCongelada(),
                validaAte(a.getDataProvaCongelada(), versao), a.getAutorizadaEm());
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
