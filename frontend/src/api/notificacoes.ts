import { requisicao, type DataHora } from './cliente';

export type TipoNotificacao = 'PEDE_ACAO' | 'INFORMATIVA';

export interface Notificacao {
    id: number;
    titulo: string;
    mensagem: string | null;
    tipo: TipoNotificacao;
    oportunidadeId: number | null;
    oportunidadeTitulo: string | null;
    link: string | null;
    criadaEm: DataHora;
    lidaEm: DataHora | null;
    emailEnviadoEm: DataHora | null;
}

export interface Quantidade {
    quantidade: number;
}

export function listarNotificacoes(naoLidas?: boolean) {
    return requisicao<Notificacao[]>('/api/notificacoes', { parametros: { naoLidas: naoLidas ? 'true' : undefined } });
}

export function contarNaoLidas() {
    return requisicao<Quantidade>('/api/notificacoes/nao-lidas');
}

export function marcarComoLida(id: number) {
    return requisicao<Notificacao>(`/api/notificacoes/${id}/lida`, { metodo: 'POST' });
}

export function marcarTodasComoLidas() {
    return requisicao<Quantidade>('/api/notificacoes/lidas', { metodo: 'POST' });
}