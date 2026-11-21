package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.Notificacao;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    List<Notificacao> findByPessoaIdOrderByCriadaEmDescIdDesc(Long pessoaId);

    List<Notificacao> findByPessoaIdAndLidaEmIsNullOrderByCriadaEmDescIdDesc(Long pessoaId);

    @Modifying
    @Query("update Notificacao n set n.lidaEm = CURRENT_TIMESTAMP where n.pessoaId = :pessoaId and n.lidaEm is null")
    int marcarTodasLidas(Long pessoaId);
}