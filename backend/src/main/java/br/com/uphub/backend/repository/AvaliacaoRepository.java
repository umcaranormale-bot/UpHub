package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.Avaliacao;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    List<Avaliacao> findByCandidaturaIdOrderByRodadaAscAtribuidaEmAsc(Long candidaturaId);

    List<Avaliacao> findByCandidaturaIdAndRodada(Long candidaturaId, Short rodada);

    boolean existsByCandidaturaIdAndVinculoIdAndRodada(Long candidaturaId, Long vinculoId, Short rodada);

    boolean existsByOportunidadeIdAndVinculoId(Long oportunidadeId, Long vinculoId);

    // a fila do avaliador: as avaliações dos vínculos ativos dele
    @Query("select a from Avaliacao a, Vinculo v where v.id = a.vinculoId and v.pessoa.id = :pessoaId "
            + "and v.encerradoEm is null order by a.assinadaEm nulls first, a.atribuidaEm")
    List<Avaliacao> filaDa(@Param("pessoaId") Long pessoaId);

    @Query("select count(a) from Avaliacao a, Vinculo v where v.id = a.vinculoId and v.pessoa.id = :pessoaId "
            + "and a.candidaturaId = :candidaturaId")
    long contarDoAvaliador(@Param("candidaturaId") Long candidaturaId, @Param("pessoaId") Long pessoaId);
}
