import { requisicao } from './cliente';

export interface ReservaCadastro {
    criterio: string;
    quantidade: number;
}

export interface Reserva {
    id: number;
    versaoId: number;
    criterio: string;
    quantidade: number;
}

const base = (oportunidadeId: number, versaoId: number) =>
    `/api/oportunidades/${oportunidadeId}/versoes/${versaoId}/reservas`;

export function criarReserva(oportunidadeId: number, versaoId: number, dados: ReservaCadastro) {
    return requisicao<Reserva>(base(oportunidadeId, versaoId), { metodo: 'POST', corpo: dados });
}

export function listarReservas(oportunidadeId: number, versaoId: number) {
    return requisicao<Reserva[]>(base(oportunidadeId, versaoId));
}

export function editarReserva(
    oportunidadeId: number,
    versaoId: number,
    reservaId: number,
    dados: Partial<ReservaCadastro>,
) {
    return requisicao<Reserva>(`${base(oportunidadeId, versaoId)}/${reservaId}`, { metodo: 'PUT', corpo: dados });
}

export function removerReserva(oportunidadeId: number, versaoId: number, reservaId: number) {
    return requisicao<void>(`${base(oportunidadeId, versaoId)}/${reservaId}`, { metodo: 'DELETE' });
}
