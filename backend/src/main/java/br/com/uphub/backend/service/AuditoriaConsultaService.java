package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.EventoAuditoriaResponse;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.repository.EventoAuditoriaRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuditoriaConsultaService {

    private final EventoAuditoriaRepository repository;
    private final OportunidadeRepository oportunidadeRepository;
    private final CandidaturaService candidaturaService;
    private final Acesso acesso;

    public AuditoriaConsultaService(EventoAuditoriaRepository repository,
                                    OportunidadeRepository oportunidadeRepository,
                                    CandidaturaService candidaturaService,
                                    Acesso acesso) {
        this.repository = repository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.candidaturaService = candidaturaService;
        this.acesso = acesso;
    }

    // só o provedor dono (CONDUZIR_SELECAO) e a gestão
    @Transactional(readOnly = true)
    public List<EventoAuditoriaResponse> daOportunidade(Long oportunidadeId, Long pessoaId) {
        Oportunidade oportunidade = oportunidadeRepository.findById(oportunidadeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
        if (!acesso.ehGestao(pessoaId)) {
            acesso.exigir(pessoaId, oportunidade.getOrganizacaoId(), Permissao.CONDUZIR_SELECAO);
        }
        return repository.findByOportunidadeIdOrderByOcorridoEmDescIdDesc(oportunidadeId)
                .stream().map(EventoAuditoriaResponse::de).toList();
    }

    // quem já pode ver a candidatura (a regra é a mesma do GET /api/candidaturas/{id})
    @Transactional(readOnly = true)
    public List<EventoAuditoriaResponse> daCandidatura(Long candidaturaId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.paraLeitura(candidaturaId, pessoaId);
        return repository.findByCandidaturaIdOrderByOcorridoEmDescIdDesc(candidatura.getId())
                .stream().map(EventoAuditoriaResponse::de).toList();
    }
}