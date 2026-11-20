import { requisicao, type DataHora } from './cliente';
import type { Elegibilidade } from './requisitos';

export type EstadoCandidatura =
    | 'RASCUNHO'
    | 'ENVIADA'
    | 'ELEGIVEL'
    | 'NAO_ELEGIVEL'
    | 'EM_ANALISE'
    | 'AJUSTE'
    | 'PERDA_DE_PRAZO'
    | 'APROVADA'
    | 'REPROVADA'
    | 'HOMOLOGADA'
    | 'LISTA_DE_ESPERA'
    | 'EM_ACOMPANHAMENTO'
    | 'DESISTENTE'
    | 'NAO_CONVOCADA'
    | 'DESCLASSIFICADA'
    | 'DESCARTADA'
    | 'CONCLUIDA';

export type EstagioFunil = 'INSCRITA' | 'TRIADA' | 'EM_DILIGENCIA' | 'SELECIONADA';

export interface CandidaturaCadastro {
    organizacaoId: number;
    tituloProposta?: string;
    resumoExecutivo?: string;
    valorSolicitado?: number;
}

export interface Candidatura {
    id: number;
    oportunidadeId: number;
    versaoId: number | null;
    organizacaoId: number;
    criadaPor: number;
    tituloProposta: string | null;
    resumoExecutivo: string | null;
    valorSolicitado: number | null;
    estado: EstadoCandidatura;
    proximosEstados: EstadoCandidatura[];
    estagioFunil: EstagioFunil | null;
    posicaoLista: number | null;
    salvaEm: DataHora | null;
    enviadaEm: DataHora | null;
    criadaEm: DataHora;
}

export interface Envio {
    candidatura: Candidatura;
    elegibilidade: Elegibilidade;
}

export interface Transicao {
    de: EstadoCandidatura;
    para: EstadoCandidatura;
    quemPode: ('CANDIDATO' | 'PROVEDOR' | 'AVALIADOR' | 'SISTEMA')[];
}

export function criarCandidatura(oportunidadeId: number, dados: CandidaturaCadastro) {
    return requisicao<Candidatura>(`/api/oportunidades/${oportunidadeId}/candidaturas`, {
        metodo: 'POST',
        corpo: dados,
    });
}

export function editarCandidatura(id: number, dados: Omit<Partial<CandidaturaCadastro>, 'organizacaoId'>) {
    return requisicao<Candidatura>(`/api/candidaturas/${id}`, { metodo: 'PUT', corpo: dados });
}

export function enviarCandidatura(id: number) {
    return requisicao<Envio>(`/api/candidaturas/${id}/enviar`, { metodo: 'POST' });
}

export function buscarCandidatura(id: number) {
    return requisicao<Candidatura>(`/api/candidaturas/${id}`);
}

export function listarCandidaturasDaOrganizacao(organizacaoId: number) {
    return requisicao<Candidatura[]>('/api/candidaturas', { parametros: { organizacaoId } });
}

export function listarCandidaturasDaOportunidade(oportunidadeId: number, estado?: EstadoCandidatura) {
    return requisicao<Candidatura[]>(`/api/oportunidades/${oportunidadeId}/candidaturas`, {
        parametros: { estado },
    });
}

export function decidirElegibilidade(id: number, elegivel: boolean) {
    return requisicao<Candidatura>(`/api/candidaturas/${id}/elegibilidade`, {
        metodo: 'POST',
        corpo: { elegivel },
    });
}

export function iniciarAnalise(id: number) {
    return requisicao<Candidatura>(`/api/candidaturas/${id}/analise`, { metodo: 'POST' });
}

export function moverNoFunil(id: number, estagio: EstagioFunil) {
    return requisicao<Candidatura>(`/api/candidaturas/${id}/funil`, { metodo: 'POST', corpo: { estagio } });
}

export function listarTransicoes() {
    return requisicao<Transicao[]>('/api/candidaturas/transicoes');
}