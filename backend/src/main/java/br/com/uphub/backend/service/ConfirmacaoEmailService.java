package br.com.uphub.backend.service;

import br.com.uphub.backend.model.Pessoa;
import br.com.uphub.backend.model.TokenPessoa;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.TokenPessoaRepository;
import java.time.OffsetDateTime;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ConfirmacaoEmailService {

    private static final String FINALIDADE = "CONFIRMAR_EMAIL";
    private static final int HORAS_PARA_EXPIRAR = 24;
    private static final int SEGUNDOS_ENTRE_REENVIOS = 60;

    private final TokenPessoaRepository tokenRepository;
    private final PessoaRepository pessoaRepository;
    private final CodigoSeguro codigoSeguro;
    private final EnvioEmail envioEmail;

    public ConfirmacaoEmailService(TokenPessoaRepository tokenRepository,
                                   PessoaRepository pessoaRepository,
                                   CodigoSeguro codigoSeguro,
                                   EnvioEmail envioEmail) {
        this.tokenRepository = tokenRepository;
        this.pessoaRepository = pessoaRepository;
        this.codigoSeguro = codigoSeguro;
        this.envioEmail = envioEmail;
    }

    /** Chamado pelo cadastro e pelo reenvio: cancela o código ativo, cria outro e envia por e-mail. */
    @Transactional
    public void gerarEEnviar(Pessoa pessoa) {
        tokenRepository.findFirstByPessoaIdAndFinalidadeAndUsadoEmIsNullAndCanceladoEmIsNull(pessoa.getId(), FINALIDADE)
                .ifPresent(anterior -> {
                    anterior.cancelar();
                    tokenRepository.saveAndFlush(anterior);
                });

        String codigo = codigoSeguro.codigoDeSeisDigitos();
        tokenRepository.save(new TokenPessoa(pessoa.getId(), FINALIDADE, codigoSeguro.hash(codigo),
                OffsetDateTime.now().plusHours(HORAS_PARA_EXPIRAR)));

        envioEmail.enviar(pessoa.getEmail(), "Seu código de confirmação do Up Hub",
                "Olá, " + pessoa.getNome() + ".\n\n"
                        + "Seu código de confirmação é " + codigo + ".\n"
                        + "Ele vale por " + HORAS_PARA_EXPIRAR + " horas e só pode ser usado uma vez.\n\n"
                        + "Se você não criou uma conta no Up Hub, ignore este e-mail.");
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public void confirmar(String emailInformado, String codigoInformado) {
        Pessoa pessoa = buscarPessoa(emailInformado);
        if (codigoInformado == null || !codigoInformado.trim().matches("\\d{6}")) {
            throw erro(HttpStatus.BAD_REQUEST, "O código tem 6 números");
        }
        if (pessoa.emailConfirmado()) {
            throw erro(HttpStatus.CONFLICT, "Este e-mail já foi confirmado");
        }

        TokenPessoa token = tokenRepository
                .findFirstByPessoaIdAndFinalidadeAndUsadoEmIsNullAndCanceladoEmIsNull(pessoa.getId(), FINALIDADE)
                .orElseThrow(() -> erro(HttpStatus.BAD_REQUEST, "Não há código ativo. Peça um novo código"));
        if (token.expirado()) {
            throw erro(HttpStatus.BAD_REQUEST, "O código expirou. Peça um novo código");
        }
        if (token.esgotouTentativas()) {
            throw erro(HttpStatus.BAD_REQUEST, "Muitas tentativas erradas. Peça um novo código");
        }
        if (!token.getTokenHash().equals(codigoSeguro.hash(codigoInformado.trim()))) {
            token.registrarTentativaErrada();
            tokenRepository.save(token);
            throw erro(HttpStatus.BAD_REQUEST, "Código incorreto");
        }

        token.marcarUsado();
        pessoa.confirmarEmail();
    }

    @Transactional
    public void reenviar(String emailInformado) {
        Pessoa pessoa = buscarPessoa(emailInformado);
        if (pessoa.emailConfirmado()) {
            throw erro(HttpStatus.CONFLICT, "Este e-mail já foi confirmado");
        }
        tokenRepository.findFirstByPessoaIdAndFinalidadeAndUsadoEmIsNullAndCanceladoEmIsNull(pessoa.getId(), FINALIDADE)
                .filter(ativo -> ativo.getCriadoEm().isAfter(OffsetDateTime.now().minusSeconds(SEGUNDOS_ENTRE_REENVIOS)))
                .ifPresent(ativo -> {
                    throw erro(HttpStatus.TOO_MANY_REQUESTS, "Aguarde 1 minuto para pedir outro código");
                });
        gerarEEnviar(pessoa);
    }

    private Pessoa buscarPessoa(String emailInformado) {
        if (emailInformado == null || emailInformado.isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo email é obrigatório");
        }
        return pessoaRepository.findByEmailIgnoreCase(emailInformado.trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Nenhuma conta com este e-mail"));
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}