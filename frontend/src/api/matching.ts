import { requisicao, type Data } from './cliente';
import type { TrilhaCodigo } from './trilhas';

export interface Motivo {
    criterio: 'Elegibilidade' | 'Área' | 'Perfil' | 'Tese' | 'Competências';
    peso: number;
    pontos: number;
    explicacao: string;
}

export interface Match {
    oportunidadeId: number;
    oportunidadeTitulo: string;
    trilhaCodigo: TrilhaCodigo;
    area: string | null;
    prazoEnvio: Data | null;
    organizacaoId: number;
    organizacaoNome: string;
    organizacaoTipo: string;
    compatibilidade: number;
    elegibilidade: 'ELEGIVEL' | 'PENDENTE';
    jaSeCandidatou: boolean;
    motivos: Motivo[];
}

export interface PesosTrilha {
    trilhaCodigo: TrilhaCodigo;
    pesos: Record<string, number>;
}

export function recomendadas(organizacaoId: number, limite?: number) {
    return requisicao<Match[]>('/api/matching/oportunidades', { parametros: { organizacaoId, limite } });
}

export function matchingDaOportunidade(oportunidadeId: number, limite?: number) {
    return requisicao<Match[]>(`/api/oportunidades/${oportunidadeId}/matching`, { parametros: { limite } });
}

export function pesosDoMatching() {
    return requisicao<PesosTrilha[]>('/api/matching/pesos');
}
