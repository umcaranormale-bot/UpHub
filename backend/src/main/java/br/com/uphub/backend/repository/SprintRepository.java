package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.Sprint;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SprintRepository extends JpaRepository<Sprint, Long> {

    List<Sprint> findByCandidaturaIdOrderByNumero(Long candidaturaId);

    boolean existsByCandidaturaIdAndEstado(Long candidaturaId, String estado);
}
