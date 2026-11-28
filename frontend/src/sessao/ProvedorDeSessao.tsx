import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { buscarSessao, entrar as entrarNaApi, sair as sairDaApi } from '../api/auth'
import { EVENTO_SESSAO_EXPIRADA, lerToken } from '../api/cliente'
import { buscarOrganizacao } from '../api/organizacoes'
import type { Pessoa } from '../api/pessoas'
import { listarPedidos } from '../api/solicitacoesProvedor'
import type { Vinculo } from '../api/vinculos'
import { areaDoVinculo, INICIO_DA_AREA } from '../navegacao/areas'
import { ContextoDaSessao, type Perfil, type Sessao } from './contexto'

const CHAVE_PERFIL = 'uphub.vinculo'

// quem tem mais de um vínculo vê a lista nesta ordem
const ORDEM: Vinculo['papel'][] = ['GESTAO', 'PROVEDOR', 'AVALIADOR', 'MENTOR', 'CANDIDATO']

async function montarPerfis(vinculos: Vinculo[]): Promise<Perfil[]> {
    const ativos = vinculos
        .filter((v) => v.encerradoEm === null)
        .sort((a, b) => ORDEM.indexOf(a.papel) - ORDEM.indexOf(b.papel))
    return Promise.all(
        ativos.map(async (vinculo) => {
            // a organização diz se o candidato é de squad; se falhar, segue como candidato comum
            const organizacao = await buscarOrganizacao(vinculo.organizacaoId).catch(() => null)
            return { vinculo, organizacao, area: areaDoVinculo(vinculo, organizacao ?? undefined) }
        }),
    )
}

function lerPerfilGuardado(): number | null {
    try {
        const valor = localStorage.getItem(CHAVE_PERFIL)
        return valor ? Number(valor) : null
    } catch {
        return null
    }
}

function guardarPerfil(vinculoId: number | null) {
    try {
        if (vinculoId === null) localStorage.removeItem(CHAVE_PERFIL)
        else localStorage.setItem(CHAVE_PERFIL, String(vinculoId))
    } catch {
        // sem localStorage (janela privada): o perfil vale só nesta aba
    }
}

/** A primeira tela do perfil. O provedor sem permissão de publicar vai para o pedido. */
async function rotaInicialDoPerfil(perfil: Perfil): Promise<string> {
    if (perfil.area === 'provedor') {
        const pedidos = await listarPedidos(perfil.vinculo.organizacaoId).catch(() => [])
        const ultimo = [...pedidos].sort((a, b) => b.pedidaEm.localeCompare(a.pedidaEm))[0]
        if (!ultimo || ultimo.situacao !== 'APROVADA') return '/provedor/pedido'
    }
    return INICIO_DA_AREA[perfil.area]
}

export function ProvedorDeSessao({ children }: { children: ReactNode }) {
    const [carregando, setCarregando] = useState(() => lerToken() !== null)
    const [pessoa, setPessoa] = useState<Pessoa | null>(null)
    const [perfis, setPerfis] = useState<Perfil[]>([])
    const [vinculoAtivoId, setVinculoAtivoId] = useState<number | null>(lerPerfilGuardado)
    // a lista mais recente, para o escolherPerfil logo depois de um recarregar() (o estado ainda não renderizou)
    const perfisAtuais = useRef<Perfil[]>([])

    const aplicar = useCallback(async (novaPessoa: Pessoa, vinculos: Vinculo[]) => {
        const novosPerfis = await montarPerfis(vinculos)
        perfisAtuais.current = novosPerfis
        setPessoa(novaPessoa)
        setPerfis(novosPerfis)
        return novosPerfis
    }, [])

    const limpar = useCallback(() => {
        perfisAtuais.current = []
        setPessoa(null)
        setPerfis([])
        setVinculoAtivoId(null)
        guardarPerfil(null)
    }, [])

    const recarregar = useCallback(async () => {
        if (!lerToken()) {
            limpar()
            setCarregando(false)
            return
        }
        try {
            const sessao = await buscarSessao()
            await aplicar(sessao.pessoa, sessao.vinculos)
        } catch {
            limpar()
        } finally {
            setCarregando(false)
        }
    }, [aplicar, limpar])

    // primeira abertura: com token guardado, lê a sessão (sem token, já começa deslogado)
    useEffect(() => {
        if (!lerToken()) return
        let ativo = true
        buscarSessao()
            .then((sessao) => (ativo ? aplicar(sessao.pessoa, sessao.vinculos) : undefined))
            .catch(() => (ativo ? limpar() : undefined))
            .finally(() => {
                if (ativo) setCarregando(false)
            })
        return () => {
            ativo = false
        }
    }, [aplicar, limpar])

    // a API respondeu 401: o token já foi apagado pelo cliente.ts
    useEffect(() => {
        const aoExpirar = () => limpar()
        window.addEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar)
        return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar)
    }, [limpar])

    const entrar = useCallback(
        async (email: string, senha: string) => {
            const resposta = await entrarNaApi(email, senha)
            const novosPerfis = await aplicar(resposta.pessoa, resposta.vinculos)
            if (novosPerfis.length === 0) {
                setVinculoAtivoId(null)
                guardarPerfil(null)
                return '/conta/nova-organizacao'
            }
            if (novosPerfis.length > 1) {
                return '/entrar/vinculo'
            }
            const unico = novosPerfis[0]
            setVinculoAtivoId(unico.vinculo.id)
            guardarPerfil(unico.vinculo.id)
            return rotaInicialDoPerfil(unico)
        },
        [aplicar],
    )

    const escolherPerfil = useCallback(
        async (vinculoId: number) => {
            const perfil = perfisAtuais.current.find((p) => p.vinculo.id === vinculoId)
            if (!perfil) return '/entrar'
            setVinculoAtivoId(vinculoId)
            guardarPerfil(vinculoId)
            return rotaInicialDoPerfil(perfil)
        },
        [],
    )

    const sair = useCallback(() => {
        sairDaApi()
        limpar()
    }, [limpar])

    const perfilAtivo = useMemo(
        () => perfis.find((p) => p.vinculo.id === vinculoAtivoId) ?? perfis[0] ?? null,
        [perfis, vinculoAtivoId],
    )

    const valor = useMemo<Sessao>(
        () => ({ carregando, pessoa, perfis, perfilAtivo, entrar, escolherPerfil, recarregar, sair }),
        [carregando, pessoa, perfis, perfilAtivo, entrar, escolherPerfil, recarregar, sair],
    )

    return <ContextoDaSessao.Provider value={valor}>{children}</ContextoDaSessao.Provider>
}

export default ProvedorDeSessao
