package br.com.uphub.backend.service;

import br.com.uphub.backend.candidatura.MaquinaDeEstados.Ator;
import br.com.uphub.backend.dto.CandidaturaResponse;
import br.com.uphub.backend.dto.VagasResponse;
import br.com.uphub.backend.model.Candidatura;
import br.com.uphub.backend.model.Oportunidade;
import br.com.uphub.backend.model.ReservaVagas;
import br.com.uphub.backend.model.VersaoOportunidade;
import br.com.uphub.backend.repository.AutodeclaracaoReservaRepository;
import br.com.uphub.backend.repository.CandidaturaRepository;
import br.com.uphub.backend.repository.OportunidadeRepository;
import br.com.uphub.backend.repository.ReservaVagasRepository;
import br.com.uphub.backend.repository.VersaoOportunidadeRepository;
import br.com.uphub.backend.seguranca.Acesso;
import br.com.uphub.backend.seguranca.Permissao;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

// Depois da avaliação: homologação dentro das vagas (com as reservas), lista de espera, convocação,
// acompanhamento, conclusão e desistência.
@Service
public class ResultadoService {

    // quem já ocupa uma vaga
    private static final Set<String> OCUPAM_VAGA = Set.of("HOMOLOGADA", "EM_ACOMPANHAMENTO", "CONCLUIDA");

    private final CandidaturaRepository candidaturaRepository;
    private final VersaoOportunidadeRepository versaoRepository;
    private final ReservaVagasRepository reservaRepository;
    private final AutodeclaracaoReservaRepository autodeclaracaoRepository;
    private final OportunidadeRepository oportunidadeRepository;
    private final CandidaturaService candidaturaService;
    private final Acesso acesso;
    private final AuditoriaService auditoria;

    public ResultadoService(CandidaturaRepository candidaturaRepository,
                            VersaoOportunidadeRepository versaoRepository,
                            ReservaVagasRepository reservaRepository,
                            AutodeclaracaoReservaRepository autodeclaracaoRepository,
                            OportunidadeRepository oportunidadeRepository,
                            CandidaturaService candidaturaService,
                            Acesso acesso,
                            AuditoriaService auditoria) {
        this.candidaturaRepository = candidaturaRepository;
        this.versaoRepository = versaoRepository;
        this.reservaRepository = reservaRepository;
        this.autodeclaracaoRepository = autodeclaracaoRepository;
        this.oportunidadeRepository = oportunidadeRepository;
        this.candidaturaService = candidaturaService;
        this.acesso = acesso;
        this.auditoria = auditoria;
    }

    // ---------- provedor

    @Transactional
    public CandidaturaResponse homologar(Long candidaturaId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.comoProvedor(candidaturaId, pessoaId);
        exigirEstado(candidatura, "APROVADA", "Só a candidatura aprovada é homologada");
        Vagas vagas = vagas(candidatura);
        String semVaga = vagas.motivoSemVaga(candidatura);
        if (semVaga != null) {
            throw erro(HttpStatus.CONFLICT, semVaga + ". Use a lista de espera");
        }
        return CandidaturaResponse.de(moverERegistrar(candidatura, "HOMOLOGADA", Ator.PROVEDOR, pessoaId));
    }

    // a aprovada sem vaga entra no fim da lista
    @Transactional
    public CandidaturaResponse listaDeEspera(Long candidaturaId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.comoProvedor(candidaturaId, pessoaId);
        exigirEstado(candidatura, "APROVADA", "Só a candidatura aprovada entra na lista de espera");
        short ultima = candidaturaRepository.findByOportunidadeIdAndEstadoOrderByPosicaoLista(candidatura.getOportunidadeId(), "LISTA_DE_ESPERA")
                .stream().map(Candidatura::getPosicaoLista).max(Short::compare).orElse((short) 0);
        candidatura.entrarNaLista((short) (ultima + 1));
        return CandidaturaResponse.de(moverERegistrar(candidatura, "LISTA_DE_ESPERA", Ator.PROVEDOR, pessoaId));
    }

    // convoca da lista: vale a ordem, entre as que cabem nas vagas que abriram
    @Transactional
    public CandidaturaResponse convocar(Long candidaturaId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.comoProvedor(candidaturaId, pessoaId);
        exigirEstado(candidatura, "LISTA_DE_ESPERA", "Só se convoca quem está na lista de espera");
        Vagas vagas = vagas(candidatura);
        List<Candidatura> cabem = candidaturaRepository
                .findByOportunidadeIdAndEstadoOrderByPosicaoLista(candidatura.getOportunidadeId(), "LISTA_DE_ESPERA").stream()
                .filter(c -> vagas.motivoSemVaga(c) == null)
                .toList();
        if (cabem.isEmpty()) {
            throw erro(HttpStatus.CONFLICT, vagas.motivoSemVaga(candidatura));
        }
        Candidatura primeira = cabem.get(0);
        if (!primeira.getId().equals(candidatura.getId())) {
            throw erro(HttpStatus.CONFLICT, "Respeite a ordem da lista: convoque antes a candidatura " + primeira.getId()
                    + " (posição " + primeira.getPosicaoLista() + ")");
        }
        candidatura.sairDaLista();
        return CandidaturaResponse.de(moverERegistrar(candidatura, "HOMOLOGADA", Ator.PROVEDOR, pessoaId));
    }

    @Transactional
    public CandidaturaResponse naoConvocar(Long candidaturaId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.comoProvedor(candidaturaId, pessoaId);
        exigirEstado(candidatura, "LISTA_DE_ESPERA", "Só sai da lista quem está nela");
        candidatura.sairDaLista();
        return CandidaturaResponse.de(moverERegistrar(candidatura, "NAO_CONVOCADA", Ator.PROVEDOR, pessoaId));
    }

    @Transactional
    public CandidaturaResponse iniciarAcompanhamento(Long candidaturaId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.comoProvedor(candidaturaId, pessoaId);
        return CandidaturaResponse.de(moverERegistrar(candidatura, "EM_ACOMPANHAMENTO", Ator.PROVEDOR, pessoaId));
    }

    @Transactional
    public CandidaturaResponse concluir(Long candidaturaId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.comoProvedor(candidaturaId, pessoaId);
        return CandidaturaResponse.de(moverERegistrar(candidatura, "CONCLUIDA", Ator.PROVEDOR, pessoaId));
    }

    // ---------- organização candidata

    @Transactional
    public CandidaturaResponse desistir(Long candidaturaId, Long pessoaId) {
        Candidatura candidatura = candidaturaService.paraLeitura(candidaturaId, pessoaId);
        acesso.exigir(pessoaId, candidatura.getOrganizacaoId(), Permissao.CANDIDATAR);
        return CandidaturaResponse.de(moverERegistrar(candidatura, "DESISTENTE", Ator.CANDIDATO, pessoaId));
    }

    // ---------- leitura

    @Transactional(readOnly = true)
    public VagasResponse resumo(Long oportunidadeId, Long pessoaId) {
        Oportunidade oportunidade = oportunidadeRepository.findById(oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Oportunidade não encontrada"));
        if (!acesso.ehGestao(pessoaId)) {
            acesso.exigir(pessoaId, oportunidade.getOrganizacaoId(), Permissao.CONDUZIR_SELECAO);
        }
        VersaoOportunidade versao = versaoRepository.findFirstByOportunidadeIdAndPublicadaEmIsNotNull(oportunidadeId)
                .orElseThrow(() -> erro(HttpStatus.CONFLICT, "Esta oportunidade ainda não foi publicada"));
        Vagas vagas = calcular(oportunidadeId, versao);
        List<VagasResponse.NaLista> lista = candidaturaRepository
                .findByOportunidadeIdAndEstadoOrderByPosicaoLista(oportunidadeId, "LISTA_DE_ESPERA").stream()
                .map(c -> new VagasResponse.NaLista(c.getId(), c.getTituloProposta(), c.getPosicaoLista()))
                .toList();
        return new VagasResponse(oportunidadeId, vagas.total, vagas.ocupadas,
                vagas.total == null ? null : Math.max(0, vagas.total - vagas.ocupadas),
                vagas.reservas.stream().map(r -> new VagasResponse.Reserva(r.getCriterio(), r.getQuantidade(),
                        vagas.ocupadasNaReserva.getOrDefault(r.getId(), 0))).toList(),
                lista);
    }

    // ---------- auditoria

    // muda o estado pela máquina e registra quem fez, de qual estado e para qual
    private Candidatura moverERegistrar(Candidatura candidatura, String para, Ator ator, Long pessoaId) {
        String estadoAntes = candidatura.getEstado();
        Candidatura movida = candidaturaService.moverPor(candidatura, para, ator);
        auditoria.registrarTransicaoCandidatura(movida, pessoaId, null, ator.name(), estadoAntes, para, null);
        return movida;
    }

    // ---------- contas das vagas

    private Vagas vagas(Candidatura candidatura) {
        VersaoOportunidade versao = versaoRepository.findById(candidatura.getVersaoId()).orElseThrow();
        return calcular(candidatura.getOportunidadeId(), versao);
    }

    // cada homologada ocupa a primeira reserva em que se declarou e que ainda tem lugar; senão, ampla concorrência
    private Vagas calcular(Long oportunidadeId, VersaoOportunidade versao) {
        List<ReservaVagas> reservas = reservaRepository.findByVersao_IdOrderById(versao.getId());
        List<Candidatura> ocupando = candidaturaRepository.findByOportunidadeIdAndEstadoInOrderByEnviadaEm(oportunidadeId, OCUPAM_VAGA);
        Map<Long, Integer> naReserva = new HashMap<>();
        for (Candidatura c : ocupando) {
            Set<String> declarados = declarados(c);
            for (ReservaVagas r : reservas) {
                if (declarados.contains(r.getCriterio().toLowerCase()) && naReserva.getOrDefault(r.getId(), 0) < r.getQuantidade()) {
                    naReserva.merge(r.getId(), 1, Integer::sum);
                    break;
                }
            }
        }
        return new Vagas(versao.getQuantidadeVagas(), ocupando.size(), reservas, naReserva);
    }

    // a autodeclaração conta enquanto não foi recusada
    private Set<String> declarados(Candidatura c) {
        return autodeclaracaoRepository.findById_CandidaturaIdOrderByDeclaradaEm(c.getId()).stream()
                .filter(a -> !"RECUSADA".equals(a.getSituacao()))
                .map(a -> a.getId().getCriterio().toLowerCase())
                .collect(Collectors.toSet());
    }

    private final class Vagas {
        final Integer total;
        final int ocupadas;
        final List<ReservaVagas> reservas;
        final Map<Long, Integer> ocupadasNaReserva;

        Vagas(Integer total, int ocupadas, List<ReservaVagas> reservas, Map<Long, Integer> ocupadasNaReserva) {
            this.total = total;
            this.ocupadas = ocupadas;
            this.reservas = reservas;
            this.ocupadasNaReserva = ocupadasNaReserva;
        }

        // null = cabe; senão, o motivo
        String motivoSemVaga(Candidatura candidatura) {
            if (total == null) {
                return null;
            }
            if (ocupadas >= total) {
                return "As " + total + " vagas desta oportunidade estão preenchidas";
            }
            Set<String> declarados = declarados(candidatura);
            boolean temReservaLivre = reservas.stream().anyMatch(r -> declarados.contains(r.getCriterio().toLowerCase())
                    && ocupadasNaReserva.getOrDefault(r.getId(), 0) < r.getQuantidade());
            if (temReservaLivre) {
                return null;
            }
            int reservadasLivres = reservas.stream()
                    .mapToInt(r -> Math.max(0, r.getQuantidade() - ocupadasNaReserva.getOrDefault(r.getId(), 0))).sum();
            if (ocupadas + reservadasLivres >= total) {
                String criterios = reservas.stream()
                        .filter(r -> ocupadasNaReserva.getOrDefault(r.getId(), 0) < r.getQuantidade())
                        .map(ReservaVagas::getCriterio).collect(Collectors.joining(", "));
                return "As vagas que sobram são reservadas (" + criterios + ")";
            }
            return null;
        }
    }

    private void exigirEstado(Candidatura candidatura, String estado, String mensagem) {
        if (!estado.equals(candidatura.getEstado())) {
            throw erro(HttpStatus.CONFLICT, mensagem);
        }
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}