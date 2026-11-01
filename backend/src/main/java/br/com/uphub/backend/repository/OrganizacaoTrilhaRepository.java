package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.OrganizacaoTrilha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrganizacaoTrilhaRepository extends JpaRepository<OrganizacaoTrilha, Long> {
    List<OrganizacaoTrilha> findByOrganizacaoId(Long organizacaoId);
}