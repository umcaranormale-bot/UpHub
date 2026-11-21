package br.com.uphub.backend.service;

import br.com.uphub.backend.candidatura.TiposPorTrilha;
import br.com.uphub.backend.dto.FavoritaResponse;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.OportunidadeFavorita;
import br.com.uphub.backend.model.OportunidadeFavoritaId;
import br.com.uphub.backend.model.Organizacao;
import br.com.uphub.backend.repository.OportunidadeFavoritaRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.VersaoOportunidadeRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

// Favoritas (V38): a organização candidata guarda as oportunidades que quer acompanhar.
@Service
public class FavoritaService {

    private static final Set<String> CANDIDATAS = Set.of("EMPRESA", "STARTUP", "SQUAD");

    private final OportunidadeFavoritaRepository favoritaRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final OrganizacaoRepository organizacaoRepository;
    private final VersaoOportunidadeRepository versaoRepository;
    private final PessoaRepository pessoaRepository;
    private final Acesso acesso;

    public FavoritaService(OportunidadeFavoritaRepository favoritaRepository, OportunidadeRepository oportunidadeRepository,
                           OrganizacaoRepository organizacaoRepository, VersaoOportunidadeRepository versaoRepository,
                           PessoaRepository pessoaRepository, Acesso acesso) {
        this.favoritaRepository = favoritaRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.organizacaoRepository = organizacaoRepository;
        this.versaoRepository = versaoRepository;
        this.pessoaRepository = pessoaRepository;
        this.acesso = acesso;
    }

    @Transactional(readOnly = true)
    public List<FavoritaResponse> listar(Long organizacaoId, Long pessoaId) {
        organizacaoCandidata(organizacaoId, pessoaId);
        return favoritaRepository.findById_OrganizacaoIdOrderByFavoritadaEmDesc(organizacaoId).stream()
                .map(this::resposta).toList();
    }

    @Transactional
    public FavoritaResponse favoritar(Long organizacaoId, Long oportunidadeId, Long pessoaId) {
        Organizacao organizacao = organizacaoCandidata(organizacaoId, pessoaId);
        Oportunidade oportunidade = oportunidadeRepository.findById(oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
        if (!TiposPorTrilha.aceita(oportunidade.getTrilhaCodigo(), organizacao.getTipo())) {
            throw erro(HttpStatus.BAD_REQUEST, "Esta oportunidade é só para " + TiposPorTrilha.quem(oportunidade.getTrilhaCodigo()));
        }
        if (!"PUBLICADA".equals(oportunidade.getEstado())) {
            throw erro(HttpStatus.CONFLICT, "Só oportunidade publicada pode ser favoritada");
        }
        OportunidadeFavoritaId id = new OportunidadeFavoritaId(organizacaoId, oportunidadeId);
        if (favoritaRepository.existsById(id)) {
            throw erro(HttpStatus.CONFLICT, "Esta oportunidade já está nas favoritas");
        }
        OportunidadeFavorita favorita = favoritaRepository.saveAndFlush(
                new OportunidadeFavorita(organizacaoId, oportunidadeId, pessoaId, OffsetDateTime.now()));
        return resposta(favorita);
    }

    @Transactional
    public void desfavoritar(Long organizacaoId, Long oportunidadeId, Long pessoaId) {
        organizacaoCandidata(organizacaoId, pessoaId);
        OportunidadeFavoritaId id = new OportunidadeFavoritaId(organizacaoId, oportunidadeId);
        if (!favoritaRepository.existsById(id)) {
            throw erro(HttpStatus.NOT_FOUND, "Esta oportunidade não está nas favoritas");
        }
        favoritaRepository.deleteById(id);
    }

    // só quem tem vínculo CANDIDATO numa organização candidata (empresa, startup ou squad)
    private Organizacao organizacaoCandidata(Long organizacaoId, Long pessoaId) {
        Organizacao organizacao = organizacaoRepository.findById(organizacaoId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));
        acesso.exigir(pessoaId, organizacaoId, Permissao.CANDIDATAR);
        if (!CANDIDATAS.contains(organizacao.getTipo())) {
            throw erro(HttpStatus.BAD_REQUEST, "Só empresa, startup ou squad guarda oportunidades favoritas");
        }
        return organizacao;
    }

    private FavoritaResponse resposta(OportunidadeFavorita f) {
        Oportunidade o = oportunidadeRepository.findById(f.getId().getOportunidadeId()).orElseThrow();
        String provedor = organizacaoRepository.findById(o.getOrganizacaoId()).map(Organizacao::getNome).orElse(null);
        var prazo = versaoRepository.findFirstByOportunidadeIdAndPublicadaEmIsNotNull(o.getId())
                .map(v -> v.getPrazoEnvio()).orElse(null);
        String autor = pessoaRepository.findById(f.getFavoritadaPor()).map(p -> p.getNome()).orElse(null);
        return new FavoritaResponse(f.getId().getOrganizacaoId(), o.getId(), o.getTitulo(), o.getTrilhaCodigo(), o.getEstado(),
                provedor, prazo, new FavoritaResponse.Autor(f.getFavoritadaPor(), autor), f.getFavoritadaEm());
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
