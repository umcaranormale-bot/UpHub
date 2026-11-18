package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.OportunidadeCadastroRequest;
import br.com.uphub.backend.dto.OportunidadeResponse;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.OrganizacaoTrilhaId;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.OrganizacaoTrilhaRepository;
import br.com.uphub.backend.repository.TrilhaRepository;
import java.util.List;
import java.util.Locale;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OportunidadeService {

    private final OportunidadeRepository oportunidadeRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final TrilhaRepository trilhaRepository;
    private final OrganizacaoTrilhaRepository organizacaoTrilhaRepository;
    private final Acesso acesso;

    public OportunidadeService(OportunidadeRepository oportunidadeRepository,
                               OrganizacaoRepository organizacaoRepository,
                               TrilhaRepository trilhaRepository,
                               OrganizacaoTrilhaRepository organizacaoTrilhaRepository,
                               Acesso acesso) {
        this.oportunidadeRepository = oportunidadeRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.trilhaRepository = trilhaRepository;
        this.organizacaoTrilhaRepository = organizacaoTrilhaRepository;
        this.acesso = acesso;
    }

    @Transactional
    public OportunidadeResponse cadastrar(OportunidadeCadastroRequest dados, Long criadaPor) {
        // 1. campos obrigatórios (400)
        String titulo = obrigatorio(dados.titulo(), "titulo", 200);
        String trilhaCodigo = obrigatorio(dados.trilhaCodigo(), "trilhaCodigo", 20).toUpperCase(Locale.ROOT);
        Long organizacaoId = dados.organizacaoId();
        if (organizacaoId == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo organizacaoId é obrigatório");
        }
        String resumo = (dados.resumo() == null || dados.resumo().isBlank())
                ? null
                : dados.resumo().trim();

        // 2. o que precisa existir (404)
        if (!trilhaRepository.existsById(trilhaCodigo)) {
            throw erro(HttpStatus.NOT_FOUND, "Trilha não encontrada");
        }
        if (!organizacaoRepository.existsById(organizacaoId)) {
            throw erro(HttpStatus.NOT_FOUND, "Organização não encontrada");
        }

        // 3. permissão (403)
        acesso.exigir(criadaPor, organizacaoId, Permissao.CRIAR_OPORTUNIDADE);
        if (!organizacaoTrilhaRepository.existsById(new OrganizacaoTrilhaId(organizacaoId, trilhaCodigo))) {
            throw erro(HttpStatus.FORBIDDEN, "Esta organização não atua na trilha " + trilhaCodigo);
        }

        Oportunidade oportunidade = new Oportunidade(organizacaoId, trilhaCodigo, titulo, resumo, criadaPor);

        return OportunidadeResponse.de(oportunidadeRepository.save(oportunidade));
    }

    @Transactional(readOnly = true)
    public List<OportunidadeResponse> listarPorOrganizacao(Long organizacaoId, Long pessoaId) {
        if (organizacaoId == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O parâmetro organizacaoId é obrigatório");
        }
        if (!organizacaoRepository.existsById(organizacaoId)) {
            throw erro(HttpStatus.NOT_FOUND, "Organização não encontrada");
        }
        // quem é da organização (ou da gestão) vê os rascunhos; os outros, só o que já foi publicado
        List<Oportunidade> oportunidades = acesso.podeVer(pessoaId, organizacaoId)
                ? oportunidadeRepository.findByOrganizacaoId(organizacaoId)
                : oportunidadeRepository.findByOrganizacaoIdAndEstadoNot(organizacaoId, "RASCUNHO");
        return oportunidades.stream()
                .map(OportunidadeResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public OportunidadeResponse buscarPorId(Long id, Long pessoaId) {
        Oportunidade oportunidade = oportunidadeRepository.findById(id)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
        // rascunho de outra organização não aparece: responde como se não existisse
        if ("RASCUNHO".equals(oportunidade.getEstado()) && !acesso.podeVer(pessoaId, oportunidade.getOrganizacaoId())) {
            throw erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada");
        }
        return OportunidadeResponse.de(oportunidade);
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