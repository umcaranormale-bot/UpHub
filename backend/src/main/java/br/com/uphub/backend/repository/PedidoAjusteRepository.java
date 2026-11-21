package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.PedidoAjuste;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoAjusteRepository extends JpaRepository<PedidoAjuste, Long> {

    List<PedidoAjuste> findByCandidaturaIdOrderByPedidoEm(Long candidaturaId);

    Optional<PedidoAjuste> findFirstByCandidaturaIdAndSituacaoInOrderByPedidoEmDesc(Long candidaturaId, List<String> situacoes);

    long countByCandidaturaIdAndSituacao(Long candidaturaId, String situacao);

    List<PedidoAjuste> findBySituacaoAndPrazoReenvioBefore(String situacao, OffsetDateTime agora);
}
