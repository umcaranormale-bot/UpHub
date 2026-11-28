import { useState } from 'react'

import { mensagemDeErro } from '../../api/erros'
import { editarParametroDeGargalo, listarGargalos, listarParametrosDeGargalo, type EtapaGargalo } from '../../api/gargalos'
import type { ResumoGargalo } from '../../api/painel'
import { ANEL_FOCO, CARTAO, TRANSICAO_COR } from '../../estilos/classes'
import useDados from '../../hooks/useDados'
import { CustomButton } from '../CustomButton'
import SeloStatus from '../SeloStatus'
import { Aviso } from '../ui/Estados'
import { dias, ORDEM_DAS_ETAPAS, ROTULO_ETAPA, ROTULO_RESPONSAVEL } from './rotulos'

/**
 * Gargalos do painel (79): em cada etapa da seleção, quantas passaram do limite
 * e a mais antiga (resumo do GET /api/painel). Embaixo, os itens parados de
 * GET /api/gargalos: onde a fila travou e com quem está a bola. Ao lado, a
 * gestão muda o limite da etapa, em dias úteis.
 */
interface BlocoGargalosProps {
    gargalos: ResumoGargalo[]
    /** Depois de mudar um limite: o painel recalcula os gargalos. */
    aoMudarLimite: () => void
}

export function BlocoGargalos({ gargalos, aoMudarLimite }: BlocoGargalosProps) {
    const parametros = useDados(() => listarParametrosDeGargalo(), [])
    // os itens parados mudam quando o limite muda: recarrega junto com o painel
    const itens = useDados(() => listarGargalos(), [gargalos])
    const [editando, setEditando] = useState<EtapaGargalo | null>(null)
    const [valor, setValor] = useState('')
    const [salvando, setSalvando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [aviso, setAviso] = useState<string | null>(null)

    const limites = new Map<EtapaGargalo, number>()
    for (const g of gargalos) limites.set(g.etapa, g.limiteDiasUteis)
    for (const p of parametros.dados ?? []) limites.set(p.etapa, p.limiteDiasUteis)

    const etapas = ORDEM_DAS_ETAPAS.filter((e) => limites.has(e) || gargalos.some((g) => g.etapa === e))
    const acima = gargalos.reduce((t, g) => t + g.acimaDoLimite, 0)
    const limiteDigitado = Number(valor)
    const limiteValido = Number.isInteger(limiteDigitado) && limiteDigitado >= 1

    async function salvar(etapa: EtapaGargalo) {
        if (!limiteValido) return
        setSalvando(true)
        setErro(null)
        try {
            await editarParametroDeGargalo(etapa, limiteDigitado)
            setEditando(null)
            setAviso(`Limite de ${ROTULO_ETAPA[etapa]} agora é de ${dias(limiteDigitado)} úteis.`)
            await parametros.recarregar()
            aoMudarLimite()
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setSalvando(false)
        }
    }

    return (
        <section aria-labelledby="titulo-gargalos" className={CARTAO}>
            <header className="flex items-center gap-3 border-b border-sutil p-card">
                <h2 id="titulo-gargalos" className="font-display text-bloco text-titulo">
                    Gargalos
                </h2>
                <SeloStatus
                    status={acima > 0 ? 'pendente' : 'aprovada'}
                    rotulo={acima > 0 ? `${acima} acima do limite` : 'nada acima do limite'}
                    comPonto
                />
                <p className="ml-auto text-apoio text-secundario">limites em dias úteis, por etapa</p>
            </header>

            {aviso && (
                <div className="px-card pt-4">
                    <Aviso tipo="sucesso">{aviso}</Aviso>
                </div>
            )}
            {parametros.erro && (
                <div className="px-card pt-4">
                    <Aviso tipo="erro">Não deu para carregar os limites para edição: {parametros.erro}</Aviso>
                </div>
            )}

            {etapas.length === 0 ? (
                <p className="p-card text-apoio text-secundario">Nenhuma etapa com limite definido ainda.</p>
            ) : (
                <div className="relative overflow-x-auto"><table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-sutil bg-page">
                            {['Etapa', 'Com quem está', 'Limite', 'Acima do limite', 'Mais antiga', ''].map((c, i) => (
                                <th key={c || i} scope="col" className="px-card py-3 text-selo text-secundario uppercase">
                                    {c || <span className="sr-only">Ação</span>}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {etapas.map((etapa) => {
                            const g = gargalos.find((x) => x.etapa === etapa)
                            const responsaveis = [
                                ...new Set(
                                    (itens.dados?.find((x) => x.etapa === etapa)?.itens ?? []).map((i) => ROTULO_RESPONSAVEL[i.responsavel.papel]),
                                ),
                            ]
                            const limite = limites.get(etapa) ?? g?.limiteDiasUteis ?? 0
                            const emEdicao = editando === etapa
                            const idCampo = `limite-${etapa}`
                            return (
                                <tr key={etapa} className={`border-b border-sutil last:border-b-0 hover:bg-page ${TRANSICAO_COR}`}>
                                    <td className="px-card py-4 text-item text-titulo">{ROTULO_ETAPA[etapa]}</td>
                                    <td className="px-card py-4 text-apoio text-secundario">
                                        {responsaveis.length ? responsaveis.join(', ') : '—'}
                                    </td>
                                    <td className="px-card py-4">
                                        {emEdicao ? (
                                            <span className="flex items-center gap-2">
                                                <label htmlFor={idCampo} className="sr-only">
                                                    Limite de {ROTULO_ETAPA[etapa]} em dias úteis
                                                </label>
                                                <input
                                                    id={idCampo}
                                                    type="number"
                                                    min={1}
                                                    step={1}
                                                    value={valor}
                                                    onChange={(e) => setValor(e.target.value)}
                                                    className={`w-20 rounded-card border border-sutil px-2 py-1 text-right text-corpo text-titulo ${ANEL_FOCO}`}
                                                />
                                                <span className="text-apoio text-secundario">dias úteis</span>
                                            </span>
                                        ) : (
                                            <span className="text-apoio text-titulo">{dias(limite)} úteis</span>
                                        )}
                                    </td>
                                    <td className="px-card py-4">
                                        {g && g.acimaDoLimite > 0 ? (
                                            <SeloStatus status="reprovada" rotulo={`${g.acimaDoLimite} acima`} comPonto />
                                        ) : (
                                            <span className="text-apoio text-secundario">0</span>
                                        )}
                                    </td>
                                    <td className="px-card py-4 text-apoio text-titulo">
                                        {g && g.maisAntigoDiasUteis != null ? `${dias(g.maisAntigoDiasUteis)} úteis` : '—'}
                                    </td>
                                    <td className="px-card py-4 text-right">
                                        {emEdicao ? (
                                            <span className="flex justify-end gap-2">
                                                <CustomButton
                                                    variant="aprovar"
                                                    size="auto"
                                                    type="button"
                                                    disabled={!limiteValido || salvando}
                                                    onClick={() => void salvar(etapa)}
                                                >
                                                    {salvando ? 'Salvando…' : 'Salvar'}
                                                </CustomButton>
                                                <CustomButton variant="neutro" size="auto" type="button" onClick={() => setEditando(null)}>
                                                    Cancelar
                                                </CustomButton>
                                            </span>
                                        ) : (
                                            parametros.dados && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditando(etapa)
                                                        setValor(String(limite))
                                                        setErro(null)
                                                        setAviso(null)
                                                    }}
                                                    className={`rounded-card text-apoio font-semibold text-acento hover:text-titulo ${TRANSICAO_COR} ${ANEL_FOCO}`}
                                                >
                                                    Editar limite<span className="sr-only"> de {ROTULO_ETAPA[etapa]}</span>
                                                </button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table></div>
            )}

            {(itens.dados ?? []).some((e) => e.itens.length > 0) && (
                <div className="border-t border-sutil p-card">
                    <h3 className="text-selo text-secundario uppercase">Parados além do limite</h3>
                    <ul className="mt-3 flex flex-col gap-2">
                        {(itens.dados ?? []).flatMap((e) =>
                            e.itens.map((i) => (
                                <li
                                    key={`${e.etapa}-${i.candidaturaId ?? ''}-${i.solicitacaoProvedorId ?? ''}`}
                                    className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-card border border-sutil px-4 py-3"
                                >
                                    <span className="text-selo text-secundario uppercase">{ROTULO_ETAPA[e.etapa]}</span>
                                    <span className="text-item text-titulo">
                                        {i.oportunidadeTitulo ? `${i.oportunidadeTitulo} · ${i.organizacaoNome}` : `Pedido de provedor · ${i.organizacaoNome}`}
                                    </span>
                                    {i.semAvaliador && <SeloStatus status="reprovada" rotulo="sem avaliador designado" comPonto />}
                                    <span className="ml-auto text-apoio text-secundario">
                                        com {i.responsavel.nome} ({ROTULO_RESPONSAVEL[i.responsavel.papel].toLowerCase()}) · {dias(i.diasUteis)} úteis
                                    </span>
                                </li>
                            )),
                        )}
                    </ul>
                </div>
            )}
            {itens.erro && (
                <div className="px-card pb-4">
                    <Aviso tipo="erro">Não deu para carregar os itens parados: {itens.erro}</Aviso>
                </div>
            )}

            {erro && (
                <div className="px-card pb-4">
                    <Aviso tipo="erro">{erro}</Aviso>
                </div>
            )}
            {editando && !limiteValido && (
                <p className="px-card pb-4 text-legenda text-status-reprovada-texto">O limite é um número inteiro de pelo menos 1 dia útil.</p>
            )}
        </section>
    )
}

export default BlocoGargalos
