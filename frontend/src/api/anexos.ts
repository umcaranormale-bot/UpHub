import { requisicao, type Data } from './cliente';

export interface AnexoCadastro {
    documentoId: number;
    documentoExigidoId?: number;
}

export interface Anexo {
    candidaturaId: number;
    documentoId: number;
    tipo: string;
    nomeArquivo: string;
    tipoMime: string | null;
    tamanhoBytes: number;
    validade: Data | null;
    documentoExigidoId: number | null;
    documentoExigidoNome: string | null;
}

const base = (candidaturaId: number) => `/api/candidaturas/${candidaturaId}/anexos`;

export function anexarDocumento(candidaturaId: number, dados: AnexoCadastro) {
    return requisicao<Anexo>(base(candidaturaId), { metodo: 'POST', corpo: dados });
}

export function listarAnexos(candidaturaId: number) {
    return requisicao<Anexo[]>(base(candidaturaId));
}

export function removerAnexo(candidaturaId: number, documentoId: number) {
    return requisicao<void>(`${base(candidaturaId)}/${documentoId}`, { metodo: 'DELETE' });
}