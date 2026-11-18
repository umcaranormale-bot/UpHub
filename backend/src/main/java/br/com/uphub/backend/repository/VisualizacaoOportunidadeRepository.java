package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.VisualizacaoOportunidade;
import br.com.uphub.backend.model.VisualizacaoOportunidadeId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VisualizacaoOportunidadeRepository
        extends JpaRepository<VisualizacaoOportunidade, VisualizacaoOportunidadeId> {

    List<VisualizacaoOportunidade> findById_OportunidadeIdOrderByUltimaEmDesc(Long oportunidadeId);
}
