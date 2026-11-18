package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.AutorizacaoNota;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AutorizacaoNotaRepository extends JpaRepository<AutorizacaoNota, Long> {

    List<AutorizacaoNota> findByCandidaturaIdOrderByAutorizadaEm(Long candidaturaId);

    Optional<AutorizacaoNota> findByIdAndCandidaturaId(Long id, Long candidaturaId);

    boolean existsByCandidaturaIdAndResultadoProvaId(Long candidaturaId, Long resultadoProvaId);
}
