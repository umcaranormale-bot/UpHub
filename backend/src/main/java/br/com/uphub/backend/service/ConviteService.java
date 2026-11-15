package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.AceiteConviteRequest;
import br.com.uphub.backend.dto.ConviteCadastroRequest;
import br.com.uphub.backend.dto.ConviteResponse;
import br.com.uphub.backend.dto.ConviteValidacaoResponse;
import br.com.uphub.backend.dto.LoginResponse;
import br.com.uphub.backend.dto.RecusaConviteRequest;
import br.com.uphub.backend.model.Convite;
import br.com.uphub.backend.model.Organizacao;
import br.com.uphub.backend.model.Pessoa;
import br.com.uphub.backend.model.Vinculo;
import br.com.uphub.backend.repository.ConviteRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.VinculoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class ConviteService {

    private static final Set<String> PAPEIS = Set.of("AVALIADOR", "MENTOR");
    private static final int DIAS_PARA_EXPIRAR = 7;

    private final ConviteRepository conviteRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final PessoaRepository pessoaRepository;
    private final VinculoRepository vinculoRepository;
    private final CodigoSeguro codigoSeguro;
    private final EnvioEmail envioEmail;
    private final PasswordEncoder passwordEncoder;
    private final LoginService loginService;
    private final String frontUrl;

    public ConviteService(ConviteRepository conviteRepository,
                          OrganizacaoRepository organizacaoRepository,
                          PessoaRepository pessoaRepository,
                          VinculoRepository vinculoRepository,
                          CodigoSeguro codigoSeguro,
                          EnvioEmail envioEmail,
                          PasswordEncoder passwordEncoder,
                          LoginService loginService,
                          @Value("${uphub.front.url}") String frontUrl) {
        this.conviteRepository = conviteRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.pessoaRepository = pessoaRepository;
        this.vinculoRepository = vinculoRepository;
        this.codigoSeguro = codigoSeguro;
        this.envioEmail = envioEmail;
        this.passwordEncoder = passwordEncoder;
        this.loginService = loginService;
        String url = frontUrl.trim();
        this.frontUrl = url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    @Transactional
    public ConviteResponse cadastrar(ConviteCadastroRequest dados) {
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
        Organizacao organizacao = organizacaoRepository.findById(organizacaoId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));
        Long enviadoPor = dados.enviadoPor();
        if (enviadoPor == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo enviadoPor é obrigatório");
        }
        Pessoa remetente = pessoaRepository.findById(enviadoPor)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Pessoa que está enviando não encontrada"));
        if (!vinculoRepository.existsByPessoa_IdAndOrganizacao_Id(enviadoPor, organizacaoId)) {
            throw erro(HttpStatus.FORBIDDEN, "Esta pessoa não tem vínculo com esta organização");
        }

        Convite aberto = conviteRepository
                .findFirstByOrganizacaoIdAndPapelAndEmailIgnoreCaseAndSituacao(organizacaoId, papel, email, "AGUARDANDO")
                .orElse(null);
        if (aberto != null) {
            if (!aberto.vencido()) {
                throw erro(HttpStatus.CONFLICT, "Já existe um convite aguardando para este e-mail e papel");
            }
            aberto.expirar();
            conviteRepository.saveAndFlush(aberto);
        }

        String codigo = codigoSeguro.tokenDeLink();
        Convite convite = conviteRepository.save(new Convite(email, papel, organizacaoId, enviadoPor,
                OffsetDateTime.now().plusDays(DIAS_PARA_EXPIRAR), codigoSeguro.hash(codigo)));

        String link = frontUrl + "/convite?codigo=" + codigo;
        String funcao = "AVALIADOR".equals(papel) ? "avaliador(a)" : "mentor(a)";
        envioEmail.enviar(email, "Você recebeu um convite no Up Hub",
                "Olá.\n\n"
                        + remetente.getNome() + ", da " + organizacao.getNome()
                        + ", convidou você para ser " + funcao + " no Up Hub.\n\n"
                        + "Para aceitar ou recusar, abra o link abaixo. Ele vale por "
                        + DIAS_PARA_EXPIRAR + " dias:\n\n"
                        + link + "\n\n"
                        + "Se você não esperava este convite, pode ignorar este e-mail.");

        return ConviteResponse.de(convite);
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

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public ConviteValidacaoResponse validar(String codigo) {
        Convite convite = conviteAberto(codigo);
        Organizacao organizacao = organizacaoRepository.findById(convite.getOrganizacaoId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));
        String convidadoPor = pessoaRepository.findById(convite.getEnviadoPor())
                .map(Pessoa::getNome)
                .orElse(null);
        boolean contaExistente = pessoaRepository.findByEmailIgnoreCase(convite.getEmail())
                .filter(p -> p.getExcluidaEm() == null)
                .isPresent();
        return new ConviteValidacaoResponse(organizacao.getNome(), convidadoPor, convite.getPapel(),
                convite.getEmail(), convite.getExpiraEm(), contaExistente);
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public LoginResponse aceitar(AceiteConviteRequest dados) {
        Convite convite = conviteAberto(dados.codigo());
        if (dados.senha() == null || dados.senha().isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo senha é obrigatório");
        }
        String senha = dados.senha().trim();
        Organizacao organizacao = organizacaoRepository.findById(convite.getOrganizacaoId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));

        Pessoa pessoa = pessoaRepository.findByEmailIgnoreCase(convite.getEmail()).orElse(null);
        if (pessoa != null) {
            if (pessoa.getExcluidaEm() != null) {
                throw erro(HttpStatus.CONFLICT, "A conta deste e-mail foi excluída");
            }
            if (!passwordEncoder.matches(senha, pessoa.getSenhaHash())) {
                throw erro(HttpStatus.UNAUTHORIZED, "Senha incorreta");
            }
            if (vinculoRepository.existsByPessoa_IdAndOrganizacao_Id(pessoa.getId(), organizacao.getId())) {
                throw erro(HttpStatus.CONFLICT, "Você já tem vínculo com esta organização");
            }
        } else {
            String nome = obrigatorio(dados.nome(), "nome", 160);
            if (senha.length() < 8) {
                throw erro(HttpStatus.BAD_REQUEST, "A senha precisa ter pelo menos 8 caracteres");
            }
            if (senha.length() > 72) {
                throw erro(HttpStatus.BAD_REQUEST, "O campo senha aceita no máximo 72 caracteres");
            }
            pessoa = pessoaRepository.save(
                    new Pessoa(nome, convite.getEmail(), null, passwordEncoder.encode(senha)));
        }

        pessoa.confirmarEmail();
        vinculoRepository.save(new Vinculo(pessoa, organizacao, convite.getPapel(), null, false));
        convite.aceitar(pessoa.getId());
        return loginService.abrirSessao(pessoa);
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public void recusar(RecusaConviteRequest dados) {
        Convite convite = conviteAberto(dados.codigo());
        convite.recusar();
    }

    private Convite conviteAberto(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo codigo é obrigatório");
        }
        Convite convite = conviteRepository.findByTokenHash(codigoSeguro.hash(codigo.trim()))
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Convite não encontrado"));
        if (convite.aguardando() && convite.vencido()) {
            convite.expirar();
            conviteRepository.save(convite);
        }
        switch (convite.getSituacao()) {
            case "ACEITO" -> throw erro(HttpStatus.CONFLICT, "Este convite já foi aceito");
            case "RECUSADO" -> throw erro(HttpStatus.CONFLICT, "Este convite já foi recusado");
            case "EXPIRADO" -> throw erro(HttpStatus.GONE, "Este convite expirou. Peça um novo a quem convidou você");
            default -> { }
        }
        return convite;
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