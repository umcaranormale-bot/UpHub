import { requisicao, type Data, type DataHora } from './cliente';

export interface ProvaCadastro {
    nota: number;
    dataProva: Data;
    area?: string;
}

export interface Prova {
    id: number;
    pessoaId: number;
    area: string | null;
    nota: number;
    dataProva: Data;
    registradoEm: DataHora;
}

export function registrarProva(dados: ProvaCadastro) {
    return requisicao<Prova>('/api/provas', { metodo: 'POST', corpo: dados });
}

export function listarMinhasProvas() {
    return requisicao<Prova[]>('/api/provas');
}
