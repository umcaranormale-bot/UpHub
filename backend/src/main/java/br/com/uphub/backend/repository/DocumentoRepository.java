package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.Documento;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    @Query("select d from Documento d join fetch d.organizacao join fetch d.enviadoPor "
            + "where d.organizacao.id = :organizacaoId order by d.enviadoEm desc")
    List<Documento> listarPorOrganizacao(Long organizacaoId);

    @Query("select d from Documento d join fetch d.organizacao join fetch d.enviadoPor "
            + "where d.id = :id")
    Optional<Documento> buscarPorId(Long id);
}