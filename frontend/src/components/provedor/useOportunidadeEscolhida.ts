import { useSearchParams } from 'react-router-dom'

import { listarOportunidades, type Oportunidade } from '../../api/oportunidades'
import useDados from '../../hooks/useDados'
import { useSessao } from '../../sessao/contexto'

/**
 * As oportunidades da organização e a escolhida no endereço (?oportunidade=12).
 * Sem escolha, fica a mais nova que já saiu do rascunho (ou a mais nova de todas,
 * quando `comRascunhos`).
 */
export function useOportunidadeEscolhida(comRascunhos = false) {
    const { perfilAtivo } = useSessao()
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId
    const [parametros, setParametros] = useSearchParams()
    const lista = useDados(
        async () => {
            const todas = await listarOportunidades(organizacaoId!)
            return [...todas]
                .filter((o) => comRascunhos || o.estado !== 'RASCUNHO')
                .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))
        },
        [organizacaoId, comRascunhos],
        !!organizacaoId,
    )
    const pedida = Number(parametros.get('oportunidade'))
    const oportunidades: Oportunidade[] = lista.dados ?? []
    const escolhida = oportunidades.find((o) => o.id === pedida) ?? oportunidades[0] ?? null

    function escolher(id: number) {
        const novos = new URLSearchParams(parametros)
        novos.set('oportunidade', String(id))
        setParametros(novos, { replace: true })
    }

    return { ...lista, organizacaoId, oportunidades, escolhida, escolher }
}

export default useOportunidadeEscolhida
