import { requisicao } from './cliente';

export type TrilhaCodigo = 'FOMENTO' | 'INVESTIMENTO' | 'FORMACAO';

export interface Trilha {
    codigo: TrilhaCodigo;
    nome: string;
}

export function listarTrilhas() {
    return requisicao<Trilha[]>('/api/trilhas');
}

export function buscarTrilha(codigo: string) {
    return requisicao<Trilha>(`/api/trilhas/${encodeURIComponent(codigo)}`);
}