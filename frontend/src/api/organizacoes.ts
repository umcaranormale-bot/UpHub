import { requisicao, type DataHora } from './cliente';

export type TipoOrganizacao =
    | 'EMPRESA'
    | 'STARTUP'
    | 'SQUAD'
    | 'ORGAO_FOMENTO'
    | 'INVESTIDOR'
    | 'ACELERADORA'
    | 'EMPRESA_PARCEIRA';

export interface OrganizacaoCadastro {
    tipo: TipoOrganizacao;
    nome: string;
    razaoSocial?: string;
    cnpj?: string;
    porte?: string;
    setor?: string;
    estagio?: string;
    anoFundacao?: number;
    sedeCidade?: string;
    sedeUf?: string;
    descricao?: string;
    papel?: 'PROVEDOR' | 'CANDIDATO';
}

export type OrganizacaoEdicao = Partial<Omit<OrganizacaoCadastro, 'tipo' | 'papel'>> & {
    deckDocumentoId?: number;
};

export interface Organizacao {
    id: number;
    tipo: TipoOrganizacao | 'GESTAO' | 'PESSOA_FISICA';
    nome: string;
    razaoSocial: string | null;
    cnpj: string | null;
    porte: string | null;
    setor: string | null;
    estagio: string | null;
    anoFundacao: number | null;
    sedeCidade: string | null;
    sedeUf: string | null;
    descricao: string | null;
    deckDocumentoId: number | null;
    criadaEm: DataHora;
}

export function cadastrarOrganizacao(dados: OrganizacaoCadastro) {
    return requisicao<Organizacao>('/api/organizacoes', { metodo: 'POST', corpo: dados });
}

export function listarOrganizacoes(nome?: string) {
    return requisicao<Organizacao[]>('/api/organizacoes', { parametros: { nome } });
}

export function buscarOrganizacao(id: number) {
    return requisicao<Organizacao>(`/api/organizacoes/${id}`);
}

export function editarOrganizacao(id: number, dados: OrganizacaoEdicao) {
    return requisicao<Organizacao>(`/api/organizacoes/${id}`, { metodo: 'PUT', corpo: dados });
}
