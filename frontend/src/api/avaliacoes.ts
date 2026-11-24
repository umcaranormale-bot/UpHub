import { requisicao, type Data, type DataHora } from './cliente';
import type { EstadoCandidatura } from './candidaturas';

export type Decisao = 'APROVADA' | 'REPROVADA' | 'AJUSTE';

export interface RascunhoAvaliacao {
    decisao?: Decisao;
    parecer?: string;
}

export interface ItemAjusteCadastro {
    descricao: string;
    detalhe?: string;
    documentoExigidoId?: number;
}

export interface Avaliacao {
    id: number;
    candidaturaId: number;
    oportunidadeId: number;
    tituloProposta: string | null;
    estadoCandidatura: EstadoCandidatura;
    rodada: number;
    vinculoId: number | null;
    avaliadorNome: string | null;
    atribuidaEm: DataHora;
    prazoAvaliacao: Data | null;
    decisao: Decisao | null;
    parecer: string | null;
    parecerRetificado: string | null;
    retificadaEm: DataHora | null;
    notaFinal: number | null;
    assinadaEm: DataHora | null;
}

export function atribuirAvaliacao(candidaturaId: number, vinculoId: number) {
    return requisicao<Avaliacao>(`/api/candidaturas/${candidaturaId}/avaliacoes`, { metodo: 'POST', corpo: { vinculoId } });
}

export function listarAvaliacoesDaCandidatura(candidaturaId: number) {
    return requisicao<Avaliacao[]>(`/api/candidaturas/${candidaturaId}/avaliacoes`);
}

export function minhaFila() {
    return requisicao<Avaliacao[]>('/api/avaliacoes');
}

export function buscarAvaliacao(id: number) {
    return requisicao<Avaliacao>(`/api/avaliacoes/${id}`);
}

export function salvarAvaliacao(id: number, dados: RascunhoAvaliacao) {
    return requisicao<Avaliacao>(`/api/avaliacoes/${id}`, { metodo: 'PUT', corpo: dados });
}

export function assinarAvaliacao(id: number, itens?: ItemAjusteCadastro[]) {
    return requisicao<Avaliacao>(`/api/avaliacoes/${id}/assinar`, { metodo: 'POST', corpo: itens ? { itens } : {} });
}

export function removerAvaliacao(id: number) {
    return requisicao<void>(`/api/avaliacoes/${id}`, { metodo: 'DELETE' });
}
