package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.VisualizacaoRequest;
import br.com.uphub.backend.dto.VisualizacaoResponse;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.Organizacao;
import br.com.uphub.backend.model.VisualizacaoOportunidade;
import br.com.uphub.backend.model.VisualizacaoOportunidadeId;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.VisualizacaoOportunidadeRepository;
import br.com.uphub.backend.seguranca.Acesso;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class VisualizacaoOportunidadeService {

    private final VisualizacaoOportunidadeRepository visualizacaoRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final Acesso acesso;

    public VisualizacaoOportunidadeService(VisualizacaoOportunidadeRepository visualizacaoRepository,
                                           OportunidadeRepository oportunidadeRepository,
                                           OrganizacaoRepository organizacaoRepository,
                                           Acesso acesso) {
        this.visualizacaoRepository = visualizacaoRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.acesso = acesso;
    }

    // a tela da oportunidade chama ao abrir: guarda a primeira e a última vez que a organização viu
    @Transactional
    public void registrar(Long oportunidadeId, VisualizacaoRequest dados, Long pessoaId) {
        if (dados == null || dados.organizacaoId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo organizacaoId é obrigatório");
        }
        Long organizacaoId = dados.organizacaoId();
        Oportunidade oportunidade = oportunidadeRepository.findById(oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
        if (!organizacaoRepository.existsById(organizacaoId)) {
            throw erro(HttpStatus.NOT_FOUND, "Organização não encontrada");
        }
        // só registra em nome de uma organização de que a pessoa faz parte
        if (!acesso.ehMembro(pessoaId, organizacaoId)) {
            throw erro(HttpStatus.FORBIDDEN, "Você não faz parte desta organização");
        }
        // a própria organização que publicou não conta, e rascunho não é visto por fora
        if (organizacaoId.equals(oportunidade.getOrganizacaoId())) {
            return;
        }
        if ("RASCUNHO".equals(oportunidade.getEstado())) {
            throw erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada");
        }

        OffsetDateTime agora = OffsetDateTime.now();
        VisualizacaoOportunidade visualizacao = visualizacaoRepository
                .findById(new VisualizacaoOportunidadeId(oportunidadeId, organizacaoId))
                .orElse(null);
        if (visualizacao == null) {
            visualizacaoRepository.save(new VisualizacaoOportunidade(oportunidadeId, organizacaoId, agora));
        } else {
            visualizacao.viuDeNovo(agora);
        }
    }

    // quem viu: só a organização que publicou (e a gestão)
    @Transactional(readOnly = true)
    public List<VisualizacaoResponse> listar(Long oportunidadeId, Long pessoaId) {
        Oportunidade oportunidade = oportunidadeRepository.findById(oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
        acesso.exigirAcesso(pessoaId, oportunidade.getOrganizacaoId());

        List<VisualizacaoOportunidade> visualizacoes =
                visualizacaoRepository.findById_OportunidadeIdOrderByUltimaEmDesc(oportunidadeId);
        Map<Long, String> nomes = organizacaoRepository
                .findByIdIn(visualizacoes.stream().map(v -> v.getId().getOrganizacaoId()).toList()).stream()
                .collect(Collectors.toMap(Organizacao::getId, Organizacao::getNome, (a, b) -> a));
        return visualizacoes.stream()
                .map(v -> new VisualizacaoResponse(v.getId().getOrganizacaoId(),
                        nomes.get(v.getId().getOrganizacaoId()), v.getPrimeiraEm(), v.getUltimaEm()))
                .toList();
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
