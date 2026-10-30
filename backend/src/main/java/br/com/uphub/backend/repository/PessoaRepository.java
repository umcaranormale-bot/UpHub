package br.com.uphub.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.uphub.backend.model.Pessoa;

public interface PessoaRepository extends JpaRepository<Pessoa, Long> {

    boolean existsByEmailIgnoreCase(String email);

    Optional<Pessoa> findByEmailIgnoreCase(String email);
}