import { requisicao } from './cliente';

export interface CriterioCadastro {
    descricao: string;
    peso?: number;
    escalaMin?: number;
    escalaMax?: number;
    ordem?: number;
    evidenciaEsperada?: string;
}

export interface Criterio {
    id: number;
    versaoId: number;
    ordem: number | null;
    descricao: string;
    peso: number | null;
    escalaMin: number | null;
    escalaMax: number | null;
    evidenciaEsperada: string | null;
}

const base = (oportunidadeId: number, versaoId: number) =>
    `/api/oportunidades/${oportunidadeId}/versoes/${versaoId}/criterios`;

export function criarCriterio(oportunidadeId: number, versaoId: number, dados: CriterioCadastro) {
    return requisicao<Criterio>(base(oportunidadeId, versaoId), { metodo: 'POST', corpo: dados });
}

export function listarCriterios(oportunidadeId: number, versaoId: number) {
    return requisicao<Criterio[]>(base(oportunidadeId, versaoId));
}

export function editarCriterio(
    oportunidadeId: number,
    versaoId: number,
    criterioId: number,
    dados: Partial<CriterioCadastro>,
) {
    return requisicao<Criterio>(`${base(oportunidadeId, versaoId)}/${criterioId}`, {
        metodo: 'PUT',
        corpo: dados,
    });
}

export function removerCriterio(oportunidadeId: number, versaoId: number, criterioId: number) {
    return requisicao<void>(`${base(oportunidadeId, versaoId)}/${criterioId}`, { metodo: 'DELETE' });
}
