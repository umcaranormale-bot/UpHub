package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.ResultadoProva;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ResultadoProvaRepository extends JpaRepository<ResultadoProva, Long> {

    List<ResultadoProva> findByPessoaIdOrderByDataProvaDesc(Long pessoaId);

    // a prova mais recente da pessoa na mesma área (área vazia conta como uma área)
    @Query("select r from ResultadoProva r where r.pessoaId = :pessoaId "
            + "and ((:area is null and r.area is null) or lower(r.area) = lower(:area)) "
            + "order by r.dataProva desc limit 1")
    Optional<ResultadoProva> ultimaNaArea(Long pessoaId, String area);
}
