import { requisicao, type Data, type DataHora } from './cliente';
import type { TrilhaCodigo } from './trilhas';
import type { EstadoOportunidade } from './oportunidades';

export interface Favorita {
    organizacaoId: number;
    oportunidadeId: number;
    titulo: string;
    trilhaCodigo: TrilhaCodigo;
    estado: EstadoOportunidade;
    provedorNome: string;
    prazoEnvio: Data | null;
    favoritadaPor: { pessoaId: number; nome: string };
    favoritadaEm: DataHora;
}

export function listarFavoritas(organizacaoId: number) {
    return requisicao<Favorita[]>(`/api/organizacoes/${organizacaoId}/favoritas`);
}

export function favoritar(organizacaoId: number, oportunidadeId: number) {
    return requisicao<Favorita>(`/api/organizacoes/${organizacaoId}/favoritas/${oportunidadeId}`, { metodo: 'POST' });
}

export function desfavoritar(organizacaoId: number, oportunidadeId: number) {
    return requisicao<void>(`/api/organizacoes/${organizacaoId}/favoritas/${oportunidadeId}`, { metodo: 'DELETE' });
}