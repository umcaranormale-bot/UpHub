package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.DocumentoExigidoRequest;
import br.com.uphub.backend.dto.DocumentoExigidoResponse;
import br.com.uphub.backend.model.DocumentoExigido;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.VersaoOportunidade;
import br.com.uphub.backend.repository.DocumentoExigidoRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.VersaoOportunidadeRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DocumentoExigidoService {

    private final DocumentoExigidoRepository documentoExigidoRepository;
    private final VersaoOportunidadeRepository versaoRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final Acesso acesso;

    public DocumentoExigidoService(DocumentoExigidoRepository documentoExigidoRepository,
                                   VersaoOportunidadeRepository versaoRepository,
                                   OportunidadeRepository oportunidadeRepository,
                                   Acesso acesso) {
        this.documentoExigidoRepository = documentoExigidoRepository;
        this.versaoRepository = versaoRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.acesso = acesso;
    }

    @Transactional
    public DocumentoExigidoResponse cadastrar(Long oportunidadeId, Long versaoId, DocumentoExigidoRequest dados, Long pessoaId) {
        String nome = nome(dados.nome());
        VersaoOportunidade versao = buscarVersaoParaEscrita(oportunidadeId, versaoId, pessoaId);
        if (documentoExigidoRepository.existsByVersao_IdAndNomeIgnoreCase(versaoId, nome)) {
            throw erro(HttpStatus.CONFLICT, "Esta versão já exige um documento com este nome");
        }
        // sem dizer, o documento é obrigatório
        boolean obrigatorio = dados.obrigatorio() == null || dados.obrigatorio();
        return DocumentoExigidoResponse.de(documentoExigidoRepository.save(new DocumentoExigido(versao, nome, obrigatorio)));
    }

    @Transactional(readOnly = true)
    public List<DocumentoExigidoResponse> listar(Long oportunidadeId, Long versaoId, Long pessoaId) {
        buscarVersaoVisivel(oportunidadeId, versaoId, pessoaId);
        return documentoExigidoRepository.findByVersao_IdOrderById(versaoId).stream()
                .map(DocumentoExigidoResponse::de)
                .toList();
    }

    @Transactional
    public DocumentoExigidoResponse editar(Long oportunidadeId, Long versaoId, Long documentoId,
                                           DocumentoExigidoRequest dados, Long pessoaId) {
        buscarVersaoParaEscrita(oportunidadeId, versaoId, pessoaId);
        DocumentoExigido documento = buscarDocumento(versaoId, documentoId);
        if (dados.nome() != null) {
            String nome = nome(dados.nome());
            if (documentoExigidoRepository.existsByVersao_IdAndNomeIgnoreCaseAndIdNot(versaoId, nome, documentoId)) {
                throw erro(HttpStatus.CONFLICT, "Esta versão já exige um documento com este nome");
            }
            documento.setNome(nome);
        }
        if (dados.obrigatorio() != null) {
            documento.setObrigatorio(dados.obrigatorio());
        }
        return DocumentoExigidoResponse.de(documentoExigidoRepository.save(documento));
    }

    @Transactional
    public void remover(Long oportunidadeId, Long versaoId, Long documentoId, Long pessoaId) {
        buscarVersaoParaEscrita(oportunidadeId, versaoId, pessoaId);
        documentoExigidoRepository.delete(buscarDocumento(versaoId, documentoId));
    }

    private String nome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo nome é obrigatório");
        }
        String limpo = nome.trim();
        if (limpo.length() > 120) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo nome aceita no máximo 120 caracteres");
        }
        return limpo;
    }

    // 404 (oportunidade/versão) -> 403 (não é provedor) -> 409 (versão já publicada)
    private VersaoOportunidade buscarVersaoParaEscrita(Long oportunidadeId, Long versaoId, Long pessoaId) {
        Oportunidade oportunidade = oportunidadeRepository.findById(oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
        VersaoOportunidade versao = versaoRepository.findByIdAndOportunidadeId(versaoId, oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Versão não encontrada"));
        acesso.exigir(pessoaId, oportunidade.getOrganizacaoId(), Permissao.EDITAR_OPORTUNIDADE);
        if (versao.isPublicada()) {
            throw erro(HttpStatus.CONFLICT, "Os documentos exigidos só podem ser alterados enquanto a versão for rascunho");
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

    private DocumentoExigido buscarDocumento(Long versaoId, Long documentoId) {
        return documentoExigidoRepository.findByIdAndVersao_Id(documentoId, versaoId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Documento exigido não encontrado"));
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
