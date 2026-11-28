import { buscarCandidatura, type Candidatura } from '../../api/candidaturas'
import { minhasAlocacoes, type Alocacao } from '../../api/mentoria'
import { buscarOportunidade, type Oportunidade } from '../../api/oportunidades'
import { buscarOrganizacao, type Organizacao } from '../../api/organizacoes'
import { ErroApi } from '../../api/cliente'
import { horasDoMes, listarSessoes, type HorasMentoria } from '../../api/sessoes'
import { listarSprints } from '../../api/sprints'
import { hoje } from '../../estilos/formatos'

/**
 * Apoio das telas do mentor: cada alocação (convite ou acompanhamento) com a
 * candidatura, o desafio, quem oferece e quem se candidatou.
 */

export interface AlocacaoDetalhada {
    alocacao: Alocacao
    candidatura: Candidatura | null
    desafio: Oportunidade | null
    /** A organização candidata (squad, startup, empresa). */
    candidata: Organizacao | null
    /** Quem oferece o desafio. */
    provedor: Organizacao | null
}

/** O mês atual como AAAA-MM (o formato do horasDoMes). */
export function mesAtual(): string {
    return hoje().slice(0, 7)
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

/** 2026-11 → novembro */
export function nomeDoMes(mes: string): string {
    return MESES[Number(mes.slice(5, 7)) - 1] ?? mes
}

/** 750 → 12 h 30 min */
export function formatarMinutos(minutos: number): string {
    const h = Math.floor(minutos / 60)
    const m = minutos % 60
    if (h === 0) return `${m} min`
    return m === 0 ? `${h} h` : `${h} h ${m} min`
}

/** 8 ou 7.5 → "8 h" / "7,5 h" */
export function formatarHoras(horas: number | null | undefined): string {
    if (horas === null || horas === undefined) return '—'
    return `${String(horas).replace('.', ',')} h`
}

/** Só as alocações do vínculo de mentor que está ativo (uma pessoa pode mentorar por mais de uma organização). */
export async function alocacoesDetalhadas(vinculoId?: number): Promise<AlocacaoDetalhada[]> {
    const todas = await minhasAlocacoes()
    const alocacoes = vinculoId ? todas.filter((a) => a.vinculoId === vinculoId) : todas
    const organizacoes = new Map<number, Promise<Organizacao | null>>()
    const organizacao = (id: number) => {
        if (!organizacoes.has(id)) organizacoes.set(id, buscarOrganizacao(id).catch(() => null))
        return organizacoes.get(id)!
    }
    const desafios = new Map<number, Promise<Oportunidade | null>>()
    const desafioDe = (id: number) => {
        if (!desafios.has(id)) desafios.set(id, buscarOportunidade(id).catch(() => null))
        return desafios.get(id)!
    }
    const lista = await Promise.all(
        alocacoes.map(async (alocacao) => {
            // convite recusado ou expirado não dá mais acesso à candidatura (404)
            const candidatura = await buscarCandidatura(alocacao.candidaturaId).catch(() => null)
            const desafio = candidatura ? await desafioDe(candidatura.oportunidadeId) : null
            const [candidata, provedor] = await Promise.all([
                candidatura ? organizacao(candidatura.organizacaoId) : Promise.resolve(null),
                desafio ? organizacao(desafio.organizacaoId) : Promise.resolve(null),
            ])
            return { alocacao, candidatura, desafio, candidata, provedor }
        }),
    )
    return lista.sort((a, b) => b.alocacao.convidadaEm.localeCompare(a.alocacao.convidadaEm))
}

/** Horas do mês de cada alocação aceita, e o total. */
export async function horasDasAceitas(alocacoes: Alocacao[], mes = mesAtual()) {
    const aceitas = alocacoes.filter((a) => a.situacao === 'ACEITA')
    const horas = await Promise.all(aceitas.map((a) => horasDoMes(a.id, mes).catch(() => null)))
    const porAlocacao = new Map<number, HorasMentoria>()
    horas.forEach((h) => h && porAlocacao.set(h.alocacaoId, h))
    const minutos = horas.reduce((soma, h) => soma + (h?.minutosRealizados ?? 0), 0)
    const sessoes = horas.reduce((soma, h) => soma + (h?.sessoesAssinadas ?? 0), 0)
    return { mes, porAlocacao, minutos, sessoes }
}

/** Nome para mostrar de quem é acompanhado. */
export function nomeDoAcompanhado(item: AlocacaoDetalhada): string {
    return item.candidata?.nome ?? item.alocacao.tituloProposta ?? `Candidatura #${item.alocacao.candidaturaId}`
}

/** Um acompanhamento (alocação do mentor logado) com as sprints, as sessões e as horas do mês. */
export async function carregarAcompanhado(alocacaoId: number, vinculoId?: number) {
    const item = (await alocacoesDetalhadas(vinculoId)).find((i) => i.alocacao.id === alocacaoId)
    if (!item) throw new ErroApi(404, 'Acompanhamento não encontrado')
    const candidaturaId = item.alocacao.candidaturaId
    const [sprints, sessoes, horas] = await Promise.all([
        listarSprints(candidaturaId),
        listarSessoes(candidaturaId),
        horasDoMes(alocacaoId).catch(() => null),
    ])
    return {
        item,
        sprints,
        // as sessões de outros mentores da mesma candidatura ficam fora
        sessoes: sessoes.filter((s) => s.alocacaoId === alocacaoId).sort((a, b) => b.dataSessao.localeCompare(a.dataSessao)),
        horas,
    }
}
