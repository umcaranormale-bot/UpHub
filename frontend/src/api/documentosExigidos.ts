import { requisicao } from './cliente';

export interface DocumentoExigidoCadastro {
    nome: string;
    obrigatorio?: boolean;
}

export interface DocumentoExigido {
    id: number;
    versaoId: number;
    nome: string;
    obrigatorio: boolean;
}

const base = (oportunidadeId: number, versaoId: number) =>
    `/api/oportunidades/${oportunidadeId}/versoes/${versaoId}/documentos-exigidos`;

export function criarDocumentoExigido(oportunidadeId: number, versaoId: number, dados: DocumentoExigidoCadastro) {
    return requisicao<DocumentoExigido>(base(oportunidadeId, versaoId), { metodo: 'POST', corpo: dados });
}

export function listarDocumentosExigidos(oportunidadeId: number, versaoId: number) {
    return requisicao<DocumentoExigido[]>(base(oportunidadeId, versaoId));
}

export function editarDocumentoExigido(
    oportunidadeId: number,
    versaoId: number,
    documentoId: number,
    dados: Partial<DocumentoExigidoCadastro>,
) {
    return requisicao<DocumentoExigido>(`${base(oportunidadeId, versaoId)}/${documentoId}`, {
        metodo: 'PUT',
        corpo: dados,
    });
}

export function removerDocumentoExigido(oportunidadeId: number, versaoId: number, documentoId: number) {
    return requisicao<void>(`${base(oportunidadeId, versaoId)}/${documentoId}`, { metodo: 'DELETE' });
}
