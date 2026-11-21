package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.OportunidadeFavorita;
import br.com.uphub.backend.model.OportunidadeFavoritaId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OportunidadeFavoritaRepository extends JpaRepository<OportunidadeFavorita, OportunidadeFavoritaId> {

    List<OportunidadeFavorita> findById_OrganizacaoIdOrderByFavoritadaEmDesc(Long organizacaoId);
}
