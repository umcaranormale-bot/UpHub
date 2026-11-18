import { requisicao, type DataHora } from './cliente';

export interface PessoaCadastro {
    nome: string;
    email: string;
    senha: string;
    telefone?: string;
}

export interface Pessoa {
    id: number;
    nome: string;
    email: string;
    telefone: string | null;
    fotoRef: string | null;
    criadaEm: DataHora;
}

export function cadastrarPessoa(dados: PessoaCadastro) {
    return requisicao<Pessoa>('/api/pessoas', { metodo: 'POST', corpo: dados });
}

export function buscarPessoa(id: number) {
    return requisicao<Pessoa>(`/api/pessoas/${id}`);
}