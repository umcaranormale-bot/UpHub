package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.ConviteCadastroRequest;
import br.com.uphub.backend.dto.ConviteResponse;
import br.com.uphub.backend.model.Convite;
import br.com.uphub.backend.repository.ConviteRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ConviteService {

    private static final Set<String> PAPEIS = Set.of("AVALIADOR", "MENTOR");
    private static final int DIAS_PARA_EXPIRAR = 7;

    private final ConviteRepository conviteRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final PessoaRepository pessoaRepository;

    public ConviteService(ConviteRepository conviteRepository,
                          OrganizacaoRepository organizacaoRepository,
                          PessoaRepository pessoaRepository) {
        this.conviteRepository = conviteRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.pessoaRepository = pessoaRepository;
    }

    @Transactional
    public ConviteResponse cadastrar(ConviteCadastroRequest dados) {
        String email = obrigatorio(dados.email(), "email", 254).toLowerCase();
        if (!email.contains("@")) {
            throw erro(HttpStatus.BAD_REQUEST, "O e-mail é inválido");
        }

        String papel = obrigatorio(dados.papel(), "papel", 20).toUpperCase();
        if (!PAPEIS.contains(papel)) {
            throw erro(HttpStatus.BAD_REQUEST, "Papel inválido. Use: AVALIADOR ou MENTOR");
        }

        Long organizacaoId = dados.organizacaoId();
        if (organizacaoId == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo organizacaoId é obrigatório");
        }
        if (!organizacaoRepository.existsById(organizacaoId)) {
            throw erro(HttpStatus.NOT_FOUND, "Organização não encontrada");
        }

        Long enviadoPor = dados.enviadoPor();
        if (enviadoPor == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo enviadoPor é obrigatório");
        }
        if (!pessoaRepository.existsById(enviadoPor)) {
            throw erro(HttpStatus.NOT_FOUND, "Pessoa que está enviando não encontrada");
        }

        if (conviteRepository.existsByOrganizacaoIdAndPapelAndEmailIgnoreCaseAndSituacao(
                organizacaoId, papel, email, "AGUARDANDO")) {
            throw erro(HttpStatus.CONFLICT, "Já existe um convite aguardando para este e-mail e papel");
        }

        Convite convite = new Convite();
        convite.setEmail(email);
        convite.setPapel(papel);
        convite.setOrganizacaoId(organizacaoId);
        convite.setEnviadoPor(enviadoPor);
        convite.setExpiraEm(OffsetDateTime.now().plusDays(DIAS_PARA_EXPIRAR));
        convite.setToken(UUID.randomUUID().toString().replace("-", ""));

        return ConviteResponse.de(conviteRepository.save(convite));
    }

    @Transactional(readOnly = true)
    public List<ConviteResponse> listarPorOrganizacao(Long organizacaoId) {
        return conviteRepository.findByOrganizacaoId(organizacaoId).stream()
                .map(ConviteResponse::de)
                .toList();
    }

    private String obrigatorio(String valor, String campo, int maximo) {
        if (valor == null || valor.isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo " + campo + " é obrigatório");
        }
        String limpo = valor.trim();
        if (limpo.length() > maximo) {
            throw erro(HttpStatus.BAD_REQUEST,
                    "O campo " + campo + " aceita no máximo " + maximo + " caracteres");
        }
        return limpo;
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}