package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.VersaoOportunidade;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VersaoOportunidadeRepository extends JpaRepository<VersaoOportunidade, Long> {

    List<VersaoOportunidade> findByOportunidadeIdOrderByNumero(Long oportunidadeId);

    Optional<VersaoOportunidade> findByIdAndOportunidadeId(Long id, Long oportunidadeId);

    Optional<VersaoOportunidade> findFirstByOportunidadeIdAndPublicadaEmIsNotNull(Long oportunidadeId);

    boolean existsByOportunidadeIdAndPublicadaEmIsNotNull(Long oportunidadeId);

    @Query("select coalesce(max(v.numero), 0) from VersaoOportunidade v where v.oportunidadeId = :oportunidadeId")
    int maiorNumero(Long oportunidadeId);
}
