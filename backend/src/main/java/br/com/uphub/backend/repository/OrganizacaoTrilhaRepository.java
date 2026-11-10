package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.OrganizacaoTrilha;
import br.com.uphub.backend.model.OrganizacaoTrilhaId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrganizacaoTrilhaRepository extends JpaRepository<OrganizacaoTrilha, OrganizacaoTrilhaId> {

    @Query("select ot from OrganizacaoTrilha ot join fetch ot.organizacao join fetch ot.trilha")
    List<OrganizacaoTrilha> listarTodas();
}
