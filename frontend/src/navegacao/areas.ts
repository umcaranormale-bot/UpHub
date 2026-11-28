import type { Organizacao } from '../api/organizacoes'
import type { Vinculo } from '../api/vinculos'

/**
 * Área do sistema: cada vínculo (papel numa organização) leva para uma área,
 * e cada área tem o seu prefixo de rota e o seu menu.
 *
 * O CANDIDATO se divide em dois: quem é de uma squad vai para /squad, e quem é
 * de empresa ou startup vai para /candidato. O vínculo não traz o tipo da
 * organização, então ele vem da organização (buscarOrganizacao).
 */
export type Area = 'candidato' | 'squad' | 'provedor' | 'avaliador' | 'mentor' | 'gestao'

export const INICIO_DA_AREA: Record<Area, string> = {
    candidato: '/candidato',
    squad: '/squad',
    provedor: '/provedor',
    avaliador: '/avaliador',
    mentor: '/mentor',
    gestao: '/gestao',
}

export const CONTA_DA_AREA: Record<Area, string> = {
    candidato: '/candidato/conta',
    squad: '/squad/conta',
    provedor: '/provedor/conta',
    avaliador: '/avaliador/conta',
    mentor: '/mentor/conta',
    gestao: '/gestao/conta',
}

/** Rótulo do papel no cabeçalho (o selo ao lado da organização). */
export const ROTULO_DA_AREA: Record<Area, string> = {
    candidato: 'Candidato',
    squad: 'Candidato · squad',
    provedor: 'Provedor',
    avaliador: 'Avaliador',
    mentor: 'Mentor',
    gestao: 'Gestão',
}

export function areaDoVinculo(vinculo: Vinculo, organizacao?: Organizacao): Area {
    switch (vinculo.papel) {
        case 'GESTAO':
            return 'gestao'
        case 'PROVEDOR':
            return 'provedor'
        case 'AVALIADOR':
            return 'avaliador'
        case 'MENTOR':
            return 'mentor'
        case 'CANDIDATO':
            return organizacao?.tipo === 'SQUAD' ? 'squad' : 'candidato'
    }
}

/** A área de uma rota, pelo primeiro pedaço do caminho (/provedor/candidaturas → provedor). */
export function areaDaRota(caminho: string): Area | null {
    const primeiro = caminho.split('/')[1] as Area
    return primeiro in INICIO_DA_AREA ? primeiro : null
}

export function iniciais(nome: string): string {
    const partes = nome.trim().split(/\s+/).filter(Boolean)
    if (partes.length === 0) return '?'
    const primeira = partes[0][0]
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
    return (primeira + ultima).toUpperCase()
}
