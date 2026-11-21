import { requisicao, type Data, type DataHora } from './cliente';

export interface Sprint {
    id: number;
    candidaturaId: number;
    numero: number;
    estado: 'PLANEJADA' | 'EM_ANDAMENTO' | 'ENTREGUE' | 'AVALIADA';
    prazoEntrega: Data | null;
    entregaDescricao: string | null;
    entregaRegistradaEm: DataHora | null;
    notaEntrega: number | null;
    feedbackEntrega: string | null;
    avaliadaEm: DataHora | null;
}

export interface AvaliacaoEntrega {
    nota: number;
    feedback: string;
}

export function criarSprint(candidaturaId: number, prazoEntrega?: Data) {
    return requisicao<Sprint>(`/api/candidaturas/${candidaturaId}/sprints`, { metodo: 'POST', corpo: { prazoEntrega } });
}

export function listarSprints(candidaturaId: number) {
    return requisicao<Sprint[]>(`/api/candidaturas/${candidaturaId}/sprints`);
}

export function iniciarSprint(id: number) {
    return requisicao<Sprint>(`/api/sprints/${id}/iniciar`, { metodo: 'POST' });
}

export function entregarSprint(id: number, descricao: string) {
    return requisicao<Sprint>(`/api/sprints/${id}/entrega`, { metodo: 'POST', corpo: { descricao } });
}

export function avaliarEntrega(id: number, dados: AvaliacaoEntrega) {
    return requisicao<Sprint>(`/api/sprints/${id}/avaliacao`, { metodo: 'POST', corpo: dados });
}
