import { useState } from 'react'

import { mensagemDeErro } from '../../api/erros'
import { aprovarPedido, recusarPedido, revogarPermissao, type Solicitacao } from '../../api/solicitacoesProvedor'
import { CustomButton } from '../CustomButton'
import { CampoTexto } from '../ui/Campo'
import { Aviso } from '../ui/Estados'
import Modal from '../ui/Modal'

/**
 * Modal · aprovar provedor, Modal · recusar provedor e Modal · revogar
 * permissão. Quem abre passa o pedido e a ação; com null, fica fechado.
 * Para começar limpo, o pai troca a key ao abrir.
 */
export type AcaoDoPedido = 'aprovar' | 'recusar' | 'revogar'

interface ModalDoPedidoProps {
    pedido: Solicitacao | null
    acao: AcaoDoPedido | null
    aoFechar: () => void
    aoConcluir: (resultado: Solicitacao, acao: AcaoDoPedido) => void
}

const TEXTOS: Record<AcaoDoPedido, { titulo: string; botao: string; enviando: string }> = {
    aprovar: { titulo: 'Aprovar provedor', botao: 'Aprovar e liberar publicação', enviando: 'Aprovando…' },
    recusar: { titulo: 'Recusar provedor', botao: 'Registrar recusa', enviando: 'Registrando…' },
    revogar: { titulo: 'Revogar permissão', botao: 'Revogar permissão', enviando: 'Revogando…' },
}

export function ModalDoPedido({ pedido, acao, aoFechar, aoConcluir }: ModalDoPedidoProps) {
    const [motivo, setMotivo] = useState('')
    const [porDocumento, setPorDocumento] = useState(false)
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const aberto = pedido !== null && acao !== null
    const textos = TEXTOS[acao ?? 'aprovar']
    const precisaMotivo = acao === 'recusar' || acao === 'revogar'
    const pronto = !precisaMotivo || motivo.trim().length > 0

    async function confirmar() {
        if (!pedido || !acao || !pronto) return
        setEnviando(true)
        setErro(null)
        try {
            const resultado =
                acao === 'aprovar'
                    ? await aprovarPedido(pedido.id)
                    : acao === 'recusar'
                      ? await recusarPedido(pedido.id, motivo.trim(), porDocumento)
                      : await revogarPermissao(pedido.id, motivo.trim())
            aoConcluir(resultado, acao)
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setEnviando(false)
        }
    }

    const nome = pedido?.organizacaoNome ?? ''
    const descricao =
        acao === 'aprovar'
            ? `${nome} passa a publicar oportunidades. Se havia oportunidades suspensas por uma revogação, elas voltam a andar. A decisão fica no histórico de auditoria, com autor e data.`
            : acao === 'recusar'
              ? `${nome} continua navegando, mas não publica. O motivo aparece para a organização, que pode pedir de novo respondendo à recusa.`
              : `${nome} perde a permissão de publicar. As oportunidades publicadas ou em avaliação ficam suspensas, e as candidaturas pausam até uma nova aprovação.`

    return (
        <Modal
            aberto={aberto}
            titulo={textos.titulo}
            descricao={descricao}
            aoFechar={aoFechar}
            acoes={
                <>
                    <CustomButton variant="neutro" size="auto" type="button" onClick={aoFechar}>
                        Cancelar
                    </CustomButton>
                    <CustomButton
                        variant={acao === 'aprovar' ? 'aprovar' : 'reprovar'}
                        size="auto"
                        type="button"
                        disabled={!pronto || enviando}
                        onClick={() => void confirmar()}
                    >
                        {enviando ? textos.enviando : textos.botao}
                    </CustomButton>
                </>
            }
        >
            {precisaMotivo && (
                <CampoTexto
                    rotulo="Motivo (obrigatório)"
                    ajuda={acao === 'recusar' ? 'A organização lê este texto.' : 'Fica no histórico e a organização lê este texto.'}
                    value={motivo}
                    rows={3}
                    onChange={(e) => setMotivo(e.target.value)}
                />
            )}
            {acao === 'recusar' && (
                <label className="flex items-start gap-3 text-apoio text-titulo">
                    <input
                        type="checkbox"
                        checked={porDocumento}
                        onChange={(e) => setPorDocumento(e.target.checked)}
                        className="mt-1 size-4 accent-acento"
                    />
                    <span>
                        Recusa por documento
                        <span className="block text-legenda text-secundario">
                            No novo pedido, a organização vai ter de mandar um documento diferente do recusado.
                        </span>
                    </span>
                </label>
            )}
            {erro && <Aviso tipo="erro">{erro}</Aviso>}
        </Modal>
    )
}

export default ModalDoPedido
