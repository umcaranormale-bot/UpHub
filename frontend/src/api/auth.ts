import { apagarToken, guardarToken, requisicao, type DataHora } from './cliente';
import type { Pessoa } from './pessoas';
import type { Vinculo } from './vinculos';

export interface Sessao {
    pessoa: Pessoa;
    vinculos: Vinculo[];
}

export interface LoginResposta extends Sessao {
    token: string;
    expiraEm: DataHora;
}

export async function entrar(email: string, senha: string) {
    const resposta = await requisicao<LoginResposta>('/api/auth/login', {
        metodo: 'POST',
        corpo: { email, senha },
    });
    guardarToken(resposta.token);
    return resposta;
}

export function buscarSessao() {
    return requisicao<Sessao>('/api/auth/eu');
}

export function sair() {
    apagarToken();
}