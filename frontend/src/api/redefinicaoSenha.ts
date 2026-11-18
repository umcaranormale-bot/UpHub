import { requisicao } from './cliente';
export function pedirLinkDeSenha(email: string) {
    return requisicao<void>('/api/redefinicao-senha/solicitar', {
        metodo: 'POST',
        corpo: { email },
    });
}

export function redefinirSenha(token: string, senha: string) {
    return requisicao<void>('/api/redefinicao-senha', {
        metodo: 'POST',
        corpo: { token, senha },
    });
}