package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.CandidaturaParticipante;
import br.com.uphub.backend.model.CandidaturaParticipanteId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidaturaParticipanteRepository extends JpaRepository<CandidaturaParticipante, CandidaturaParticipanteId> {

    List<CandidaturaParticipante> findById_CandidaturaIdOrderByConviteEnviadoEm(Long candidaturaId);
}
