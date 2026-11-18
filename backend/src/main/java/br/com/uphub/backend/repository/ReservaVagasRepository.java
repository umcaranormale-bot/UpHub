package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.ReservaVagas;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReservaVagasRepository extends JpaRepository<ReservaVagas, Long> {

    List<ReservaVagas> findByVersao_IdOrderById(Long versaoId);

    Optional<ReservaVagas> findByIdAndVersao_Id(Long id, Long versaoId);

    boolean existsByVersao_IdAndCriterioIgnoreCase(Long versaoId, String criterio);

    boolean existsByVersao_IdAndCriterioIgnoreCaseAndIdNot(Long versaoId, String criterio, Long id);

    @Query("select coalesce(sum(r.quantidade), 0) from ReservaVagas r where r.versao.id = :versaoId")
    int somaReservada(Long versaoId);
}
