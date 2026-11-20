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

export function guardarToken(token: string) {
    localStorage.setItem(CHAVE_TOKEN, token);
}

export function lerToken(): string | null {
    return localStorage.getItem(CHAVE_TOKEN);
}

export function apagarToken() {
    localStorage.removeItem(CHAVE_TOKEN);
}

export async function requisicao<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
    const url = new URL(caminho, import.meta.env.VITE_API_URL);
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
        const dados: unknown = await resposta.json().catch(() => null);
        throw new ErroApi(resposta.status, lerMensagem(dados, resposta.status));
    }

    if (resposta.status === 204) return undefined as T;
    return (await resposta.json()) as T;
}