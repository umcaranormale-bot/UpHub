import { requisicao, type DataHora } from './cliente';
import type { EstadoCandidatura } from './candidaturas';

export interface ItemAjuste {
    id: number;
    pedidoAjusteId: number;
    descricao: string;
    detalhe: string | null;
    documentoExigidoId: number | null;
    documentoExigidoNome: string | null;
    documentoNovoId: number | null;
    corrigidoEm: DataHora | null;
}

export interface PedidoAjuste {
    id: number;
    candidaturaId: number;
    avaliacaoId: number;
    rodada: number | null;
    pedidoEm: DataHora;
    prazoReenvio: DataHora;
    situacao: 'AGUARDANDO' | 'REENVIADO' | 'PERDA_DE_PRAZO';
    resposta: string | null;
    reenviadoEm: DataHora | null;
    prazoPerdidoEm: DataHora | null;
    reabertoEm: DataHora | null;
    estadoCandidatura: EstadoCandidatura;
    itens: ItemAjuste[];
}

const base = (candidaturaId: number) => `/api/candidaturas/${candidaturaId}/ajustes`;

export function listarAjustes(candidaturaId: number) {
    return requisicao<PedidoAjuste[]>(base(candidaturaId));
}

export function corrigirItem(candidaturaId: number, itemId: number, documentoNovoId?: number) {
    return requisicao<ItemAjuste>(`${base(candidaturaId)}/itens/${itemId}/corrigir`, {
        metodo: 'POST',
        corpo: documentoNovoId ? { documentoNovoId } : {},
    });
}

export function reenviarAjuste(candidaturaId: number, resposta: string) {
    return requisicao<PedidoAjuste>(`${base(candidaturaId)}/reenviar`, { metodo: 'POST', corpo: { resposta } });
}

export function reabrirAjuste(candidaturaId: number) {
    return requisicao<PedidoAjuste>(`${base(candidaturaId)}/reabrir`, { metodo: 'POST' });
}
