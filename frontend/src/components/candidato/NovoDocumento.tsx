import { useState, type FormEvent } from 'react'

import { cadastrarDocumento, type Documento } from '../../api/documentos'
import { mensagemDeErro } from '../../api/erros'
import { CustomButton } from '../CustomButton'
import { Campo } from '../ui/Campo'
import { Aviso } from '../ui/Estados'

/**
 * Cadastra um documento da organização (documentos.ts).
 *
 * O envio do arquivo em si ainda não existe na API: a tela lê o nome, o
 * tamanho e o tipo do arquivo escolhido e guarda só esses dados. O
 * armazenamentoRef aceita qualquer texto por enquanto.
 */
export function NovoDocumento({
    organizacaoId,
    tipoSugerido = '',
    aoCriar,
    aoCancelar,
}: {
    organizacaoId: number
    /** Ex.: o nome do documento exigido que este arquivo vai cumprir. */
    tipoSugerido?: string
    aoCriar: (documento: Documento) => void | Promise<void>
    aoCancelar?: () => void
}) {
    const [arquivo, setArquivo] = useState<File | null>(null)
    const [tipo, setTipo] = useState(tipoSugerido)
    const [validade, setValidade] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    async function enviar(e: FormEvent) {
        e.preventDefault()
        if (!arquivo) {
            setErro('Escolha o arquivo.')
            return
        }
        setEnviando(true)
        setErro(null)
        try {
            const documento = await cadastrarDocumento({
                organizacaoId,
                tipo: tipo.trim() || 'DOCUMENTO',
                nomeArquivo: arquivo.name,
                tamanhoBytes: Math.max(arquivo.size, 1),
                armazenamentoRef: `local/${arquivo.name}`,
                tipoMime: arquivo.type || undefined,
                validade: validade || undefined,
            })
            await aoCriar(documento)
            setArquivo(null)
            setValidade('')
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <form onSubmit={enviar} className="flex flex-col gap-3 rounded-card border border-sutil bg-page p-4">
            <Campo
                rotulo="Arquivo"
                type="file"
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                ajuda="Por enquanto, o sistema guarda o nome, o tamanho e o tipo do arquivo."
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Campo rotulo="Tipo do documento" value={tipo} maxLength={60} onChange={(e) => setTipo(e.target.value)} placeholder="Ex.: CERTIDAO" />
                <Campo rotulo="Validade (opcional)" type="date" value={validade} onChange={(e) => setValidade(e.target.value)} />
            </div>
            {erro && <Aviso tipo="erro">{erro}</Aviso>}
            <div className="flex gap-3">
                <CustomButton type="submit" variant="aprovar" size="auto" disabled={enviando}>
                    {enviando ? 'Enviando…' : 'Cadastrar documento'}
                </CustomButton>
                {aoCancelar && (
                    <CustomButton type="button" variant="neutro" size="auto" onClick={aoCancelar}>
                        Cancelar
                    </CustomButton>
                )}
            </div>
        </form>
    )
}

export default NovoDocumento
