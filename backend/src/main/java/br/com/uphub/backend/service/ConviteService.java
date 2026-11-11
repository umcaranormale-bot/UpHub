package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.ConviteCadastroRequest;
import br.com.uphub.backend.dto.ConviteCriadoResponse;
import br.com.uphub.backend.dto.ConviteResponse;
import br.com.uphub.backend.model.Convite;
import br.com.uphub.backend.repository.ConviteRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.VinculoRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
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
    private final VinculoRepository vinculoRepository;

    public ConviteService(ConviteRepository conviteRepository,
                          OrganizacaoRepository organizacaoRepository,
                          PessoaRepository pessoaRepository,
                          VinculoRepository vinculoRepository) {
        this.conviteRepository = conviteRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.pessoaRepository = pessoaRepository;
        this.vinculoRepository = vinculoRepository;
    }

    @Transactional
    public ConviteCriadoResponse cadastrar(ConviteCadastroRequest dados) {
        String email = obrigatorio(dados.email(), "email", 254).toLowerCase(Locale.ROOT);
        if (!email.contains("@")) {
            throw erro(HttpStatus.BAD_REQUEST, "O e-mail é inválido");
        }

        String papel = obrigatorio(dados.papel(), "papel", 20).toUpperCase(Locale.ROOT);
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
        if (!vinculoRepository.existsByPessoa_IdAndOrganizacao_Id(enviadoPor, organizacaoId)) {
            throw erro(HttpStatus.FORBIDDEN, "Esta pessoa não tem vínculo com esta organização");
        }

        Convite aberto = conviteRepository
                .findFirstByOrganizacaoIdAndPapelAndEmailIgnoreCaseAndSituacao(organizacaoId, papel, email, "AGUARDANDO")
                .orElse(null);
        if (aberto != null) {
            if (aberto.getExpiraEm().isAfter(OffsetDateTime.now())) {
                throw erro(HttpStatus.CONFLICT, "Já existe um convite aguardando para este e-mail e papel");
            }
            aberto.setSituacao("EXPIRADO");
            conviteRepository.saveAndFlush(aberto);
        }

        String codigo = UUID.randomUUID().toString().replace("-", "");
        Convite convite = new Convite(email, papel, organizacaoId, enviadoPor,
                OffsetDateTime.now().plusDays(DIAS_PARA_EXPIRAR), hash(codigo));

        return new ConviteCriadoResponse(ConviteResponse.de(conviteRepository.save(convite)), codigo);
    }

    @Transactional(readOnly = true)
    public List<ConviteResponse> listarPorOrganizacao(Long organizacaoId) {
        if (organizacaoId == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O parâmetro organizacaoId é obrigatório");
        }
        if (!organizacaoRepository.existsById(organizacaoId)) {
            throw erro(HttpStatus.NOT_FOUND, "Organização não encontrada");
        }
        return conviteRepository.findByOrganizacaoId(organizacaoId).stream()
                .map(ConviteResponse::de)
                .toList();
    }

    private String hash(String codigo) {
        try {
            byte[] bytes = MessageDigest.getInstance("SHA-256")
                    .digest(codigo.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponível", e);
        }
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