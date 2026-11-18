package br.com.uphub.backend.seguranca;

import br.com.uphub.backend.repository.VinculoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Component
public class Acesso {

    private final VinculoRepository vinculoRepository;

    public Acesso(VinculoRepository vinculoRepository) {
        this.vinculoRepository = vinculoRepository;
    }

    public boolean ehGestao(Long pessoaId) {
        return vinculoRepository.existsByPessoa_IdAndPapelAndEncerradoEmIsNull(pessoaId, "GESTAO");
    }

    public boolean ehMembro(Long pessoaId, Long organizacaoId) {
        return vinculoRepository.existsByPessoa_IdAndOrganizacao_IdAndEncerradoEmIsNull(pessoaId, organizacaoId);
    }

    public boolean podeVer(Long pessoaId, Long organizacaoId) {
        return ehMembro(pessoaId, organizacaoId) || ehGestao(pessoaId);
    }

    public List<Long> organizacoesDa(Long pessoaId) {
        return vinculoRepository.organizacoesAtivasDa(pessoaId);
    }

    public void exigirAcesso(Long pessoaId, Long organizacaoId) {
        if (!podeVer(pessoaId, organizacaoId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Você não tem acesso aos dados desta organização");
        }
    }

    public void exigir(Long pessoaId, Long organizacaoId, Permissao permissao) {
        if (!vinculoRepository.existsByPessoa_IdAndOrganizacao_IdAndPapelInAndEncerradoEmIsNull(
                pessoaId, organizacaoId, permissao.getPapeis())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Seu papel nesta organização não permite " + permissao.getDescricao());
        }
    }

    public void exigirRepresentante(Long pessoaId, Long organizacaoId, String acao) {
        if (!vinculoRepository.existsByPessoa_IdAndOrganizacao_IdAndRepresentanteTrueAndEncerradoEmIsNull(
                pessoaId, organizacaoId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Só o representante da organização pode " + acao);
        }
    }
}
