package br.com.uphub.backend.controller;

import br.com.uphub.backend.dto.CorrecaoItemRequest;
import br.com.uphub.backend.dto.ItemAjusteResponse;
import br.com.uphub.backend.dto.PedidoAjusteResponse;
import br.com.uphub.backend.dto.ReenvioRequest;
import br.com.uphub.backend.seguranca.PessoaLogada;
import br.com.uphub.backend.service.ItemAjusteService;
import br.com.uphub.backend.service.PedidoAjusteService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/candidaturas/{candidaturaId}/ajustes")
public class PedidoAjusteController {

    private final PedidoAjusteService pedidoService;
    private final ItemAjusteService itemService;

    public PedidoAjusteController(PedidoAjusteService pedidoService, ItemAjusteService itemService) {
        this.pedidoService = pedidoService;
        this.itemService = itemService;
    }

    @PostMapping("/itens/{itemId}/corrigir")
    public ItemAjusteResponse corrigir(@PathVariable("candidaturaId") Long candidaturaId,
                                       @PathVariable("itemId") Long itemId,
                                       @RequestBody(required = false) CorrecaoItemRequest dados,
                                       @PessoaLogada Long pessoaId) {
        return itemService.corrigir(candidaturaId, itemId, dados, pessoaId);
    }

    @GetMapping
    public List<PedidoAjusteResponse> listar(@PathVariable("candidaturaId") Long candidaturaId, @PessoaLogada Long pessoaId) {
        return pedidoService.listar(candidaturaId, pessoaId);
    }

    @PostMapping("/reenviar")
    public PedidoAjusteResponse reenviar(@PathVariable("candidaturaId") Long candidaturaId,
                                         @RequestBody ReenvioRequest dados,
                                         @PessoaLogada Long pessoaId) {
        return pedidoService.reenviar(candidaturaId, dados, pessoaId);
    }

    @PostMapping("/reabrir")
    public PedidoAjusteResponse reabrir(@PathVariable("candidaturaId") Long candidaturaId, @PessoaLogada Long pessoaId) {
        return pedidoService.reabrir(candidaturaId, pessoaId);
    }
}
