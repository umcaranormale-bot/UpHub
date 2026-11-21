import { requisicao, type Data, type DataHora } from './cliente';

export interface DocumentoCadastro {
    organizacaoId: number;
    tipo: string;
    nomeArquivo: string;
    tamanhoBytes: number;
    armazenamentoRef: string;
    tipoMime?: string;
    validade?: Data;
    textoPesquisavel?: boolean;
}

export interface Documento {
    id: number;
    organizacaoId: number;
    organizacaoNome: string;
    enviadoPorId: number;
    enviadoPorNome: string;
    tipo: string;
    nomeArquivo: string;
    tamanhoBytes: number;
    tipoMime: string | null;
    validade: Data | null;
    textoPesquisavel: boolean | null;
    enviadoEm: DataHora;
}

export function cadastrarDocumento(dados: DocumentoCadastro) {
    return requisicao<Documento>('/api/documentos', { metodo: 'POST', corpo: dados });
}

export function listarDocumentos(organizacaoId: number) {
    return requisicao<Documento[]>('/api/documentos', { parametros: { organizacaoId } });
}

export function buscarDocumento(id: number) {
    return requisicao<Documento>(`/api/documentos/${id}`);
}
