package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.LoginRequest;
import br.com.uphub.backend.dto.LoginResponse;
import br.com.uphub.backend.dto.PessoaResponse;
import br.com.uphub.backend.dto.SessaoResponse;
import br.com.uphub.backend.dto.VinculoResponse;
import br.com.uphub.backend.model.Pessoa;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.VinculoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class LoginService {

    private static final String CREDENCIAIS_ERRADAS = "E-mail ou senha incorretos";

    private final PessoaRepository pessoaRepository;
    private final VinculoRepository vinculoRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenAcesso tokenAcesso;
    private final String hashFalso;

    public LoginService(PessoaRepository pessoaRepository, VinculoRepository vinculoRepository,
                        PasswordEncoder passwordEncoder, TokenAcesso tokenAcesso) {
        this.pessoaRepository = pessoaRepository;
        this.vinculoRepository = vinculoRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenAcesso = tokenAcesso;
        this.hashFalso = passwordEncoder.encode("conta-que-nao-existe");
    }

    @Transactional(readOnly = true)
    public LoginResponse entrar(LoginRequest dados) {
        if (dados.email() == null || dados.email().isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo email é obrigatório");
        }
        if (dados.senha() == null || dados.senha().isEmpty()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo senha é obrigatório");
        }
        String email = dados.email().trim().toLowerCase(Locale.ROOT);

        Pessoa pessoa = pessoaRepository.findByEmailIgnoreCase(email)
                .filter(p -> p.getExcluidaEm() == null)
                .orElse(null);

        if (pessoa == null) {
            passwordEncoder.matches(dados.senha(), hashFalso);
            throw erro(HttpStatus.UNAUTHORIZED, CREDENCIAIS_ERRADAS);
        }
        if (!passwordEncoder.matches(dados.senha(), pessoa.getSenhaHash())) {
            throw erro(HttpStatus.UNAUTHORIZED, CREDENCIAIS_ERRADAS);
        }
        if (!pessoa.emailConfirmado()) {
            throw erro(HttpStatus.FORBIDDEN, "Confirme seu e-mail antes de entrar");
        }

        TokenAcesso.TokenGerado token = tokenAcesso.gerar(pessoa.getId());
        return new LoginResponse(token.token(), token.expiraEm(),
                PessoaResponse.de(pessoa), vinculosAtivos(pessoa.getId()));
    }

    @Transactional(readOnly = true)
    public SessaoResponse sessao(String cabecalhoAuthorization) {
        String token = null;
        if (cabecalhoAuthorization != null && cabecalhoAuthorization.startsWith("Bearer ")) {
            token = cabecalhoAuthorization.substring("Bearer ".length());
        }
        Long pessoaId = tokenAcesso.pessoaIdDoToken(token);

        Pessoa pessoa = pessoaRepository.findById(pessoaId)
                .filter(p -> p.getExcluidaEm() == null)
                .orElseThrow(() -> erro(HttpStatus.UNAUTHORIZED, "Sessão inválida ou expirada. Entre de novo"));

        return new SessaoResponse(PessoaResponse.de(pessoa), vinculosAtivos(pessoaId));
    }

    private List<VinculoResponse> vinculosAtivos(Long pessoaId) {
        return vinculoRepository.listarPorPessoa(pessoaId).stream()
                .filter(v -> v.getEncerradoEm() == null)
                .map(VinculoResponse::de)
                .toList();
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}