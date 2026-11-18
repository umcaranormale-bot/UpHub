package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.Candidatura;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidaturaRepository extends JpaRepository<Candidatura, Long> {

    boolean existsByOportunidadeIdAndOrganizacaoId(Long oportunidadeId, Long organizacaoId);

    List<Candidatura> findByOrganizacaoIdOrderByCriadaEmDesc(Long organizacaoId);

    List<Candidatura> findByOportunidadeIdAndEstadoNotInOrderByEnviadaEm(Long oportunidadeId, Collection<String> estados);

    List<Candidatura> findByOportunidadeIdAndEstadoOrderByEnviadaEm(Long oportunidadeId, String estado);
}
