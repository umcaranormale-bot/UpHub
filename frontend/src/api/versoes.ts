import { requisicao, type Data, type DataHora } from './cliente';

export interface VersaoEdicao {
    prazoEnvio?: Data;
    notaMinima?: number;
    validadeNotaDias?: 30 | 60 | 90;
    prazoAjusteDias?: number;
    escopo?: string;
    entregaveis?: string;
    cargaSemanalHoras?: number;
    duracaoSemanas?: number;
    quantidadeVagas?: number;
}

export interface Versao {
    id: number;
    oportunidadeId: number;
    numero: number;
    publicada: boolean;
    prazoEnvio: Data | null;
    notaMinima: number | null;
    validadeNotaDias: 30 | 60 | 90;
    prazoAjusteDias: number;
    escopo: string | null;
    entregaveis: string | null;
    cargaSemanalHoras: number | null;
    duracaoSemanas: number | null;
    quantidadeVagas: number | null;
    criadaPor: number;
    criadaEm: DataHora;
    publicadaEm: DataHora | null;
}

const base = (oportunidadeId: number) => `/api/oportunidades/${oportunidadeId}/versoes`;

export function criarVersao(oportunidadeId: number) {
    return requisicao<Versao>(base(oportunidadeId), { metodo: 'POST' });
}

export function listarVersoes(oportunidadeId: number) {
    return requisicao<Versao[]>(base(oportunidadeId));
}

export function buscarVersao(oportunidadeId: number, versaoId: number) {
    return requisicao<Versao>(`${base(oportunidadeId)}/${versaoId}`);
}

export function editarVersao(oportunidadeId: number, versaoId: number, dados: VersaoEdicao) {
    return requisicao<Versao>(`${base(oportunidadeId)}/${versaoId}`, { metodo: 'PUT', corpo: dados });
}
export function publicarVersao(oportunidadeId: number, versaoId: number) {
    return requisicao<Versao>(`${base(oportunidadeId)}/${versaoId}/publicar`, { metodo: 'POST' });
}