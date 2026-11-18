package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.ReservaVagasRequest;
import br.com.uphub.backend.dto.ReservaVagasResponse;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.ReservaVagas;
import br.com.uphub.backend.model.VersaoOportunidade;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.ReservaVagasRepository;
import br.com.uphub.backend.repository.VersaoOportunidadeRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ReservaVagasService {

    private final ReservaVagasRepository reservaRepository;
    private final VersaoOportunidadeRepository versaoRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final Acesso acesso;

    public ReservaVagasService(ReservaVagasRepository reservaRepository,
                               VersaoOportunidadeRepository versaoRepository,
                               OportunidadeRepository oportunidadeRepository,
                               Acesso acesso) {
        this.reservaRepository = reservaRepository;
        this.versaoRepository = versaoRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.acesso = acesso;
    }

    @Transactional
    public ReservaVagasResponse cadastrar(Long oportunidadeId, Long versaoId, ReservaVagasRequest dados, Long pessoaId) {
        String criterio = criterio(dados.criterio());
        int quantidade = quantidade(dados.quantidade());
        VersaoOportunidade versao = buscarVersaoParaEscrita(oportunidadeId, versaoId, pessoaId);
        if (reservaRepository.existsByVersao_IdAndCriterioIgnoreCase(versaoId, criterio)) {
            throw erro(HttpStatus.CONFLICT, "Esta versão já tem uma reserva para este critério");
        }
        conferirTotal(versao, reservaRepository.somaReservada(versaoId) + quantidade);
        return ReservaVagasResponse.de(reservaRepository.save(new ReservaVagas(versao, criterio, quantidade)));
    }

    @Transactional(readOnly = true)
    public List<ReservaVagasResponse> listar(Long oportunidadeId, Long versaoId, Long pessoaId) {
        buscarVersaoVisivel(oportunidadeId, versaoId, pessoaId);
        return reservaRepository.findByVersao_IdOrderById(versaoId).stream()
                .map(ReservaVagasResponse::de)
                .toList();
    }

    @Transactional
    public ReservaVagasResponse editar(Long oportunidadeId, Long versaoId, Long reservaId,
                                       ReservaVagasRequest dados, Long pessoaId) {
        VersaoOportunidade versao = buscarVersaoParaEscrita(oportunidadeId, versaoId, pessoaId);
        ReservaVagas reserva = buscarReserva(versaoId, reservaId);
        if (dados.criterio() != null) {
            String criterio = criterio(dados.criterio());
            if (reservaRepository.existsByVersao_IdAndCriterioIgnoreCaseAndIdNot(versaoId, criterio, reservaId)) {
                throw erro(HttpStatus.CONFLICT, "Esta versão já tem uma reserva para este critério");
            }
            reserva.setCriterio(criterio);
        }
        if (dados.quantidade() != null) {
            int quantidade = quantidade(dados.quantidade());
            conferirTotal(versao, reservaRepository.somaReservada(versaoId) - reserva.getQuantidade() + quantidade);
            reserva.setQuantidade(quantidade);
        }
        return ReservaVagasResponse.de(reservaRepository.save(reserva));
    }

    @Transactional
    public void remover(Long oportunidadeId, Long versaoId, Long reservaId, Long pessoaId) {
        buscarVersaoParaEscrita(oportunidadeId, versaoId, pessoaId);
        reservaRepository.delete(buscarReserva(versaoId, reservaId));
    }

    // a soma das reservas não passa do total de vagas da versão; sem total, não dá para reservar
    private void conferirTotal(VersaoOportunidade versao, int somaDepois) {
        if (versao.getQuantidadeVagas() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "Defina a quantidade de vagas da versão antes de reservar vagas");
        }
        if (somaDepois > versao.getQuantidadeVagas()) {
            throw erro(HttpStatus.BAD_REQUEST, "As reservas somariam " + somaDepois
                    + " vagas, mais que as " + versao.getQuantidadeVagas() + " vagas da versão");
        }
    }

    private String criterio(String criterio) {
        if (criterio == null || criterio.isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo criterio é obrigatório");
        }
        String limpo = criterio.trim();
        if (limpo.length() > 80) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo criterio aceita no máximo 80 caracteres");
        }
        return limpo;
    }

    private int quantidade(Integer quantidade) {
        if (quantidade == null || quantidade <= 0) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo quantidade é obrigatório e deve ser maior que zero");
        }
        return quantidade;
    }

    // 404 (oportunidade/versão) -> 403 (não é provedor) -> 409 (versão já publicada)
    private VersaoOportunidade buscarVersaoParaEscrita(Long oportunidadeId, Long versaoId, Long pessoaId) {
        Oportunidade oportunidade = oportunidadeRepository.findById(oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
        VersaoOportunidade versao = versaoRepository.findByIdAndOportunidadeId(versaoId, oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Versão não encontrada"));
        acesso.exigir(pessoaId, oportunidade.getOrganizacaoId(), Permissao.EDITAR_OPORTUNIDADE);
        if (versao.isPublicada()) {
            throw erro(HttpStatus.CONFLICT, "As reservas de vagas só podem ser alteradas enquanto a versão for rascunho");
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

    private ReservaVagas buscarReserva(Long versaoId, Long reservaId) {
        return reservaRepository.findByIdAndVersao_Id(reservaId, versaoId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Reserva não encontrada"));
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
