package br.com.uphub.backend.repository;

import br.com.uphub.backend.model.Vinculo;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VinculoRepository extends JpaRepository<Vinculo, Long> {

    boolean existsByPessoa_IdAndOrganizacao_Id(Long pessoaId, Long organizacaoId);

    boolean existsByPessoa_IdAndOrganizacao_IdAndPapel(Long pessoaId, Long organizacaoId, String papel);

    boolean existsByPessoa_IdAndOrganizacao_IdAndEncerradoEmIsNull(Long pessoaId, Long organizacaoId);

    boolean existsByPessoa_IdAndOrganizacao_IdAndPapelInAndEncerradoEmIsNull(
            Long pessoaId, Long organizacaoId, Collection<String> papeis);

    boolean existsByPessoa_IdAndOrganizacao_IdAndRepresentanteTrueAndEncerradoEmIsNull(Long pessoaId, Long organizacaoId);

    boolean existsByPessoa_IdAndPapelAndEncerradoEmIsNull(Long pessoaId, String papel);

    List<Vinculo> findByPapelAndEncerradoEmIsNull(String papel);

    @Query("select v.organizacao.id from Vinculo v where v.pessoa.id = :pessoaId and v.encerradoEm is null")
    List<Long> organizacoesAtivasDa(Long pessoaId);

    @Query("select count(v) from Vinculo v, Vinculo w where v.pessoa.id = :pessoaId and w.pessoa.id = :outraPessoaId "
            + "and v.organizacao.id = w.organizacao.id and v.encerradoEm is null and w.encerradoEm is null")
    long contarOrganizacoesEmComum(Long pessoaId, Long outraPessoaId);

    @Query("select v from Vinculo v join fetch v.pessoa join fetch v.organizacao "
            + "where v.pessoa.id = :pessoaId order by v.ativoDesde")
    List<Vinculo> listarPorPessoa(Long pessoaId);

    @Query("select v from Vinculo v join fetch v.pessoa join fetch v.organizacao "
            + "where v.organizacao.id = :organizacaoId order by v.pessoa.nome")
    List<Vinculo> listarPorOrganizacao(Long organizacaoId);
}
