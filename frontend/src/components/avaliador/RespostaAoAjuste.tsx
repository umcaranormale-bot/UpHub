import type { PedidoAjuste } from '../../api/ajustes'
import type { Avaliacao } from '../../api/avaliacoes'
import { CARTAO } from '../../estilos/classes'
import { formatarData, formatarDataHora } from '../../estilos/formatos'
import SeloStatus from '../SeloStatus'
import { parecerEmVigor } from './fila'

/**
 * 48 · o bloco do topo da rubrica na 2ª (ou 3ª) rodada: o que você pediu na
 * rodada anterior, o que o candidato respondeu e os itens que ele corrigiu.
 */
interface RespostaAoAjusteProps {
    pedido: PedidoAjuste
    /** A sua avaliação da rodada anterior, com o parecer do pedido. */
    anterior: Avaliacao | undefined
    organizacaoNome: string
}

export function RespostaAoAjuste({ pedido, anterior, organizacaoNome }: RespostaAoAjusteProps) {
    const noPrazo =
        pedido.reenviadoEm !== null && new Date(pedido.reenviadoEm).getTime() <= new Date(pedido.prazoReenvio).getTime()
    return (
        <section aria-labelledby="titulo-resposta-ajuste" className={CARTAO}>
            <header className="flex items-start gap-3 border-b border-sutil p-card">
                <div className="min-w-0 flex-1">
                    <h2 id="titulo-resposta-ajuste" className="font-display text-bloco text-titulo">
                        Resposta ao seu pedido de ajuste
                    </h2>
                    <p className="mt-1 text-apoio text-secundario">
                        Pedido em {formatarData(pedido.pedidoEm)} · prazo até {formatarData(pedido.prazoReenvio)}
                        {pedido.reenviadoEm && ` · reenviada em ${formatarData(pedido.reenviadoEm)} por ${organizacaoNome}`}
                        {pedido.reabertoEm && ` · prazo reaberto em ${formatarData(pedido.reabertoEm)}`}
                    </p>
                </div>
                {pedido.reenviadoEm && (
                    <SeloStatus
                        status={noPrazo ? 'aprovada' : 'pendente'}
                        rotulo={noPrazo ? 'Reenviada no prazo' : 'Reenviada após reabertura'}
                    />
                )}
            </header>

            <div className="flex flex-col gap-4 p-card">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-card bg-page p-4">
                        <p className="text-legenda text-secundario">
                            Seu pedido{pedido.rodada ? ` (${pedido.rodada}ª rodada)` : ''}
                        </p>
                        <p className="mt-1 whitespace-pre-line text-apoio text-titulo">
                            {anterior ? parecerEmVigor(anterior) || '—' : '—'}
                        </p>
                    </div>
                    <div className="rounded-card bg-acento-suave p-4">
                        <p className="text-legenda text-acento">O que o candidato mudou</p>
                        <p className="mt-1 whitespace-pre-line text-apoio text-titulo">{pedido.resposta ?? '—'}</p>
                    </div>
                </div>

                {pedido.itens.length > 0 && (
                    <ul className="overflow-hidden rounded-card border border-sutil">
                        {pedido.itens.map((item) => (
                            <li key={item.id} className="flex items-center gap-3 border-b border-sutil px-4 py-3 last:border-b-0">
                                <div className="min-w-0 flex-1">
                                    <p className="text-item text-titulo">{item.descricao}</p>
                                    <p className="mt-1 text-legenda text-secundario">
                                        {[
                                            item.detalhe,
                                            item.documentoExigidoNome && `documento: ${item.documentoExigidoNome}`,
                                            item.documentoNovoId && 'arquivo novo anexado',
                                        ]
                                            .filter(Boolean)
                                            .join(' · ') || 'sem detalhe'}
                                    </p>
                                </div>
                                {item.corrigidoEm ? (
                                    <SeloStatus status="aprovada" rotulo={`Corrigido em ${formatarDataHora(item.corrigidoEm)}`} />
                                ) : (
                                    <SeloStatus status="pendente" rotulo="Sem correção" />
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                <p className="text-legenda text-secundario">
                    Esta rodada tem uma avaliação nova: dê as notas de novo e assine a decisão. O parecer da rodada
                    anterior continua no histórico.
                </p>
            </div>
        </section>
    )
}

export default RespostaAoAjuste
