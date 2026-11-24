import { buscarDocumento } from '../../api/documentos'
import type { Organizacao } from '../../api/organizacoes'
import type { Solicitacao } from '../../api/solicitacoesProvedor'
import { formatarData, ROTULO_TIPO_ORGANIZACAO } from '../../estilos/formatos'
import useDados from '../../hooks/useDados'
import CartoesDeDetalhe from '../CartoesDeDetalhe'

/**
 * A conferência de um pedido de provedor (18, 18b e 49): CNPJ, e-mail
 * institucional, documento e tipo, e, no 2º pedido, a recusa anterior ao lado
 * da resposta da organização.
 */
interface ConferenciaDoPedidoProps {
    pedido: Solicitacao
    organizacao: Organizacao | undefined
    /** O pedido recusado ou revogado a que este responde (estado 49). */
    anterior: Solicitacao | undefined
}

function tamanho(bytes: number): string {
    return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function ConferenciaDoPedido({ pedido, organizacao, anterior }: ConferenciaDoPedidoProps) {
    const documento = useDados(() => buscarDocumento(pedido.documentoId ?? 0), [pedido.documentoId], pedido.documentoId !== null)
    const docNovo = anterior && pedido.documentoId !== null && pedido.documentoId !== anterior.documentoId
    const anteriorDoc = useDados(
        () => buscarDocumento(anterior?.documentoId ?? 0),
        [anterior?.documentoId],
        anterior?.documentoId != null,
    )

    const valorDoDocumento =
        pedido.documentoId === null
            ? 'Nenhum documento'
            : documento.carregando
              ? 'Carregando…'
              : documento.erro
                ? 'Não deu para abrir'
                : (documento.dados?.nomeArquivo ?? '—')
    const notaDoDocumento =
        pedido.documentoId === null
            ? 'o pedido foi sem documento'
            : documento.dados
              ? `${tamanho(documento.dados.tamanhoBytes)} · enviado em ${formatarData(documento.dados.enviadoEm)}${docNovo ? ' · documento novo' : ''}`
              : (documento.erro ?? '')

    return (
        <div className="flex flex-col gap-5">
            <CartoesDeDetalhe
                itens={[
                    {
                        rotulo: 'CNPJ',
                        valor: organizacao?.cnpj ?? '—',
                        nota: organizacao?.razaoSocial ?? 'sem razão social cadastrada',
                    },
                    {
                        rotulo: 'E-mail institucional',
                        valor: pedido.emailInstitucional,
                        nota: `pedido por ${pedido.solicitanteNome}`,
                    },
                    { rotulo: 'Documento de comprovação', valor: valorDoDocumento, nota: notaDoDocumento, confirmado: !!documento.dados },
                    {
                        rotulo: 'Tipo da organização',
                        valor: organizacao ? (ROTULO_TIPO_ORGANIZACAO[organizacao.tipo] ?? organizacao.tipo) : '—',
                        nota: [organizacao?.sedeCidade, organizacao?.sedeUf].filter(Boolean).join(' · ') || 'sede não informada',
                    },
                ]}
            />

            {anterior && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="rounded-card border border-status-reprovada-borda bg-status-reprovada-fundo p-5">
                        <p className="text-item text-status-reprovada-texto">
                            {anterior.situacao === 'REVOGADA' ? 'Revogação anterior' : 'Recusa anterior'} ·{' '}
                            {formatarData(anterior.situacao === 'REVOGADA' ? anterior.revogadaEm : anterior.decididaEm)}
                        </p>
                        <p className="mt-2 text-apoio text-titulo">
                            Motivo: {(anterior.situacao === 'REVOGADA' ? anterior.motivoRevogacao : anterior.motivo) ?? '—'}
                        </p>
                        <p className="mt-1 text-legenda text-secundario">Pedido anterior de {formatarData(anterior.pedidaEm)}</p>
                        {anterior.documentoId !== null && (
                            <p className="mt-1 text-legenda text-secundario">
                                Documento do pedido anterior: {anteriorDoc.dados?.nomeArquivo ?? '—'}
                            </p>
                        )}
                        {anterior.recusaPorDocumento && (
                            <span className="mt-2 inline-block rounded-badge bg-card px-2 py-1 text-selo text-status-reprovada-texto">
                                Recusa por documento
                            </span>
                        )}
                    </div>
                    <div className="rounded-card bg-acento-suave p-5">
                        <p className="text-item text-acento">Resposta da organização · {formatarData(pedido.pedidaEm)}</p>
                        <p className="mt-2 whitespace-pre-line text-apoio text-titulo">{pedido.respostaRecusa ?? '—'}</p>
                        {anterior.recusaPorDocumento && (
                            <span
                                className={`mt-2 inline-block rounded-badge px-2 py-1 text-selo ${
                                    docNovo ? 'bg-status-aprovada-fundo text-status-aprovada-texto' : 'bg-aviso-fundo text-ocre'
                                }`}
                            >
                                {docNovo ? 'Documento diferente do recusado' : 'Mesmo documento do pedido recusado'}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ConferenciaDoPedido
