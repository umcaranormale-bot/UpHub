import type { Status } from '../components/SeloStatus'
import type { Trilha } from '../components/SeloDeTrilha'
import type { TrilhaCodigo } from '../api/trilhas'

/**
 * Formatos usados em várias telas: datas, trilhas, estados da candidatura e
 * tipos de organização. A API manda os códigos (MAIÚSCULAS); a tela mostra o rótulo.
 */

const FUSO = 'America/Recife'

/** 2026-11-19 ou 2026-11-19T10:00:00Z → 19/11/2026 */
export function formatarData(valor: string | null | undefined): string {
    if (!valor) return '—'
    // data pura (AAAA-MM-DD) não passa pelo fuso, senão vira o dia anterior
    const soData = /^\d{4}-\d{2}-\d{2}$/.test(valor)
    if (soData) {
        const [a, m, d] = valor.split('-')
        return `${d}/${m}/${a}`
    }
    return new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, dateStyle: 'short' }).format(new Date(valor))
}

/** → 19/11/2026 10:00 */
export function formatarDataHora(valor: string | null | undefined): string {
    if (!valor) return '—'
    return new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, dateStyle: 'short', timeStyle: 'short' }).format(
        new Date(valor),
    )
}

export function formatarMoeda(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return '—'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

/** Hoje no fuso de Recife, como AAAA-MM-DD (para comparar com prazos). */
export function hoje(): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date())
}

/** Dias corridos de hoje até a data (negativo = já passou). */
export function diasAte(data: string): number {
    const alvo = Date.UTC(+data.slice(0, 4), +data.slice(5, 7) - 1, +data.slice(8, 10))
    const h = hoje()
    const agora = Date.UTC(+h.slice(0, 4), +h.slice(5, 7) - 1, +h.slice(8, 10))
    return Math.round((alvo - agora) / 86_400_000)
}

// ---------- trilhas

export const ROTULO_TRILHA: Record<TrilhaCodigo, string> = {
    FOMENTO: 'Fomento',
    INVESTIMENTO: 'Investimento',
    FORMACAO: 'Formação',
}

/** O código da API (FOMENTO) para a chave do SeloDeTrilha (fomento). */
export function trilhaDoSelo(codigo: TrilhaCodigo): Trilha {
    return codigo.toLowerCase() as Trilha
}

// ---------- candidatura

export type EstadoCandidatura =
    | 'RASCUNHO'
    | 'ENVIADA'
    | 'ELEGIVEL'
    | 'NAO_ELEGIVEL'
    | 'DESCARTADA'
    | 'EM_ANALISE'
    | 'APROVADA'
    | 'REPROVADA'
    | 'AJUSTE'
    | 'PERDA_DE_PRAZO'
    | 'HOMOLOGADA'
    | 'LISTA_DE_ESPERA'
    | 'NAO_CONVOCADA'
    | 'DESCLASSIFICADA'
    | 'EM_ACOMPANHAMENTO'
    | 'DESISTENTE'
    | 'CONCLUIDA'

export const ROTULO_ESTADO: Record<EstadoCandidatura, string> = {
    RASCUNHO: 'Rascunho',
    ENVIADA: 'Enviada',
    ELEGIVEL: 'Elegível',
    NAO_ELEGIVEL: 'Não elegível',
    DESCARTADA: 'Descartada',
    EM_ANALISE: 'Em análise',
    APROVADA: 'Aprovada',
    REPROVADA: 'Reprovada',
    AJUSTE: 'Ajuste pedido',
    PERDA_DE_PRAZO: 'Perdeu o prazo',
    HOMOLOGADA: 'Homologada',
    LISTA_DE_ESPERA: 'Lista de espera',
    NAO_CONVOCADA: 'Não convocada',
    DESCLASSIFICADA: 'Desclassificada',
    EM_ACOMPANHAMENTO: 'Em acompanhamento',
    DESISTENTE: 'Desistente',
    CONCLUIDA: 'Concluída',
}

/** A cor do selo de cada estado (as cinco cores do design system, mais o pendente). */
export const STATUS_DO_ESTADO: Record<EstadoCandidatura, Status> = {
    RASCUNHO: 'rascunho',
    ENVIADA: 'enviada',
    ELEGIVEL: 'enviada',
    NAO_ELEGIVEL: 'reprovada',
    DESCARTADA: 'rascunho',
    EM_ANALISE: 'avaliacao',
    APROVADA: 'aprovada',
    REPROVADA: 'reprovada',
    AJUSTE: 'pendente',
    PERDA_DE_PRAZO: 'reprovada',
    HOMOLOGADA: 'aprovada',
    LISTA_DE_ESPERA: 'pendente',
    NAO_CONVOCADA: 'reprovada',
    DESCLASSIFICADA: 'reprovada',
    EM_ACOMPANHAMENTO: 'aprovada',
    DESISTENTE: 'rascunho',
    CONCLUIDA: 'aprovada',
}

export function rotuloDoEstado(estado: string): string {
    return ROTULO_ESTADO[estado as EstadoCandidatura] ?? estado
}

export function statusDoEstado(estado: string): Status {
    return STATUS_DO_ESTADO[estado as EstadoCandidatura] ?? 'pendente'
}

// ---------- organizações

export const ROTULO_TIPO_ORGANIZACAO: Record<string, string> = {
    EMPRESA: 'Empresa',
    STARTUP: 'Startup',
    SQUAD: 'Squad',
    ORGAO_FOMENTO: 'Órgão de fomento',
    INVESTIDOR: 'Investidor',
    ACELERADORA: 'Aceleradora',
    EMPRESA_PARCEIRA: 'Empresa parceira',
    GESTAO: 'Gestão do Porto Digital',
    PESSOA_FISICA: 'Pessoa física',
}

/** Quem se candidata (o resto oferece oportunidades). */
export const TIPOS_CANDIDATOS = ['EMPRESA', 'STARTUP', 'SQUAD'] as const
export const TIPOS_PROVEDORES = ['ORGAO_FOMENTO', 'INVESTIDOR', 'ACELERADORA', 'EMPRESA_PARCEIRA'] as const
