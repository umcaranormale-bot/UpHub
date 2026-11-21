import { requisicao, type DataHora } from './cliente';
import type { EstadoCandidatura } from './candidaturas';

export interface Autodeclaracao {
    candidaturaId: number;
    criterio: string;
    declaradaEm: DataHora;
    situacao: 'DECLARADA' | 'CONFIRMADA' | 'RECUSADA';
    conferidaPor: number | null;
    conferidaEm: DataHora | null;
    motivoRecusa: string | null;
    estadoCandidatura: EstadoCandidatura;
}

export interface Conferencia {
    confirmada: boolean;
    motivo?: string;
}

const base = (candidaturaId: number) => `/api/candidaturas/${candidaturaId}/autodeclaracoes`;

export function declarar(candidaturaId: number, criterio: string) {
    return requisicao<Autodeclaracao>(base(candidaturaId), { metodo: 'POST', corpo: { criterio } });
}

export function listarAutodeclaracoes(candidaturaId: number) {
    return requisicao<Autodeclaracao[]>(base(candidaturaId));
}

export function retirarAutodeclaracao(candidaturaId: number, criterio: string) {
    return requisicao<void>(`${base(candidaturaId)}/${encodeURIComponent(criterio)}`, { metodo: 'DELETE' });
}

export function conferirAutodeclaracao(candidaturaId: number, criterio: string, dados: Conferencia) {
    return requisicao<Autodeclaracao>(`${base(candidaturaId)}/${encodeURIComponent(criterio)}/conferencia`, {
        metodo: 'POST',
        corpo: dados,
    });
}
