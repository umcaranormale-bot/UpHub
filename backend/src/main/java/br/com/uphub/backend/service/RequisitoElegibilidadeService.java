package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.CampoElegibilidadeResponse;
import br.com.uphub.backend.dto.ElegibilidadeResponse;
import br.com.uphub.backend.dto.RequisitoCadastroRequest;
import br.com.uphub.backend.dto.RequisitoEdicaoRequest;
import br.com.uphub.backend.dto.RequisitoResponse;
import br.com.uphub.backend.elegibilidade.CampoElegibilidade;
import br.com.uphub.backend.elegibilidade.MotorElegibilidade;
import br.com.uphub.backend.elegibilidade.OperadorElegibilidade;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.Organizacao;
import br.com.uphub.backend.model.RequisitoElegibilidade;
import br.com.uphub.backend.model.VersaoOportunidade;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.RequisitoElegibilidadeRepository;
import br.com.uphub.backend.repository.VersaoOportunidadeRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.time.Year;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RequisitoElegibilidadeService {

    private static final JsonMapper JSON = JsonMapper.builder().build();

    private final RequisitoElegibilidadeRepository requisitoRepository;
    private final VersaoOportunidadeRepository versaoRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final Acesso acesso;

    public RequisitoElegibilidadeService(RequisitoElegibilidadeRepository requisitoRepository,
                                         VersaoOportunidadeRepository versaoRepository,
                                         OportunidadeRepository oportunidadeRepository,
                                         OrganizacaoRepository organizacaoRepository,
                                         Acesso acesso) {
        this.requisitoRepository = requisitoRepository;
        this.versaoRepository = versaoRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.acesso = acesso;
    }

    // a lista de campos e operadores que a tela de criar requisito oferece
    public List<CampoElegibilidadeResponse> campos() {
        return Arrays.stream(CampoElegibilidade.values())
                .map(c -> new CampoElegibilidadeResponse(c.name(), c.getDescricao(), c.getTipo().name(),
                        Arrays.stream(OperadorElegibilidade.values())
                                .filter(o -> !o.isSoNumero() || c.getTipo() == CampoElegibilidade.Tipo.NUMERO)
                                .map(Enum::name)
                                .toList()))
                .toList();
    }

    @Transactional
    public RequisitoResponse cadastrar(Long oportunidadeId, Long versaoId, RequisitoCadastroRequest dados, Long pessoaId) {
        VersaoOportunidade versao = buscarVersaoParaEscrita(oportunidadeId, versaoId, pessoaId);
        RegraValida regra = validarRegra(dados.campo(), dados.operador(), dados.valor());
        Short ordem = dados.ordem() != null ? validarOrdem(dados.ordem()) : proximaOrdem(versaoId);
        boolean obrigatoria = dados.obrigatoria() == null || dados.obrigatoria();

        RequisitoElegibilidade requisito = new RequisitoElegibilidade(versao, ordem,
                regra.campo().name(), regra.operador().name(), regra.json(), obrigatoria);
        return RequisitoResponse.de(requisitoRepository.save(requisito));
    }

    @Transactional(readOnly = true)
    public List<RequisitoResponse> listar(Long oportunidadeId, Long versaoId, Long pessoaId) {
        buscarVersaoVisivel(oportunidadeId, versaoId, pessoaId);
        return requisitoRepository.listarPorVersao(versaoId).stream()
                .map(RequisitoResponse::de)
                .toList();
    }

    @Transactional
    public RequisitoResponse editar(Long oportunidadeId, Long versaoId, Long requisitoId,
                                    RequisitoEdicaoRequest dados, Long pessoaId) {
        buscarVersaoParaEscrita(oportunidadeId, versaoId, pessoaId);
        RequisitoElegibilidade requisito = buscarRequisito(versaoId, requisitoId);

        // o que não veio fica como está; a regra resultante é conferida inteira
        if (dados.campo() != null || dados.operador() != null || dados.valor() != null) {
            RegraValida regra = validarRegra(
                    dados.campo() != null ? dados.campo() : requisito.getCampo(),
                    dados.operador() != null ? dados.operador() : requisito.getOperador(),
                    dados.valor() != null ? dados.valor() : lerJson(requisito.getValor()));
            requisito.trocarRegra(regra.campo().name(), regra.operador().name(), regra.json());
        }
        if (dados.obrigatoria() != null) {
            requisito.setObrigatoria(dados.obrigatoria());
        }
        if (dados.ordem() != null) {
            requisito.setOrdem(validarOrdem(dados.ordem()));
        }
        return RequisitoResponse.de(requisitoRepository.save(requisito));
    }

    @Transactional
    public void remover(Long oportunidadeId, Long versaoId, Long requisitoId, Long pessoaId) {
        buscarVersaoParaEscrita(oportunidadeId, versaoId, pessoaId);
        requisitoRepository.delete(buscarRequisito(versaoId, requisitoId));
    }

    // prévia: a organização confere, antes de se candidatar, se atende aos requisitos da versão
    @Transactional(readOnly = true)
    public ElegibilidadeResponse avaliar(Long oportunidadeId, Long versaoId, Long organizacaoId, Long pessoaId) {
        if (organizacaoId == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O parâmetro organizacaoId é obrigatório");
        }
        buscarVersaoVisivel(oportunidadeId, versaoId, pessoaId);
        Organizacao organizacao = organizacaoRepository.findById(organizacaoId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));
        acesso.exigirAcesso(pessoaId, organizacaoId);

        MotorElegibilidade.Resultado resultado = MotorElegibilidade.avaliar(
                perfil(organizacao, Year.now()), regras(versaoId));
        return new ElegibilidadeResponse(organizacaoId, versaoId, resultado.situacao(),
                resultado.requisitos(), resultado.faltou());
    }

    // usado também pela candidatura (V19/V22), no envio
    public static Map<CampoElegibilidade, Object> perfil(Organizacao organizacao, Year anoAtual) {
        Map<CampoElegibilidade, Object> perfil = new EnumMap<>(CampoElegibilidade.class);
        for (CampoElegibilidade campo : CampoElegibilidade.values()) {
            perfil.put(campo, campo.ler(organizacao, anoAtual));
        }
        return perfil;
    }

    public List<MotorElegibilidade.Regra> regras(Long versaoId) {
        return requisitoRepository.listarPorVersao(versaoId).stream()
                .map(r -> new MotorElegibilidade.Regra(r.getId(), CampoElegibilidade.de(r.getCampo()),
                        OperadorElegibilidade.de(r.getOperador()), lerJson(r.getValor()), r.isObrigatoria()))
                .toList();
    }

    private record RegraValida(CampoElegibilidade campo, OperadorElegibilidade operador, String json) {
    }

    private RegraValida validarRegra(String campoTexto, String operadorTexto, JsonNode valor) {
        if (campoTexto == null || campoTexto.isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo campo é obrigatório");
        }
        CampoElegibilidade campo = CampoElegibilidade.de(campoTexto);
        if (campo == null) {
            throw erro(HttpStatus.BAD_REQUEST, "Campo inválido. Use: " + nomes(CampoElegibilidade.values()));
        }
        if (operadorTexto == null || operadorTexto.isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo operador é obrigatório");
        }
        OperadorElegibilidade operador = OperadorElegibilidade.de(operadorTexto);
        if (operador == null) {
            throw erro(HttpStatus.BAD_REQUEST, "Operador inválido. Use: " + nomes(OperadorElegibilidade.values()));
        }
        if (operador.isSoNumero() && campo.getTipo() != CampoElegibilidade.Tipo.NUMERO) {
            throw erro(HttpStatus.BAD_REQUEST, "O operador " + operador.name() + " só vale para campos numéricos");
        }
        if (valor == null || valor.isNull()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo valor é obrigatório");
        }

        if (operador.isLista()) {
            if (!valor.isArray() || valor.isEmpty()) {
                throw erro(HttpStatus.BAD_REQUEST,
                        "O operador " + operador.name() + " pede uma lista de valores. Ex.: [\"ME\", \"EPP\"]");
            }
            for (JsonNode item : valor) {
                conferirTipo(campo, item);
            }
        } else {
            if (valor.isArray() || valor.isObject()) {
                throw erro(HttpStatus.BAD_REQUEST, "O operador " + operador.name() + " pede um valor só, não uma lista");
            }
            conferirTipo(campo, valor);
        }
        return new RegraValida(campo, operador, valor.toString());
    }

    private void conferirTipo(CampoElegibilidade campo, JsonNode valor) {
        boolean certo = campo.getTipo() == CampoElegibilidade.Tipo.NUMERO
                ? valor.isNumber()
                : valor.isString() && !valor.asString().isBlank();
        if (!certo) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo " + campo.name() + " pede "
                    + (campo.getTipo() == CampoElegibilidade.Tipo.NUMERO ? "um número" : "um texto"));
        }
    }

    private JsonNode lerJson(String json) {
        return json == null ? null : JSON.readTree(json);
    }

    // 404 (oportunidade/versão) -> 403 (não é provedor) -> 409 (versão já publicada)
    private VersaoOportunidade buscarVersaoParaEscrita(Long oportunidadeId, Long versaoId, Long pessoaId) {
        Oportunidade oportunidade = oportunidadeRepository.findById(oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
        VersaoOportunidade versao = versaoRepository.findByIdAndOportunidadeId(versaoId, oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Versão não encontrada"));
        acesso.exigir(pessoaId, oportunidade.getOrganizacaoId(), Permissao.EDITAR_OPORTUNIDADE);
        if (versao.isPublicada()) {
            throw erro(HttpStatus.CONFLICT, "Os requisitos só podem ser alterados enquanto a versão for rascunho");
        }
        return versao;
    }

    // rascunho de outra organização não aparece: responde como se não existisse (404)
    private VersaoOportunidade buscarVersaoVisivel(Long oportunidadeId, Long versaoId, Long pessoaId) {
        Oportunidade oportunidade = oportunidadeRepository.findById(oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
        VersaoOportunidade versao = versaoRepository.findByIdAndOportunidadeId(versaoId, oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Versão não encontrada"));
        if (!versao.isPublicada() && !acesso.podeVer(pessoaId, oportunidade.getOrganizacaoId())) {
            throw erro(HttpStatus.NOT_FOUND, "Versão não encontrada");
        }
        return versao;
    }

    private RequisitoElegibilidade buscarRequisito(Long versaoId, Long requisitoId) {
        return requisitoRepository.findByIdAndVersao_Id(requisitoId, versaoId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Requisito não encontrado"));
    }

    private Short validarOrdem(Integer ordem) {
        if (ordem < 1 || ordem > Short.MAX_VALUE) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo ordem deve ser maior que zero e no máximo " + Short.MAX_VALUE);
        }
        return ordem.shortValue();
    }

    private Short proximaOrdem(Long versaoId) {
        int proxima = requisitoRepository.maiorOrdem(versaoId) + 1;
        if (proxima > Short.MAX_VALUE) {
            throw erro(HttpStatus.BAD_REQUEST, "Limite de requisitos da versão atingido");
        }
        return (short) proxima;
    }

    private static String nomes(Enum<?>[] valores) {
        return Arrays.stream(valores).map(Enum::name).collect(Collectors.joining(", "));
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
