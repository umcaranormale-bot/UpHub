package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.PainelResponse;
import br.com.uphub.backend.seguranca.Acesso;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

@Service
public class PainelService {

    private static final List<String> TRILHAS = List.of("FOMENTO", "INVESTIMENTO", "FORMACAO");
    // fora da conta: o que nunca foi enviado
    private static final Set<String> NAO_ENVIADAS = Set.of("RASCUNHO", "DESCARTADA");
    // chegaram à aprovação (é a "conexão" do desafio): aprovadas e tudo o que vem depois
    private static final Set<String> APROVADAS = Set.of("APROVADA", "HOMOLOGADA", "LISTA_DE_ESPERA", "EM_ACOMPANHAMENTO",
            "CONCLUIDA", "DESISTENTE", "NAO_CONVOCADA", "DESCLASSIFICADA");
    private static final List<String> ESTAGIOS = List.of("INSCRITA", "TRIADA", "EM_DILIGENCIA", "SELECIONADA");

    private final EntityManager em;
    private final Acesso acesso;

    public PainelService(EntityManager em, Acesso acesso) {
        this.em = em;
        this.acesso = acesso;
    }

    @Transactional(readOnly = true)
    public PainelResponse painel(Long pessoaId) {
        acesso.exigirGestao(pessoaId, "ver o painel do ecossistema");

        // candidaturas por trilha e estado
        Map<String, Map<String, Long>> porTrilha = new LinkedHashMap<>();
        TRILHAS.forEach(t -> porTrilha.put(t, new TreeMap<>()));
        Map<String, Long> porEstado = new TreeMap<>();
        for (Object[] l : em.createQuery("select o.trilhaCodigo, c.estado, count(c) from Candidatura c, Oportunidade o "
                + "where o.id = c.oportunidadeId group by o.trilhaCodigo, c.estado", Object[].class).getResultList()) {
            String trilha = (String) l[0], estado = (String) l[1];
            long n = (Long) l[2];
            porTrilha.computeIfAbsent(trilha, k -> new TreeMap<>()).merge(estado, n, Long::sum);
            if (!NAO_ENVIADAS.contains(estado)) {
                porEstado.merge(estado, n, Long::sum);
            }
        }

        // oportunidades publicadas, ativas ou pausadas
        Map<String, long[]> oportunidades = new LinkedHashMap<>();
        TRILHAS.forEach(t -> oportunidades.put(t, new long[2]));
        for (Object[] l : em.createQuery("select o.trilhaCodigo, o.suspensaEm, count(o) from Oportunidade o "
                + "where o.estado = 'PUBLICADA' group by o.trilhaCodigo, o.suspensaEm", Object[].class).getResultList()) {
            long[] contas = oportunidades.computeIfAbsent((String) l[0], k -> new long[2]);
            contas[l[1] == null ? 0 : 1] += (Long) l[2];
        }

        List<PainelResponse.Trilha> trilhas = new ArrayList<>();
        long[] soma = new long[6];
        for (String t : porTrilha.keySet()) {
            Map<String, Long> e = porTrilha.get(t);
            long[] o = oportunidades.getOrDefault(t, new long[2]);
            long enviadas = e.entrySet().stream().filter(x -> !NAO_ENVIADAS.contains(x.getKey())).mapToLong(Map.Entry::getValue).sum();
            long aprovadas = e.entrySet().stream().filter(x -> APROVADAS.contains(x.getKey())).mapToLong(Map.Entry::getValue).sum();
            long acompanhamento = e.getOrDefault("EM_ACOMPANHAMENTO", 0L);
            long concluidas = e.getOrDefault("CONCLUIDA", 0L);
            trilhas.add(new PainelResponse.Trilha(t, o[0], o[1], enviadas, aprovadas, taxa(aprovadas, enviadas), acompanhamento, concluidas));
            long[] parte = {o[0], o[1], enviadas, aprovadas, acompanhamento, concluidas};
            for (int i = 0; i < soma.length; i++) {
                soma[i] += parte[i];
            }
        }
        PainelResponse.Trilha total = new PainelResponse.Trilha("TODAS", soma[0], soma[1], soma[2], soma[3],
                taxa(soma[3], soma[2]), soma[4], soma[5]);

        // funil da trilha Investimento (kanban)
        Map<String, Long> funil = new LinkedHashMap<>();
        ESTAGIOS.forEach(s -> funil.put(s, 0L));
        for (Object[] l : em.createQuery("select c.estagioFunil, count(c) from Candidatura c where c.estagioFunil is not null "
                + "group by c.estagioFunil", Object[].class).getResultList()) {
            funil.put((String) l[0], (Long) l[1]);
        }

        Map<String, Long> organizacoes = new TreeMap<>();
        for (Object[] l : em.createQuery("select o.tipo, count(o) from Organizacao o where o.tipo <> 'GESTAO' group by o.tipo",
                Object[].class).getResultList()) {
            organizacoes.put((String) l[0], (Long) l[1]);
        }

        PainelResponse.Residencias residencias = new PainelResponse.Residencias(
                contar("select count(r) from Residencia r where r.estado = 'ABERTA'"),
                contar("select count(r) from Residencia r where r.estado = 'ENCERRADA'"),
                contar("select count(s) from Squad s, Residencia r where r.id = s.residenciaId and r.estado = 'ABERTA'"),
                contar("select count(o) from Oportunidade o, Residencia r where r.id = o.residenciaId and r.estado = 'ABERTA' "
                        + "and o.estado <> 'RASCUNHO'"));

        PainelResponse.Avaliacao avaliacao = new PainelResponse.Avaliacao(
                contar("select count(a) from Avaliacao a where a.assinadaEm is null"),
                contar("select count(a) from Avaliacao a where a.assinadaEm is not null"),
                contar("select count(p) from PedidoAjuste p where p.situacao = 'AGUARDANDO'"));

        YearMonth mes = YearMonth.now();
        BigDecimal previstas = em.createQuery("select coalesce(sum(a.horasPrevistasMes), 0) from AlocacaoMentor a "
                + "where a.situacao = 'ACEITA'", BigDecimal.class).getSingleResult();
        Object[] sessoes = em.createQuery("select count(s), coalesce(sum(s.duracaoMinutos), 0) from SessaoMentoria s "
                        + "where s.situacao = 'ASSINADO' and s.dataSessao between :inicio and :fim", Object[].class)
                .setParameter("inicio", mes.atDay(1)).setParameter("fim", mes.atEndOfMonth()).getSingleResult();
        long minutos = ((Number) sessoes[1]).longValue();
        PainelResponse.Mentoria mentoria = new PainelResponse.Mentoria(
                contar("select count(a) from AlocacaoMentor a where a.situacao = 'ACEITA'"), previstas,
                BigDecimal.valueOf(minutos).divide(BigDecimal.valueOf(60), 1, RoundingMode.HALF_UP), ((Number) sessoes[0]).longValue());

        return new PainelResponse(OffsetDateTime.now(), total, trilhas, porEstado, funil, organizacoes, residencias,
                avaliacao, mentoria,
                "Os gargalos (tempo parado em cada etapa) entram com o histórico de ações (V34) e os parâmetros de gargalo (V36).");
    }

    private long contar(String jpql) {
        return em.createQuery(jpql, Long.class).getSingleResult();
    }

    private BigDecimal taxa(long parte, long todo) {
        if (todo == 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(parte * 100).divide(BigDecimal.valueOf(todo), 1, RoundingMode.HALF_UP);
    }
}
