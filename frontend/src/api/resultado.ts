import { requisicao } from './cliente';
import type { Candidatura } from './candidaturas';

export interface Vagas {
    oportunidadeId: number;
    total: number | null;
    ocupadas: number;
    livres: number | null;
    reservas: { criterio: string; quantidade: number; ocupadas: number }[];
    listaDeEspera: { candidaturaId: number; tituloProposta: string | null; posicao: number }[];
}

const acao = (candidaturaId: number, caminho: string) =>
    requisicao<Candidatura>(`/api/candidaturas/${candidaturaId}/${caminho}`, { metodo: 'POST' });

export function resumoDasVagas(oportunidadeId: number) {
    return requisicao<Vagas>(`/api/oportunidades/${oportunidadeId}/vagas`);
}

export const homologar = (id: number) => acao(id, 'homologar');
export const porNaListaDeEspera = (id: number) => acao(id, 'lista-de-espera');
export const convocar = (id: number) => acao(id, 'convocar');
export const naoConvocar = (id: number) => acao(id, 'nao-convocar');
export const iniciarAcompanhamento = (id: number) => acao(id, 'acompanhamento');
export const concluir = (id: number) => acao(id, 'concluir');
export const desistir = (id: number) => acao(id, 'desistir');