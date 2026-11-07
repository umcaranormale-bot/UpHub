package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.SolicitacaoProvedor;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SolicitacaoProvedorRepository extends JpaRepository<SolicitacaoProvedor, Long> {

    boolean existsByOrganizacao_IdAndSituacao(Long organizacaoId, String situacao);

    @Query("select s from SolicitacaoProvedor s join fetch s.organizacao join fetch s.solicitante "
            + "where s.organizacao.id = :organizacaoId order by s.pedidaEm desc")
    List<SolicitacaoProvedor> listarPorOrganizacao(Long organizacaoId);

    @Query("select s from SolicitacaoProvedor s join fetch s.organizacao join fetch s.solicitante "
            + "where s.id = :id")
    Optional<SolicitacaoProvedor> buscarPorId(Long id);
}