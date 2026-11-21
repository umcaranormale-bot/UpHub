package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.NotificacaoResponse;
import br.com.uphub.backend.dto.QuantidadeResponse;
import br.com.uphub.backend.model.Notificacao;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.repository.NotificacaoRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import java.time.OffsetDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotificacaoService {

    private static final Logger LOG = LoggerFactory.getLogger(NotificacaoService.class);

    private final NotificacaoRepository repository;
    private final PessoaRepository pessoaRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final EnvioEmail envioEmail;

    public NotificacaoService(NotificacaoRepository repository,
                              PessoaRepository pessoaRepository,
                              OportunidadeRepository oportunidadeRepository,
                              EnvioEmail envioEmail) {
        this.repository = repository;
        this.pessoaRepository = pessoaRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.envioEmail = envioEmail;
    }

    // chamado pelos gatilhos. Só a PEDE_ACAO manda e-mail; se o e-mail falhar, a notificação fica salva
    @Transactional
    public void criar(Long pessoaId, Long oportunidadeId, String titulo, String mensagem, String tipo) {
        if (!Notificacao.PEDE_ACAO.equals(tipo) && !Notificacao.INFORMATIVA.equals(tipo)) {
            throw new IllegalArgumentException("Tipo de notificação inválido: " + tipo);
        }
        Notificacao notificacao = repository.save(new Notificacao(pessoaId, oportunidadeId, titulo, mensagem, tipo));
        if (Notificacao.PEDE_ACAO.equals(tipo)) {
            enviarEmail(notificacao);
        }
    }

    private void enviarEmail(Notificacao notificacao) {
        try {
            String email = pessoaRepository.findById(notificacao.getPessoaId()).orElseThrow().getEmail();
            envioEmail.enviar(email, notificacao.getTitulo(),
                    notificacao.getMensagem() == null ? notificacao.getTitulo() : notificacao.getMensagem());
            notificacao.marcarEmailEnviado(OffsetDateTime.now());
            repository.save(notificacao);
        } catch (RuntimeException e) {
            LOG.warn("E-mail da notificação {} não foi enviado: {}", notificacao.getId(), e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<NotificacaoResponse> listar(Long pessoaId, boolean somenteNaoLidas) {
        List<Notificacao> lista = somenteNaoLidas
                ? repository.findByPessoaIdAndLidaEmIsNullOrderByCriadaEmDescIdDesc(pessoaId)
                : repository.findByPessoaIdOrderByCriadaEmDescIdDesc(pessoaId);
        return lista.stream().map(this::resposta).toList();
    }

    @Transactional(readOnly = true)
    public QuantidadeResponse contarNaoLidas(Long pessoaId) {
        return new QuantidadeResponse(repository.countByPessoaIdAndLidaEmIsNull(pessoaId));
    }

    // 404 se não existe, 403 se é de outra pessoa
    @Transactional
    public NotificacaoResponse marcarLida(Long id, Long pessoaId) {
        Notificacao notificacao = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificação não encontrada"));
        if (!notificacao.getPessoaId().equals(pessoaId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Esta notificação é de outra pessoa");
        }
        notificacao.marcarLida(OffsetDateTime.now());
        return resposta(repository.save(notificacao));
    }

    @Transactional
    public QuantidadeResponse marcarTodasLidas(Long pessoaId) {
        return new QuantidadeResponse(repository.marcarTodasLidas(pessoaId));
    }

    private NotificacaoResponse resposta(Notificacao n) {
        String titulo = n.getOportunidadeId() == null ? null
                : oportunidadeRepository.findById(n.getOportunidadeId()).map(Oportunidade::getTitulo).orElse(null);
        return NotificacaoResponse.de(n, titulo);
    }
}