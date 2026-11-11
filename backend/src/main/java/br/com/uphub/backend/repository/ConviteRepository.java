package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.Convite;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConviteRepository extends JpaRepository<Convite, Long> {

    Optional<Convite> findByTokenHash(String tokenHash);

    List<Convite> findByOrganizacaoId(Long organizacaoId);

    Optional<Convite> findFirstByOrganizacaoIdAndPapelAndEmailIgnoreCaseAndSituacao(
            Long organizacaoId, String papel, String email, String situacao);
}