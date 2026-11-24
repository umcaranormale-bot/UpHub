import { listarAjustes, type PedidoAjuste } from '../../api/ajustes'
import { listarAnexos, type Anexo } from '../../api/anexos'
import { buscarAvaliacao, listarAvaliacoesDaCandidatura, type Avaliacao } from '../../api/avaliacoes'
import { buscarCandidatura, type Candidatura } from '../../api/candidaturas'
import { listarNotas, type NotaCriterio } from '../../api/notasPorCriterio'
import { buscarOportunidade, type Oportunidade } from '../../api/oportunidades'
import { buscarOrganizacao, type Organizacao } from '../../api/organizacoes'
import { listarRetificacoes, type RetificacaoFeita } from '../../api/retificacoes'

/** Tudo o que a rubrica e parecer (07, 34, 36 e 48) mostra de uma avaliação. */
export interface Ficha {
    avaliacao: Avaliacao
    notas: NotaCriterio[]
    candidatura: Candidatura
    organizacao: Organizacao
    oportunidade: Oportunidade
    anexos: Anexo[]
    ajustes: PedidoAjuste[]
    /** As avaliações desta pessoa na mesma candidatura (as rodadas anteriores). */
    minhasRodadas: Avaliacao[]
    retificacoes: RetificacaoFeita[]
}

export async function carregarFicha(id: number): Promise<Ficha> {
    const avaliacao = await buscarAvaliacao(id)
    const [notas, candidatura, oportunidade, anexos, ajustes, minhasRodadas, retificacoes] = await Promise.all([
        listarNotas(id),
        buscarCandidatura(avaliacao.candidaturaId),
        buscarOportunidade(avaliacao.oportunidadeId),
        listarAnexos(avaliacao.candidaturaId),
        listarAjustes(avaliacao.candidaturaId),
        listarAvaliacoesDaCandidatura(avaliacao.candidaturaId),
        avaliacao.assinadaEm ? listarRetificacoes(id) : Promise.resolve([]),
    ])
    const organizacao = await buscarOrganizacao(candidatura.organizacaoId)
    return {
        avaliacao,
        notas: [...notas].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
        candidatura,
        organizacao,
        oportunidade,
        anexos,
        ajustes,
        minhasRodadas,
        retificacoes,
    }
}

/**
 * Nota final de 0 a 100, a mesma conta do back-end: cada nota vai para 0 a 100
 * dentro da escala do critério, e a média é ponderada pelos pesos. Enquanto
 * faltar nota, não há nota final.
 */
export function notaFinalPrevista(notas: NotaCriterio[], valores: Record<number, string>): number | null {
    if (notas.length === 0) return null
    let soma = 0
    let pesos = 0
    for (const c of notas) {
        const texto = valores[c.criterioId]
        if (texto === undefined || texto.trim() === '') return null
        const nota = Number(texto.replace(',', '.'))
        if (Number.isNaN(nota) || nota < c.escalaMin || nota > c.escalaMax) return null
        const normalizada = ((nota - c.escalaMin) / (c.escalaMax - c.escalaMin)) * 100
        soma += normalizada * c.peso
        pesos += c.peso
    }
    return pesos === 0 ? null : soma / pesos
}

export function formatarNota(valor: number | null): string {
    if (valor === null) return '—'
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatarNumero(valor: number): string {
    return valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}
