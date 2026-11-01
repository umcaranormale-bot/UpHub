package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.TrilhaResponse;
import br.com.uphub.backend.repository.TrilhaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TrilhaService {

    private final TrilhaRepository trilhaRepository;

    public TrilhaService(TrilhaRepository trilhaRepository) {
        this.trilhaRepository = trilhaRepository;
    }

    @Transactional(readOnly = true)
    public List<TrilhaResponse> listar() {
        return trilhaRepository.findAll().stream()
                .map(TrilhaResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public TrilhaResponse buscarPorCodigo(String codigo) {
        return trilhaRepository.findById(codigo.toUpperCase())
                .map(TrilhaResponse::de)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Trilha não encontrada"));
    }
}