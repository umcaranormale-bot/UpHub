import { requisicao, type DataHora } from './cliente';

export interface Participante {
    candidaturaId: number;
    pessoaId: number;
    nome: string;
    conviteEnviadoEm: DataHora;
    confirmouEm: DataHora | null;
}

const base = (candidaturaId: number) => `/api/candidaturas/${candidaturaId}/participantes`;

export function adicionarParticipante(candidaturaId: number, pessoaId: number) {
    return requisicao<Participante>(base(candidaturaId), { metodo: 'POST', corpo: { pessoaId } });
}

export function listarParticipantes(candidaturaId: number) {
    return requisicao<Participante[]>(base(candidaturaId));
}

export function confirmarParticipacao(candidaturaId: number) {
    return requisicao<Participante>(`${base(candidaturaId)}/confirmar`, { metodo: 'POST' });
}

export function removerParticipante(candidaturaId: number, pessoaId: number) {
    return requisicao<void>(`${base(candidaturaId)}/${pessoaId}`, { metodo: 'DELETE' });
}
