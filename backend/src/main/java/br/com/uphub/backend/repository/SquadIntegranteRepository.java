package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.SquadIntegrante;
import br.com.uphub.backend.model.SquadIntegranteId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SquadIntegranteRepository extends JpaRepository<SquadIntegrante, SquadIntegranteId> {

    @Query("select si from SquadIntegrante si join fetch si.pessoa "
            + "where si.id.squadId = :squadId order by si.pessoa.nome")
    List<SquadIntegrante> listarPorSquad(Long squadId);
}