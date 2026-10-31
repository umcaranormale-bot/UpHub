package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.OrganizacaoCadastroRequest;
import br.com.uphub.backend.dto.OrganizacaoResponse;
import br.com.uphub.backend.model.Organizacao;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import java.time.Year;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrganizacaoService {

    private final OrganizacaoRepository organizacaoRepository;

    public OrganizacaoService(OrganizacaoRepository organizacaoRepository) {
        this.organizacaoRepository = organizacaoRepository;
    }

    @Transactional
    public OrganizacaoResponse cadastrar(OrganizacaoCadastroRequest dados) {
        String tipo = obrigatorio(dados.tipo(), "tipo", 30).toLowerCase();
        String nome = obrigatorio(dados.nome(), "nome", 200);
        String cnpj = cnpj(dados.cnpj());

        if (cnpj != null && organizacaoRepository.existsByCnpj(cnpj)) {
            throw erro(HttpStatus.CONFLICT, "Este CNPJ já está cadastrado");
        }

        Short ano = dados.anoFundacao();
        if (ano != null && (ano < 1800 || ano > Year.now().getValue())) {
            throw erro(HttpStatus.BAD_REQUEST, "O ano de fundação é inválido");
        }

        String uf = opcional(dados.sedeUf(), "sedeUf", 2);
        if (uf != null) {
            if (uf.length() != 2) {
                throw erro(HttpStatus.BAD_REQUEST, "A UF precisa ter 2 letras");
            }
            uf = uf.toUpperCase();
        }

        Organizacao organizacao = new Organizacao();
        organizacao.setTipo(tipo);
        organizacao.setNome(nome);
        organizacao.setRazaoSocial(opcional(dados.razaoSocial(), "razaoSocial", 200));
        organizacao.setCnpj(cnpj);
        organizacao.setPorte(opcional(dados.porte(), "porte", 30));
        organizacao.setSetor(opcional(dados.setor(), "setor", 80));
        organizacao.setEstagio(opcional(dados.estagio(), "estagio", 40));
        organizacao.setAnoFundacao(ano);
        organizacao.setSedeCidade(opcional(dados.sedeCidade(), "sedeCidade", 80));
        organizacao.setSedeUf(uf);

        return OrganizacaoResponse.de(organizacaoRepository.save(organizacao));
    }

    @Transactional(readOnly = true)
    public List<OrganizacaoResponse> listar(String nome) {
        List<Organizacao> encontradas = (nome == null || nome.isBlank())
                ? organizacaoRepository.findAll()
                : organizacaoRepository.findByNomeContainingIgnoreCase(nome.trim());
        return encontradas.stream().map(OrganizacaoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public OrganizacaoResponse buscarPorId(Long id) {
        return organizacaoRepository.findById(id)
                .map(OrganizacaoResponse::de)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));
    }

    private String cnpj(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        String digitos = valor.replaceAll("[^0-9]", "");
        if (digitos.length() != 14) {
            throw erro(HttpStatus.BAD_REQUEST, "O CNPJ precisa ter 14 números");
        }
        return digitos;
    }

    private String obrigatorio(String valor, String campo, int maximo) {
        if (valor == null || valor.isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo " + campo + " é obrigatório");
        }
        return limite(valor.trim(), campo, maximo);
    }

    private String opcional(String valor, String campo, int maximo) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return limite(valor.trim(), campo, maximo);
    }

    private String limite(String valor, String campo, int maximo) {
        if (valor.length() > maximo) {
            throw erro(HttpStatus.BAD_REQUEST,
                    "O campo " + campo + " aceita no máximo " + maximo + " caracteres");
        }
        return valor;
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}