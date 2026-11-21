import { requisicao } from './cliente';
import type { TrilhaCodigo } from './trilhas';

export interface OrganizacaoTrilha {
    organizacaoId: number;
    organizacaoNome: string;
    trilhaCodigo: TrilhaCodigo;
    trilhaNome: string;
}

export function liberarTrilha(organizacaoId: number, trilhaCodigo: TrilhaCodigo) {
    return requisicao<OrganizacaoTrilha>('/api/organizacao-trilhas', {
        metodo: 'POST',
        corpo: { organizacaoId, trilhaCodigo },
    });
}

export function listarTrilhasDasOrganizacoes(organizacaoId?: number) {
    return requisicao<OrganizacaoTrilha[]>('/api/organizacao-trilhas', { parametros: { organizacaoId } });
}
