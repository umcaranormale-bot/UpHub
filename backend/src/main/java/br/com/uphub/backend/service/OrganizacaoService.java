package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.OrganizacaoCadastroRequest;
import br.com.uphub.backend.dto.OrganizacaoEdicaoRequest;
import br.com.uphub.backend.dto.OrganizacaoResponse;
import br.com.uphub.backend.model.Documento;
import br.com.uphub.backend.model.Organizacao;
import br.com.uphub.backend.repository.DocumentoRepository;
import br.com.uphub.backend.repository.OrganizacaoRepository;
import java.time.Year;
import java.util.List;
import java.util.Locale;
import br.com.uphub.backend.model.Pessoa;
import br.com.uphub.backend.model.Vinculo;
import br.com.uphub.backend.repository.PessoaRepository;
import br.com.uphub.backend.repository.VinculoRepository;
import br.com.uphub.backend.seguranca.Acesso;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrganizacaoService {

    // os tipos do desafio: quem se candidata (empresa, startup, squad) e quem oferece oportunidades
    private static final List<String> TIPOS = List.of(
            "EMPRESA", "STARTUP", "SQUAD", "ORGAO_FOMENTO", "INVESTIDOR", "ACELERADORA", "EMPRESA_PARCEIRA");

    private static final List<String> TIPOS_PROVEDORES = List.of("ORGAO_FOMENTO", "INVESTIDOR", "ACELERADORA", "EMPRESA_PARCEIRA");
    private static final List<String> PAPEIS_DE_QUEM_CADASTRA = List.of("PROVEDOR", "CANDIDATO");

    private final OrganizacaoRepository organizacaoRepository;
    private final PessoaRepository pessoaRepository;
    private final VinculoRepository vinculoRepository;
    private final DocumentoRepository documentoRepository;
    private final Acesso acesso;

    public OrganizacaoService(OrganizacaoRepository organizacaoRepository,
                              PessoaRepository pessoaRepository,
                              VinculoRepository vinculoRepository,
                              DocumentoRepository documentoRepository,
                              Acesso acesso) {
        this.organizacaoRepository = organizacaoRepository;
        this.pessoaRepository = pessoaRepository;
        this.vinculoRepository = vinculoRepository;
        this.documentoRepository = documentoRepository;
        this.acesso = acesso;
    }

    @Transactional
    public OrganizacaoResponse cadastrar(OrganizacaoCadastroRequest dados, Long pessoaId) {
        String tipo = obrigatorio(dados.tipo(), "tipo", 30).toUpperCase(Locale.ROOT);
        if (!TIPOS.contains(tipo)) {
            throw erro(HttpStatus.BAD_REQUEST, "Tipo inválido. Use: " + String.join(", ", TIPOS));
        }
        String nome = obrigatorio(dados.nome(), "nome", 200);
        String cnpj = cnpj(dados.cnpj());

        // quem cadastra entra na organização como representante. Sem papel informado,
        // órgão de fomento, investidor, aceleradora e empresa parceira entram como PROVEDOR; os outros, como CANDIDATO
        String papel = TIPOS_PROVEDORES.contains(tipo) ? "PROVEDOR" : "CANDIDATO";
        if (dados.papel() != null && !dados.papel().isBlank()) {
            papel = dados.papel().trim().toUpperCase(Locale.ROOT);
            if (!PAPEIS_DE_QUEM_CADASTRA.contains(papel)) {
                throw erro(HttpStatus.BAD_REQUEST, "Papel inválido. Use: PROVEDOR ou CANDIDATO");
            }
        }

        if (cnpj != null && organizacaoRepository.existsByCnpj(cnpj)) {
            throw erro(HttpStatus.CONFLICT, "Este CNPJ já está cadastrado");
        }

        Short ano = dados.anoFundacao();
        if (ano != null && (ano < 1800 || ano > Year.now().getValue())) {
            throw erro(HttpStatus.BAD_REQUEST, "O ano de fundação é inválido");
        }

        String uf = opcional(dados.sedeUf(), "sedeUf", 2);
        if (uf != null) {
            if (!uf.matches("[A-Za-z]{2}")) {
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
        organizacao.setDescricao(texto(dados.descricao()));

        Organizacao salva = organizacaoRepository.save(organizacao);
        Pessoa pessoa = pessoaRepository.findById(pessoaId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Pessoa não encontrada"));
        vinculoRepository.save(new Vinculo(pessoa, salva, papel, null, true));

        return OrganizacaoResponse.de(salva);
    }

    // o representante edita o perfil; o deck é um documento da própria startup
    @Transactional
    public OrganizacaoResponse editar(Long id, OrganizacaoEdicaoRequest dados, Long pessoaId) {
        Organizacao organizacao = organizacaoRepository.findById(id)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));
        acesso.exigirRepresentante(pessoaId, id, "editar o perfil da organização");
        if (dados == null) {
            return OrganizacaoResponse.de(organizacao);
        }
        if (dados.nome() != null) {
            organizacao.setNome(obrigatorio(dados.nome(), "nome", 200));
        }
        if (dados.cnpj() != null) {
            String cnpj = cnpj(dados.cnpj());
            if (cnpj != null && !cnpj.equals(organizacao.getCnpj()) && organizacaoRepository.existsByCnpj(cnpj)) {
                throw erro(HttpStatus.CONFLICT, "Este CNPJ já está cadastrado");
            }
            organizacao.setCnpj(cnpj);
        }
        if (dados.anoFundacao() != null) {
            Short ano = dados.anoFundacao();
            if (ano < 1800 || ano > Year.now().getValue()) {
                throw erro(HttpStatus.BAD_REQUEST, "O ano de fundação é inválido");
            }
            organizacao.setAnoFundacao(ano);
        }
        if (dados.sedeUf() != null) {
            String uf = opcional(dados.sedeUf(), "sedeUf", 2);
            if (uf != null && !uf.matches("[A-Za-z]{2}")) {
                throw erro(HttpStatus.BAD_REQUEST, "A UF precisa ter 2 letras");
            }
            organizacao.setSedeUf(uf == null ? null : uf.toUpperCase());
        }
        if (dados.razaoSocial() != null) {
            organizacao.setRazaoSocial(opcional(dados.razaoSocial(), "razaoSocial", 200));
        }
        if (dados.porte() != null) {
            organizacao.setPorte(opcional(dados.porte(), "porte", 30));
        }
        if (dados.setor() != null) {
            organizacao.setSetor(opcional(dados.setor(), "setor", 80));
        }
        if (dados.estagio() != null) {
            organizacao.setEstagio(opcional(dados.estagio(), "estagio", 40));
        }
        if (dados.sedeCidade() != null) {
            organizacao.setSedeCidade(opcional(dados.sedeCidade(), "sedeCidade", 80));
        }
        if (dados.descricao() != null) {
            organizacao.setDescricao(texto(dados.descricao()));
        }
        if (dados.deckDocumentoId() != null) {
            if (!"STARTUP".equals(organizacao.getTipo())) {
                throw erro(HttpStatus.BAD_REQUEST, "O deck é do perfil da startup");
            }
            Documento deck = documentoRepository.findById(dados.deckDocumentoId())
                    .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Documento não encontrado"));
            if (!deck.getOrganizacao().getId().equals(id)) {
                throw erro(HttpStatus.BAD_REQUEST, "O deck precisa ser um documento da própria startup");
            }
            organizacao.setDeckDocumentoId(deck.getId());
        }
        return OrganizacaoResponse.de(organizacaoRepository.saveAndFlush(organizacao));
    }

    @Transactional(readOnly = true)
    public List<OrganizacaoResponse> listar(String nome, Long pessoaId) {
        boolean semNome = nome == null || nome.isBlank();
        List<Organizacao> encontradas;
        if (acesso.ehGestao(pessoaId)) {
            // a gestão vê todas as organizações
            encontradas = semNome
                    ? organizacaoRepository.findAll()
                    : organizacaoRepository.findByNomeContainingIgnoreCase(nome.trim());
        } else {
            // os outros veem só as organizações em que têm vínculo
            List<Long> minhas = acesso.organizacoesDa(pessoaId);
            encontradas = semNome
                    ? organizacaoRepository.findByIdIn(minhas)
                    : organizacaoRepository.findByIdInAndNomeContainingIgnoreCase(minhas, nome.trim());
        }
        return encontradas.stream().map(OrganizacaoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public OrganizacaoResponse buscarPorId(Long id) {
        return organizacaoRepository.findById(id)
                .map(OrganizacaoResponse::de)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Organização não encontrada"));
    }

    private String texto(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
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