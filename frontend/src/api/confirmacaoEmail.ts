import { requisicao } from './cliente';

export function confirmarEmail(email: string, codigo: string) {
    return requisicao<void>('/api/confirmacao-email', {
        metodo: 'POST',
        corpo: { email, codigo },
    });
}

export function reenviarCodigo(email: string) {
    return requisicao<void>('/api/confirmacao-email/reenviar', {
        metodo: 'POST',
        corpo: { email },
    });
}