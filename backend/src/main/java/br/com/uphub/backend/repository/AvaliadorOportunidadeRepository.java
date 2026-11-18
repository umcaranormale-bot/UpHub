package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.AvaliadorOportunidade;
import br.com.uphub.backend.model.AvaliadorOportunidadeId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AvaliadorOportunidadeRepository extends JpaRepository<AvaliadorOportunidade, AvaliadorOportunidadeId> {

    List<AvaliadorOportunidade> findById_OportunidadeIdOrderByDesignadoEm(Long oportunidadeId);

    // as designações de uma pessoa, pelos vínculos ativos dela
    @Query("select a from AvaliadorOportunidade a, Vinculo v where v.id = a.id.vinculoId "
            + "and v.pessoa.id = :pessoaId and v.encerradoEm is null order by a.designadoEm desc")
    List<AvaliadorOportunidade> designacoesDa(@Param("pessoaId") Long pessoaId);
}
