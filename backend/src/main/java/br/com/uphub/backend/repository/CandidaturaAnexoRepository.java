package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.CandidaturaAnexo;
import br.com.uphub.backend.model.CandidaturaAnexoId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidaturaAnexoRepository extends JpaRepository<CandidaturaAnexo, CandidaturaAnexoId> {

    List<CandidaturaAnexo> findById_CandidaturaIdOrderById_DocumentoId(Long candidaturaId);
}
