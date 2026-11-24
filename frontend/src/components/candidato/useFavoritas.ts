import { useState } from 'react'

import { mensagemDeErro } from '../../api/erros'
import { desfavoritar, favoritar, listarFavoritas, type Favorita } from '../../api/favoritas'
import useDados from '../../hooks/useDados'
import { ehConflito } from './apoio'

/**
 * As favoritas da organização e o favoritar/desfavoritar.
 *
 * O assunto ainda está pendente no back-end (V38): se a lista não carregar,
 * `ids` fica null e as telas escondem o botão de favoritar.
 */
export function useFavoritas(organizacaoId: number | undefined) {
    const { dados, carregando, erro, recarregar } = useDados(
        () => listarFavoritas(organizacaoId as number),
        [organizacaoId],
        !!organizacaoId,
    )
    const [erroDaAcao, setErroDaAcao] = useState<string | null>(null)

    const ids = dados && !erro ? new Set(dados.map((f) => f.oportunidadeId)) : null

    async function alternar(oportunidadeId: number) {
        if (!organizacaoId || !ids) return
        setErroDaAcao(null)
        try {
            if (ids.has(oportunidadeId)) await desfavoritar(organizacaoId, oportunidadeId)
            else await favoritar(organizacaoId, oportunidadeId)
        } catch (e) {
            // 409 = já estava favoritada: só atualiza a lista
            if (!ehConflito(e)) setErroDaAcao(mensagemDeErro(e))
        }
        await recarregar()
    }

    return {
        lista: (dados ?? []) as Favorita[],
        ids,
        carregando,
        erro,
        erroDaAcao,
        alternar,
        recarregar,
    }
}

export default useFavoritas
