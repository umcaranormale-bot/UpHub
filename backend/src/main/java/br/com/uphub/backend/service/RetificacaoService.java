package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.RetificacaoRequest;
import br.com.uphub.backend.dto.RetificacaoResponse;
import br.com.uphub.backend.model.Avaliacao;
import br.com.uphub.backend.model.RetificacaoParecer;
import br.com.uphub.backend.repository.RetificacaoParecerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class RetificacaoService {

    private final RetificacaoParecerRepository retificacaoRepository;
    private final AvaliacaoService avaliacaoService;

    public RetificacaoService(RetificacaoParecerRepository retificacaoRepository, AvaliacaoService avaliacaoService) {
        this.retificacaoRepository = retificacaoRepository;
        this.avaliacaoService = avaliacaoService;
    }

    // só o texto do parecer muda; a decisão e as notas assinadas ficam como estão
    @Transactional
    public RetificacaoResponse retificar(Long avaliacaoId, RetificacaoRequest dados, Long pessoaId) {
        String parecer = texto(dados == null ? null : dados.parecerRetificado(), "parecerRetificado");
        String justificativa = texto(dados == null ? null : dados.justificativa(), "justificativa");
        Avaliacao avaliacao = avaliacaoService.paraLer(avaliacaoId, pessoaId);
        if (!avaliacaoService.ehDoAvaliadorLogado(avaliacao, pessoaId)) {
            throw erro(HttpStatus.FORBIDDEN, "Só o avaliador desta avaliação pode retificar o parecer");
        }
        if (!avaliacao.assinada()) {
            throw erro(HttpStatus.CONFLICT, "Antes de assinar, é só editar o parecer");
        }
        RetificacaoParecer retificacao = retificacaoRepository.save(
                new RetificacaoParecer(avaliacaoId, parecer, justificativa, pessoaId, OffsetDateTime.now()));
        return RetificacaoResponse.de(retificacao);
    }

    @Transactional(readOnly = true)
    public List<RetificacaoResponse> listar(Long avaliacaoId, Long pessoaId) {
        avaliacaoService.paraLer(avaliacaoId, pessoaId);
        return retificacaoRepository.findByAvaliacaoIdOrderByRetificadaEm(avaliacaoId).stream()
                .map(RetificacaoResponse::de)
                .toList();
    }

    private String texto(String valor, String campo) {
        if (valor == null || valor.isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo " + campo + " é obrigatório");
        }
        return valor.trim();
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
