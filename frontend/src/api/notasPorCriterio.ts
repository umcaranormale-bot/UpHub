import { requisicao, type DataHora } from './cliente';
export interface NotaCriterio {
    avaliacaoId: number;
    criterioId: number;
    ordem: number | null;
    descricao: string;
    peso: number;
    escalaMin: number;
    escalaMax: number;
    evidenciaEsperada: string | null;
    nota: number | null;
    registradaEm: DataHora | null;
}

export function listarNotas(avaliacaoId: number) {
    return requisicao<NotaCriterio[]>(`/api/avaliacoes/${avaliacaoId}/notas`);
}
export function darNota(avaliacaoId: number, criterioId: number, nota: number) {
    return requisicao<NotaCriterio>(`/api/avaliacoes/${avaliacaoId}/notas/${criterioId}`, { metodo: 'PUT', corpo: { nota } });
}