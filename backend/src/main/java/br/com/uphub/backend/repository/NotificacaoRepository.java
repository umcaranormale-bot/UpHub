package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.Notificacao;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    // a tela mostra as 50 mais novas
    List<Notificacao> findTop50ByPessoaIdOrderByCriadaEmDescIdDesc(Long pessoaId);

    List<Notificacao> findTop50ByPessoaIdAndLidaEmIsNullOrderByCriadaEmDescIdDesc(Long pessoaId);

    long countByPessoaIdAndLidaEmIsNull(Long pessoaId);

    boolean existsByPessoaIdAndOportunidadeIdAndTituloAndCriadaEmAfter(Long pessoaId, Long oportunidadeId,
                                                                      String titulo, OffsetDateTime desde);

    @Modifying(clearAutomatically = true)
    @Query("update Notificacao n set n.lidaEm = CURRENT_TIMESTAMP where n.pessoaId = :pessoaId and n.lidaEm is null")
    int marcarTodasLidas(@Param("pessoaId") Long pessoaId);
}
