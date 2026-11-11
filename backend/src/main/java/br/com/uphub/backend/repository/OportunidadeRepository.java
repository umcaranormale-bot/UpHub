package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.Oportunidade;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OportunidadeRepository extends JpaRepository<Oportunidade, Long> {

    List<Oportunidade> findByOrganizacaoId(Long organizacaoId);

    List<Oportunidade> findByOrganizacaoIdAndEstado(Long organizacaoId, String estado);

    List<Oportunidade> findByTrilhaCodigoAndEstado(String trilhaCodigo, String estado);
}