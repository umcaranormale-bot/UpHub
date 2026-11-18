package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.RequisitoElegibilidade;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface RequisitoElegibilidadeRepository extends JpaRepository<RequisitoElegibilidade, Long> {

    @Query("select r from RequisitoElegibilidade r where r.versao.id = :versaoId order by r.ordem asc nulls last, r.id asc")
    List<RequisitoElegibilidade> listarPorVersao(Long versaoId);

    Optional<RequisitoElegibilidade> findByIdAndVersao_Id(Long id, Long versaoId);

    @Query("select coalesce(max(r.ordem), 0) from RequisitoElegibilidade r where r.versao.id = :versaoId")
    int maiorOrdem(Long versaoId);
}
