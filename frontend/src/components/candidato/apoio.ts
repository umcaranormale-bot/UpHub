import { listarCandidaturasDaOrganizacao, type Candidatura, type EstadoCandidatura } from '../../api/candidaturas'
import { ErroApi } from '../../api/cliente'
import { buscarOportunidade, type Oportunidade } from '../../api/oportunidades'
import { buscarOrganizacao } from '../../api/organizacoes'
import type { CampoRequisito, Operador, SituacaoRequisito, ValorRequisito } from '../../api/requisitos'
import type { TrilhaCodigo } from '../../api/trilhas'
import { listarVersoes, type Versao } from '../../api/versoes'
import { diasAte } from '../../estilos/formatos'
import type { Status } from '../SeloStatus'

/**
 * Apoio das telas do candidato de empresa ou startup: regras de quem se
 * candidata em cada trilha, rótulos dos requisitos e as buscas que mais de
 * uma tela repete (a candidatura com a oportunidade dela, a versão publicada).
 */

// ---------- quem se candidata (TiposPorTrilha.java do back-end)

export const TIPOS_DA_TRILHA: Record<TrilhaCodigo, string[]> = {
    FOMENTO: ['EMPRESA', 'STARTUP'],
    INVESTIMENTO: ['STARTUP'],
    FORMACAO: ['SQUAD'],
}

export const QUEM_SE_CANDIDATA: Record<TrilhaCodigo, string> = {
    FOMENTO: 'empresas e startups',
    INVESTIMENTO: 'startups',
    FORMACAO: 'squads',
}

export function podeCandidatar(trilha: TrilhaCodigo, tipo: string | undefined): boolean {
    return !!tipo && TIPOS_DA_TRILHA[trilha].includes(tipo)
}

/** As trilhas em que o tipo da organização se candidata. */
export function trilhasDoTipo(tipo: string | undefined): TrilhaCodigo[] {
    return (Object.keys(TIPOS_DA_TRILHA) as TrilhaCodigo[]).filter((t) => podeCandidatar(t, tipo))
}

/** Quantas entram na aba Recomendadas (o mesmo limite da tela 63). */
export const LIMITE_RECOMENDADAS = 10

// ---------- requisitos

export const ROTULO_CAMPO: Record<CampoRequisito, string> = {
    TIPO: 'Tipo da organização',
    PORTE: 'Porte',
    SETOR: 'Setor',
    ESTAGIO: 'Estágio',
    SEDE_UF: 'UF da sede',
    SEDE_CIDADE: 'Cidade da sede',
    TEMPO_DE_MERCADO_ANOS: 'Tempo de mercado (anos)',
}

export const ROTULO_OPERADOR: Record<Operador, string> = {
    IGUAL: 'igual a',
    DIFERENTE: 'diferente de',
    EM: 'um destes:',
    FORA_DE: 'nenhum destes:',
    MAIOR_OU_IGUAL: 'pelo menos',
    MENOR_OU_IGUAL: 'no máximo',
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

export const SITUACAO_DO_REQUISITO: Record<SituacaoRequisito, { status: Status; rotulo: string }> = {
    ATENDIDO: { status: 'aprovada', rotulo: 'Atendido' },
    NAO_ATENDIDO: { status: 'reprovada', rotulo: 'Não atendido' },
    PENDENTE: { status: 'pendente', rotulo: 'Pendente' },
}

export const SITUACAO_DA_ELEGIBILIDADE: Record<'ELEGIVEL' | 'INELEGIVEL' | 'PENDENTE', { status: Status; rotulo: string }> = {
    ELEGIVEL: { status: 'aprovada', rotulo: 'Elegível' },
    INELEGIVEL: { status: 'reprovada', rotulo: 'Não elegível' },
    PENDENTE: { status: 'pendente', rotulo: 'Pendente' },
}

// ---------- estados da candidatura

/** Ainda não decidida: o candidato acompanha. */
export const EM_ANDAMENTO: EstadoCandidatura[] = [
    'RASCUNHO',
    'ENVIADA',
    'ELEGIVEL',
    'EM_ANALISE',
    'AJUSTE',
    'APROVADA',
    'LISTA_DE_ESPERA',
    'HOMOLOGADA',
    'EM_ACOMPANHAMENTO',
]

export function emAndamento(estado: EstadoCandidatura): boolean {
    return EM_ANDAMENTO.includes(estado)
}

/** Para onde levar a candidatura na lista: rascunho edita, ajuste corrige, o resto acompanha. */
export function rotaDaCandidatura(c: Candidatura): { para: string; acao: string } {
    if (c.estado === 'RASCUNHO') return { para: `/candidato/candidaturas/${c.id}/editar`, acao: 'Continuar' }
    if (c.estado === 'AJUSTE') return { para: `/candidato/candidaturas/${c.id}/ajuste`, acao: 'Corrigir e reenviar' }
    if (c.estado === 'NAO_ELEGIVEL') return { para: `/candidato/candidaturas/${c.id}`, acao: 'Ver extrato' }
    return { para: `/candidato/candidaturas/${c.id}`, acao: 'Acompanhar' }
}

// ---------- buscas repetidas

export interface CandidaturaComOportunidade {
    candidatura: Candidatura
    /** null quando a oportunidade não pôde ser lida. */
    oportunidade: Oportunidade | null
}

/** As candidaturas da organização, cada uma com a oportunidade (a candidatura não traz o título dela). */
export async function candidaturasComOportunidade(organizacaoId: number): Promise<CandidaturaComOportunidade[]> {
    const candidaturas = await listarCandidaturasDaOrganizacao(organizacaoId)
    const ids = [...new Set(candidaturas.map((c) => c.oportunidadeId))]
    const oportunidades = new Map<number, Oportunidade | null>()
    await Promise.all(
        ids.map(async (id) => {
            oportunidades.set(id, await buscarOportunidade(id).catch(() => null))
        }),
    )
    return candidaturas
        .map((candidatura) => ({ candidatura, oportunidade: oportunidades.get(candidatura.oportunidadeId) ?? null }))
        .sort((a, b) => (b.candidatura.salvaEm ?? b.candidatura.criadaEm).localeCompare(a.candidatura.salvaEm ?? a.candidatura.criadaEm))
}

/** O nome de cada organização (o perfil público vale para qualquer pessoa logada). */
export async function nomesDasOrganizacoes(ids: number[]): Promise<Map<number, string>> {
    const nomes = new Map<number, string>()
    await Promise.all(
        [...new Set(ids)].map(async (id) => {
            const org = await buscarOrganizacao(id).catch(() => null)
            if (org) nomes.set(id, org.nome)
        }),
    )
    return nomes
}

/** A versão publicada da oportunidade (quem é de fora só vê essa). */
export async function versaoPublicada(oportunidadeId: number): Promise<Versao | null> {
    const versoes = await listarVersoes(oportunidadeId)
    return versoes.find((v) => v.publicada) ?? null
}

/** Busca que pode não existir ainda no back-end: devolve o erro em vez de quebrar a tela. */
export async function talvez<T>(promessa: Promise<T>): Promise<{ ok: true; valor: T } | { ok: false; erro: string }> {
    try {
        return { ok: true, valor: await promessa }
    } catch (e) {
        return { ok: false, erro: e instanceof ErroApi ? e.message : 'Não foi possível falar com o servidor.' }
    }
}

export function ehConflito(e: unknown): boolean {
    return e instanceof ErroApi && e.status === 409
}

/** "AAAA-MM-DD..." → dias até a data, ou null. */
export function diasAteData(valor: string | null | undefined): number | null {
    if (!valor) return null
    return diasAte(valor.slice(0, 10))
}

export function textoDosDias(dias: number): string {
    if (dias < 0) return 'prazo encerrado'
    if (dias === 0) return 'encerra hoje'
    if (dias === 1) return 'encerra amanhã'
    return `encerra em ${dias} dias`
}

export function tamanhoDoArquivo(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}
