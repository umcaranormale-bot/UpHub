import { requisicao } from './cliente';

export interface SquadCadastro {
    organizacaoId: number;
    descricao?: string;
    codigoCoordenacao?: string;
}

export interface Squad {
    organizacaoId: number;
    nome: string;
    descricao: string | null;
    codigoCoordenacao: string | null;
    residenciaId: number | null;
}

export interface IntegranteCadastro {
    pessoaId: number;
    competencia?: string;
}

export interface Integrante {
    squadId: number;
    pessoaId: number;
    nome: string;
    competencia: string | null;
}

export function cadastrarSquad(dados: SquadCadastro) {
    return requisicao<Squad>('/api/squads', { metodo: 'POST', corpo: dados });
}

export function listarSquads() {
    return requisicao<Squad[]>('/api/squads');
}

export function buscarSquad(id: number) {
    return requisicao<Squad>(`/api/squads/${id}`);
}

export function adicionarIntegrante(squadId: number, dados: IntegranteCadastro) {
    return requisicao<Integrante>(`/api/squads/${squadId}/integrantes`, {
        metodo: 'POST',
        corpo: dados,
    });
}

export function listarIntegrantes(squadId: number) {
    return requisicao<Integrante[]>(`/api/squads/${squadId}/integrantes`);
}
