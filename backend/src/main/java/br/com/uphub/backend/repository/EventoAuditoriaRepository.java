package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.EventoAuditoria;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventoAuditoriaRepository extends JpaRepository<EventoAuditoria, Long> {

    // filtros comuns: ação (opcional), período [desde, ate) e limite; mais novo primeiro
    String FILTROS = """
             AND (CAST(:acao AS varchar) IS NULL OR e.acao = CAST(:acao AS varchar))
             AND e.ocorrido_em >= :desde AND e.ocorrido_em < :ate
             ORDER BY e.ocorrido_em DESC, e.id DESC
             LIMIT :limite
            """;

    @Query(value = "SELECT e.* FROM evento_auditoria e WHERE e.oportunidade_id = :id" + FILTROS, nativeQuery = true)
    List<EventoAuditoria> daOportunidade(@Param("id") Long oportunidadeId, @Param("acao") String acao,
                                         @Param("desde") OffsetDateTime desde, @Param("ate") OffsetDateTime ate,
                                         @Param("limite") int limite);

    @Query(value = "SELECT e.* FROM evento_auditoria e WHERE e.candidatura_id = :id" + FILTROS, nativeQuery = true)
    List<EventoAuditoria> daCandidatura(@Param("id") Long candidaturaId, @Param("acao") String acao,
                                        @Param("desde") OffsetDateTime desde, @Param("ate") OffsetDateTime ate,
                                        @Param("limite") int limite);

    // da organização: as oportunidades dela, as candidaturas dela e os pedidos de provedor dela
    @Query(value = """
            SELECT e.* FROM evento_auditoria e
              LEFT JOIN oportunidade o ON o.id = e.oportunidade_id
              LEFT JOIN candidatura c ON c.id = e.candidatura_id
              LEFT JOIN solicitacao_provedor s ON e.entidade_tipo = 'SOLICITACAO_PROVEDOR' AND s.id = e.entidade_id
             WHERE (o.organizacao_id = :id OR c.organizacao_id = :id OR s.organizacao_id = :id)
            """ + FILTROS, nativeQuery = true)
    List<EventoAuditoria> daOrganizacao(@Param("id") Long organizacaoId, @Param("acao") String acao,
                                        @Param("desde") OffsetDateTime desde, @Param("ate") OffsetDateTime ate,
                                        @Param("limite") int limite);
}
