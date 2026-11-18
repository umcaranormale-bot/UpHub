package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.Criterio;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CriterioRepository extends JpaRepository<Criterio, Long> {

    @Query("select c from Criterio c where c.versao.id = :versaoId order by c.ordem asc nulls last, c.id asc")
    List<Criterio> listarPorVersao(Long versaoId);

    Optional<Criterio> findByIdAndVersao_Id(Long id, Long versaoId);

    @Query("select coalesce(max(c.ordem), 0) from Criterio c where c.versao.id = :versaoId")
    int maiorOrdem(Long versaoId);
}
