package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.AlocacaoMentor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AlocacaoMentorRepository extends JpaRepository<AlocacaoMentor, Long> {

    List<AlocacaoMentor> findByCandidaturaIdOrderByConvidadaEm(Long candidaturaId);

    boolean existsByVinculoIdAndCandidaturaId(Long vinculoId, Long candidaturaId);

    List<AlocacaoMentor> findBySituacaoAndPrazoRespostaBefore(String situacao, LocalDate hoje);

    // as horas por mês que o mentor já tem comprometidas (aceitas e convites em aberto)
    @Query("select coalesce(sum(a.horasPrevistasMes), 0) from AlocacaoMentor a "
            + "where a.vinculoId = :vinculoId and a.situacao in ('PENDENTE', 'ACEITA')")
    BigDecimal horasComprometidas(@Param("vinculoId") Long vinculoId);

    // as alocações de uma pessoa, pelos vínculos ativos dela
    @Query("select a from AlocacaoMentor a, Vinculo v where v.id = a.vinculoId and v.pessoa.id = :pessoaId "
            + "and v.encerradoEm is null order by a.convidadaEm desc")
    List<AlocacaoMentor> doMentor(@Param("pessoaId") Long pessoaId);

    @Query("select count(a) from AlocacaoMentor a, Vinculo v where v.id = a.vinculoId and v.pessoa.id = :pessoaId "
            + "and a.candidaturaId = :candidaturaId and a.situacao in :situacoes")
    long contarDoMentor(@Param("candidaturaId") Long candidaturaId, @Param("pessoaId") Long pessoaId,
                        @Param("situacoes") Collection<String> situacoes);
}
