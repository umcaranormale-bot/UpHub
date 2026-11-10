package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.Convite;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConviteRepository extends JpaRepository<Convite, Long> {

    Optional<Convite> findByToken(String token);

    List<Convite> findByOrganizacaoId(Long organizacaoId);

    boolean existsByOrganizacaoIdAndPapelAndEmailIgnoreCaseAndSituacao(
            Long organizacaoId, String papel, String email, String situacao);
}