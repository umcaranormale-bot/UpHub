import { requisicao, type DataHora } from './cliente';
import type { TrilhaCodigo } from './trilhas';

export type EstadoOportunidade = 'RASCUNHO' | 'PUBLICADA' | 'EM_AVALIACAO' | 'ENCERRADA';

export interface OportunidadeCadastro {
    organizacaoId: number;
    trilhaCodigo: TrilhaCodigo;
    titulo: string;
    resumo?: string;
    area?: string;
    tese?: string;
    residenciaId?: number;
}

export type OportunidadeEdicao = Partial<Pick<OportunidadeCadastro, 'titulo' | 'resumo' | 'area' | 'tese' | 'residenciaId'>>;

export interface Oportunidade {
    id: number;
    organizacaoId: number;
    trilhaCodigo: TrilhaCodigo;
    titulo: string;
    resumo: string | null;
    area: string | null;
    tese: string | null;
    residenciaId: number | null;
    estado: EstadoOportunidade;
    criadaPor: number;
    criadaEm: DataHora;
    publicadaEm: DataHora | null;
    encerradaEm: DataHora | null;
    suspensaEm: DataHora | null;
}

export function criarOportunidade(dados: OportunidadeCadastro) {
    return requisicao<Oportunidade>('/api/oportunidades', { metodo: 'POST', corpo: dados });
}

/** Todas as oportunidades publicadas do ecossistema (a busca do candidato), da mais nova para a mais antiga. */
export function listarOportunidadesPublicadas(trilhaCodigo?: TrilhaCodigo) {
    return requisicao<Oportunidade[]>('/api/oportunidades', { parametros: { trilhaCodigo } });
}

export function listarOportunidades(organizacaoId: number) {
    return requisicao<Oportunidade[]>('/api/oportunidades', { parametros: { organizacaoId } });
}

export function buscarOportunidade(id: number) {
    return requisicao<Oportunidade>(`/api/oportunidades/${id}`);
}

export function editarOportunidade(id: number, dados: OportunidadeEdicao) {
    return requisicao<Oportunidade>(`/api/oportunidades/${id}`, { metodo: 'PUT', corpo: dados });
}
