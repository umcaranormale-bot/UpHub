package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.Residencia;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResidenciaRepository extends JpaRepository<Residencia, Long> {

    List<Residencia> findAllByOrderByInicioDesc();

    List<Residencia> findByEstadoOrderByInicioDesc(String estado);

    Optional<Residencia> findByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCase(String codigo);
}
