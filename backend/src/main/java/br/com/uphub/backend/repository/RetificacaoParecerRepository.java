package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.RetificacaoParecer;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RetificacaoParecerRepository extends JpaRepository<RetificacaoParecer, Long> {

    List<RetificacaoParecer> findByAvaliacaoIdOrderByRetificadaEm(Long avaliacaoId);

    Optional<RetificacaoParecer> findFirstByAvaliacaoIdOrderByRetificadaEmDesc(Long avaliacaoId);
}
