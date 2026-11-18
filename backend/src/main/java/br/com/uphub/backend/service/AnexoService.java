package br.com.uphub.backend.service;

import br.com.uphub.backend.candidatura.EtapaDoEnvio;
import br.com.uphub.backend.dto.AnexoRequest;
import br.com.uphub.backend.dto.AnexoResponse;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.CandidaturaAnexo;
import br.com.uphub.backend.model.CandidaturaAnexoId;
import br.com.uphub.backend.model.Documento;
import br.com.uphub.backend.model.DocumentoExigido;
import br.com.uphub.backend.model.VersaoOportunidade;
import br.com.uphub.backend.repository.CandidaturaAnexoRepository;
import br.com.uphub.backend.repository.DocumentoExigidoRepository;
import br.com.uphub.backend.repository.DocumentoRepository;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Order(30)
public class AnexoService implements EtapaDoEnvio {

    private static final DateTimeFormatter DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final CandidaturaAnexoRepository anexoRepository;
    private final DocumentoRepository documentoRepository;
    private final DocumentoExigidoRepository exigidoRepository;
    private final CandidaturaService candidaturaService;

    public AnexoService(CandidaturaAnexoRepository anexoRepository,
                        DocumentoRepository documentoRepository,
                        DocumentoExigidoRepository exigidoRepository,
                        CandidaturaService candidaturaService) {
        this.anexoRepository = anexoRepository;
        this.documentoRepository = documentoRepository;
        this.exigidoRepository = exigidoRepository;
        this.candidaturaService = candidaturaService;
    }

    // anexa um documento da organização candidata; com documentoExigidoId, ele cumpre aquele item da oportunidade
    @Transactional
    public AnexoResponse anexar(Long candidaturaId, AnexoRequest dados, Long pessoaId) {
        if (dados == null || dados.documentoId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo documentoId é obrigatório");
        }
        Candidatura candidatura = candidaturaService.rascunhoDoCandidato(candidaturaId, pessoaId);
        Documento documento = documentoRepository.findById(dados.documentoId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Documento não encontrado"));
        if (!documento.getOrganizacao().getId().equals(candidatura.getOrganizacaoId())) {
            throw erro(HttpStatus.BAD_REQUEST, "Só dá para anexar documentos da organização que está se candidatando");
        }
        if (vencido(documento)) {
            throw erro(HttpStatus.BAD_REQUEST, "Este documento venceu em " + documento.getValidade().format(DATA)
                    + ". Envie uma versão atualizada");
        }
        DocumentoExigido exigido = null;
        if (dados.documentoExigidoId() != null) {
            VersaoOportunidade versao = candidaturaService.versaoPublicada(candidatura);
            exigido = exigidoRepository.findByIdAndVersao_Id(dados.documentoExigidoId(), versao.getId())
                    .orElseThrow(() -> erro(HttpStatus.BAD_REQUEST, "Este documento exigido não é desta oportunidade"));
        }
        if (anexoRepository.existsById(new CandidaturaAnexoId(candidaturaId, documento.getId()))) {
            throw erro(HttpStatus.CONFLICT, "Este documento já está anexado à candidatura");
        }
        CandidaturaAnexo anexo = anexoRepository.save(
                new CandidaturaAnexo(candidaturaId, documento.getId(), exigido == null ? null : exigido.getId()));
        return resposta(anexo, documento, exigido);
    }

    @Transactional
    public void remover(Long candidaturaId, Long documentoId, Long pessoaId) {
        candidaturaService.rascunhoDoCandidato(candidaturaId, pessoaId);
        CandidaturaAnexo anexo = anexoRepository.findById(new CandidaturaAnexoId(candidaturaId, documentoId))
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Este documento não está anexado à candidatura"));
        anexoRepository.delete(anexo);
    }

    @Transactional(readOnly = true)
    public List<AnexoResponse> listar(Long candidaturaId, Long pessoaId) {
        candidaturaService.paraLeitura(candidaturaId, pessoaId);
        return anexoRepository.findById_CandidaturaIdOrderById_DocumentoId(candidaturaId).stream()
                .map(a -> resposta(a,
                        documentoRepository.findById(a.getId().getDocumentoId()).orElseThrow(),
                        a.getDocumentoExigidoId() == null ? null : exigidoRepository.findById(a.getDocumentoExigidoId()).orElse(null)))
                .toList();
    }

    // no envio: todo documento obrigatório da versão precisa estar anexado, e nenhum anexo pode estar vencido
    @Override
    public void conferir(Candidatura candidatura, VersaoOportunidade versao) {
        List<CandidaturaAnexo> anexos = anexoRepository.findById_CandidaturaIdOrderById_DocumentoId(candidatura.getId());
        Set<Long> cumpridos = anexos.stream().map(CandidaturaAnexo::getDocumentoExigidoId)
                .filter(java.util.Objects::nonNull).collect(Collectors.toSet());
        List<String> faltam = exigidoRepository.findByVersao_IdOrderById(versao.getId()).stream()
                .filter(e -> e.isObrigatorio() && !cumpridos.contains(e.getId()))
                .map(DocumentoExigido::getNome)
                .toList();
        if (!faltam.isEmpty()) {
            throw erro(HttpStatus.BAD_REQUEST, "Faltam documentos obrigatórios: " + String.join(", ", faltam));
        }
        List<String> vencidos = anexos.stream()
                .map(a -> documentoRepository.findById(a.getId().getDocumentoId()).orElseThrow())
                .filter(this::vencido)
                .map(Documento::getNomeArquivo)
                .toList();
        if (!vencidos.isEmpty()) {
            throw erro(HttpStatus.BAD_REQUEST, "Documentos vencidos na candidatura: " + String.join(", ", vencidos));
        }
    }

    private boolean vencido(Documento documento) {
        return documento.getValidade() != null && documento.getValidade().isBefore(LocalDate.now());
    }

    private AnexoResponse resposta(CandidaturaAnexo a, Documento d, DocumentoExigido e) {
        return new AnexoResponse(a.getId().getCandidaturaId(), d.getId(), d.getTipo(), d.getNomeArquivo(), d.getTipoMime(),
                d.getTamanhoBytes(), d.getValidade(), e == null ? null : e.getId(), e == null ? null : e.getNome());
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
