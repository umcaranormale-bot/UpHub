import { requisicao, type DataHora } from './cliente';

export type SituacaoSolicitacao = 'AGUARDANDO' | 'APROVADA' | 'RECUSADA' | 'REVOGADA';

export interface SolicitacaoCadastro {
    organizacaoId: number;
    emailInstitucional: string;
    documentoId?: number;
    solicitacaoAnteriorId?: number;
    respostaRecusa?: string;
}

export interface Solicitacao {
    id: number;
    organizacaoId: number;
    organizacaoNome: string;
    solicitanteId: number;
    solicitanteNome: string;
    emailInstitucional: string;
    documentoId: number | null;
    pedidaEm: DataHora;
    situacao: SituacaoSolicitacao;
    decididaPorId: number | null;
    decididaEm: DataHora | null;
    motivo: string | null;
    recusaPorDocumento: boolean;
    solicitacaoAnteriorId: number | null;
    respostaRecusa: string | null;
    revogadaPorId: number | null;
    revogadaEm: DataHora | null;
    motivoRevogacao: string | null;
}

export function pedirPermissao(dados: SolicitacaoCadastro) {
    return requisicao<Solicitacao>('/api/solicitacoes-provedor', { metodo: 'POST', corpo: dados });
}

export function listarPedidos(organizacaoId: number) {
    return requisicao<Solicitacao[]>('/api/solicitacoes-provedor', {
        parametros: { organizacaoId },
    });
}

export function buscarPedido(id: number) {
    return requisicao<Solicitacao>(`/api/solicitacoes-provedor/${id}`);
}

export function listarFila(situacao?: SituacaoSolicitacao) {
    return requisicao<Solicitacao[]>('/api/solicitacoes-provedor', { parametros: { situacao } });
}

export function aprovarPedido(id: number) {
    return requisicao<Solicitacao>(`/api/solicitacoes-provedor/${id}/aprovar`, { metodo: 'POST' });
}

export function recusarPedido(id: number, motivo: string, recusaPorDocumento = false) {
    return requisicao<Solicitacao>(`/api/solicitacoes-provedor/${id}/recusar`, {
        metodo: 'POST',
        corpo: { motivo, recusaPorDocumento },
    });
}

export function revogarPermissao(id: number, motivo: string) {
    return requisicao<Solicitacao>(`/api/solicitacoes-provedor/${id}/revogar`, {
        metodo: 'POST',
        corpo: { motivo },
    });
}
