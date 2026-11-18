package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.CorrecaoItemRequest;
import br.com.uphub.backend.dto.ItemAjusteRequest;
import br.com.uphub.backend.dto.ItemAjusteResponse;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.CandidaturaAnexo;
import br.com.uphub.backend.model.CandidaturaAnexoId;
import br.com.uphub.backend.model.Documento;
import br.com.uphub.backend.model.DocumentoExigido;
import br.com.uphub.backend.model.ItemAjuste;
import br.com.uphub.backend.model.PedidoAjuste;
import br.com.uphub.backend.repository.CandidaturaAnexoRepository;
import br.com.uphub.backend.repository.DocumentoExigidoRepository;
import br.com.uphub.backend.repository.DocumentoRepository;
import br.com.uphub.backend.repository.ItemAjusteRepository;
import br.com.uphub.backend.repository.PedidoAjusteRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class ItemAjusteService {

    private final ItemAjusteRepository itemRepository;
    private final PedidoAjusteRepository pedidoRepository;
    private final DocumentoExigidoRepository exigidoRepository;
    private final DocumentoRepository documentoRepository;
    private final CandidaturaAnexoRepository anexoRepository;
    private final CandidaturaService candidaturaService;
    private final Acesso acesso;

    public ItemAjusteService(ItemAjusteRepository itemRepository,
                             PedidoAjusteRepository pedidoRepository,
                             DocumentoExigidoRepository exigidoRepository,
                             DocumentoRepository documentoRepository,
                             CandidaturaAnexoRepository anexoRepository,
                             CandidaturaService candidaturaService,
                             Acesso acesso) {
        this.itemRepository = itemRepository;
        this.pedidoRepository = pedidoRepository;
        this.exigidoRepository = exigidoRepository;
        this.documentoRepository = documentoRepository;
        this.anexoRepository = anexoRepository;
        this.candidaturaService = candidaturaService;
        this.acesso = acesso;
    }

    // confere os itens que vêm na assinatura com AJUSTE, antes de gravar qualquer coisa
    public void validar(List<ItemAjusteRequest> itens, Long versaoId) {
        if (itens == null || itens.isEmpty()) {
            throw erro(HttpStatus.BAD_REQUEST, "Para pedir ajuste, diga o que precisa ser corrigido (itens)");
        }
        for (ItemAjusteRequest item : itens) {
            if (item == null || item.descricao() == null || item.descricao().isBlank()) {
                throw erro(HttpStatus.BAD_REQUEST, "Todo item de ajuste precisa de descricao");
            }
            if (item.descricao().trim().length() > 200) {
                throw erro(HttpStatus.BAD_REQUEST, "A descricao do item aceita no máximo 200 caracteres");
            }
            if (item.documentoExigidoId() != null
                    && exigidoRepository.findByIdAndVersao_Id(item.documentoExigidoId(), versaoId).isEmpty()) {
                throw erro(HttpStatus.BAD_REQUEST, "O documento exigido do item não é desta oportunidade");
            }
        }
    }

    @Transactional
    public void criar(PedidoAjuste pedido, List<ItemAjusteRequest> itens) {
        for (ItemAjusteRequest item : itens) {
            String detalhe = item.detalhe() == null || item.detalhe().isBlank() ? null : item.detalhe().trim();
            itemRepository.save(new ItemAjuste(pedido.getId(), item.descricao().trim(), detalhe, item.documentoExigidoId()));
        }
    }

    // no reenvio, todo item precisa estar corrigido
    public void conferir(PedidoAjuste pedido) {
        List<String> faltam = itemRepository.findByPedidoAjusteIdOrderById(pedido.getId()).stream()
                .filter(i -> !i.corrigido()).map(ItemAjuste::getDescricao).toList();
        if (!faltam.isEmpty()) {
            throw erro(HttpStatus.BAD_REQUEST, "Ainda faltam itens do ajuste: " + String.join(", ", faltam));
        }
    }

    public List<ItemAjusteResponse> itensDo(Long pedidoId) {
        return itemRepository.findByPedidoAjusteIdOrderById(pedidoId).stream().map(this::resposta).toList();
    }

    // a organização marca o item como corrigido; se o item aponta um documento exigido, o documento novo entra no lugar do anexo
    @Transactional
    public ItemAjusteResponse corrigir(Long candidaturaId, Long itemId, CorrecaoItemRequest dados, Long pessoaId) {
        Candidatura candidatura = candidaturaService.paraLeitura(candidaturaId, pessoaId);
        acesso.exigir(pessoaId, candidatura.getOrganizacaoId(), Permissao.CANDIDATAR);
        if (!"AJUSTE".equals(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "Esta candidatura não está aguardando ajuste");
        }
        ItemAjuste item = itemRepository.findById(itemId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Item de ajuste não encontrado"));
        PedidoAjuste pedido = pedidoRepository.findById(item.getPedidoAjusteId()).orElseThrow();
        if (!pedido.getCandidaturaId().equals(candidaturaId) || !"AGUARDANDO".equals(pedido.getSituacao())) {
            throw erro(HttpStatus.NOT_FOUND, "Item de ajuste não encontrado");
        }
        Long documentoNovoId = dados == null ? null : dados.documentoNovoId();
        if (item.getDocumentoExigidoId() != null && documentoNovoId == null) {
            throw erro(HttpStatus.BAD_REQUEST, "Este item pede um documento novo: informe o documentoNovoId");
        }
        if (documentoNovoId != null) {
            Documento documento = documentoRepository.findById(documentoNovoId)
                    .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Documento não encontrado"));
            if (!documento.getOrganizacao().getId().equals(candidatura.getOrganizacaoId())) {
                throw erro(HttpStatus.BAD_REQUEST, "Só dá para usar documentos da organização que está se candidatando");
            }
            if (documento.getValidade() != null && documento.getValidade().isBefore(LocalDate.now())) {
                throw erro(HttpStatus.BAD_REQUEST, "Este documento está vencido");
            }
            if (item.getDocumentoExigidoId() != null) {
                trocarAnexo(candidaturaId, item.getDocumentoExigidoId(), documento.getId());
            }
        }
        item.corrigir(documentoNovoId, OffsetDateTime.now());
        return resposta(itemRepository.saveAndFlush(item));
    }

    // o documento novo passa a cumprir o documento exigido; o anexo antigo daquele item sai
    private void trocarAnexo(Long candidaturaId, Long documentoExigidoId, Long documentoNovoId) {
        List<CandidaturaAnexo> antigos = anexoRepository.findById_CandidaturaIdOrderById_DocumentoId(candidaturaId).stream()
                .filter(a -> Objects.equals(a.getDocumentoExigidoId(), documentoExigidoId)
                        || a.getId().getDocumentoId().equals(documentoNovoId))
                .toList();
        anexoRepository.deleteAll(antigos);
        anexoRepository.flush();
        anexoRepository.save(new CandidaturaAnexo(candidaturaId, documentoNovoId, documentoExigidoId));
    }

    private ItemAjusteResponse resposta(ItemAjuste i) {
        String nome = i.getDocumentoExigidoId() == null ? null
                : exigidoRepository.findById(i.getDocumentoExigidoId()).map(DocumentoExigido::getNome).orElse(null);
        return new ItemAjusteResponse(i.getId(), i.getPedidoAjusteId(), i.getDescricao(), i.getDetalhe(),
                i.getDocumentoExigidoId(), nome, i.getDocumentoNovoId(), i.getCorrigidoEm());
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
