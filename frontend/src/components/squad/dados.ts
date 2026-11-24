import { listarCandidaturasDaOrganizacao, type Candidatura, type EstadoCandidatura } from '../../api/candidaturas'
import { ErroApi } from '../../api/cliente'
import { buscarOportunidade, type Oportunidade } from '../../api/oportunidades'
import { buscarOrganizacao, type Organizacao } from '../../api/organizacoes'
import { buscarSquad, type Squad } from '../../api/squads'
import { listarVersoes, type Versao } from '../../api/versoes'
import { useSessao } from '../../sessao/contexto'

/**
 * Apoio das telas da squad: a organização do perfil ativo e as buscas que
 * várias telas repetem (candidaturas com o desafio, versão publicada).
 */

/** A squad do perfil ativo. O id da squad é o mesmo da organização. */
export function useSquadAtiva() {
    const { pessoa, perfilAtivo } = useSessao()
    return {
        squadId: perfilAtivo?.vinculo.organizacaoId,
        nome: perfilAtivo?.vinculo.organizacaoNome ?? '',
        representante: perfilAtivo?.vinculo.representante ?? false,
        pessoaId: pessoa?.id,
        primeiroNome: pessoa?.nome.trim().split(/\s+/)[0] ?? '',
    }
}

export interface CandidaturaComDesafio {
    candidatura: Candidatura
    /** null quando o desafio não pôde ser lido. */
    desafio: Oportunidade | null
}

/** As candidaturas da organização, cada uma com o desafio (oportunidade) dela. */
export async function candidaturasComDesafio(organizacaoId: number): Promise<CandidaturaComDesafio[]> {
    const candidaturas = await listarCandidaturasDaOrganizacao(organizacaoId)
    const ids = [...new Set(candidaturas.map((c) => c.oportunidadeId))]
    const desafios = new Map<number, Oportunidade | null>()
    await Promise.all(
        ids.map(async (id) => {
            desafios.set(id, await buscarOportunidade(id).catch(() => null))
        }),
    )
    return candidaturas
        .map((candidatura) => ({ candidatura, desafio: desafios.get(candidatura.oportunidadeId) ?? null }))
        .sort((a, b) => maisRecente(b.candidatura).localeCompare(maisRecente(a.candidatura)))
}

function maisRecente(c: Candidatura): string {
    return c.enviadaEm ?? c.salvaEm ?? c.criadaEm
}

/** A versão publicada da oportunidade (é ela que vale para quem se candidata). */
export async function versaoPublicada(oportunidadeId: number): Promise<Versao | null> {
    const versoes = await listarVersoes(oportunidadeId)
    const publicadas = versoes.filter((v) => v.publicada).sort((a, b) => b.numero - a.numero)
    return publicadas[0] ?? null
}

/** A squad cadastrada, ou null quando a organização ainda não foi cadastrada como squad (404). */
export async function squadOuNada(id: number): Promise<Squad | null> {
    try {
        return await buscarSquad(id)
    } catch (e) {
        if (e instanceof ErroApi && e.status === 404) return null
        throw e
    }
}

/** Os nomes das organizações (provedores dos desafios), sem repetir a busca. */
export async function organizacoesPorId(ids: number[]): Promise<Map<number, Organizacao>> {
    const mapa = new Map<number, Organizacao>()
    await Promise.all(
        [...new Set(ids)].map(async (id) => {
            const org = await buscarOrganizacao(id).catch(() => null)
            if (org) mapa.set(id, org)
        }),
    )
    return mapa
}

/** Estados em que a candidatura já teve um desfecho. */
export const ESTADOS_DECIDIDOS: EstadoCandidatura[] = [
    'NAO_ELEGIVEL',
    'PERDA_DE_PRAZO',
    'REPROVADA',
    'DESISTENTE',
    'NAO_CONVOCADA',
    'DESCLASSIFICADA',
    'DESCARTADA',
    'CONCLUIDA',
]

/** Estados em que a squad acompanha as sprints. */
export const ESTADOS_COM_SPRINTS: EstadoCandidatura[] = ['EM_ACOMPANHAMENTO', 'CONCLUIDA']

/** A rota certa para abrir uma candidatura da squad. */
export function rotaDaCandidatura(c: Candidatura): string {
    return ESTADOS_COM_SPRINTS.includes(c.estado)
        ? `/squad/candidaturas/${c.id}/sprints`
        : `/squad/candidaturas/${c.id}/editar`
}

/** Linha curta com as datas da candidatura. */
export function linhaDoTempo(c: Candidatura, formatar: (v: string | null) => string): string {
    const partes = [`criada em ${formatar(c.criadaEm)}`]
    if (c.salvaEm && c.estado === 'RASCUNHO') partes.push(`salva em ${formatar(c.salvaEm)}`)
    if (c.enviadaEm) partes.push(`enviada em ${formatar(c.enviadaEm)}`)
    return partes.join(' · ')
}
