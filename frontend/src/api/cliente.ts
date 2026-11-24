export type DataHora = string;
export type Data = string;

export class ErroApi extends Error {
    readonly status: number;

    constructor(status: number, mensagem: string) {
        super(mensagem);
        this.name = 'ErroApi';
        this.status = status;
    }
}

type Parametros = Record<string, string | number | undefined>;

interface Opcoes {
    metodo?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    corpo?: unknown;
    parametros?: Parametros;
}

function lerMensagem(dados: unknown, status: number): string {
    if (
        typeof dados === 'object' &&
        dados !== null &&
        'erro' in dados &&
        typeof dados.erro === 'string'
    ) {
        return dados.erro;
    }
    return `O servidor respondeu ${status}`;
}

const CHAVE_TOKEN = 'uphub.token';

/** Disparado quando a API responde 401 com um token guardado (sessão vencida). */
export const EVENTO_SESSAO_EXPIRADA = 'uphub:sessao-expirada';

// endereços que respondem 401 quando a senha digitada está errada
const CONFEREM_SENHA = ['/api/auth/login', '/api/convites/aceitar'];

export function guardarToken(token: string) {
    localStorage.setItem(CHAVE_TOKEN, token);
}

export function lerToken(): string | null {
    return localStorage.getItem(CHAVE_TOKEN);
}

export function apagarToken() {
    localStorage.removeItem(CHAVE_TOKEN);
}

// Sem VITE_API_URL (produção), a API fica no mesmo endereço do site: a portaria manda /api para o back-end.
const BASE_DA_API = import.meta.env.VITE_API_URL || window.location.origin;

export async function requisicao<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
    const url = new URL(caminho, BASE_DA_API);
    for (const [nome, valor] of Object.entries(opcoes.parametros ?? {})) {
        if (valor !== undefined) url.searchParams.set(nome, String(valor));
    }

    const temCorpo = opcoes.corpo !== undefined;
    const cabecalhos: Record<string, string> = {};
    if (temCorpo) cabecalhos['Content-Type'] = 'application/json';
    const token = lerToken();
    if (token) cabecalhos['Authorization'] = `Bearer ${token}`;
    const resposta = await fetch(url, {
        method: opcoes.metodo ?? 'GET',
        headers: cabecalhos,
        body: temCorpo ? JSON.stringify(opcoes.corpo) : undefined,
    });
    if (!resposta.ok) {
        // token vencido ou inválido: apaga e avisa o site, que volta para o login
        // (menos onde o 401 é "senha incorreta", como aceitar um convite: aí a sessão continua valendo)
        if (resposta.status === 401 && token && !CONFEREM_SENHA.some((c) => caminho.startsWith(c))) {
            apagarToken();
            window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
        }
        const dados: unknown = await resposta.json().catch(() => null);
        throw new ErroApi(resposta.status, lerMensagem(dados, resposta.status));
    }

    if (resposta.status === 204) return undefined as T;
    return (await resposta.json()) as T;
}