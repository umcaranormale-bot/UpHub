package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.SessaoMentoria;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessaoMentoriaRepository extends JpaRepository<SessaoMentoria, Long> {

    List<SessaoMentoria> findByAlocacaoIdInOrderByDataSessaoAscIdAsc(Collection<Long> alocacaoIds);

    List<SessaoMentoria> findByAlocacaoIdAndSituacaoAndDataSessaoBetween(Long alocacaoId, String situacao,
                                                                          LocalDate inicio, LocalDate fim);
}
