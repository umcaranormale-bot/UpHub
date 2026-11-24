import { requisicao } from './cliente';

export type CampoRequisito =
    | 'TIPO'
    | 'PORTE'
    | 'SETOR'
    | 'ESTAGIO'
    | 'SEDE_UF'
    | 'SEDE_CIDADE'
    | 'TEMPO_DE_MERCADO_ANOS';

export type Operador = 'IGUAL' | 'DIFERENTE' | 'EM' | 'FORA_DE' | 'MAIOR_OU_IGUAL' | 'MENOR_OU_IGUAL';

export type ValorRequisito = string | number | (string | number)[];

export interface CampoDisponivel {
    campo: CampoRequisito;
    descricao: string;
    tipo: 'TEXTO' | 'NUMERO';
    operadores: Operador[];
}

export interface RequisitoCadastro {
    campo: CampoRequisito;
    operador: Operador;
    valor: ValorRequisito;
    obrigatoria?: boolean;
    ordem?: number;
}

export interface Requisito {
    id: number;
    versaoId: number;
    ordem: number | null;
    campo: CampoRequisito;
    operador: Operador;
    valor: ValorRequisito;
    obrigatoria: boolean;
}

export type SituacaoRequisito = 'ATENDIDO' | 'NAO_ATENDIDO' | 'PENDENTE';

export interface ResultadoRequisito {
    requisitoId: number;
    campo: CampoRequisito;
    operador: Operador;
    valorExigido: ValorRequisito;
    valorInformado: string | number | null;
    obrigatoria: boolean;
    situacao: SituacaoRequisito;
    explicacao: string;
}

export interface Elegibilidade {
    organizacaoId: number;
    versaoId: number;
    situacao: 'ELEGIVEL' | 'INELEGIVEL' | 'PENDENTE';
    requisitos: ResultadoRequisito[];
    faltou: string[];
}

const base = (oportunidadeId: number, versaoId: number) =>
    `/api/oportunidades/${oportunidadeId}/versoes/${versaoId}`;

export function listarCamposDeRequisito() {
    return requisicao<CampoDisponivel[]>('/api/requisitos/campos');
}

export function criarRequisito(oportunidadeId: number, versaoId: number, dados: RequisitoCadastro) {
    return requisicao<Requisito>(`${base(oportunidadeId, versaoId)}/requisitos`, {
        metodo: 'POST',
        corpo: dados,
    });
}

export function listarRequisitos(oportunidadeId: number, versaoId: number) {
    return requisicao<Requisito[]>(`${base(oportunidadeId, versaoId)}/requisitos`);
}

export function editarRequisito(
    oportunidadeId: number,
    versaoId: number,
    requisitoId: number,
    dados: Partial<RequisitoCadastro>,
) {
    return requisicao<Requisito>(`${base(oportunidadeId, versaoId)}/requisitos/${requisitoId}`, {
        metodo: 'PUT',
        corpo: dados,
    });
}

export function removerRequisito(oportunidadeId: number, versaoId: number, requisitoId: number) {
    return requisicao<void>(`${base(oportunidadeId, versaoId)}/requisitos/${requisitoId}`, {
        metodo: 'DELETE',
    });
}

export function conferirElegibilidade(oportunidadeId: number, versaoId: number, organizacaoId: number) {
    return requisicao<Elegibilidade>(`${base(oportunidadeId, versaoId)}/elegibilidade`, {
        parametros: { organizacaoId },
    });
}
