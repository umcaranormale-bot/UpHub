import { useState } from 'react'
import { Link } from 'react-router-dom'

import { mensagemDeErro } from '../../../api/erros'
import { criarReserva, editarReserva, removerReserva, type Reserva } from '../../../api/reservas'
import type { Solicitacao } from '../../../api/solicitacoesProvedor'
import { publicarVersao, type Versao } from '../../../api/versoes'
import { formatarData, hoje } from '../../../estilos/formatos'
import { Campo } from '../../ui/Campo'
import { Aviso } from '../../ui/Estados'
import Botao from '../Botao'
import { Bloco } from '../Cabecalho'
import { LINK_ACAO } from '../rotulos'

/** Etapa 5 · reserva de vagas e a conferência final antes de publicar. */
export function EtapaPublicar({
    oportunidadeId,
    versao,
    reservas,
    somaPesos,
    totalCriterios,
    pedido,
    aoMudar,
    aoPublicar,
}: {
    oportunidadeId: number
    versao: Versao
    reservas: Reserva[]
    somaPesos: number
    totalCriterios: number
    pedido: Solicitacao | null
    aoMudar: () => Promise<void>
    aoPublicar: () => void
}) {
    const [erro, setErro] = useState<string | null>(null)
    const [publicando, setPublicando] = useState(false)
    const reservadas = reservas.reduce((s, r) => s + r.quantidade, 0)

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

    const conferencias = [
        {
            ok: !!versao.prazoEnvio && versao.prazoEnvio >= hoje(),
            texto: versao.prazoEnvio
                ? `Prazo de envio: ${formatarData(versao.prazoEnvio)}`
                : 'Prazo de envio preenchido (etapa Prazos e vagas)',
        },
        {
            ok: totalCriterios > 0 && somaPesos === 100,
            texto: `Critérios com pesos somando 100% (hoje: ${totalCriterios} critério${totalCriterios === 1 ? '' : 's'}, ${somaPesos.toLocaleString('pt-BR')}%)`,
        },
        {
            ok: pedido?.situacao === 'APROVADA',
            texto: 'Permissão de publicar aprovada pela gestão do Porto Digital',
        },
    ]
    const pronta = conferencias.every((c) => c.ok)

    async function publicar() {
        setPublicando(true)
        setErro(null)
        try {
            await publicarVersao(oportunidadeId, versao.id)
            aoPublicar()
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setPublicando(false)
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <Bloco
                titulo="Reserva de vagas"
                apoio={
                    versao.quantidadeVagas
                        ? `${reservadas} de ${versao.quantidadeVagas} vagas reservadas. A soma das reservas não passa do total de vagas.`
                        : 'Para reservar vagas, defina antes a quantidade de vagas (etapa Prazos e vagas).'
                }
            >
                {reservas.length > 0 ? (
                    <ul className="flex flex-col divide-y divide-sutil rounded-card border border-sutil">
                        {reservas.map((r) => (
                            <LinhaDaReserva
                                key={`${r.id}-${r.quantidade}`}
                                reserva={r}
                                aoSalvar={(quantidade) =>
                                    executar(() => editarReserva(oportunidadeId, versao.id, r.id, { quantidade }))
                                }
                                aoRemover={() => executar(() => removerReserva(oportunidadeId, versao.id, r.id))}
                            />
                        ))}
                    </ul>
                ) : (
                    <p className="text-apoio text-secundario">Nenhuma vaga reservada: todas são de ampla concorrência.</p>
                )}
                {versao.quantidadeVagas !== null && (
                    <NovaReserva
                        aoCriar={(criterio, quantidade) =>
                            executar(() => criarReserva(oportunidadeId, versao.id, { criterio, quantidade }))
                        }
                    />
                )}
                <p className="mt-3 text-legenda text-secundario">
                    Quem se declara no critério concorre às vagas reservadas e às de ampla concorrência. A autodeclaração é
                    conferida depois da homologação.
                </p>
            </Bloco>

            <Bloco titulo="Publicar" apoio="Depois de publicar, só o prazo de envio muda. O resto fica congelado.">
                <ul className="flex flex-col gap-2">
                    {conferencias.map((c) => (
                        <li key={c.texto} className="flex items-center gap-3 text-apoio">
                            <span
                                className={`rounded-badge px-2 py-0.5 text-selo ${
                                    c.ok ? 'bg-status-aprovada-fundo text-status-aprovada-texto' : 'bg-aviso-fundo text-ocre'
                                }`}
                            >
                                {c.ok ? 'Pronto' : 'Falta'}
                            </span>
                            <span className="text-titulo">{c.texto}</span>
                        </li>
                    ))}
                </ul>
                {pedido?.situacao !== 'APROVADA' && (
                    <p className="mt-3 text-apoio text-secundario">
                        O rascunho fica salvo.{' '}
                        <Link to="/provedor/pedido" className={LINK_ACAO}>
                            Ver o pedido de permissão
                        </Link>
                    </p>
                )}
                {erro && (
                    <div className="mt-4">
                        <Aviso tipo="erro">{erro}</Aviso>
                    </div>
                )}
                {pedido?.situacao === 'APROVADA' && (
                    <div className="mt-4 flex justify-end">
                        <Botao variante="primario" disabled={!pronta || publicando} onClick={() => void publicar()}>
                            {publicando ? 'Publicando…' : 'Publicar oportunidade'}
                        </Botao>
                    </div>
                )}
            </Bloco>
        </div>
    )
}

function LinhaDaReserva({
    reserva,
    aoSalvar,
    aoRemover,
}: {
    reserva: Reserva
    aoSalvar: (quantidade: number) => Promise<boolean>
    aoRemover: () => Promise<boolean>
}) {
    const [quantidade, setQuantidade] = useState(String(reserva.quantidade))
    return (
        <li className="flex items-end gap-3 px-4 py-3">
            <span className="min-w-0 flex-1 pb-2 text-item text-titulo">{reserva.criterio}</span>
            <div className="w-32">
                <Campo
                    rotulo="Vagas"
                    type="number"
                    min={1}
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                />
            </div>
            <Botao
                disabled={!quantidade || Number(quantidade) === reserva.quantidade}
                onClick={() => void aoSalvar(Number(quantidade))}
                className="h-[42px]"
            >
                Salvar
            </Botao>
            <Botao onClick={() => void aoRemover()} className="h-[42px]">
                Remover
            </Botao>
        </li>
    )
}

function NovaReserva({ aoCriar }: { aoCriar: (criterio: string, quantidade: number) => Promise<boolean> }) {
    const [criterio, setCriterio] = useState('')
    const [quantidade, setQuantidade] = useState('1')
    const [ocupado, setOcupado] = useState(false)
    const pronto = criterio.trim() !== '' && Number(quantidade) > 0

    return (
        <form
            className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_8rem_auto] items-end gap-3 rounded-card bg-page p-4"
            onSubmit={async (e) => {
                e.preventDefault()
                if (!pronto) return
                setOcupado(true)
                const ok = await aoCriar(criterio.trim(), Number(quantidade))
                setOcupado(false)
                if (ok) {
                    setCriterio('')
                    setQuantidade('1')
                }
            }}
        >
            <Campo
                rotulo="Critério da reserva"
                maxLength={80}
                placeholder="Ex.: liderada por mulheres"
                value={criterio}
                onChange={(e) => setCriterio(e.target.value)}
            />
            <Campo rotulo="Vagas" type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
            <Botao type="submit" variante="primario" disabled={!pronto || ocupado} className="h-[42px]">
                + Reservar
            </Botao>
        </form>
    )
}

export default EtapaPublicar
