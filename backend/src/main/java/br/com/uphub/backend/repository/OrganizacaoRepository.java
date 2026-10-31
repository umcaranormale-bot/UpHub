package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.Organizacao;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizacaoRepository extends JpaRepository<Organizacao, Long> {

    boolean existsByCnpj(String cnpj);

    List<Organizacao> findByNomeContainingIgnoreCase(String nome);
}