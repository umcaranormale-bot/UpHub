package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.Trilha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface TrilhaRepository extends JpaRepository<Trilha, String> {
}