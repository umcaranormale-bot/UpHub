import { requisicao, type Data, type DataHora } from './cliente';

export interface Sessao {
    dataSessao: Data;
    duracaoMinutos: number;
    sprintId?: number;
    feedback?: string;
}

export interface SessaoMentoria {
    id: number;
    alocacaoId: number;
    candidaturaId: number;
    mentorNome: string | null;
    sprintId: number | null;
    sprintNumero: number | null;
    dataSessao: Data;
    duracaoMinutos: number;
    feedback: string | null;
    situacao: 'RASCUNHO' | 'ASSINADO';
    assinadoEm: DataHora | null;
    registradaEm: DataHora;
}

export interface HorasMentoria {
    alocacaoId: number;
    mes: string;
    horasPrevistasMes: number;
    minutosRealizados: number;
    horasRealizadas: number;
    sessoesAssinadas: number;
}

export function registrarSessao(alocacaoId: number, dados: Sessao) {
    return requisicao<SessaoMentoria>(`/api/alocacoes/${alocacaoId}/sessoes`, { metodo: 'POST', corpo: dados });
}

export function editarSessao(id: number, dados: Partial<Sessao>) {
    return requisicao<SessaoMentoria>(`/api/sessoes/${id}`, { metodo: 'PUT', corpo: dados });
}

export function assinarSessao(id: number) {
    return requisicao<SessaoMentoria>(`/api/sessoes/${id}/assinar`, { metodo: 'POST' });
}

export function apagarSessao(id: number) {
    return requisicao<void>(`/api/sessoes/${id}`, { metodo: 'DELETE' });
}

export function listarSessoes(candidaturaId: number) {
    return requisicao<SessaoMentoria[]>(`/api/candidaturas/${candidaturaId}/sessoes`);
}

export function horasDoMes(alocacaoId: number, mes?: string) {
    return requisicao<HorasMentoria>(`/api/alocacoes/${alocacaoId}/horas`, { parametros: { mes } });
}
