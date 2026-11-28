import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useSessao, type Perfil } from '../../sessao/contexto'

type Busca = (perfil: Perfil) => boolean

/**
 * Depois de criar uma organização ou aceitar um convite: lê a sessão de novo,
 * escolhe o perfil novo e vai para o início dele.
 *
 * O escolherPerfil() procura o vínculo nos perfis que a sessão já tem, e o
 * escolherPerfil de antes do recarregar() ainda tem a lista velha. Por isso a
 * escolha acontece no efeito, que já roda com a sessão recarregada.
 *
 * `semPerfil` roda quando o perfil novo não aparece na sessão.
 */
export function useEntrarNoPerfilNovo(semPerfil: () => void) {
    const { perfis, recarregar, escolherPerfil } = useSessao()
    const navigate = useNavigate()
    const [busca, setBusca] = useState<{ achar: Busca } | null>(null)
    const feito = useRef(false)
    const aoFalhar = useRef(semPerfil)

    useEffect(() => {
        aoFalhar.current = semPerfil
    })

    useEffect(() => {
        if (!busca || feito.current) return
        feito.current = true
        const perfil = perfis.find(busca.achar)
        if (!perfil) {
            aoFalhar.current()
            return
        }
        void escolherPerfil(perfil.vinculo.id).then((rota) => navigate(rota, { replace: true }))
    }, [busca, perfis, escolherPerfil, navigate])

    return useCallback(
        async (achar: Busca) => {
            await recarregar()
            feito.current = false
            setBusca({ achar })
        },
        [recarregar],
    )
}
