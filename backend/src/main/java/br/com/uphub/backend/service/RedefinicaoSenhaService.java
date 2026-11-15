package br.com.uphub.backend.service;

import br.com.uphub.backend.model.Pessoa;
import br.com.uphub.backend.model.TokenPessoa;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.TokenPessoaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Optional;

@Service
public class RedefinicaoSenhaService {

    private static final String FINALIDADE = "REDEFINIR_SENHA";
    private static final int MINUTOS_PARA_EXPIRAR = 60;
    private static final int SEGUNDOS_ENTRE_PEDIDOS = 60;
    private static final String LINK_INVALIDO = "Este link é inválido ou expirou. Peça um novo";

    private final TokenPessoaRepository tokenRepository;
    private final PessoaRepository pessoaRepository;
    private final CodigoSeguro codigoSeguro;
    private final EnvioEmail envioEmail;
    private final PasswordEncoder passwordEncoder;
    private final String frontUrl;

    public RedefinicaoSenhaService(TokenPessoaRepository tokenRepository,
                                   PessoaRepository pessoaRepository,
                                   CodigoSeguro codigoSeguro,
                                   EnvioEmail envioEmail,
                                   PasswordEncoder passwordEncoder,
                                   @Value("${uphub.front.url}") String frontUrl) {
        this.tokenRepository = tokenRepository;
        this.pessoaRepository = pessoaRepository;
        this.codigoSeguro = codigoSeguro;
        this.envioEmail = envioEmail;
        this.passwordEncoder = passwordEncoder;
        this.frontUrl = frontUrl.endsWith("/") ? frontUrl.substring(0, frontUrl.length() - 1) : frontUrl;
    }

    @Transactional
    public void solicitar(String emailInformado) {
        if (emailInformado == null || emailInformado.isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo email é obrigatório");
        }
        Pessoa pessoa = pessoaRepository.findByEmailIgnoreCase(emailInformado.trim().toLowerCase(Locale.ROOT))
                .filter(p -> p.getExcluidaEm() == null)
                .orElse(null);
        if (pessoa == null) {
            return;
        }

        Optional<TokenPessoa> ativo = tokenRepository
                .findFirstByPessoaIdAndFinalidadeAndUsadoEmIsNullAndCanceladoEmIsNull(pessoa.getId(), FINALIDADE);
        if (ativo.isPresent()
                && ativo.get().getCriadoEm().isAfter(OffsetDateTime.now().minusSeconds(SEGUNDOS_ENTRE_PEDIDOS))) {
            return;
        }
        ativo.ifPresent(anterior -> {
            anterior.cancelar();
            tokenRepository.saveAndFlush(anterior);
        });

        String token = codigoSeguro.tokenDeLink();
        tokenRepository.save(new TokenPessoa(pessoa.getId(), FINALIDADE, codigoSeguro.hash(token),
                OffsetDateTime.now().plusMinutes(MINUTOS_PARA_EXPIRAR)));

        String link = frontUrl + "/redefinir-senha?token=" + token;
        envioEmail.enviar(pessoa.getEmail(), "Crie uma senha nova no Up Hub",
                "Olá, " + pessoa.getNome() + ".\n\n"
                        + "Recebemos um pedido para criar uma senha nova para a sua conta.\n"
                        + "Abra o link abaixo. Ele vale por 1 hora e só pode ser usado uma vez:\n\n"
                        + link + "\n\n"
                        + "Se você não pediu, ignore este e-mail. A sua senha continua a mesma.");
    }

    @Transactional
    public void redefinir(String tokenInformado, String senhaInformada) {
        if (tokenInformado == null || tokenInformado.isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo token é obrigatório");
        }
        if (senhaInformada == null || senhaInformada.isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo senha é obrigatório");
        }
        String senha = senhaInformada.trim();
        if (senha.length() < 8) {
            throw erro(HttpStatus.BAD_REQUEST, "A senha precisa ter pelo menos 8 caracteres");
        }
        if (senha.length() > 72) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo senha aceita no máximo 72 caracteres");
        }

        TokenPessoa token = tokenRepository
                .findFirstByTokenHashAndFinalidadeAndUsadoEmIsNullAndCanceladoEmIsNull(
                        codigoSeguro.hash(tokenInformado.trim()), FINALIDADE)
                .orElseThrow(() -> erro(HttpStatus.BAD_REQUEST, LINK_INVALIDO));
        if (token.expirado()) {
            throw erro(HttpStatus.BAD_REQUEST, LINK_INVALIDO);
        }
        Pessoa pessoa = pessoaRepository.findById(token.getPessoaId())
                .filter(p -> p.getExcluidaEm() == null)
                .orElseThrow(() -> erro(HttpStatus.BAD_REQUEST, LINK_INVALIDO));

        token.marcarUsado();
        pessoa.trocarSenha(passwordEncoder.encode(senha));
        pessoa.confirmarEmail();
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}