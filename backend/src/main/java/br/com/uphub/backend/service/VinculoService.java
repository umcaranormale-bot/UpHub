package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.VinculoCadastroRequest;
import br.com.uphub.backend.dto.VinculoResponse;
import br.com.uphub.backend.model.Organizacao;
import br.com.uphub.backend.model.Pessoa;
import br.com.uphub.backend.model.Vinculo;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.VinculoRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VinculoService {

    private static final List<String> PAPEIS = List.of(
            "PROVEDOR", "CANDIDATO", "AVALIADOR", "MENTOR", "GESTAO");

    private final VinculoRepository vinculoRepository;
    private final PessoaRepository pessoaRepository;
    private final OrganizacaoRepository organizacaoRepository;

    public VinculoService(VinculoRepository vinculoRepository,
                          PessoaRepository pessoaRepository,
                          OrganizacaoRepository organizacaoRepository) {
        this.vinculoRepository = vinculoRepository;
        this.pessoaRepository = pessoaRepository;
        this.organizacaoRepository = organizacaoRepository;
    }

    @Transactional
    public VinculoResponse cadastrar(VinculoCadastroRequest dados) {
        if (dados.pessoaId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo pessoaId é obrigatório");
        }
        if (dados.organizacaoId() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo organizacaoId é obrigatório");
        }
        if (dados.papel() == null || dados.papel().isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo papel é obrigatório");
        }
        String papel = dados.papel().trim().toUpperCase(Locale.ROOT);
        if (!PAPEIS.contains(papel)) {
            throw erro(HttpStatus.BAD_REQUEST, "Papel inválido. Use: " + String.join(", ", PAPEIS));
        }

        Pessoa pessoa = pessoaRepository.findById(dados.pessoaId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Pessoa não encontrada"));
        Organizacao organizacao = organizacaoRepository.findById(dados.organizacaoId())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));

        boolean organizacaoDeGestao = "GESTAO".equals(organizacao.getTipo());
        if (organizacaoDeGestao != "GESTAO".equals(papel)) {
            throw erro(HttpStatus.BAD_REQUEST,
                    "O papel GESTAO só existe na organização de gestão, e ela só aceita esse papel");
        }

        if (vinculoRepository.existsByPessoa_IdAndOrganizacao_Id(pessoa.getId(), organizacao.getId())) {
            throw erro(HttpStatus.CONFLICT, "Esta pessoa já tem vínculo com esta organização");
        }

        Vinculo vinculo = new Vinculo(
                pessoa,
                organizacao,
                papel,
                opcional(dados.funcao(), "funcao", 120),
                Boolean.TRUE.equals(dados.representante()));

        return VinculoResponse.de(vinculoRepository.save(vinculo));
    }

    @Transactional(readOnly = true)
    public List<VinculoResponse> listar(Long pessoaId, Long organizacaoId) {
        if ((pessoaId == null) == (organizacaoId == null)) {
            throw erro(HttpStatus.BAD_REQUEST, "Informe pessoaId ou organizacaoId, um dos dois");
        }

        List<Vinculo> vinculos;
        if (pessoaId != null) {
            if (!pessoaRepository.existsById(pessoaId)) {
                throw erro(HttpStatus.NOT_FOUND, "Pessoa não encontrada");
            }
            vinculos = vinculoRepository.listarPorPessoa(pessoaId);
        } else {
            if (!organizacaoRepository.existsById(organizacaoId)) {
                throw erro(HttpStatus.NOT_FOUND, "Organização não encontrada");
            }
            vinculos = vinculoRepository.listarPorOrganizacao(organizacaoId);
        }
        return vinculos.stream().map(VinculoResponse::de).toList();
    }

    private String opcional(String valor, String campo, int maximo) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        String limpo = valor.trim();
        if (limpo.length() > maximo) {
            throw erro(HttpStatus.BAD_REQUEST,
                    "O campo " + campo + " aceita no máximo " + maximo + " caracteres");
        }
        return limpo;
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}