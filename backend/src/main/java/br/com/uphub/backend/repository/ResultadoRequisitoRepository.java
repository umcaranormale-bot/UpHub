package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.ResultadoRequisito;
import br.com.uphub.backend.model.ResultadoRequisitoId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResultadoRequisitoRepository extends JpaRepository<ResultadoRequisito, ResultadoRequisitoId> {

    List<ResultadoRequisito> findById_CandidaturaId(Long candidaturaId);
}
