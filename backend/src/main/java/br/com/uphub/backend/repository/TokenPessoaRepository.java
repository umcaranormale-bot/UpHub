package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.TokenPessoa;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TokenPessoaRepository extends JpaRepository<TokenPessoa, Long> {

    Optional<TokenPessoa> findFirstByPessoaIdAndFinalidadeAndUsadoEmIsNullAndCanceladoEmIsNull(
            Long pessoaId, String finalidade);

    Optional<TokenPessoa> findFirstByTokenHashAndFinalidadeAndUsadoEmIsNullAndCanceladoEmIsNull(
            String tokenHash, String finalidade);
}