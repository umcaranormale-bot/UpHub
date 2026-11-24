import { createContext, useContext } from 'react'

import type { Organizacao } from '../api/organizacoes'
import type { Pessoa } from '../api/pessoas'
import type { Vinculo } from '../api/vinculos'
import type { Area } from '../navegacao/areas'

/** Um vínculo ativo com a organização dele e a área do sistema para onde leva. */
export interface Perfil {
    vinculo: Vinculo
    organizacao: Organizacao | null
    area: Area
}

export interface Sessao {
    /** Lendo a sessão do token guardado (primeira abertura da página). */
    carregando: boolean
    pessoa: Pessoa | null
    /** Só os vínculos ativos (sem encerradoEm), cada um com a área. */
    perfis: Perfil[]
    /** O perfil com que a pessoa está navegando (escolhido no login ou no "Trocar perfil"). */
    perfilAtivo: Perfil | null
    /** Entra e devolve a rota para onde mandar a pessoa. */
    entrar: (email: string, senha: string) => Promise<string>
    /** Troca o perfil ativo e devolve a rota inicial dele. */
    escolherPerfil: (vinculoId: number) => Promise<string>
    /** Lê de novo a sessão (depois de criar uma organização, aceitar um convite...). */
    recarregar: () => Promise<void>
    /** Apaga o token. Quem chama decide para onde navegar. */
    sair: () => void
}

export const ContextoDaSessao = createContext<Sessao | null>(null)

export function useSessao(): Sessao {
    const sessao = useContext(ContextoDaSessao)
    if (!sessao) throw new Error('useSessao precisa estar dentro do <ProvedorDeSessao>')
    return sessao
}
