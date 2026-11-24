import { useState } from 'react'

import type { Avaliacao } from '../../api/avaliacoes'
import { mensagemDeErro } from '../../api/erros'
import { retificarParecer } from '../../api/retificacoes'
import { CustomButton } from '../CustomButton'
import { CampoTexto } from '../ui/Campo'
import { Aviso } from '../ui/Estados'
import Modal from '../ui/Modal'
import { parecerEmVigor } from './fila'

/**
 * Modal · retificar parecer — depois de assinar, só o texto do parecer muda,
 * sempre com justificativa. A decisão e as notas ficam como foram assinadas.
 *
 * Quem abre passa a avaliação; com null, o modal fica fechado. Para começar do
 * texto em vigor, o pai troca a key ao abrir.
 */
interface ModalRetificarProps {
    avaliacao: Avaliacao | null
    aoFechar: () => void
    aoRetificar: () => void
}

export function ModalRetificar({ avaliacao, aoFechar, aoRetificar }: ModalRetificarProps) {
    const [parecer, setParecer] = useState(avaliacao ? parecerEmVigor(avaliacao) : '')
    const [justificativa, setJustificativa] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const pronto = parecer.trim().length > 0 && justificativa.trim().length > 0

    async function confirmar() {
        if (!avaliacao || !pronto) return
        setEnviando(true)
        setErro(null)
        try {
            await retificarParecer(avaliacao.id, {
                parecerRetificado: parecer.trim(),
                justificativa: justificativa.trim(),
            })
            aoRetificar()
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <Modal
            aberto={avaliacao !== null}
            titulo="Retificar parecer"
            largura="larga"
            descricao="A decisão e as notas assinadas não mudam. O parecer original fica guardado no histórico e o candidato passa a ler o texto novo."
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
                        {enviando ? 'Registrando…' : 'Registrar retificação'}
                    </CustomButton>
                </>
            }
        >
            <CampoTexto
                rotulo="Parecer retificado"
                value={parecer}
                rows={5}
                onChange={(e) => setParecer(e.target.value)}
            />
            <CampoTexto
                rotulo="Justificativa (obrigatória)"
                ajuda="Explique por que o texto mudou. Fica no histórico de auditoria."
                value={justificativa}
                rows={3}
                onChange={(e) => setJustificativa(e.target.value)}
            />
            {erro && <Aviso tipo="erro">{erro}</Aviso>}
        </Modal>
    )
}

export default ModalRetificar
