import { minhaFila, type Avaliacao } from '../../api/avaliacoes'
import { minhasDesignacoes } from '../../api/avaliadores'
import { buscarCandidatura } from '../../api/candidaturas'
import { buscarOportunidade } from '../../api/oportunidades'
import { buscarOrganizacao } from '../../api/organizacoes'
import type { Status } from '../SeloStatus'

/**
 * A fila do avaliador com o que a tela mostra e a avaliação não traz: o nome
 * da organização candidata e o título da oportunidade. Usada na fila (75) e na
 * coluna da esquerda da rubrica (07).
 */
export interface ItemDaFila extends Avaliacao {
    organizacaoNome: string
    oportunidadeTitulo: string
}

export type SituacaoNaFila = 'avaliar' | 'rascunho' | 'assinada' | 'parada'

export const SITUACAO_NA_FILA: Record<SituacaoNaFila, { rotulo: string; status: Status }> = {
    avaliar: { rotulo: 'A avaliar', status: 'avaliacao' },
    rascunho: { rotulo: 'Em rascunho', status: 'pendente' },
    assinada: { rotulo: 'Assinada', status: 'aprovada' },
    parada: { rotulo: 'Fora de análise', status: 'rascunho' },
}

export function situacaoNaFila(a: Avaliacao): SituacaoNaFila {
    if (a.assinadaEm) return 'assinada'
    if (a.estadoCandidatura !== 'EM_ANALISE') return 'parada'
    return a.decisao || a.parecer ? 'rascunho' : 'avaliar'
}

/** O parecer que vale: o retificado, quando houver. */
export function parecerEmVigor(a: Avaliacao): string {
    return a.parecerRetificado ?? a.parecer ?? ''
}

export const ROTULO_DECISAO: Record<string, string> = {
    APROVADA: 'Aprovação',
    REPROVADA: 'Reprovação',
    AJUSTE: 'Pedido de ajuste',
}

export async function carregarFila(): Promise<ItemDaFila[]> {
    const [fila, designacoes] = await Promise.all([minhaFila(), minhasDesignacoes()])

    const titulos = new Map<number, string>()
    for (const d of designacoes) titulos.set(d.oportunidadeId, d.oportunidadeTitulo)
    const semTitulo = [...new Set(fila.map((a) => a.oportunidadeId))].filter((id) => !titulos.has(id))
    await Promise.all(
        semTitulo.map(async (id) => {
            const oportunidade = await buscarOportunidade(id)
            titulos.set(id, oportunidade.titulo)
        }),
    )

    const organizacaoDaCandidatura = new Map<number, number>()
    await Promise.all(
        [...new Set(fila.map((a) => a.candidaturaId))].map(async (id) => {
            const candidatura = await buscarCandidatura(id)
            organizacaoDaCandidatura.set(id, candidatura.organizacaoId)
        }),
    )
    const nomes = new Map<number, string>()
    await Promise.all(
        [...new Set(organizacaoDaCandidatura.values())].map(async (id) => {
            const organizacao = await buscarOrganizacao(id)
            nomes.set(id, organizacao.nome)
        }),
    )

    return fila.map((a) => ({
        ...a,
        organizacaoNome: nomes.get(organizacaoDaCandidatura.get(a.candidaturaId) ?? -1) ?? '—',
        oportunidadeTitulo: titulos.get(a.oportunidadeId) ?? '—',
    }))
}
