package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.EventoAuditoriaResponse;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.EventoAuditoria;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.Pessoa;
import br.com.uphub.backend.repository.EventoAuditoriaRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuditoriaConsultaService {

    private static final ZoneId RECIFE = ZoneId.of("America/Recife");
    private static final int LIMITE_PADRAO = 100;
    private static final int LIMITE_MAXIMO = 500;
    private static final LocalDate COMECO = LocalDate.of(2000, 1, 1);
    private static final LocalDate FIM = LocalDate.of(2100, 1, 1);

    private final EventoAuditoriaRepository repository;
    private final OportunidadeRepository oportunidadeRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final PessoaRepository pessoaRepository;
    private final CandidaturaService candidaturaService;
    private final Acesso acesso;

    public AuditoriaConsultaService(EventoAuditoriaRepository repository,
                                    OportunidadeRepository oportunidadeRepository,
                                    OrganizacaoRepository organizacaoRepository,
                                    PessoaRepository pessoaRepository,
                                    CandidaturaService candidaturaService,
                                    Acesso acesso) {
        this.repository = repository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.pessoaRepository = pessoaRepository;
        this.candidaturaService = candidaturaService;
        this.acesso = acesso;
    }

    // ?acao=&desde=&ate=&limite= (datas "AAAA-MM-DD", inclusive, na hora do Recife)
    public record Filtros(String acao, OffsetDateTime desde, OffsetDateTime ate, int limite) {
    }

    public Filtros filtros(String acao, String desde, String ate, Integer limite) {
        String acaoLimpa = acao == null || acao.isBlank() ? null : acao.trim();
        if (acaoLimpa != null && !AuditoriaService.ACOES.contains(acaoLimpa)) {
            throw erro(HttpStatus.BAD_REQUEST, "Ação desconhecida: " + acaoLimpa);
        }
        LocalDate de = data(desde, "desde", COMECO);
        LocalDate diaAte = data(ate, "ate", FIM);
        if (de.isAfter(diaAte)) {
            throw erro(HttpStatus.BAD_REQUEST, "A data desde não pode ser depois da data ate");
        }
        int lim = limite == null ? LIMITE_PADRAO : limite;
        if (lim < 1 || lim > LIMITE_MAXIMO) {
            throw erro(HttpStatus.BAD_REQUEST, "O limite vai de 1 a " + LIMITE_MAXIMO);
        }
        return new Filtros(acaoLimpa,
                de.atStartOfDay(RECIFE).toOffsetDateTime(),
                diaAte.plusDays(1).atStartOfDay(RECIFE).toOffsetDateTime(),
                lim);
    }

    // os membros da organização e a gestão
    @Transactional(readOnly = true)
    public List<EventoAuditoriaResponse> daOrganizacao(Long organizacaoId, Filtros f, Long pessoaId) {
        if (!organizacaoRepository.existsById(organizacaoId)) {
            throw erro(HttpStatus.NOT_FOUND, "Organização não encontrada");
        }
        acesso.exigirAcesso(pessoaId, organizacaoId);
        return comNomes(repository.daOrganizacao(organizacaoId, f.acao(), f.desde(), f.ate(), f.limite()));
    }

    // só o provedor dono (CONDUZIR_SELECAO) e a gestão
    @Transactional(readOnly = true)
    public List<EventoAuditoriaResponse> daOportunidade(Long oportunidadeId, Filtros f, Long pessoaId) {
        Oportunidade oportunidade = oportunidadeRepository.findById(oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
        if (!acesso.ehGestao(pessoaId)) {
            acesso.exigir(pessoaId, oportunidade.getOrganizacaoId(), Permissao.CONDUZIR_SELECAO);
        }
        return comNomes(repository.daOportunidade(oportunidadeId, f.acao(), f.desde(), f.ate(), f.limite()));
    }

    // quem já pode ver a candidatura (a regra é a mesma do GET /api/candidaturas/{id})
    @Transactional(readOnly = true)
    public List<EventoAuditoriaResponse> daCandidatura(Long candidaturaId, Filtros f, Long pessoaId) {
        Candidatura candidatura = candidaturaService.paraLeitura(candidaturaId, pessoaId);
        return comNomes(repository.daCandidatura(candidatura.getId(), f.acao(), f.desde(), f.ate(), f.limite()));
    }

    // busca o nome de todos os autores de uma vez (uma consulta, não uma por evento)
    private List<EventoAuditoriaResponse> comNomes(List<EventoAuditoria> eventos) {
        List<Long> ids = eventos.stream().map(EventoAuditoria::getAutorPessoaId)
                .filter(Objects::nonNull).distinct().toList();
        Map<Long, String> nomes = pessoaRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Pessoa::getId, Pessoa::getNome));
        return eventos.stream().map(e -> EventoAuditoriaResponse.de(e, nomes)).toList();
    }

    private LocalDate data(String valor, String campo, LocalDate padrao) {
        if (valor == null || valor.isBlank()) {
            return padrao;
        }
        try {
            return LocalDate.parse(valor.trim());
        } catch (DateTimeParseException e) {
            throw erro(HttpStatus.BAD_REQUEST, "Data inválida em " + campo + ". Use AAAA-MM-DD");
        }
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
