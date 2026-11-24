import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'

import { mensagemDeErro } from '../api/erros'

export interface Dados<T> {
    dados: T | null
    carregando: boolean
    erro: string | null
    /** Busca de novo (depois de salvar, aprovar...). Não apaga os dados atuais enquanto busca. */
    recarregar: () => Promise<void>
    /** Troca os dados na tela sem buscar (resposta de um PUT, por exemplo). */
    definir: (valor: T) => void
}

/**
 * Carrega dados da API para uma tela. Exemplo:
 *
 *   const { dados, carregando, erro, recarregar } = useDados(() => minhaFila(), [])
 *
 * As dependências funcionam como as do useEffect: mudou o id da rota, busca de novo.
 * Com `ativo = false` não busca (ex.: falta o id da organização ainda).
 */
export function useDados<T>(buscar: () => Promise<T>, deps: DependencyList, ativo = true): Dados<T> {
    const [dados, setDados] = useState<T | null>(null)
    const [carregando, setCarregando] = useState(ativo)
    const [erro, setErro] = useState<string | null>(null)
    const buscarAtual = useRef(buscar)
    useEffect(() => {
        buscarAtual.current = buscar
    })
    const pedido = useRef(0)

    const recarregar = useCallback(async () => {
        const meu = ++pedido.current
        setCarregando(true)
        setErro(null)
        try {
            const valor = await buscarAtual.current()
            if (meu === pedido.current) setDados(valor)
        } catch (e) {
            if (meu === pedido.current) setErro(mensagemDeErro(e))
        } finally {
            if (meu === pedido.current) setCarregando(false)
        }
    }, [])

    // buscar ao abrir e quando as dependências mudam: o "carregando" precisa ligar
    // na hora, por isso o setState dentro do efeito é intencional aqui
    useEffect(() => {
        if (!ativo) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCarregando(false)
            return
        }
        void recarregar()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ativo, recarregar, ...deps])

    return { dados, carregando, erro, recarregar, definir: setDados }
}

export default useDados
