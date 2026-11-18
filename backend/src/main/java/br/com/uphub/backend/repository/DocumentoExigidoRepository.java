package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.DocumentoExigido;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentoExigidoRepository extends JpaRepository<DocumentoExigido, Long> {

    List<DocumentoExigido> findByVersao_IdOrderById(Long versaoId);

    Optional<DocumentoExigido> findByIdAndVersao_Id(Long id, Long versaoId);

    boolean existsByVersao_IdAndNomeIgnoreCase(Long versaoId, String nome);

    boolean existsByVersao_IdAndNomeIgnoreCaseAndIdNot(Long versaoId, String nome, Long id);
}
