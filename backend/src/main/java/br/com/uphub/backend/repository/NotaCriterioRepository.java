package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.NotaCriterio;
import br.com.uphub.backend.model.NotaCriterioId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotaCriterioRepository extends JpaRepository<NotaCriterio, NotaCriterioId> {

    List<NotaCriterio> findById_AvaliacaoId(Long avaliacaoId);
}
