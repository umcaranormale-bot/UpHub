import { useState } from 'react'

import { mensagemDeErro } from '../../api/erros'
import { CustomButton } from '../CustomButton'
import { Aviso } from '../ui/Estados'
import Modal from '../ui/Modal'

/**
 * Modal · aprovar candidatura e Modal · reprovar candidatura — a confirmação
 * antes de assinar. Depois de assinada, a avaliação não muda mais.
 */
interface ModalDecisaoProps {
    decisao: 'APROVADA' | 'REPROVADA' | null
    organizacaoNome: string
    notaFinal: string
    parecer: string
    aoFechar: () => void
    /** Salva e assina; lança o erro da API para o modal mostrar. */
    aoConfirmar: () => Promise<void>
}

export function ModalDecisao({ decisao, organizacaoNome, notaFinal, parecer, aoFechar, aoConfirmar }: ModalDecisaoProps) {
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const aprovar = decisao === 'APROVADA'

    async function confirmar() {
        setEnviando(true)
        setErro(null)
        try {
            await aoConfirmar()
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <Modal
            aberto={decisao !== null}
            titulo={aprovar ? 'Aprovar candidatura' : 'Reprovar candidatura'}
            descricao={
                <>
                    Você assina a {aprovar ? 'aprovação' : 'reprovação'} de <strong>{organizacaoNome}</strong> com nota
                    final <strong>{notaFinal}</strong> (de 0 a 100). Quando todos os avaliadores da rodada assinarem, a
                    candidatura segue com o resultado da maioria. Depois de assinada, a avaliação não muda: só o parecer
                    pode ser retificado, com justificativa.
                </>
            }
            aoFechar={aoFechar}
            acoes={
                <>
                    <CustomButton variant="neutro" size="auto" type="button" onClick={aoFechar}>
                        Cancelar
                    </CustomButton>
                    <CustomButton
                        variant={aprovar ? 'aprovar' : 'reprovar'}
                        size="auto"
                        type="button"
                        disabled={enviando}
                        onClick={() => void confirmar()}
                    >
                        {enviando ? 'Assinando…' : aprovar ? 'Assinar aprovação' : 'Assinar reprovação'}
                    </CustomButton>
                </>
            }
        >
            <div className="rounded-card bg-page p-4">
                <p className="text-legenda text-secundario">Parecer que o candidato vai ler</p>
                <p className="mt-1 whitespace-pre-line text-apoio text-titulo">{parecer}</p>
            </div>
            {erro && <Aviso tipo="erro">{erro}</Aviso>}
        </Modal>
    )
}

export default ModalDecisao
