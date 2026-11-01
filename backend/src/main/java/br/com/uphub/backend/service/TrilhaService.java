package br.com.uphub.backend.service;

import br.com.uphub.backend.model.OrganizacaoTrilha;
import br.com.uphub.backend.model.Trilha;
import br.com.uphub.backend.repository.OrganizacaoTrilhaRepository;
import br.com.uphub.backend.repository.TrilhaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrilhaService {

    @Autowired
    private TrilhaRepository trilhaRepository;

    @Autowired
    private OrganizacaoTrilhaRepository organizacaoTrilhaRepository;

    public List<Trilha> listarTodasTrilhas() {
        return trilhaRepository.findAll();
    }

    public List<OrganizacaoTrilha> listarTrilhasPorOrganizacao(Long organizacaoId) {
        return organizacaoTrilhaRepository.findByOrganizacaoId(organizacaoId);
    }
}
