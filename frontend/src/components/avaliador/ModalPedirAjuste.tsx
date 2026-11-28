import { useState } from 'react'

import type { ItemAjusteCadastro } from '../../api/avaliacoes'
import { listarDocumentosExigidos } from '../../api/documentosExigidos'
import { mensagemDeErro } from '../../api/erros'
import { buscarVersao } from '../../api/versoes'
import { ANEL_FOCO, TRANSICAO_COR } from '../../estilos/classes'
import useDados from '../../hooks/useDados'
import { CustomButton } from '../CustomButton'
import { Campo, CampoTexto } from '../ui/Campo'
import { Aviso, Carregando } from '../ui/Estados'
import Modal from '../ui/Modal'

/**
 * Modal · pedir ajuste — o que precisa ser corrigido (documentos exigidos da
 * oportunidade ou itens livres) e a mensagem para o candidato, que é o parecer.
 * Confirmar assina a avaliação com a decisão AJUSTE.
 */
interface ModalPedirAjusteProps {
    aberto: boolean
    organizacaoNome: string
    oportunidadeId: number
    versaoId: number | null
    rodada: number
    parecer: string
    aoMudarParecer: (texto: string) => void
    aoFechar: () => void
    /** Salva e assina; lança o erro da API para o modal mostrar. */
    aoConfirmar: (itens: ItemAjusteCadastro[]) => Promise<void>
}

interface ItemLivre {
    chave: number
    descricao: string
    detalhe: string
}

const LIMITE_DESCRICAO = 200

export function ModalPedirAjuste({
    aberto,
    organizacaoNome,
    oportunidadeId,
    versaoId,
    rodada,
    parecer,
    aoMudarParecer,
    aoFechar,
    aoConfirmar,
}: ModalPedirAjusteProps) {
    const { dados, carregando, erro: erroAoCarregar } = useDados(
        async () => {
            if (versaoId === null) return { documentos: [], prazoDias: null }
            const [documentos, versao] = await Promise.all([
                listarDocumentosExigidos(oportunidadeId, versaoId),
                buscarVersao(oportunidadeId, versaoId).catch(() => null),
            ])
            return { documentos, prazoDias: versao?.prazoAjusteDias ?? null }
        },
        [oportunidadeId, versaoId],
        aberto,
    )

    // documento exigido marcado → o detalhe que acompanha
    const [marcados, setMarcados] = useState<Record<number, string>>({})
    const [livres, setLivres] = useState<ItemLivre[]>([])
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const documentos = dados?.documentos ?? []
    const itens: ItemAjusteCadastro[] = [
        ...documentos
            .filter((d) => d.id in marcados)
            .map((d) => ({
                descricao: d.nome.slice(0, LIMITE_DESCRICAO),
                detalhe: marcados[d.id].trim() || undefined,
                documentoExigidoId: d.id,
            })),
        ...livres
            .filter((l) => l.descricao.trim())
            .map((l) => ({ descricao: l.descricao.trim(), detalhe: l.detalhe.trim() || undefined })),
    ]
    const pronto = itens.length > 0 && parecer.trim().length > 0

    async function confirmar() {
        setEnviando(true)
        setErro(null)
        try {
            await aoConfirmar(itens)
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setEnviando(false)
        }
    }

    function mudarLivre(chave: number, campo: 'descricao' | 'detalhe', valor: string) {
        setLivres((atual) => atual.map((l) => (l.chave === chave ? { ...l, [campo]: valor } : l)))
    }

    return (
        <Modal
            aberto={aberto}
            largura="larga"
            titulo="Pedir ajuste ao candidato"
            descricao={`A candidatura volta para ${organizacaoNome} corrigir os itens marcados e reenviar, numa rodada nova, com os mesmos avaliadores. Depois de assinado, o parecer não pode ser editado, só retificado com justificativa.`}
            aoFechar={aoFechar}
            acoes={
                <>
                    <CustomButton variant="neutro" size="auto" type="button" onClick={aoFechar}>
                        Cancelar
                    </CustomButton>
                    <CustomButton
                        variant="aprovar"
                        size="auto"
                        type="button"
                        disabled={!pronto || enviando}
                        onClick={() => void confirmar()}
                    >
                        {enviando ? 'Assinando…' : 'Assinar e enviar pedido'}
                    </CustomButton>
                </>
            }
        >
            <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-medium text-secundario">O que precisa ser corrigido</legend>
                {carregando ? (
                    <Carregando texto="Carregando os documentos exigidos…" />
                ) : erroAoCarregar ? (
                    <Aviso tipo="erro">{erroAoCarregar}</Aviso>
                ) : (
                    documentos.length > 0 && (
                        <ul className="mt-1 overflow-hidden rounded-card border border-sutil">
                            {documentos.map((d) => {
                                const marcado = d.id in marcados
                                return (
                                    <li key={d.id} className="border-b border-sutil px-4 py-3 last:border-b-0">
                                        <label className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={marcado}
                                                onChange={(e) =>
                                                    setMarcados((atual) => {
                                                        const novo = { ...atual }
                                                        if (e.target.checked) novo[d.id] = ''
                                                        else delete novo[d.id]
                                                        return novo
                                                    })
                                                }
                                                className="mt-1 size-4 accent-acento"
                                            />
                                            <span>
                                                <span className="block text-item text-titulo">{d.nome}</span>
                                                <span className="block text-legenda text-secundario">
                                                    documento exigido{d.obrigatorio ? ' · obrigatório' : ''} · o
                                                    candidato envia um arquivo novo
                                                </span>
                                            </span>
                                        </label>
                                        {marcado && (
                                            <div className="mt-2 pl-7">
                                                <Campo
                                                    rotulo={`O que corrigir em ${d.nome} (opcional)`}
                                                    value={marcados[d.id]}
                                                    onChange={(e) =>
                                                        setMarcados((atual) => ({ ...atual, [d.id]: e.target.value }))
                                                    }
                                                />
                                            </div>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    )
                )}

                {livres.map((l, i) => (
                    <div key={l.chave} className="flex flex-col gap-2 rounded-card border border-sutil p-4">
                        <Campo
                            rotulo={`Item ${documentos.length > 0 ? 'livre ' : ''}${i + 1}`}
                            ajuda={`Até ${LIMITE_DESCRICAO} caracteres. Ex.: Plano financeiro`}
                            maxLength={LIMITE_DESCRICAO}
                            value={l.descricao}
                            onChange={(e) => mudarLivre(l.chave, 'descricao', e.target.value)}
                        />
                        <Campo
                            rotulo="Detalhe (opcional)"
                            value={l.detalhe}
                            onChange={(e) => mudarLivre(l.chave, 'detalhe', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setLivres((atual) => atual.filter((x) => x.chave !== l.chave))}
                            className={`self-start rounded-card text-apoio text-status-reprovada-texto underline ${ANEL_FOCO}`}
                        >
                            Tirar este item
                        </button>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => setLivres((atual) => [...atual, { chave: Date.now(), descricao: '', detalhe: '' }])}
                    className={`self-start rounded-card text-apoio font-semibold text-acento hover:text-titulo ${TRANSICAO_COR} ${ANEL_FOCO}`}
                >
                    + Acrescentar item
                </button>
            </fieldset>

            <CampoTexto
                rotulo="Mensagem para o candidato (é o parecer)"
                value={parecer}
                rows={4}
                onChange={(e) => aoMudarParecer(e.target.value)}
            />

            <p className="rounded-card bg-page p-4 text-legenda text-secundario">
                {dados?.prazoDias
                    ? `Prazo para reenvio: ${dados.prazoDias} dias corridos, definido na oportunidade e contado de quando a rodada fecha. `
                    : 'O prazo para reenvio é o definido na oportunidade, contado de quando a rodada fecha. '}
                {rodada === 1
                    ? 'Este é o 1º de 2 pedidos de ajuste possíveis.'
                    : 'Este é o 2º e último pedido de ajuste: na rodada 3, a decisão é só aprovar ou reprovar.'}
            </p>

            {!pronto && (
                <p className="text-legenda text-secundario">
                    Marque ou escreva pelo menos um item e escreva a mensagem para liberar a assinatura.
                </p>
            )}
            {erro && <Aviso tipo="erro">{erro}</Aviso>}
        </Modal>
    )
}

export default ModalPedirAjuste
