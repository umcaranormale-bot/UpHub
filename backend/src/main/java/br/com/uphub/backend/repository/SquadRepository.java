package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.Squad;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SquadRepository extends JpaRepository<Squad, Long> {

    @Query("select s from Squad s join fetch s.organizacao")
    List<Squad> listarTodas();

    @Query("select s from Squad s join fetch s.organizacao where s.organizacaoId = :id")
    Optional<Squad> buscarComOrganizacao(Long id);
}