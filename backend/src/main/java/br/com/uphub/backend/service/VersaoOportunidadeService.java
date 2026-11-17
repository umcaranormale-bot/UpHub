package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.VersaoOportunidadeCadastroRequest;
import br.com.uphub.backend.dto.VersaoOportunidadeEdicaoRequest;
import br.com.uphub.backend.dto.VersaoOportunidadePublicacaoRequest;
import br.com.uphub.backend.dto.VersaoOportunidadeResponse;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.VersaoOportunidade;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.SolicitacaoProvedorRepository;
import br.com.uphub.backend.repository.VersaoOportunidadeRepository;
import br.com.uphub.backend.repository.VinculoRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VersaoOportunidadeService {

    private static final List<Integer> VALIDADES_NOTA = List.of(30, 60, 90);
    private static final BigDecimal LIMITE_NOTA = new BigDecimal("999.99"); // numeric(5,2)

    private final VersaoOportunidadeRepository versaoRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final PessoaRepository pessoaRepository;
    private final VinculoRepository vinculoRepository;
    private final SolicitacaoProvedorRepository solicitacaoRepository;

    public VersaoOportunidadeService(VersaoOportunidadeRepository versaoRepository,
                                     OportunidadeRepository oportunidadeRepository,
                                     PessoaRepository pessoaRepository,
                                     VinculoRepository vinculoRepository,
                                     SolicitacaoProvedorRepository solicitacaoRepository) {
        this.versaoRepository = versaoRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.pessoaRepository = pessoaRepository;
        this.vinculoRepository = vinculoRepository;
        this.solicitacaoRepository = solicitacaoRepository;
    }

    @Transactional
    public VersaoOportunidadeResponse cadastrar(Long oportunidadeId, VersaoOportunidadeCadastroRequest dados) {
        // 1. obrigatórios (400)
        Long criadaPor = dados.criadaPor();
        if (criadaPor == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo criadaPor é obrigatório");
        }

        // 2. existência (404)
        Oportunidade oportunidade = buscarOportunidade(oportunidadeId);
        exigirPessoa(criadaPor, "Pessoa que está criando não encontrada");

        // 3. permissão (403)
        exigirProvedor(criadaPor, oportunidade, "Só o provedor da organização pode criar versões");

        int numero = versaoRepository.maiorNumero(oportunidadeId) + 1;
        VersaoOportunidade versao = new VersaoOportunidade(oportunidadeId, numero, criadaPor);

        return VersaoOportunidadeResponse.de(versaoRepository.save(versao));
    }

    @Transactional(readOnly = true)
    public List<VersaoOportunidadeResponse> listar(Long oportunidadeId) {
        buscarOportunidade(oportunidadeId);
        return versaoRepository.findByOportunidadeIdOrderByNumero(oportunidadeId).stream()
                .map(VersaoOportunidadeResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public VersaoOportunidadeResponse buscarPorId(Long oportunidadeId, Long versaoId) {
        return VersaoOportunidadeResponse.de(buscarVersao(oportunidadeId, versaoId));
    }

    // Editar uma versão já publicada NÃO cria versão nova: altera a mesma linha.
    @Transactional
    public VersaoOportunidadeResponse editar(Long oportunidadeId, Long versaoId,
                                             VersaoOportunidadeEdicaoRequest dados) {
        if (dados.pessoaId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo pessoaId é obrigatório");
        }

        Oportunidade oportunidade = buscarOportunidade(oportunidadeId);
        VersaoOportunidade versao = buscarVersao(oportunidadeId, versaoId);
        exigirPessoa(dados.pessoaId(), "Pessoa não encontrada");
        exigirProvedor(dados.pessoaId(), oportunidade, "Só o provedor da organização pode editar versões");

        if (dados.validadeNotaDias() != null) {
            if (!VALIDADES_NOTA.contains(dados.validadeNotaDias())) {
                throw erro(HttpStatus.BAD_REQUEST, "O campo validadeNotaDias aceita apenas 30, 60 ou 90");
            }
            versao.setValidadeNotaDias(dados.validadeNotaDias().shortValue());
        }
        if (dados.prazoAjusteDias() != null) {
            if (dados.prazoAjusteDias() < 3 || dados.prazoAjusteDias() > 15) {
                throw erro(HttpStatus.BAD_REQUEST, "O campo prazoAjusteDias deve ficar entre 3 e 15");
            }
            versao.setPrazoAjusteDias(dados.prazoAjusteDias().shortValue());
        }
        if (dados.notaMinima() != null) {
            if (dados.notaMinima().signum() < 0 || dados.notaMinima().compareTo(LIMITE_NOTA) > 0) {
                throw erro(HttpStatus.BAD_REQUEST, "O campo notaMinima deve ficar entre 0 e 999,99");
            }
            versao.setNotaMinima(dados.notaMinima().setScale(2, RoundingMode.HALF_UP));
        }
        if (dados.cargaSemanalHoras() != null) {
            versao.setCargaSemanalHoras(positivoShort(dados.cargaSemanalHoras(), "cargaSemanalHoras"));
        }
        if (dados.duracaoSemanas() != null) {
            versao.setDuracaoSemanas(positivoShort(dados.duracaoSemanas(), "duracaoSemanas"));
        }
        if (dados.quantidadeVagas() != null) {
            if (dados.quantidadeVagas() <= 0) {
                throw erro(HttpStatus.BAD_REQUEST, "O campo quantidadeVagas deve ser maior que zero");
            }
            versao.setQuantidadeVagas(dados.quantidadeVagas());
        }
        if (dados.prazoEnvio() != null) {
            versao.setPrazoEnvio(dados.prazoEnvio());
        }
        if (dados.escopo() != null) {
            versao.setEscopo(textoOuNulo(dados.escopo()));
        }
        if (dados.entregaveis() != null) {
            versao.setEntregaveis(textoOuNulo(dados.entregaveis()));
        }

        return VersaoOportunidadeResponse.de(versaoRepository.save(versao));
    }

    @Transactional
    public VersaoOportunidadeResponse publicar(Long oportunidadeId, Long versaoId,
                                               VersaoOportunidadePublicacaoRequest dados) {
        if (dados.pessoaId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo pessoaId é obrigatório");
        }

        Oportunidade oportunidade = buscarOportunidade(oportunidadeId);
        VersaoOportunidade versao = buscarVersao(oportunidadeId, versaoId);
        exigirPessoa(dados.pessoaId(), "Pessoa não encontrada");

        // conferência 1: só quem tem vínculo PROVEDOR com a organização (403)
        exigirProvedor(dados.pessoaId(), oportunidade, "Só o provedor da organização pode publicar");

        // conferência 2: solicitação de provedor APROVADA (403)
        if (!solicitacaoRepository.existsByOrganizacao_IdAndSituacao(oportunidade.getOrganizacaoId(), "APROVADA")) {
            throw erro(HttpStatus.FORBIDDEN,
                    "A organização precisa ter a solicitação de provedor aprovada para publicar");
        }

        // só pode existir uma versão publicada por oportunidade (ux_versao_publicada) (409)
        if (versao.isPublicada()) {
            throw erro(HttpStatus.CONFLICT, "Esta versão já está publicada");
        }
        if (versaoRepository.existsByOportunidadeIdAndPublicadaEmIsNotNull(oportunidadeId)) {
            throw erro(HttpStatus.CONFLICT,
                    "Esta oportunidade já tem uma versão publicada. Edite a versão publicada");
        }

        // conferência 3: prazo de envio obrigatório (400)
        if (versao.getPrazoEnvio() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O prazo de envio é obrigatório para publicar");
        }

        // conferência 4: a oportunidade passa a PUBLICADA
        OffsetDateTime agora = OffsetDateTime.now();
        versao.setPublicadaEm(agora);
        if ("RASCUNHO".equals(oportunidade.getEstado())) {
            oportunidade.setEstado("PUBLICADA");
            oportunidade.setPublicadaEm(agora);
            oportunidadeRepository.save(oportunidade);
        }

        return VersaoOportunidadeResponse.de(versaoRepository.save(versao));
    }

    private Oportunidade buscarOportunidade(Long oportunidadeId) {
        return oportunidadeRepository.findById(oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
    }

    private VersaoOportunidade buscarVersao(Long oportunidadeId, Long versaoId) {
        return versaoRepository.findByIdAndOportunidadeId(versaoId, oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Versão não encontrada"));
    }

    private void exigirPessoa(Long pessoaId, String mensagem) {
        if (!pessoaRepository.existsById(pessoaId)) {
            throw erro(HttpStatus.NOT_FOUND, mensagem);
        }
    }

    private void exigirProvedor(Long pessoaId, Oportunidade oportunidade, String mensagem) {
        if (!vinculoRepository.existsByPessoa_IdAndOrganizacao_IdAndPapel(
                pessoaId, oportunidade.getOrganizacaoId(), "PROVEDOR")) {
            throw erro(HttpStatus.FORBIDDEN, mensagem);
        }
    }

    private Short positivoShort(Integer valor, String campo) {
        if (valor <= 0 || valor > Short.MAX_VALUE) {
            throw erro(HttpStatus.BAD_REQUEST,
                    "O campo " + campo + " deve ser maior que zero e no máximo " + Short.MAX_VALUE);
        }
        return valor.shortValue();
    }

    private String textoOuNulo(String valor) {
        return valor.isBlank() ? null : valor.trim();
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
