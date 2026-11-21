package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.EventoAuditoria;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoAuditoriaRepository extends JpaRepository<EventoAuditoria, Long> {

    List<EventoAuditoria> findByOportunidadeIdOrderByOcorridoEmDescIdDesc(Long oportunidadeId);

    List<EventoAuditoria> findByCandidaturaIdOrderByOcorridoEmDescIdDesc(Long candidaturaId);
}