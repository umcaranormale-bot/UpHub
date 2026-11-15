package br.com.uphub.backend.service;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import br.com.uphub.backend.dto.PessoaCadastroRequest;
import br.com.uphub.backend.dto.PessoaResponse;
import br.com.uphub.backend.model.Pessoa;
import br.com.uphub.backend.repository.PessoaRepository;

@Service
public class PessoaService {

    private final PessoaRepository pessoaRepository;
    private final PasswordEncoder passwordEncoder;
    private final ConfirmacaoEmailService confirmacaoEmailService;

    public PessoaService(PessoaRepository pessoaRepository, PasswordEncoder passwordEncoder,
                         ConfirmacaoEmailService confirmacaoEmailService) {
        this.pessoaRepository = pessoaRepository;
        this.passwordEncoder = passwordEncoder;
        this.confirmacaoEmailService = confirmacaoEmailService;
    }

    @Transactional
    public PessoaResponse cadastrar(PessoaCadastroRequest dados) {
        String nome = obrigatorio(dados.nome(), "nome", 160);
        String email = obrigatorio(dados.email(), "email", 254).toLowerCase(Locale.ROOT);
        String senha = obrigatorio(dados.senha(), "senha", 72);
        String telefone = opcional(dados.telefone(), "telefone", 20);

        if (!email.contains("@")) {
            throw erro(HttpStatus.BAD_REQUEST, "O e-mail é inválido");
        }
        if (senha.length() < 8) {
            throw erro(HttpStatus.BAD_REQUEST, "A senha precisa ter pelo menos 8 caracteres");
        }
        if (pessoaRepository.existsByEmailIgnoreCase(email)) {
            throw erro(HttpStatus.CONFLICT, "Este e-mail já está cadastrado");
        }

        Pessoa pessoa = pessoaRepository.save(new Pessoa(nome, email, telefone, passwordEncoder.encode(senha)));
        confirmacaoEmailService.gerarEEnviar(pessoa);
        return PessoaResponse.de(pessoa);
    }

    @Transactional(readOnly = true)
    public PessoaResponse buscarPorId(Long id) {
        return pessoaRepository.findById(id)
                .map(PessoaResponse::de)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Pessoa não encontrada"));
    }

    private String obrigatorio(String valor, String campo, int maximo) {
        if (valor == null || valor.isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo " + campo + " é obrigatório");
        }
        return limite(valor.trim(), campo, maximo);
    }

    private String opcional(String valor, String campo, int maximo) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return limite(valor.trim(), campo, maximo);
    }

    private String limite(String valor, String campo, int maximo) {
        if (valor.length() > maximo) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo " + campo + " aceita no máximo " + maximo + " caracteres");
        }
        return valor;
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}