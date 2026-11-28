import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'

import { listarAjustes, type PedidoAjuste } from '../api/ajustes'
import { listarAvaliacoesDaCandidatura, type Avaliacao } from '../api/avaliacoes'
import { buscarCandidatura } from '../api/candidaturas'
import { buscarExtrato } from '../api/extratoElegibilidade'
import { buscarOportunidade } from '../api/oportunidades'
import CascaDoApp from '../components/CascaDoApp'
import { talvez } from '../components/candidato/apoio'
import { OQueFaltou, Secao, SeloDaElegibilidade, TabelaDeRequisitos } from '../components/candidato/Blocos'
import { CustomButton } from '../components/CustomButton'
import SeloStatus from '../components/SeloStatus'
import { Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { formatarData, formatarDataHora, rotuloDoEstado, statusDoEstado } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_CANDIDATO } from '../navegacao/menus'

/**
 * 65 · Candidato — elegibilidade, pareceres e rodadas · rota /candidato/candidaturas/:id/pareceres
 *
 * O extrato da elegibilidade no envio e cada rodada de avaliação: a decisão,
 * a nota final e o parecer de cada avaliação (sem o nome de quem avaliou), o
 * parecer retificado quando houver, e os pedidos de ajuste de cada rodada.
 */

const MAXIMO_DE_RODADAS = 3

export default function CandidatoPareceres() {
    const { id } = useParams()
    const candidaturaId = Number(id)
    const { dados, carregando, erro, recarregar } = useDados(
        async () => {
            const candidatura = await buscarCandidatura(candidaturaId)
            const [oportunidade, extrato, avaliacoes, ajustes] = await Promise.all([
                buscarOportunidade(candidatura.oportunidadeId),
                candidatura.estado === 'RASCUNHO' ? Promise.resolve(null) : talvez(buscarExtrato(candidaturaId)),
                listarAvaliacoesDaCandidatura(candidaturaId),
                listarAjustes(candidaturaId),
            ])
            return { candidatura, oportunidade, extrato, avaliacoes, ajustes }
        },
        [candidaturaId],
        Number.isFinite(candidaturaId),
    )

    const casca = (conteudo: ReactNode) => (
        <CascaDoApp itens={MENU_CANDIDATO} voltarPara={`/candidato/candidaturas/${candidaturaId}`}>
            {conteudo}
        </CascaDoApp>
    )
    if (carregando && !dados) return casca(<Carregando />)
    if (erro || !dados) return casca(<ErroNaTela mensagem={erro ?? 'Candidatura não encontrada'} tentarDeNovo={recarregar} />)

    const { candidatura: c, oportunidade, extrato, avaliacoes, ajustes } = dados

    // rodadas: as que têm avaliação visível, as que têm pedido de ajuste e a atual, se está em análise
    const numeros = new Set<number>()
    avaliacoes.forEach((a) => numeros.add(a.rodada))
    ajustes.forEach((p) => p.rodada && numeros.add(p.rodada))
    const ultimaVista = Math.max(0, ...numeros)
    const emAnalise = c.estado === 'EM_ANALISE'
    // em análise, as avaliações visíveis são das rodadas já fechadas: a atual é a seguinte
    const rodadaAtual = emAnalise ? ultimaVista + 1 : null
    if (rodadaAtual) numeros.add(rodadaAtual)
    const rodadas = [...numeros].sort((a, b) => a - b)

    return casca(
        <>
            <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="font-display text-tela text-titulo">Pareceres · {oportunidade.titulo}</h1>
                    <p className="mt-1 text-apoio text-secundario">
                        {rotuloDoEstado(c.estado)}
                        {rodadaAtual && ` · rodada ${rodadaAtual} de ${MAXIMO_DE_RODADAS}`}
                        {c.enviadaEm && ` · enviada em ${formatarData(c.enviadaEm)}`}
                    </p>
                </div>
                <SeloStatus status={statusDoEstado(c.estado)} rotulo={rotuloDoEstado(c.estado)} comPonto />
            </div>

            <div className="mt-6 flex flex-col gap-5">
                <Secao
                    titulo="Elegibilidade no envio"
                    acao={extrato?.ok ? <SeloDaElegibilidade situacao={extrato.valor.situacao} /> : undefined}
                >
                    {!extrato ? (
                        <p className="text-apoio text-secundario">A elegibilidade fica registrada quando a candidatura é enviada.</p>
                    ) : !extrato.ok ? (
                        <p className="text-apoio text-secundario">Não foi possível ler o extrato: {extrato.erro}</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <OQueFaltou itens={extrato.valor.faltou} />
                            <TabelaDeRequisitos
                                linhas={extrato.valor.requisitos.map((r) => ({
                                    id: r.requisitoId,
                                    campo: r.campo,
                                    operador: r.operador,
                                    valorExigido: r.valorExigido,
                                    valorInformado: r.valorInformado,
                                    obrigatoria: r.obrigatoria,
                                    situacao: r.situacao,
                                }))}
                            />
                        </div>
                    )}
                </Secao>

                {rodadas.length === 0 ? (
                    <Vazio titulo="Nenhuma rodada de avaliação ainda">
                        Os pareceres aparecem aqui quando a candidatura for avaliada e a rodada fechar.
                    </Vazio>
                ) : (
                    rodadas.map((n) => (
                        <Rodada
                            key={n}
                            numero={n}
                            avaliacoes={avaliacoes.filter((a) => a.rodada === n)}
                            pedido={ajustes.find((p) => p.rodada === n) ?? null}
                            emAvaliacao={n === rodadaAtual}
                            candidaturaId={c.id}
                            ajusteAberto={c.estado === 'AJUSTE'}
                        />
                    ))
                )}
            </div>
        </>,
    )
}

function Rodada({
    numero,
    avaliacoes,
    pedido,
    emAvaliacao,
    candidaturaId,
    ajusteAberto,
}: {
    numero: number
    avaliacoes: Avaliacao[]
    pedido: PedidoAjuste | null
    emAvaliacao: boolean
    candidaturaId: number
    ajusteAberto: boolean
}) {
    const assinadas = avaliacoes.filter((a) => a.assinadaEm)
    const fechadaEm = assinadas.map((a) => a.assinadaEm as string).sort().at(-1)
    const resultado = pedido
        ? 'ajuste pedido. Basta um pedido de ajuste para a rodada inteira virar ajuste.'
        : assinadas.length > 0
          ? (() => {
                const aprovadas = assinadas.filter((a) => a.decisao === 'APROVADA').length
                return aprovadas > assinadas.length - aprovadas ? 'aprovada pela maioria.' : 'reprovada (sem maioria de aprovação, o empate reprova).'
            })()
          : null

    if (emAvaliacao && avaliacoes.length === 0) {
        return (
            <Secao titulo={`Rodada ${numero} · em avaliação`}>
                <p className="text-apoio text-secundario">
                    Os avaliadores estão com a candidatura. Os pareceres aparecem quando todos da rodada assinarem.
                    {numero === MAXIMO_DE_RODADAS && ' Nesta rodada, não existe mais pedido de ajuste: só aprovar ou reprovar.'}
                </p>
            </Secao>
        )
    }

    return (
        <Secao
            titulo={`Rodada ${numero}${fechadaEm ? ` · encerrada em ${formatarData(fechadaEm)}` : ''}`}
            semRespiro
        >
            <ul>
                {avaliacoes.map((a, i) => {
                    const retificado = !!a.parecerRetificado
                    return (
                        <li key={a.id} className="flex flex-col gap-2 border-b border-sutil px-card py-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-item text-titulo">Avaliação {i + 1}</span>
                                {a.decisao && (
                                    <SeloStatus status={statusDoEstado(a.decisao)} rotulo={rotuloDoEstado(a.decisao)} comPonto />
                                )}
                                {a.notaFinal !== null && <span className="text-apoio text-acento">nota final {a.notaFinal}</span>}
                            </div>
                            {(a.parecerRetificado ?? a.parecer) && (
                                <p className="text-apoio text-secundario">{a.parecerRetificado ?? a.parecer}</p>
                            )}
                            {retificado && (
                                <p className="flex flex-wrap items-center gap-2 text-legenda text-secundario">
                                    <SeloStatus status="rascunho" rotulo={`Retificado em ${formatarData(a.retificadaEm)}`} comPonto />
                                    {a.parecer && <span>Parecer original: “{a.parecer}”</span>}
                                </p>
                            )}
                        </li>
                    )
                })}
            </ul>

            {pedido && (
                <div className="flex flex-col gap-2 border-b border-sutil px-card py-4">
                    <p className="text-item text-titulo">
                        Pedido de ajuste · {formatarDataHora(pedido.pedidoEm)} · reenvio até {formatarDataHora(pedido.prazoReenvio)}
                    </p>
                    <ol className="list-decimal pl-5 text-apoio text-titulo">
                        {pedido.itens.map((item) => (
                            <li key={item.id}>
                                {item.descricao}
                                {item.detalhe && <span className="text-secundario"> · {item.detalhe}</span>}
                                {item.corrigidoEm && <span className="text-status-aprovada-texto"> · corrigido</span>}
                            </li>
                        ))}
                    </ol>
                    {pedido.resposta && (
                        <p className="text-apoio text-secundario">
                            Sua resposta{pedido.reenviadoEm && ` (reenviada em ${formatarDataHora(pedido.reenviadoEm)})`}: “
                            {pedido.resposta}”
                        </p>
                    )}
                    {pedido.situacao === 'PERDA_DE_PRAZO' && (
                        <p className="text-apoio text-status-reprovada-texto">O prazo venceu sem reenvio.</p>
                    )}
                    {pedido.situacao === 'AGUARDANDO' && ajusteAberto && (
                        <div>
                            <CustomButton to={`/candidato/candidaturas/${candidaturaId}/ajuste`} variant="aprovar" size="auto">
                                Corrigir e reenviar
                            </CustomButton>
                        </div>
                    )}
                </div>
            )}

            {resultado && (
                <p className="m-card rounded-card border border-aviso-borda bg-aviso-fundo p-4 text-apoio text-ocre">
                    Resultado da rodada: {resultado}
                </p>
            )}
        </Secao>
    )
}
