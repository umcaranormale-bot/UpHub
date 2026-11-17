import { guardarToken, requisicao, type DataHora } from './cliente';
import type { LoginResposta } from './auth';

export type PapelConvite = 'AVALIADOR' | 'MENTOR';
export type SituacaoConvite = 'AGUARDANDO' | 'ACEITO' | 'RECUSADO' | 'EXPIRADO';

export interface ConviteCadastro {
    email: string;
    papel: PapelConvite;
    organizacaoId: number;
    enviadoPor: number;
}

export interface Convite {
    id: number;
    email: string;
    papel: PapelConvite;
    organizacaoId: number;
    enviadoPor: number;
    enviadoEm: DataHora;
    expiraEm: DataHora;
    situacao: SituacaoConvite;
    aceitoEm: DataHora | null;
    pessoaId: number | null;
}

export interface ConviteRecebido {
    organizacaoNome: string;
    convidadoPor: string | null;
    papel: PapelConvite;
    email: string;
    expiraEm: DataHora;
    contaExistente: boolean;
}

export function convidar(dados: ConviteCadastro) {
    return requisicao<Convite>('/api/convites', { metodo: 'POST', corpo: dados });
}

export function listarConvites(organizacaoId: number) {
    return requisicao<Convite[]>('/api/convites', { parametros: { organizacaoId } });
}

export function validarConvite(codigo: string) {
    return requisicao<ConviteRecebido>('/api/convites/validar', { parametros: { codigo } });
}

export async function aceitarConvite(codigo: string, senha: string, nome?: string) {

    const resposta = await requisicao<LoginResposta>('/api/convites/aceitar', {
        metodo: 'POST',
        corpo: { codigo, nome, senha },
    });
    guardarToken(resposta.token);
    return resposta;
}
export function recusarConvite(codigo: string) {
    return requisicao<void>('/api/convites/recusar', {
        metodo: 'POST',
        corpo: { codigo },
    });
}