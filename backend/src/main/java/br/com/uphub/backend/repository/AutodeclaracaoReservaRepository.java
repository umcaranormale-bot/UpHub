package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.AutodeclaracaoReserva;
import br.com.uphub.backend.model.AutodeclaracaoReservaId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AutodeclaracaoReservaRepository extends JpaRepository<AutodeclaracaoReserva, AutodeclaracaoReservaId> {

    List<AutodeclaracaoReserva> findById_CandidaturaIdOrderByDeclaradaEm(Long candidaturaId);
}
