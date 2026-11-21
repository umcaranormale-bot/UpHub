import { requisicao, type Data, type DataHora } from './cliente';

export type AcaoAuditoria =
    | 'OPORTUNIDADE_CRIADA'
    | 'OPORTUNIDADE_PUBLICADA'
    | 'VERSAO_PUBLICADA'
    | 'OPORTUNIDADE_ENCERRADA'
    | 'OPORTUNIDADE_SUSPENSA'
    | 'CANDIDATURA_ENVIADA'
    | 'ESTADO_ALTERADO'
    | 'ESTAGIO_FUNIL_ALTERADO'
    | 'AVALIADOR_DESIGNADO'
    | 'AVALIACAO_ATRIBUIDA'
    | 'AVALIACAO_ASSINADA'
    | 'PARECER_RETIFICADO'
    | 'AJUSTE_PEDIDO'
    | 'PRAZO_REABERTO'
    | 'RESULTADO_HOMOLOGADO'
    | 'PROVEDOR_APROVADO'
    | 'PROVEDOR_RECUSADO'
    | 'PROVEDOR_REVOGADO'
    | 'CONVITE_ENVIADO'
    | 'CONVITE_ACEITO'
    | 'CONVITE_EXPIRADO'
    | 'MENTOR_CONVIDADO'
    | 'ALOCACAO_RESPONDIDA'
    | 'SPRINT_AVALIADA';

export const ROTULOS_ACAO: Record<AcaoAuditoria, string> = {
    OPORTUNIDADE_CRIADA: 'Criou a oportunidade',
    OPORTUNIDADE_PUBLICADA: 'Publicou a oportunidade',
    VERSAO_PUBLICADA: 'Publicou uma nova versão',
    OPORTUNIDADE_ENCERRADA: 'Encerrou a oportunidade',
    OPORTUNIDADE_SUSPENSA: 'Oportunidade suspensa',
    CANDIDATURA_ENVIADA: 'Enviou a candidatura',
    ESTADO_ALTERADO: 'Mudou o estado',
    ESTAGIO_FUNIL_ALTERADO: 'Moveu no funil',
    AVALIADOR_DESIGNADO: 'Designou avaliador',
    AVALIACAO_ATRIBUIDA: 'Atribuiu a avaliação',
    AVALIACAO_ASSINADA: 'Assinou o parecer',
    PARECER_RETIFICADO: 'Retificou o parecer',
    AJUSTE_PEDIDO: 'Pediu ajuste',
    PRAZO_REABERTO: 'Reabriu o prazo',
    RESULTADO_HOMOLOGADO: 'Homologou o resultado',
    PROVEDOR_APROVADO: 'Aprovou o provedor',
    PROVEDOR_RECUSADO: 'Recusou o provedor',
    PROVEDOR_REVOGADO: 'Revogou a permissão',
    CONVITE_ENVIADO: 'Enviou convite',
    CONVITE_ACEITO: 'Aceitou o convite',
    CONVITE_EXPIRADO: 'Convite expirou',
    MENTOR_CONVIDADO: 'Convidou mentor',
    ALOCACAO_RESPONDIDA: 'Mentor respondeu',
    SPRINT_AVALIADA: 'Avaliou a sprint',
};

export interface EventoAuditoria {
    id: number;
    ocorridoEm: DataHora;
    autor: { pessoaId: number; nome: string } | null;
    autorSistema: 'AGENDADOR' | null;
    papel: 'PROVEDOR' | 'CANDIDATO' | 'AVALIADOR' | 'MENTOR' | 'GESTAO' | null;
    acao: AcaoAuditoria;
    entidadeTipo: string;
    entidadeId: number;
    oportunidadeId: number | null;
    candidaturaId: number | null;
    versaoId: number | null;
    estadoAnterior: string | null;
    estadoNovo: string | null;
    justificativa: string | null;
}

export interface FiltrosAuditoria {
    acao?: AcaoAuditoria;
    desde?: Data;
    ate?: Data;
    limite?: number;
}

export function historicoDaOrganizacao(organizacaoId: number, filtros: FiltrosAuditoria = {}) {
    return requisicao<EventoAuditoria[]>(`/api/organizacoes/${organizacaoId}/auditoria`, { parametros: { ...filtros } });
}

export function historicoDaOportunidade(oportunidadeId: number, filtros: FiltrosAuditoria = {}) {
    return requisicao<EventoAuditoria[]>(`/api/oportunidades/${oportunidadeId}/auditoria`, { parametros: { ...filtros } });
}

export function historicoDaCandidatura(candidaturaId: number, filtros: FiltrosAuditoria = {}) {
    return requisicao<EventoAuditoria[]>(`/api/candidaturas/${candidaturaId}/auditoria`, { parametros: { ...filtros } });
}