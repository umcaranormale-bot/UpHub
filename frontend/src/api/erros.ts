import { ErroApi } from './cliente';

export function mensagemDeErro(e: unknown): string {
    if (e instanceof ErroApi) return e.message;
    return 'Não foi possível falar com o servidor. Tente de novo.';
}