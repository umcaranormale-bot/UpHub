import { listarAvaliacoesDaCandidatura, type Avaliacao } from '../../api/avaliacoes'
import { listarAvaliadores, type Avaliador } from '../../api/avaliadores'
import { listarCandidaturasDaOportunidade, type Candidatura } from '../../api/candidaturas'
import type { Criterio } from '../../api/criterios'
import { listarOportunidades, type Oportunidade } from '../../api/oportunidades'
import { buscarOrganizacao } from '../../api/organizacoes'
import { listarPedidos, type Solicitacao } from '../../api/solicitacoesProvedor'
import { listarVersoes, type Versao } from '../../api/versoes'

/**
 * Buscas que mais de uma tela do provedor faz: o painel das oportunidades,
 * o nome das organizações candidatas e a nota final de cada candidatura.
 */

/** Oportunidade com a versão publicada (ou o rascunho mais novo), as candidaturas e os avaliadores. */
export interface OportunidadeDoPainel {
    oportunidade: Oportunidade
    versao: Versao | null
    candidaturas: Candidatura[]
    avaliadores: Avaliador[]
}

/** A versão publicada, ou a de número maior quando nenhuma foi publicada. */
export function versaoEmVigor(versoes: Versao[]): Versao | null {
    const publicada = versoes.find((v) => v.publicada)
    if (publicada) return publicada
    return [...versoes].sort((a, b) => b.numero - a.numero)[0] ?? null
}

export async function carregarPainel(organizacaoId: number): Promise<OportunidadeDoPainel[]> {
    const oportunidades = await listarOportunidades(organizacaoId)
    const ordenadas = [...oportunidades].sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))
    return Promise.all(
        ordenadas.map(async (oportunidade) => {
            const rascunho = oportunidade.estado === 'RASCUNHO'
            const [versoes, candidaturas, avaliadores] = await Promise.all([
                listarVersoes(oportunidade.id).catch(() => [] as Versao[]),
                rascunho
                    ? Promise.resolve([] as Candidatura[])
                    : listarCandidaturasDaOportunidade(oportunidade.id).catch(() => [] as Candidatura[]),
                listarAvaliadores(oportunidade.id).catch(() => [] as Avaliador[]),
            ])
            return { oportunidade, versao: versaoEmVigor(versoes), candidaturas, avaliadores }
        }),
    )
}

/** O pedido de permissão mais recente da organização (ou null, se nunca pediu). */
export async function ultimoPedido(organizacaoId: number): Promise<Solicitacao | null> {
    const pedidos = await listarPedidos(organizacaoId)
    return [...pedidos].sort((a, b) => b.pedidaEm.localeCompare(a.pedidaEm))[0] ?? null
}

// ---------- nomes das organizações candidatas

const nomes = new Map<number, Promise<string>>()

export function nomeDaOrganizacao(id: number): Promise<string> {
    let nome = nomes.get(id)
    if (!nome) {
        nome = buscarOrganizacao(id)
            .then((o) => o.nome)
            .catch(() => {
                nomes.delete(id)
                return `Organização ${id}`
            })
        nomes.set(id, nome)
    }
    return nome
}

export async function nomesDasOrganizacoes(ids: number[]): Promise<Map<number, string>> {
    const unicos = [...new Set(ids)]
    const lista = await Promise.all(unicos.map(async (id) => [id, await nomeDaOrganizacao(id)] as const))
    return new Map(lista)
}

/** A soma dos pesos dos critérios (critério sem peso conta zero). */
export function somaDosPesos(criterios: Criterio[]): number {
    return Math.round(criterios.reduce((s, c) => s + (c.peso ?? 0), 0) * 100) / 100
}

// ---------- avaliações

/** As avaliações da rodada mais recente. */
export function rodadaAtual(avaliacoes: Avaliacao[]): Avaliacao[] {
    const maior = Math.max(0, ...avaliacoes.map((a) => a.rodada))
    return avaliacoes.filter((a) => a.rodada === maior)
}

/** Média das notas finais assinadas da rodada mais recente (null sem nenhuma assinada). */
export function notaFinal(avaliacoes: Avaliacao[]): number | null {
    const notas = rodadaAtual(avaliacoes)
        .map((a) => a.notaFinal)
        .filter((n): n is number => n !== null)
    if (notas.length === 0) return null
    return notas.reduce((s, n) => s + n, 0) / notas.length
}

export function formatarNota(nota: number | null): string {
    if (nota === null) return '—'
    return nota.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** As avaliações de várias candidaturas de uma vez, por id da candidatura. */
export async function avaliacoesDe(candidaturas: Candidatura[]): Promise<Map<number, Avaliacao[]>> {
    const lista = await Promise.all(
        candidaturas.map(async (c) => {
            const avaliacoes = await listarAvaliacoesDaCandidatura(c.id).catch(() => [] as Avaliacao[])
            return [c.id, avaliacoes] as const
        }),
    )
    return new Map(lista)
}
