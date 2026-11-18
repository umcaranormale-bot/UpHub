package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.EntrarResidenciaRequest;
import br.com.uphub.backend.dto.OportunidadeResponse;
import br.com.uphub.backend.dto.ResidenciaRequest;
import br.com.uphub.backend.dto.ResidenciaResponse;
import br.com.uphub.backend.dto.SquadResponse;
import br.com.uphub.backend.model.Residencia;
import br.com.uphub.backend.model.Squad;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.ResidenciaRepository;
import br.com.uphub.backend.repository.SquadRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Service
public class ResidenciaService {

    // sem 0, O, 1, I e L, para o código não ser lido errado
    private static final String LETRAS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final SecureRandom SORTEIO = new SecureRandom();

    private final ResidenciaRepository residenciaRepository;
    private final SquadRepository squadRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final Acesso acesso;

    public ResidenciaService(ResidenciaRepository residenciaRepository,
                             SquadRepository squadRepository,
                             OportunidadeRepository oportunidadeRepository,
                             Acesso acesso) {
        this.residenciaRepository = residenciaRepository;
        this.squadRepository = squadRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.acesso = acesso;
    }

    // ---------- coordenação (gestão do Porto Digital)

    @Transactional
    public ResidenciaResponse abrir(ResidenciaRequest dados, Long pessoaId) {
        acesso.exigirGestao(pessoaId, "abrir residências");
        if (dados == null || dados.nome() == null || dados.nome().isBlank() || dados.inicio() == null || dados.fim() == null) {
            throw erro(HttpStatus.BAD_REQUEST, "Os campos nome, inicio e fim são obrigatórios");
        }
        String nome = nome(dados.nome());
        exigirPeriodo(dados.inicio(), dados.fim());
        String descricao = dados.descricao() == null || dados.descricao().isBlank() ? null : dados.descricao().trim();
        Residencia residencia = residenciaRepository.save(new Residencia(nome, descricao, novoCodigo(), dados.inicio(),
                dados.fim(), pessoaId, OffsetDateTime.now()));
        return resposta(residencia, true);
    }

    @Transactional
    public ResidenciaResponse editar(Long id, ResidenciaRequest dados, Long pessoaId) {
        acesso.exigirGestao(pessoaId, "editar residências");
        Residencia residencia = buscar(id);
        if (!residencia.aberta()) {
            throw erro(HttpStatus.CONFLICT, "Esta residência já foi encerrada");
        }
        if (dados == null) {
            return resposta(residencia, true);
        }
        String nome = dados.nome() == null ? null : nome(dados.nome());
        LocalDate inicio = dados.inicio() != null ? dados.inicio() : residencia.getInicio();
        LocalDate fim = dados.fim() != null ? dados.fim() : residencia.getFim();
        if (fim.isBefore(inicio)) {
            throw erro(HttpStatus.BAD_REQUEST, "O fim não pode ser antes do início");
        }
        residencia.editar(nome, dados.descricao() == null ? null : dados.descricao().trim(), dados.inicio(), dados.fim());
        return resposta(residenciaRepository.saveAndFlush(residencia), true);
    }

    @Transactional
    public ResidenciaResponse encerrar(Long id, Long pessoaId) {
        acesso.exigirGestao(pessoaId, "encerrar residências");
        Residencia residencia = buscar(id);
        if (!residencia.aberta()) {
            throw erro(HttpStatus.CONFLICT, "Esta residência já foi encerrada");
        }
        residencia.encerrar(OffsetDateTime.now());
        return resposta(residenciaRepository.saveAndFlush(residencia), true);
    }

    // ---------- squad

    // quem monta a squad entra na residência com o código que a coordenação passou
    @Transactional
    public SquadResponse entrar(Long squadId, EntrarResidenciaRequest dados, Long pessoaId) {
        if (dados == null || dados.codigo() == null || dados.codigo().isBlank()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo codigo é obrigatório");
        }
        Squad squad = squadRepository.buscarComOrganizacao(squadId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Squad não encontrada"));
        acesso.exigir(pessoaId, squadId, Permissao.MONTAR_SQUAD);
        Residencia residencia = residenciaRepository.findByCodigoIgnoreCase(dados.codigo().trim())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Código de residência não encontrado"));
        if (!residencia.aberta()) {
            throw erro(HttpStatus.CONFLICT, "Esta residência já foi encerrada");
        }
        if (residencia.getId().equals(squad.getResidenciaId())) {
            throw erro(HttpStatus.CONFLICT, "A squad já está nesta residência");
        }
        squad.entrarNaResidencia(residencia.getId(), residencia.getCodigo());
        return SquadResponse.de(squadRepository.saveAndFlush(squad));
    }

    // ---------- leitura

    // qualquer pessoa logada vê as residências (sem o código); a gestão vê tudo
    @Transactional(readOnly = true)
    public List<ResidenciaResponse> listar(Long pessoaId) {
        boolean gestao = acesso.ehGestao(pessoaId);
        return (gestao ? residenciaRepository.findAllByOrderByInicioDesc() : residenciaRepository.findByEstadoOrderByInicioDesc("ABERTA"))
                .stream().map(r -> resposta(r, gestao)).toList();
    }

    @Transactional(readOnly = true)
    public ResidenciaResponse buscarPorId(Long id, Long pessoaId) {
        return resposta(buscar(id), acesso.ehGestao(pessoaId));
    }

    @Transactional(readOnly = true)
    public List<OportunidadeResponse> desafios(Long id) {
        buscar(id);
        return oportunidadeRepository.findByResidenciaId(id).stream()
                .filter(o -> !"RASCUNHO".equals(o.getEstado()))
                .map(OportunidadeResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public List<SquadResponse> squads(Long id, Long pessoaId) {
        acesso.exigirGestao(pessoaId, "ver as squads da residência");
        buscar(id);
        return squadRepository.findByResidenciaId(id).stream().map(SquadResponse::de).toList();
    }

    // usado pela oportunidade: o desafio só entra numa residência aberta
    public Residencia aberta(Long id) {
        Residencia residencia = residenciaRepository.findById(id)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Residência não encontrada"));
        if (!residencia.aberta()) {
            throw erro(HttpStatus.CONFLICT, "Esta residência já foi encerrada");
        }
        return residencia;
    }

    // ---------- apoio

    private String novoCodigo() {
        String codigo;
        do {
            StringBuilder sb = new StringBuilder("RES-");
            for (int i = 0; i < 6; i++) {
                sb.append(LETRAS.charAt(SORTEIO.nextInt(LETRAS.length())));
            }
            codigo = sb.toString();
        } while (residenciaRepository.existsByCodigoIgnoreCase(codigo));
        return codigo;
    }

    private String nome(String valor) {
        String nome = valor.trim();
        if (nome.isEmpty()) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo nome não pode ficar vazio");
        }
        if (nome.length() > 200) {
            throw erro(HttpStatus.BAD_REQUEST, "O campo nome aceita no máximo 200 caracteres");
        }
        return nome;
    }

    private void exigirPeriodo(LocalDate inicio, LocalDate fim) {
        if (fim.isBefore(inicio)) {
            throw erro(HttpStatus.BAD_REQUEST, "O fim não pode ser antes do início");
        }
    }

    private Residencia buscar(Long id) {
        return residenciaRepository.findById(id).orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Residência não encontrada"));
    }

    private ResidenciaResponse resposta(Residencia r, boolean comCodigo) {
        int squads = squadRepository.findByResidenciaId(r.getId()).size();
        int desafios = (int) oportunidadeRepository.findByResidenciaId(r.getId()).stream()
                .filter(o -> !"RASCUNHO".equals(o.getEstado())).count();
        return new ResidenciaResponse(r.getId(), r.getNome(), r.getDescricao(), comCodigo ? r.getCodigo() : null,
                r.getInicio(), r.getFim(), r.getEstado(), squads, desafios, r.getCriadaEm(), r.getEncerradaEm());
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
