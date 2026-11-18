package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.ItemAjuste;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemAjusteRepository extends JpaRepository<ItemAjuste, Long> {

    List<ItemAjuste> findByPedidoAjusteIdOrderById(Long pedidoAjusteId);
}
