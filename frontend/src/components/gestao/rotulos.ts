import type { EtapaGargalo } from '../../api/gargalos'
import type { SituacaoSolicitacao } from '../../api/solicitacoesProvedor'
import type { Status } from '../SeloStatus'

/** Rótulos das telas da gestão: a API manda os códigos, a tela mostra o texto. */

export const ORDEM_DAS_ETAPAS: EtapaGargalo[] = ['PUBLICACAO', 'ELEGIBILIDADE', 'AVALIACAO', 'HOMOLOGACAO']

export const ROTULO_ETAPA: Record<EtapaGargalo, string> = {
    PUBLICACAO: 'Publicação',
    ELEGIBILIDADE: 'Elegibilidade',
    AVALIACAO: 'Avaliação',
    HOMOLOGACAO: 'Homologação',
}

export const ROTULO_RESPONSAVEL: Record<'PROVEDOR' | 'AVALIADOR' | 'GESTAO', string> = {
    PROVEDOR: 'Provedor',
    AVALIADOR: 'Avaliador',
    GESTAO: 'Gestão',
}

export const ROTULO_FUNIL: Record<'INSCRITA' | 'TRIADA' | 'EM_DILIGENCIA' | 'SELECIONADA', string> = {
    INSCRITA: 'Inscrita',
    TRIADA: 'Triada',
    EM_DILIGENCIA: 'Em diligência',
    SELECIONADA: 'Selecionada',
}

export const SITUACAO_SOLICITACAO: Record<SituacaoSolicitacao, { rotulo: string; status: Status }> = {
    AGUARDANDO: { rotulo: 'Aguardando', status: 'pendente' },
    APROVADA: { rotulo: 'Aprovada', status: 'aprovada' },
    RECUSADA: { rotulo: 'Recusada', status: 'reprovada' },
    REVOGADA: { rotulo: 'Revogada', status: 'rascunho' },
}

export const SITUACAO_ALOCACAO: Record<'PENDENTE' | 'ACEITA' | 'RECUSADA' | 'EXPIRADA', { rotulo: string; status: Status }> = {
    PENDENTE: { rotulo: 'Convite enviado', status: 'pendente' },
    ACEITA: { rotulo: 'Alocada', status: 'aprovada' },
    RECUSADA: { rotulo: 'Recusou', status: 'reprovada' },
    EXPIRADA: { rotulo: 'Convite expirou', status: 'rascunho' },
}

export function dias(n: number): string {
    return n === 1 ? '1 dia' : `${n} dias`
}

/** "2026-10" do mês de uma data, no fuso de Recife, para os indicadores "no mês". */
export function mesDe(valor: string): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Recife', year: 'numeric', month: '2-digit' }).format(
        new Date(valor),
    )
}
