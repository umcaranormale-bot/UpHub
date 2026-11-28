import { requisicao, type Data, type DataHora } from './cliente';
import type { EstadoCandidatura } from './candidaturas';

export interface Mentoria {
    areaAtuacao?: string;
    horasDisponiveisMes?: number;
}

export interface Mentor {
    vinculoId: number;
    pessoaId: number;
    nome: string;
    organizacaoId: number;
    areaAtuacao: string | null;
    horasDisponiveisMes: number | null;
    horasComprometidasMes: number;
    horasLivresMes: number | null;
}

export interface ConviteMentor {
    vinculoId: number;
    horasPrevistasMes: number;
    prazoResposta: Data;
}

export interface Alocacao {
    id: number;
    candidaturaId: number;
    tituloProposta: string | null;
    estadoCandidatura: EstadoCandidatura;
    vinculoId: number;
    mentorNome: string;
    areaAtuacao: string | null;
    horasPrevistasMes: number;
    prazoResposta: Data;
    situacao: 'PENDENTE' | 'ACEITA' | 'RECUSADA' | 'EXPIRADA';
    convidadaEm: DataHora;
    respondidaEm: DataHora | null;
}

export function definirMentoria(vinculoId: number, dados: Mentoria) {
    return requisicao<Mentor>(`/api/vinculos/${vinculoId}/mentoria`, { metodo: 'PUT', corpo: dados });
}

export function listarMentores(organizacaoId: number, area?: string) {
    return requisicao<Mentor[]>(`/api/organizacoes/${organizacaoId}/mentores`, { parametros: { area } });
}

export function convidarMentor(candidaturaId: number, dados: ConviteMentor) {
    return requisicao<Alocacao>(`/api/candidaturas/${candidaturaId}/mentores`, { metodo: 'POST', corpo: dados });
}

export function listarMentoresDaCandidatura(candidaturaId: number) {
    return requisicao<Alocacao[]>(`/api/candidaturas/${candidaturaId}/mentores`);
}

export function minhasAlocacoes() {
    return requisicao<Alocacao[]>('/api/alocacoes');
}

export function aceitarAlocacao(id: number) {
    return requisicao<Alocacao>(`/api/alocacoes/${id}/aceitar`, { metodo: 'POST' });
}

export function recusarAlocacao(id: number) {
    return requisicao<Alocacao>(`/api/alocacoes/${id}/recusar`, { metodo: 'POST' });
}
