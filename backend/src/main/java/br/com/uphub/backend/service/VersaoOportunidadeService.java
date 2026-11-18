package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.VersaoOportunidadeEdicaoRequest;
import br.com.uphub.backend.dto.VersaoOportunidadeResponse;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.VersaoOportunidade;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.SolicitacaoProvedorRepository;
import br.com.uphub.backend.repository.VersaoOportunidadeRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
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
    private final SolicitacaoProvedorRepository solicitacaoRepository;
    private final Acesso acesso;

    public VersaoOportunidadeService(VersaoOportunidadeRepository versaoRepository,
                                     OportunidadeRepository oportunidadeRepository,
                                     SolicitacaoProvedorRepository solicitacaoRepository,
                                     Acesso acesso) {
        this.versaoRepository = versaoRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.solicitacaoRepository = solicitacaoRepository;
        this.acesso = acesso;
    }

    @Transactional
    public VersaoOportunidadeResponse cadastrar(Long oportunidadeId, Long criadaPor) {
        // 1. existência (404)
        Oportunidade oportunidade = buscarOportunidade(oportunidadeId);

        // 2. permissão (403)
        acesso.exigir(criadaPor, oportunidade.getOrganizacaoId(), Permissao.EDITAR_OPORTUNIDADE);

        // 3. a versão publicada é editada no lugar: com uma publicada, uma versão nova nunca poderia ser publicada (409)
        if (versaoRepository.existsByOportunidadeIdAndPublicadaEmIsNotNull(oportunidadeId)) {
            throw erro(HttpStatus.CONFLICT,
                    "Esta oportunidade já tem uma versão publicada. Edite a versão publicada");
        }

        int numero = versaoRepository.maiorNumero(oportunidadeId) + 1;
        VersaoOportunidade versao = new VersaoOportunidade(oportunidadeId, numero, criadaPor);

        return VersaoOportunidadeResponse.de(versaoRepository.save(versao));
    }

    @Transactional(readOnly = true)
    public List<VersaoOportunidadeResponse> listar(Long oportunidadeId, Long pessoaId) {
        Oportunidade oportunidade = buscarOportunidadeVisivel(oportunidadeId, pessoaId);
        // quem é da organização (ou da gestão) vê os rascunhos; os outros, só a versão publicada
        boolean veRascunhos = acesso.podeVer(pessoaId, oportunidade.getOrganizacaoId());
        return versaoRepository.findByOportunidadeIdOrderByNumero(oportunidadeId).stream()
                .filter(v -> veRascunhos || v.isPublicada())
                .map(VersaoOportunidadeResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public VersaoOportunidadeResponse buscarPorId(Long oportunidadeId, Long versaoId, Long pessoaId) {
        Oportunidade oportunidade = buscarOportunidadeVisivel(oportunidadeId, pessoaId);
        VersaoOportunidade versao = buscarVersao(oportunidadeId, versaoId);
        if (!versao.isPublicada() && !acesso.podeVer(pessoaId, oportunidade.getOrganizacaoId())) {
            throw erro(HttpStatus.NOT_FOUND, "Versão não encontrada");
        }
        return VersaoOportunidadeResponse.de(versao);
    }

    // Editar uma versão já publicada NÃO cria versão nova: altera a mesma linha.
    @Transactional
    public VersaoOportunidadeResponse editar(Long oportunidadeId, Long versaoId,
                                             VersaoOportunidadeEdicaoRequest dados, Long pessoaId) {
        Oportunidade oportunidade = buscarOportunidade(oportunidadeId);
        VersaoOportunidade versao = buscarVersao(oportunidadeId, versaoId);
        acesso.exigir(pessoaId, oportunidade.getOrganizacaoId(), Permissao.EDITAR_OPORTUNIDADE);

        // depois de publicada, só muda o que não afeta a avaliação: o prazo de envio (409)
        if (versao.isPublicada() && (dados.notaMinima() != null || dados.validadeNotaDias() != null
                || dados.prazoAjusteDias() != null || dados.escopo() != null || dados.entregaveis() != null
                || dados.cargaSemanalHoras() != null || dados.duracaoSemanas() != null
                || dados.quantidadeVagas() != null)) {
            throw erro(HttpStatus.CONFLICT, "Depois de publicada, só dá para mudar o prazo de envio");
        }

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
            if (dados.prazoEnvio().isBefore(LocalDate.now())) {
                throw erro(HttpStatus.BAD_REQUEST, "O prazo de envio não pode ser uma data passada");
            }
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
    public VersaoOportunidadeResponse publicar(Long oportunidadeId, Long versaoId, Long pessoaId) {
        Oportunidade oportunidade = buscarOportunidade(oportunidadeId);
        VersaoOportunidade versao = buscarVersao(oportunidadeId, versaoId);

        // conferência 1: só quem tem papel PROVEDOR na organização (403)
        acesso.exigir(pessoaId, oportunidade.getOrganizacaoId(), Permissao.EDITAR_OPORTUNIDADE);

        // conferência 2: solicitação de provedor APROVADA (403)
        if (!solicitacaoRepository.existsByOrganizacao_IdAndSituacao(oportunidade.getOrganizacaoId(), "APROVADA")) {
            throw erro(HttpStatus.FORBIDDEN,
                    "A organização precisa ter a solicitação de provedor aprovada para publicar");
        }

        // oportunidade encerrada não volta a ser publicada (409)
        if ("ENCERRADA".equals(oportunidade.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "Esta oportunidade já foi encerrada");
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
        if (versao.getPrazoEnvio().isBefore(LocalDate.now())) {
            throw erro(HttpStatus.BAD_REQUEST, "O prazo de envio não pode ser uma data passada");
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

    // rascunho de outra organização não aparece: responde como se não existisse
    private Oportunidade buscarOportunidadeVisivel(Long oportunidadeId, Long pessoaId) {
        Oportunidade oportunidade = buscarOportunidade(oportunidadeId);
        if ("RASCUNHO".equals(oportunidade.getEstado()) && !acesso.podeVer(pessoaId, oportunidade.getOrganizacaoId())) {
            throw erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada");
        }
        return oportunidade;
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
