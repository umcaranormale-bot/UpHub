package br.com.uphub.backend.service;

import br.com.uphub.backend.dto.GargaloEtapaResponse;
import br.com.uphub.backend.dto.ParametroGargaloRequest;
import br.com.uphub.backend.dto.ParametroGargaloResponse;
import br.com.uphub.backend.gargalo.DiasUteis;
import br.com.uphub.backend.model.ParametroGargalo;
import br.com.uphub.backend.repository.ParametroGargaloRepository;
import br.com.uphub.backend.seguranca.Acesso;
import jakarta.persistence.EntityManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Gargalos (HU-25): o que está parado além do limite em cada etapa, e com quem está a bola.
// O tempo parado vem das datas que o banco já guarda (pedido, envio, atribuição e assinatura).
@Service
public class GargaloService {

    public static final List<String> ETAPAS = List.of("PUBLICACAO", "ELEGIBILIDADE", "AVALIACAO", "HOMOLOGACAO");
    private static final int LIMITE_PADRAO = 5;
    private static final int LIMITE_MAXIMO = 60;
    private static final ZoneId FUSO = ZoneId.of("America/Recife");

    // o provedor responsável: o representante da organização dona da oportunidade
    private static final String PROVEDOR = """
            left join lateral (select p.id, p.nome from vinculo v join pessoa p on p.id = v.pessoa_id
                               where v.organizacao_id = op.organizacao_id and v.papel = 'PROVEDOR' and v.encerrado_em is null
                               order by v.representante desc, v.id limit 1) pr on true
            """;

    // colunas: oportunidade, título, candidatura, pedido de provedor, organização, responsável (id, nome, papel), sem avaliador, desde
    private static final Map<String, String> CONSULTAS = Map.of(
            // pedido de permissão de provedor esperando a gestão
            "PUBLICACAO", """
                    select null::bigint, null::text, null::bigint, s.id, o.nome, null::bigint, 'Gestão do Porto Digital', 'GESTAO', false, s.pedida_em
                    from solicitacao_provedor s join organizacao o on o.id = s.organizacao_id
                    where s.situacao = 'AGUARDANDO'
                    """,
            // candidatura com dado pendente, esperando o provedor conferir
            "ELEGIBILIDADE", """
                    select op.id, op.titulo, c.id, null::bigint, org.nome, pr.id, coalesce(pr.nome, dona.nome), 'PROVEDOR', false, c.enviada_em
                    from candidatura c
                    join oportunidade op on op.id = c.oportunidade_id
                    join organizacao org on org.id = c.organizacao_id
                    join organizacao dona on dona.id = op.organizacao_id
                    """ + PROVEDOR + """
                    where c.estado = 'ENVIADA' and op.suspensa_em is null
                    """,
            // elegível ou em análise sem parecer assinado: conta depois do fim das inscrições, ou desde a atribuição
            "AVALIACAO", """
                    select op.id, op.titulo, c.id, null::bigint, org.nome,
                           coalesce(pend.pessoa_id, pr.id), coalesce(pend.nome, pr.nome, dona.nome),
                           case when pend.pessoa_id is not null then 'AVALIADOR' else 'PROVEDOR' end,
                           not exists (select 1 from avaliador_oportunidade ao where ao.oportunidade_id = op.id),
                           coalesce(pend.atribuida_em,
                                    greatest(c.enviada_em, ((ve.prazo_envio + 1)::timestamp at time zone 'America/Recife')))
                    from candidatura c
                    join oportunidade op on op.id = c.oportunidade_id
                    join organizacao org on org.id = c.organizacao_id
                    join organizacao dona on dona.id = op.organizacao_id
                    left join versao_oportunidade ve on ve.id = c.versao_id
                    left join lateral (select a.atribuida_em, p.id as pessoa_id, p.nome
                                       from avaliacao a join vinculo v on v.id = a.vinculo_id join pessoa p on p.id = v.pessoa_id
                                       where a.candidatura_id = c.id and a.assinada_em is null
                                       order by a.atribuida_em limit 1) pend on true
                    """ + PROVEDOR + """
                    where c.estado in ('ELEGIVEL', 'EM_ANALISE') and op.suspensa_em is null
                    """,
            // aprovada pelos avaliadores, esperando o provedor homologar
            "HOMOLOGACAO", """
                    select op.id, op.titulo, c.id, null::bigint, org.nome, pr.id, coalesce(pr.nome, dona.nome), 'PROVEDOR', false,
                           coalesce((select max(a.assinada_em) from avaliacao a where a.candidatura_id = c.id), c.enviada_em)
                    from candidatura c
                    join oportunidade op on op.id = c.oportunidade_id
                    join organizacao org on org.id = c.organizacao_id
                    join organizacao dona on dona.id = op.organizacao_id
                    """ + PROVEDOR + """
                    where c.estado = 'APROVADA' and op.suspensa_em is null
                    """);

    private final ParametroGargaloRepository parametroRepository;
    private final Acesso acesso;
    private final EntityManager em;

    public GargaloService(ParametroGargaloRepository parametroRepository, Acesso acesso, EntityManager em) {
        this.parametroRepository = parametroRepository;
        this.acesso = acesso;
        this.em = em;
    }

    @Transactional(readOnly = true)
    public List<GargaloEtapaResponse> listar(String etapa, Long pessoaId) {
        acesso.exigirGestao(pessoaId, "ver os gargalos");
        List<String> etapas = ETAPAS;
        if (etapa != null && !etapa.isBlank()) {
            String e = etapa.trim().toUpperCase();
            if (!ETAPAS.contains(e)) {
                throw erro(HttpStatus.BAD_REQUEST, "Etapa inválida. Use: " + String.join(", ", ETAPAS));
            }
            etapas = List.of(e);
        }
        return calcular(etapas);
    }

    @Transactional(readOnly = true)
    public List<ParametroGargaloResponse> parametros(Long pessoaId) {
        acesso.exigirGestao(pessoaId, "ver os gargalos");
        Map<String, Integer> limites = limites();
        return ETAPAS.stream().map(e -> new ParametroGargaloResponse(e, limites.get(e))).toList();
    }

    @Transactional
    public ParametroGargaloResponse editarParametro(String etapa, ParametroGargaloRequest dados, Long pessoaId) {
        acesso.exigirGestao(pessoaId, "mudar os limites dos gargalos");
        ParametroGargalo parametro = parametroRepository.findById(etapa == null ? "" : etapa.trim().toUpperCase())
                .orElseThrow(() -> erro(HttpStatus.NOT_FOUND, "Etapa de gargalo não encontrada"));
        Integer limite = dados == null ? null : dados.limiteDiasUteis();
        if (limite == null || limite < 1 || limite > LIMITE_MAXIMO) {
            throw erro(HttpStatus.BAD_REQUEST, "O limite precisa ser um número inteiro de 1 a " + LIMITE_MAXIMO + " dias úteis");
        }
        parametro.setLimiteDiasUteis(limite);
        return ParametroGargaloResponse.de(parametroRepository.saveAndFlush(parametro));
    }

    // para o painel: as 4 etapas, sem a lista de itens (quem chama já conferiu que é a gestão)
    @Transactional(readOnly = true)
    public List<GargaloEtapaResponse> todasAsEtapas() {
        return calcular(ETAPAS);
    }

    private List<GargaloEtapaResponse> calcular(List<String> etapas) {
        Map<String, Integer> limites = limites();
        LocalDate hoje = LocalDate.now(FUSO);
        List<GargaloEtapaResponse> resposta = new ArrayList<>();
        for (String etapa : etapas) {
            int limite = limites.get(etapa);
            List<GargaloEtapaResponse.ItemParado> itens = new ArrayList<>();
            for (Object row : em.createNativeQuery(CONSULTAS.get(etapa)).getResultList()) {
                Object[] l = (Object[]) row;
                OffsetDateTime desde = dataHora(l[9]);
                int dias = desde == null ? 0 : DiasUteis.entre(desde.atZoneSameInstant(FUSO).toLocalDate(), hoje);
                if (!DiasUteis.passouDoLimite(dias, limite)) {
                    continue;
                }
                itens.add(new GargaloEtapaResponse.ItemParado(numero(l[0]), (String) l[1], numero(l[2]), numero(l[3]),
                        (String) l[4], new GargaloEtapaResponse.Responsavel(numero(l[5]), (String) l[6], (String) l[7]),
                        Boolean.TRUE.equals(l[8]), desde, dias));
            }
            itens.sort(Comparator.comparingInt(GargaloEtapaResponse.ItemParado::diasUteis).reversed());
            Integer maisAntigo = itens.isEmpty() ? null : itens.getFirst().diasUteis();
            resposta.add(new GargaloEtapaResponse(etapa, limite, itens.size(), maisAntigo, itens));
        }
        return resposta;
    }

    private Map<String, Integer> limites() {
        Map<String, Integer> limites = parametroRepository.findAll().stream()
                .collect(Collectors.toMap(ParametroGargalo::getEtapa, ParametroGargalo::getLimiteDiasUteis));
        ETAPAS.forEach(e -> limites.putIfAbsent(e, LIMITE_PADRAO));
        return limites;
    }

    private static Long numero(Object valor) {
        return valor == null ? null : ((Number) valor).longValue();
    }

    // o driver pode devolver a data em tipos diferentes; aqui vira sempre OffsetDateTime
    private static OffsetDateTime dataHora(Object valor) {
        if (valor == null) return null;
        if (valor instanceof OffsetDateTime o) return o;
        if (valor instanceof Instant i) return i.atOffset(java.time.ZoneOffset.UTC);
        if (valor instanceof Timestamp t) return t.toInstant().atOffset(java.time.ZoneOffset.UTC);
        if (valor instanceof java.time.ZonedDateTime z) return z.toOffsetDateTime();
        throw new IllegalStateException("Data em formato inesperado: " + valor.getClass());
    }

    private ResponseStatusException erro(HttpStatus status, String mensagem) {
        return new ResponseStatusException(status, mensagem);
    }
}
