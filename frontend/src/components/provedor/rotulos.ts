import type { EstadoCandidatura } from '../../api/candidaturas'
import type { Oportunidade } from '../../api/oportunidades'
import type { CampoRequisito, Operador, ValorRequisito } from '../../api/requisitos'
import type { SituacaoSolicitacao } from '../../api/solicitacoesProvedor'
import type { Status } from '../SeloStatus'
import { ANEL_FOCO, TRANSICAO_COR } from '../../estilos/classes'

/** Rótulos e classes das telas do provedor. */

export const LINK_ACAO = `rounded-card text-apoio text-acento ${TRANSICAO_COR} hover:text-titulo hover:underline ${ANEL_FOCO}`

// ---------- oportunidade

export function rotuloDaOportunidade(o: Oportunidade): string {
    if (o.suspensaEm && o.estado !== 'ENCERRADA' && o.estado !== 'RASCUNHO') return 'Suspensa'
    switch (o.estado) {
        case 'RASCUNHO':
            return 'Rascunho'
        case 'PUBLICADA':
            return 'Publicada'
        case 'EM_AVALIACAO':
            return 'Em avaliação'
        case 'ENCERRADA':
            return 'Encerrada'
    }
}

export function statusDaOportunidade(o: Oportunidade): Status {
    if (o.suspensaEm && o.estado !== 'ENCERRADA' && o.estado !== 'RASCUNHO') return 'reprovada'
    switch (o.estado) {
        case 'RASCUNHO':
            return 'rascunho'
        case 'PUBLICADA':
            return 'aprovada'
        case 'EM_AVALIACAO':
            return 'avaliacao'
        case 'ENCERRADA':
            return 'rascunho'
    }
}

/** Oportunidade pausada: a gestão revogou a permissão do provedor. */
export function estaSuspensa(o: Oportunidade): boolean {
    return !!o.suspensaEm && o.estado !== 'ENCERRADA' && o.estado !== 'RASCUNHO'
}

// ---------- pedido de permissão

export const ROTULO_PEDIDO: Record<SituacaoSolicitacao, string> = {
    AGUARDANDO: 'Aguardando análise',
    APROVADA: 'Aprovado',
    RECUSADA: 'Recusado',
    REVOGADA: 'Revogado',
}

export const STATUS_PEDIDO: Record<SituacaoSolicitacao, Status> = {
    AGUARDANDO: 'enviada',
    APROVADA: 'aprovada',
    RECUSADA: 'reprovada',
    REVOGADA: 'reprovada',
}

// ---------- requisitos de elegibilidade

export const ROTULO_OPERADOR: Record<Operador, string> = {
    IGUAL: 'é igual a',
    DIFERENTE: 'é diferente de',
    EM: 'está em',
    FORA_DE: 'não está em',
    MAIOR_OU_IGUAL: 'maior ou igual a',
    MENOR_OU_IGUAL: 'menor ou igual a',
}

export const ROTULO_CAMPO: Record<CampoRequisito, string> = {
    TIPO: 'Tipo da organização',
    PORTE: 'Porte da empresa',
    SETOR: 'Setor de atuação',
    ESTAGIO: 'Estágio',
    SEDE_UF: 'UF da sede',
    SEDE_CIDADE: 'Cidade da sede',
    TEMPO_DE_MERCADO_ANOS: 'Tempo de mercado (anos)',
}

export function rotuloDoCampo(campo: string): string {
    return ROTULO_CAMPO[campo as CampoRequisito] ?? campo
}

export function rotuloDoOperador(operador: string): string {
    return ROTULO_OPERADOR[operador as Operador] ?? operador
}

export function formatarValor(valor: ValorRequisito | unknown): string {
    if (valor === null || valor === undefined || valor === '') return '—'
    if (Array.isArray(valor)) return valor.join(', ')
    return String(valor)
}

// ---------- candidatura

/** Estados em que a candidatura ocupa vaga. */
export const OCUPAM_VAGA: EstadoCandidatura[] = ['HOMOLOGADA', 'EM_ACOMPANHAMENTO', 'CONCLUIDA']

/** Estados que já passaram pela decisão dos avaliadores. */
export const DECIDIDAS: EstadoCandidatura[] = [
    'APROVADA',
    'REPROVADA',
    'HOMOLOGADA',
    'LISTA_DE_ESPERA',
    'NAO_CONVOCADA',
    'DESCLASSIFICADA',
    'EM_ACOMPANHAMENTO',
    'DESISTENTE',
    'CONCLUIDA',
]

/** Estados que entraram na avaliação (decididas ou ainda em análise). */
export const NA_AVALIACAO: EstadoCandidatura[] = [...DECIDIDAS, 'EM_ANALISE', 'AJUSTE', 'PERDA_DE_PRAZO']

export const APROVADAS: EstadoCandidatura[] = [
    'APROVADA',
    'HOMOLOGADA',
    'LISTA_DE_ESPERA',
    'NAO_CONVOCADA',
    'DESCLASSIFICADA',
    'EM_ACOMPANHAMENTO',
    'DESISTENTE',
    'CONCLUIDA',
]

/** A elegibilidade que se lê do estado: pendente (ENVIADA), não elegível ou elegível. */
export function elegibilidadeDoEstado(estado: EstadoCandidatura): { rotulo: string; status: Status } {
    if (estado === 'ENVIADA') return { rotulo: 'Pendente', status: 'pendente' }
    if (estado === 'NAO_ELEGIVEL') return { rotulo: 'Não elegível', status: 'reprovada' }
    return { rotulo: 'Elegível', status: 'aprovada' }
}
