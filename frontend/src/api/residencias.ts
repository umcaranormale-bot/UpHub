import { requisicao, type Data, type DataHora } from './cliente';
import type { Oportunidade } from './oportunidades';
import type { Squad } from './squads';

export interface ResidenciaCadastro {
    nome: string;
    descricao?: string;
    inicio: Data;
    fim: Data;
}

export interface Residencia {
    id: number;
    nome: string;
    descricao: string | null;
    codigo: string | null;
    inicio: Data;
    fim: Data;
    estado: 'ABERTA' | 'ENCERRADA';
    squads: number;
    desafios: number;
    criadaEm: DataHora;
    encerradaEm: DataHora | null;
}

export function abrirResidencia(dados: ResidenciaCadastro) {
    return requisicao<Residencia>('/api/residencias', { metodo: 'POST', corpo: dados });
}

export function listarResidencias() {
    return requisicao<Residencia[]>('/api/residencias');
}

export function buscarResidencia(id: number) {
    return requisicao<Residencia>(`/api/residencias/${id}`);
}

export function editarResidencia(id: number, dados: Partial<ResidenciaCadastro>) {
    return requisicao<Residencia>(`/api/residencias/${id}`, { metodo: 'PUT', corpo: dados });
}

export function encerrarResidencia(id: number) {
    return requisicao<Residencia>(`/api/residencias/${id}/encerrar`, { metodo: 'POST' });
}

export function desafiosDaResidencia(id: number) {
    return requisicao<Oportunidade[]>(`/api/residencias/${id}/desafios`);
}

export function squadsDaResidencia(id: number) {
    return requisicao<Squad[]>(`/api/residencias/${id}/squads`);
}

export function entrarNaResidencia(squadId: number, codigo: string) {
    return requisicao<Squad>(`/api/squads/${squadId}/residencia`, { metodo: 'POST', corpo: { codigo } });
}
