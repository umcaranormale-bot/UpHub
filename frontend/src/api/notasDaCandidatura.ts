import { requisicao, type Data, type DataHora } from './cliente';

export interface NotaAutorizada {
    id: number;
    candidaturaId: number;
    resultadoProvaId: number;
    pessoaId: number;
    pessoaNome: string;
    area: string | null;
    notaCongelada: number;
    dataProvaCongelada: Data;
    validaAte: Data;
    autorizadaEm: DataHora;
}

const base = (candidaturaId: number) => `/api/candidaturas/${candidaturaId}/notas`;

export function autorizarNota(candidaturaId: number, resultadoProvaId: number) {
    return requisicao<NotaAutorizada>(base(candidaturaId), { metodo: 'POST', corpo: { resultadoProvaId } });
}

export function listarNotasDaCandidatura(candidaturaId: number) {
    return requisicao<NotaAutorizada[]>(base(candidaturaId));
}

export function tirarNota(candidaturaId: number, autorizacaoId: number) {
    return requisicao<void>(`${base(candidaturaId)}/${autorizacaoId}`, { metodo: 'DELETE' });
}
