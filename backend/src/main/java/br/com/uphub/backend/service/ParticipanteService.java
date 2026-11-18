package br.com.uphub.backend.service;

import br.com.uphub.backend.candidatura.EtapaDoEnvio;
import br.com.uphub.backend.dto.ParticipanteRequest;
import br.com.uphub.backend.dto.ParticipanteResponse;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.CandidaturaParticipante;
import br.com.uphub.backend.model.CandidaturaParticipanteId;
import br.com.uphub.backend.model.Organizacao;
import br.com.uphub.backend.model.Pessoa;
import br.com.uphub.backend.model.SquadIntegranteId;
import br.com.uphub.backend.model.VersaoOportunidade;
import br.com.uphub.backend.repository.CandidaturaParticipanteRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.SquadIntegranteRepository;
import br.com.uphub.backend.seguranca.Acesso;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Order(10)
public class ParticipanteService implements EtapaDoEnvio {

    private final CandidaturaParticipanteRepository participanteRepository;
    private final CandidaturaService candidaturaService;
    private final PessoaRepository pessoaRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final SquadIntegranteRepository squadIntegranteRepository;
    private final Acesso acesso;

    public ParticipanteService(CandidaturaParticipanteRepository participanteRepository,
                               CandidaturaService candidaturaService,
                               PessoaRepository pessoaRepository,
                               OrganizacaoRepository organizacaoRepository,
                               SquadIntegranteRepository squadIntegranteRepository,
                               Acesso acesso) {
        this.participanteRepository = participanteRepository;
        this.candidaturaService = candidaturaService;
        this.pessoaRepository = pessoaRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.squadIntegranteRepository = squadIntegranteRepository;
        this.acesso = acesso;
    }

    @Transactional
    public ParticipanteResponse adicionar(Long candidaturaId, ParticipanteRequest dados, Long pessoaLogadaId) {
        if (dados == null || dados.pessoaId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo pessoaId é obrigatório");
        }
        Candidatura candidatura = candidaturaService.rascunhoDoCandidato(candidaturaId, pessoaLogadaId);
        Pessoa pessoa = pessoaRepository.findById(dados.pessoaId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Pessoa não encontrada"));
        Organizacao organizacao = organizacao(candidatura);

        // squad: o participante é integrante da squad; outras organizações: tem vínculo com ela
        boolean podeParticipar = "SQUAD".equals(organizacao.getTipo())
                ? squadIntegranteRepository.existsById(new SquadIntegranteId(organizacao.getId(), pessoa.getId()))
                : acesso.ehMembro(pessoa.getId(), organizacao.getId());
        if (!podeParticipar) {
            throw erro(HttpStatus.BAD_REQUEST, "SQUAD".equals(organizacao.getTipo())
                    ? "Só integrantes da squad participam da candidatura"
                    : "Só quem tem vínculo com a organização participa da candidatura");
        }
        CandidaturaParticipanteId id = new CandidaturaParticipanteId(candidaturaId, pessoa.getId());
        if (participanteRepository.existsById(id)) {
            throw erro(HttpStatus.CONFLICT, "Esta pessoa já participa da candidatura");
        }
        CandidaturaParticipante participante = participanteRepository.save(
                new CandidaturaParticipante(candidaturaId, pessoa.getId(), OffsetDateTime.now()));
        return resposta(participante, pessoa.getNome());
    }

    // cada participante confirma por si, logado
    @Transactional
    public ParticipanteResponse confirmar(Long candidaturaId, Long pessoaLogadaId) {
        Candidatura candidatura = candidaturaService.paraLeitura(candidaturaId, pessoaLogadaId);
        CandidaturaParticipante participante = participanteRepository
                .findById(new CandidaturaParticipanteId(candidaturaId, pessoaLogadaId))
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Você não é participante desta candidatura"));
        if (!"RASCUNHO".equals(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "Só dá para mudar isso enquanto a candidatura é rascunho");
        }
        if (!participante.confirmou()) {
            participante.confirmar(OffsetDateTime.now());
        }
        return resposta(participante, nome(pessoaLogadaId));
    }

    @Transactional
    public void remover(Long candidaturaId, Long pessoaId, Long pessoaLogadaId) {
        candidaturaService.rascunhoDoCandidato(candidaturaId, pessoaLogadaId);
        CandidaturaParticipante participante = participanteRepository
                .findById(new CandidaturaParticipanteId(candidaturaId, pessoaId))
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Participante não encontrado"));
        participanteRepository.delete(participante);
    }

    @Transactional(readOnly = true)
    public List<ParticipanteResponse> listar(Long candidaturaId, Long pessoaLogadaId) {
        candidaturaService.paraLeitura(candidaturaId, pessoaLogadaId);
        List<CandidaturaParticipante> participantes = participanteRepository.findById_CandidaturaIdOrderByConviteEnviadoEm(candidaturaId);
        Map<Long, String> nomes = pessoaRepository.findAllById(participantes.stream().map(p -> p.getId().getPessoaId()).toList())
                .stream().collect(Collectors.toMap(Pessoa::getId, Pessoa::getNome));
        return participantes.stream().map(p -> resposta(p, nomes.get(p.getId().getPessoaId()))).toList();
    }

    // no envio: squad precisa de participantes, e todo participante precisa ter confirmado
    @Override
    public void conferir(Candidatura candidatura, VersaoOportunidade versao) {
        List<CandidaturaParticipante> participantes =
                participanteRepository.findById_CandidaturaIdOrderByConviteEnviadoEm(candidatura.getId());
        if ("SQUAD".equals(organizacao(candidatura).getTipo()) && participantes.isEmpty()) {
            throw erro(HttpStatus.BAD_REQUEST, "Adicione os integrantes da squad que participam antes de enviar");
        }
        List<String> faltam = participantes.stream().filter(p -> !p.confirmou())
                .map(p -> nome(p.getId().getPessoaId())).toList();
        if (!faltam.isEmpty()) {
            throw erro(HttpStatus.BAD_REQUEST, "Ainda falta confirmar a participação: " + String.join(", ", faltam));
        }
    }

    private Organizacao organizacao(Candidatura candidatura) {
        return organizacaoRepository.findById(candidatura.getOrganizacaoId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));
    }

    private String nome(Long pessoaId) {
        return pessoaRepository.findById(pessoaId).map(Pessoa::getNome).orElse(null);
    }

    private ParticipanteResponse resposta(CandidaturaParticipante p, String nome) {
        return new ParticipanteResponse(p.getId().getCandidaturaId(), p.getId().getPessoaId(), nome,
                p.getConviteEnviadoEm(), p.getConfirmouEm());
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
