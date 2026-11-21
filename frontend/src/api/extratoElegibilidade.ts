import { requisicao, type DataHora } from './cliente';
import type { EstadoCandidatura } from './candidaturas';

export type SituacaoRequisito = 'ATENDIDO' | 'NAO_ATENDIDO' | 'PENDENTE';

export interface LinhaDoExtrato {
    requisitoId: number;
    ordem: number;
    campo: string;
    operador: string;
    valorExigido: unknown;
    obrigatoria: boolean;
    valorInformado: string | null;
    situacao: SituacaoRequisito;
    avaliadoEm: DataHora;
}

export interface Extrato {
    candidaturaId: number;
    versaoId: number;
    estado: EstadoCandidatura;
    situacao: 'ELEGIVEL' | 'INELEGIVEL' | 'PENDENTE';
    requisitos: LinhaDoExtrato[];
    faltou: string[];
}

export function buscarExtrato(candidaturaId: number) {
    return requisicao<Extrato>(`/api/candidaturas/${candidaturaId}/elegibilidade`);
}
