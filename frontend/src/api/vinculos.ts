import { requisicao, type DataHora } from './cliente';

export type Papel = 'PROVEDOR' | 'CANDIDATO' | 'AVALIADOR' | 'MENTOR' | 'GESTAO';

export interface VinculoCadastro {
    pessoaId: number;
    organizacaoId: number;
    papel: Papel;
    funcao?: string;
    representante?: boolean;
}

export interface Vinculo {
    id: number;
    pessoaId: number;
    pessoaNome: string;
    organizacaoId: number;
    organizacaoNome: string;
    papel: Papel;
    funcao: string | null;
    representante: boolean;
    ativoDesde: DataHora;
    encerradoEm: DataHora | null;
}

export type FiltroVinculos = { pessoaId: number } | { organizacaoId: number } | Record<string, never>;

export function cadastrarVinculo(dados: VinculoCadastro) {
    return requisicao<Vinculo>('/api/vinculos', { metodo: 'POST', corpo: dados });
}

export function listarVinculos(filtro: FiltroVinculos = {}) {
    return requisicao<Vinculo[]>('/api/vinculos', { parametros: filtro });
}