package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.AvaliadorRequest;
import br.com.uphub.backend.dto.AvaliadorResponse;
import br.com.uphub.backend.model.AvaliadorOportunidade;
import br.com.uphub.backend.model.AvaliadorOportunidadeId;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.Vinculo;
import br.com.uphub.backend.repository.AvaliadorOportunidadeRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.VinculoRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Service
public class AvaliadorService {

    private final AvaliadorOportunidadeRepository avaliadorRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final VinculoRepository vinculoRepository;
    private final Acesso acesso;

    public AvaliadorService(AvaliadorOportunidadeRepository avaliadorRepository,
                            OportunidadeRepository oportunidadeRepository,
                            VinculoRepository vinculoRepository,
                            Acesso acesso) {
        this.avaliadorRepository = avaliadorRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.vinculoRepository = vinculoRepository;
        this.acesso = acesso;
    }

    // o provedor designa um AVALIADOR da própria organização para a oportunidade
    @Transactional
    public AvaliadorResponse designar(Long oportunidadeId, AvaliadorRequest dados, Long pessoaId) {
        if (dados == null || dados.vinculoId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo vinculoId é obrigatório");
        }
        Oportunidade oportunidade = buscarOportunidade(oportunidadeId);
        acesso.exigir(pessoaId, oportunidade.getOrganizacaoId(), Permissao.CONDUZIR_SELECAO);
        Vinculo vinculo = vinculoRepository.findById(dados.vinculoId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Vínculo não encontrado"));
        if (!vinculo.getOrganizacao().getId().equals(oportunidade.getOrganizacaoId())) {
            throw erro(HttpStatus.BAD_REQUEST, "O avaliador precisa ter vínculo com a organização da oportunidade");
        }
        if (vinculo.getEncerradoEm() != null) {
            throw erro(HttpStatus.BAD_REQUEST, "Este vínculo foi encerrado");
        }
        if (!"AVALIADOR".equals(vinculo.getPapel())) {
            throw erro(HttpStatus.BAD_REQUEST, "Só quem tem papel AVALIADOR pode ser designado");
        }
        if (dados.prazoAvaliacao() != null && dados.prazoAvaliacao().isBefore(LocalDate.now())) {
            throw erro(HttpStatus.BAD_REQUEST, "O prazo de avaliação não pode ser no passado");
        }
        AvaliadorOportunidadeId id = new AvaliadorOportunidadeId(oportunidadeId, vinculo.getId());
        if (avaliadorRepository.existsById(id)) {
            throw erro(HttpStatus.CONFLICT, "Este avaliador já está designado para a oportunidade");
        }
        AvaliadorOportunidade designacao = avaliadorRepository.save(new AvaliadorOportunidade(
                oportunidadeId, vinculo.getId(), dados.prazoAvaliacao(), pessoaId, OffsetDateTime.now()));
        return resposta(designacao, oportunidade, vinculo);
    }

    @Transactional(readOnly = true)
    public List<AvaliadorResponse> listar(Long oportunidadeId, Long pessoaId) {
        Oportunidade oportunidade = buscarOportunidade(oportunidadeId);
        acesso.exigirAcesso(pessoaId, oportunidade.getOrganizacaoId());
        return avaliadorRepository.findById_OportunidadeIdOrderByDesignadoEm(oportunidadeId).stream()
                .map(a -> resposta(a, oportunidade, vinculoRepository.findById(a.getId().getVinculoId()).orElseThrow()))
                .toList();
    }

    // o avaliador vê para quais oportunidades foi designado
    @Transactional(readOnly = true)
    public List<AvaliadorResponse> minhasDesignacoes(Long pessoaId) {
        return avaliadorRepository.designacoesDa(pessoaId).stream()
                .map(a -> resposta(a, buscarOportunidade(a.getId().getOportunidadeId()),
                        vinculoRepository.findById(a.getId().getVinculoId()).orElseThrow()))
                .toList();
    }

    @Transactional
    public void remover(Long oportunidadeId, Long vinculoId, Long pessoaId) {
        Oportunidade oportunidade = buscarOportunidade(oportunidadeId);
        acesso.exigir(pessoaId, oportunidade.getOrganizacaoId(), Permissao.CONDUZIR_SELECAO);
        AvaliadorOportunidade designacao = avaliadorRepository.findById(new AvaliadorOportunidadeId(oportunidadeId, vinculoId))
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Este avaliador não está designado para a oportunidade"));
        avaliadorRepository.delete(designacao);
    }

    private Oportunidade buscarOportunidade(Long id) {
        return oportunidadeRepository.findById(id)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
    }

    private AvaliadorResponse resposta(AvaliadorOportunidade a, Oportunidade o, Vinculo v) {
        return new AvaliadorResponse(o.getId(), o.getTitulo(), v.getId(), v.getPessoa().getId(), v.getPessoa().getNome(),
                a.getPrazoAvaliacao(), a.getDesignadoPor(), a.getDesignadoEm());
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
