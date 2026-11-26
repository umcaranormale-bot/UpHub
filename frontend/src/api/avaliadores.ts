import { requisicao, type Data, type DataHora } from './cliente';

export interface Designacao {
    vinculoId: number;
    prazoAvaliacao?: Data;
}

export interface Avaliador {
    oportunidadeId: number;
    oportunidadeTitulo: string;
    vinculoId: number;
    pessoaId: number;
    nome: string;
    prazoAvaliacao: Data | null;
    designadoPor: number;
    designadoEm: DataHora;
}

const base = (oportunidadeId: number) => `/api/oportunidades/${oportunidadeId}/avaliadores`;

export function designarAvaliador(oportunidadeId: number, dados: Designacao) {
    return requisicao<Avaliador>(base(oportunidadeId), { metodo: 'POST', corpo: dados });
}

export function listarAvaliadores(oportunidadeId: number) {
    return requisicao<Avaliador[]>(base(oportunidadeId));
}

export function removerAvaliador(oportunidadeId: number, vinculoId: number) {
    return requisicao<void>(`${base(oportunidadeId)}/${vinculoId}`, { metodo: 'DELETE' });
}

export function minhasDesignacoes() {
    return requisicao<Avaliador[]>('/api/avaliadores/designacoes');
}