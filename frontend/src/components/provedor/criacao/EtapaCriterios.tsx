import { useState } from 'react'

import { criarCriterio, editarCriterio, removerCriterio, type Criterio, type CriterioCadastro } from '../../../api/criterios'
import { mensagemDeErro } from '../../../api/erros'
import { Campo } from '../../ui/Campo'
import { Aviso } from '../../ui/Estados'
import Botao from '../Botao'
import { Bloco } from '../Cabecalho'
import { somaDosPesos } from '../dados'

/**
 * Etapa 3 · critérios de avaliação: descrição, peso, escala e a evidência
 * esperada. Os pesos precisam somar 100 para publicar.
 */
export function EtapaCriterios({
    oportunidadeId,
    versaoId,
    criterios,
    aoMudar,
}: {
    oportunidadeId: number
    versaoId: number
    criterios: Criterio[]
    aoMudar: () => Promise<void>
}) {
    const [erro, setErro] = useState<string | null>(null)
    const soma = somaDosPesos(criterios)
    const ordenados = [...criterios].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))

    async function executar(acao: () => Promise<unknown>) {
        setErro(null)
        try {
            await acao()
            await aoMudar()
            return true
        } catch (e) {
            setErro(mensagemDeErro(e))
            return false
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <Bloco
                titulo="Critérios e pesos"
                apoio="Os avaliadores dão uma nota por critério; a nota final (0 a 100) é a média ponderada pelos pesos."
                acoes={
                    <span
                        className={`rounded-badge px-2.5 py-1 text-selo ${
                            soma === 100 ? 'bg-status-aprovada-fundo text-status-aprovada-texto' : 'bg-aviso-fundo text-ocre'
                        }`}
                    >
                        Soma dos pesos: {soma.toLocaleString('pt-BR')}%{soma === 100 ? ' ✓' : ''}
                    </span>
                }
            >
                {ordenados.length === 0 ? (
                    <p className="text-apoio text-secundario">Nenhum critério ainda. Acrescente o primeiro abaixo.</p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {ordenados.map((c) => (
                            <LinhaDoCriterio
                                key={c.id}
                                criterio={c}
                                aoSalvar={(dados) => executar(() => editarCriterio(oportunidadeId, versaoId, c.id, dados))}
                                aoRemover={() => executar(() => removerCriterio(oportunidadeId, versaoId, c.id))}
                            />
                        ))}
                    </ul>
                )}
                {soma !== 100 && ordenados.length > 0 && (
                    <p className="mt-3 text-apoio text-ocre">
                        Os pesos somam {soma.toLocaleString('pt-BR')}%. Ajuste até chegar a 100% para poder publicar.
                    </p>
                )}
            </Bloco>

            {erro && <Aviso tipo="erro">{erro}</Aviso>}

            <NovoCriterio
                sugestaoDePeso={Math.max(0, 100 - soma)}
                aoCriar={(dados) => executar(() => criarCriterio(oportunidadeId, versaoId, dados))}
            />
        </div>
    )
}

function CamposDoCriterio({
    valores,
    mudar,
}: {
    valores: { descricao: string; peso: string; escalaMin: string; escalaMax: string; evidencia: string }
    mudar: (campo: keyof typeof valores, valor: string) => void
}) {
    return (
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
            <div className="col-span-3">
                <Campo rotulo="Critério" required value={valores.descricao} onChange={(e) => mudar('descricao', e.target.value)} />
            </div>
            <Campo
                rotulo="Peso (%)"
                type="number"
                min={0.01}
                max={100}
                step="0.01"
                value={valores.peso}
                onChange={(e) => mudar('peso', e.target.value)}
            />
            <Campo
                rotulo="Escala mín."
                type="number"
                step="0.01"
                value={valores.escalaMin}
                onChange={(e) => mudar('escalaMin', e.target.value)}
            />
            <Campo
                rotulo="Escala máx."
                type="number"
                step="0.01"
                value={valores.escalaMax}
                onChange={(e) => mudar('escalaMax', e.target.value)}
            />
            <div className="col-span-3 lg:col-span-6">
                <Campo
                    rotulo="Evidência esperada"
                    value={valores.evidencia}
                    onChange={(e) => mudar('evidencia', e.target.value)}
                    ajuda="O que o avaliador deve encontrar na candidatura para dar a nota máxima."
                />
            </div>
        </div>
    )
}

function paraCadastro(v: { descricao: string; peso: string; escalaMin: string; escalaMax: string; evidencia: string }) {
    const dados: CriterioCadastro = { descricao: v.descricao.trim() }
    if (v.peso) dados.peso = Number(v.peso)
    if (v.escalaMin) dados.escalaMin = Number(v.escalaMin)
    if (v.escalaMax) dados.escalaMax = Number(v.escalaMax)
    if (v.evidencia.trim()) dados.evidenciaEsperada = v.evidencia.trim()
    return dados
}

function LinhaDoCriterio({
    criterio,
    aoSalvar,
    aoRemover,
}: {
    criterio: Criterio
    aoSalvar: (dados: Partial<CriterioCadastro>) => Promise<boolean>
    aoRemover: () => Promise<boolean>
}) {
    const inicial = {
        descricao: criterio.descricao,
        peso: criterio.peso === null ? '' : String(criterio.peso),
        escalaMin: criterio.escalaMin === null ? '' : String(criterio.escalaMin),
        escalaMax: criterio.escalaMax === null ? '' : String(criterio.escalaMax),
        evidencia: criterio.evidenciaEsperada ?? '',
    }
    const [valores, setValores] = useState(inicial)
    const [ocupado, setOcupado] = useState(false)
    const mudou = JSON.stringify(valores) !== JSON.stringify(inicial)

    return (
        <li className="rounded-card border border-sutil p-4">
            <CamposDoCriterio valores={valores} mudar={(campo, valor) => setValores((v) => ({ ...v, [campo]: valor }))} />
            <div className="mt-3 flex justify-end gap-3">
                <Botao
                    onClick={async () => {
                        setOcupado(true)
                        await aoRemover()
                        setOcupado(false)
                    }}
                    disabled={ocupado}
                >
                    Remover
                </Botao>
                <Botao
                    variante="primario"
                    disabled={!mudou || ocupado || !valores.descricao.trim()}
                    onClick={async () => {
                        setOcupado(true)
                        await aoSalvar(paraCadastro(valores))
                        setOcupado(false)
                    }}
                >
                    Salvar critério
                </Botao>
            </div>
        </li>
    )
}

function NovoCriterio({
    sugestaoDePeso,
    aoCriar,
}: {
    sugestaoDePeso: number
    aoCriar: (dados: CriterioCadastro) => Promise<boolean>
}) {
    const vazio = { descricao: '', peso: '', escalaMin: '0', escalaMax: '10', evidencia: '' }
    const [valores, setValores] = useState(vazio)
    const [ocupado, setOcupado] = useState(false)

    return (
        <Bloco titulo="Novo critério" apoio={sugestaoDePeso > 0 ? `Faltam ${sugestaoDePeso.toLocaleString('pt-BR')}% para fechar 100%.` : undefined}>
            <form
                onSubmit={async (e) => {
                    e.preventDefault()
                    if (!valores.descricao.trim()) return
                    setOcupado(true)
                    const ok = await aoCriar(paraCadastro(valores))
                    setOcupado(false)
                    if (ok) setValores(vazio)
                }}
            >
                <CamposDoCriterio valores={valores} mudar={(campo, valor) => setValores((v) => ({ ...v, [campo]: valor }))} />
                <div className="mt-3 flex justify-end">
                    <Botao type="submit" variante="primario" disabled={ocupado || !valores.descricao.trim()}>
                        + Acrescentar critério
                    </Botao>
                </div>
            </form>
        </Bloco>
    )
}

export default EtapaCriterios
