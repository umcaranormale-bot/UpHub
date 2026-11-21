import { requisicao, type DataHora } from './cliente';

export interface Retificacao {
    parecerRetificado: string;
    justificativa: string;
}
export interface RetificacaoFeita {
    id: number;
    avaliacaoId: number;
    parecerRetificado: string;
    justificativa: string;
    retificadaEm: DataHora;
}

export function retificarParecer(avaliacaoId: number, dados: Retificacao) {
    return requisicao<RetificacaoFeita>(`/api/avaliacoes/${avaliacaoId}/retificacoes`, { metodo: 'POST', corpo: dados });
}
export function listarRetificacoes(avaliacaoId: number) {
    return requisicao<RetificacaoFeita[]>(`/api/avaliacoes/${avaliacaoId}/retificacoes`);
}