package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.CriterioCadastroRequest;
import br.com.uphub.backend.dto.CriterioEdicaoRequest;
import br.com.uphub.backend.dto.CriterioResponse;
import br.com.uphub.backend.model.Criterio;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.VersaoOportunidade;
import br.com.uphub.backend.repository.CriterioRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.VersaoOportunidadeRepository;
import br.com.uphub.backend.repository.VinculoRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CriterioService {

    private static final BigDecimal CEM = new BigDecimal("100");
    private static final BigDecimal LIMITE_ESCALA = new BigDecimal("999.99"); // numeric(5,2)

    private final CriterioRepository criterioRepository;
    private final VersaoOportunidadeRepository versaoRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final PessoaRepository pessoaRepository;
    private final VinculoRepository vinculoRepository;

    public CriterioService(CriterioRepository criterioRepository,
                           VersaoOportunidadeRepository versaoRepository,
                           OportunidadeRepository oportunidadeRepository,
                           PessoaRepository pessoaRepository,
                           VinculoRepository vinculoRepository) {
        this.criterioRepository = criterioRepository;
        this.versaoRepository = versaoRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.pessoaRepository = pessoaRepository;
        this.vinculoRepository = vinculoRepository;
    }

    @Transactional
    public CriterioResponse cadastrar(Long oportunidadeId, Long versaoId, CriterioCadastroRequest dados) {
        // 1. obrigatórios (400)
        if (dados.pessoaId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo pessoaId é obrigatório");
        }
        if (dados.descricao() == null || dados.descricao().isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo descricao é obrigatório");
        }

        // 2. existência (404), permissão (403) e estado da versão (409)
        VersaoOportunidade versao = buscarVersaoParaEscrita(oportunidadeId, versaoId, dados.pessoaId());

        // 3. regras dos valores (400)
        BigDecimal peso = validarPeso(dados.peso());
        BigDecimal escalaMin = validarEscala(dados.escalaMin(), "escalaMin");
        BigDecimal escalaMax = validarEscala(dados.escalaMax(), "escalaMax");
        validarOrdemDaEscala(escalaMin, escalaMax);
        Short ordem = dados.ordem() != null
                ? validarOrdem(dados.ordem())
                : proximaOrdem(versaoId);

        Criterio criterio = new Criterio(versao, ordem, dados.descricao().trim(), peso,
                escalaMin, escalaMax, textoOuNulo(dados.evidenciaEsperada()));

        return CriterioResponse.de(criterioRepository.save(criterio));
    }

    @Transactional(readOnly = true)
    public List<CriterioResponse> listar(Long oportunidadeId, Long versaoId) {
        buscarVersao(oportunidadeId, versaoId);
        return criterioRepository.listarPorVersao(versaoId).stream()
                .map(CriterioResponse::de)
                .toList();
    }

    @Transactional
    public CriterioResponse editar(Long oportunidadeId, Long versaoId, Long criterioId,
                                   CriterioEdicaoRequest dados) {
        if (dados.pessoaId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo pessoaId é obrigatório");
        }
        buscarVersaoParaEscrita(oportunidadeId, versaoId, dados.pessoaId());
        Criterio criterio = buscarCriterio(versaoId, criterioId);

        if (dados.descricao() != null) {
            if (dados.descricao().isBlank()) {
                throw erro(HttpStatus.BAD_REQUEST, "O campo descricao não pode ficar vazio");
            }
            criterio.setDescricao(dados.descricao().trim());
        }
        if (dados.peso() != null) {
            criterio.setPeso(validarPeso(dados.peso()));
        }
        if (dados.escalaMin() != null) {
            criterio.setEscalaMin(validarEscala(dados.escalaMin(), "escalaMin"));
        }
        if (dados.escalaMax() != null) {
            criterio.setEscalaMax(validarEscala(dados.escalaMax(), "escalaMax"));
        }
        // confere o resultado final (o máximo precisa ser maior que o mínimo)
        validarOrdemDaEscala(criterio.getEscalaMin(), criterio.getEscalaMax());

        if (dados.ordem() != null) {
            criterio.setOrdem(validarOrdem(dados.ordem()));
        }
        if (dados.evidenciaEsperada() != null) {
            criterio.setEvidenciaEsperada(textoOuNulo(dados.evidenciaEsperada()));
        }

        return CriterioResponse.de(criterioRepository.save(criterio));
    }

    @Transactional
    public void remover(Long oportunidadeId, Long versaoId, Long criterioId, Long pessoaId) {
        if (pessoaId == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O parâmetro pessoaId é obrigatório");
        }
        buscarVersaoParaEscrita(oportunidadeId, versaoId, pessoaId);
        Criterio criterio = buscarCriterio(versaoId, criterioId);
        criterioRepository.delete(criterio);
    }

    // 404 (oportunidade/versão/pessoa) -> 403 (não é provedor) -> 409 (versão já publicada)
    private VersaoOportunidade buscarVersaoParaEscrita(Long oportunidadeId, Long versaoId, Long pessoaId) {
        Oportunidade oportunidade = oportunidadeRepository.findById(oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
        VersaoOportunidade versao = versaoRepository.findByIdAndOportunidadeId(versaoId, oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Versão não encontrada"));
        if (!pessoaRepository.existsById(pessoaId)) {
            throw erro(HttpStatus.NOT_FOUND, "Pessoa não encontrada");
        }
        if (!vinculoRepository.existsByPessoa_IdAndOrganizacao_IdAndPapel(
                pessoaId, oportunidade.getOrganizacaoId(), "PROVEDOR")) {
            throw erro(HttpStatus.FORBIDDEN, "Só o provedor da organização pode alterar os critérios");
        }
        if (versao.isPublicada()) {
            throw erro(HttpStatus.CONFLICT, "Os critérios só podem ser alterados enquanto a versão for rascunho");
        }
        return versao;
    }

    private VersaoOportunidade buscarVersao(Long oportunidadeId, Long versaoId) {
        if (!oportunidadeRepository.existsById(oportunidadeId)) {
            throw erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada");
        }
        return versaoRepository.findByIdAndOportunidadeId(versaoId, oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Versão não encontrada"));
    }

    private Criterio buscarCriterio(Long versaoId, Long criterioId) {
        return criterioRepository.findByIdAndVersao_Id(criterioId, versaoId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Critério não encontrado"));
    }

    // o banco exige peso > 0 e <= 100 (ck_criterio_peso)
    private BigDecimal validarPeso(BigDecimal peso) {
        if (peso == null) {
            return null;
        }
        if (peso.signum() <= 0 || peso.compareTo(CEM) > 0) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo peso deve ser maior que 0 e no máximo 100");
        }
        return peso.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal validarEscala(BigDecimal valor, String campo) {
        if (valor == null) {
            return null;
        }
        if (valor.abs().compareTo(LIMITE_ESCALA) > 0) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo " + campo + " deve ficar entre -999,99 e 999,99");
        }
        return valor.setScale(2, RoundingMode.HALF_UP);
    }

    private void validarOrdemDaEscala(BigDecimal escalaMin, BigDecimal escalaMax) {
        if (escalaMin != null && escalaMax != null && escalaMax.compareTo(escalaMin) <= 0) {
            throw erro(HttpStatus.BAD_REQUEST, "O máximo da escala precisa ser maior que o mínimo");
        }
    }

    private Short validarOrdem(Integer ordem) {
        if (ordem < 1 || ordem > Short.MAX_VALUE) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo ordem deve ser maior que zero e no máximo " + Short.MAX_VALUE);
        }
        return ordem.shortValue();
    }

    private Short proximaOrdem(Long versaoId) {
        int proxima = criterioRepository.maiorOrdem(versaoId) + 1;
        if (proxima > Short.MAX_VALUE) {
            throw erro(HttpStatus.BAD_REQUEST, "Limite de critérios da versão atingido");
        }
        return (short) proxima;
    }

    private String textoOuNulo(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor.trim();
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
