package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.Vinculo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VinculoRepository extends JpaRepository<Vinculo, Long> {

    boolean existsByPessoa_IdAndOrganizacao_Id(Long pessoaId, Long organizacaoId);

    boolean existsByPessoa_IdAndOrganizacao_IdAndPapel(Long pessoaId, Long organizacaoId, String papel);

    @Query("select v from Vinculo v join fetch v.pessoa join fetch v.organizacao "
            + "where v.pessoa.id = :pessoaId order by v.ativoDesde")
    List<Vinculo> listarPorPessoa(Long pessoaId);

    @Query("select v from Vinculo v join fetch v.pessoa join fetch v.organizacao "
            + "where v.organizacao.id = :organizacaoId order by v.pessoa.nome")
    List<Vinculo> listarPorOrganizacao(Long organizacaoId);
}