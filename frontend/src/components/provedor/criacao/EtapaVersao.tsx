import { useState } from 'react'

import { mensagemDeErro } from '../../../api/erros'
import type { TrilhaCodigo } from '../../../api/trilhas'
import { editarVersao, type Versao, type VersaoEdicao } from '../../../api/versoes'
import { hoje } from '../../../estilos/formatos'
import { Campo, CampoLista, CampoTexto } from '../../ui/Campo'
import { Aviso } from '../../ui/Estados'
import Botao from '../Botao'
import { Bloco } from '../Cabecalho'

/** Etapa 2 · prazo de envio, vagas, nota mínima, validade da nota, prazo de ajuste e o escopo. */
export function EtapaVersao({
    oportunidadeId,
    trilha,
    versao,
    aoSalvar,
}: {
    oportunidadeId: number
    trilha: TrilhaCodigo
    versao: Versao
    aoSalvar: (versao: Versao) => void
}) {
    const texto = (n: number | null) => (n === null ? '' : String(n))
    const [prazoEnvio, setPrazoEnvio] = useState(versao.prazoEnvio ?? '')
    const [vagas, setVagas] = useState(texto(versao.quantidadeVagas))
    const [notaMinima, setNotaMinima] = useState(texto(versao.notaMinima))
    const [validade, setValidade] = useState(String(versao.validadeNotaDias))
    const [prazoAjuste, setPrazoAjuste] = useState(String(versao.prazoAjusteDias))
    const [escopo, setEscopo] = useState(versao.escopo ?? '')
    const [entregaveis, setEntregaveis] = useState(versao.entregaveis ?? '')
    const [carga, setCarga] = useState(texto(versao.cargaSemanalHoras))
    const [duracao, setDuracao] = useState(texto(versao.duracaoSemanas))
    const [salvando, setSalvando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    async function salvar() {
        // manda só o que foi preenchido: campo ausente fica como está
        const dados: VersaoEdicao = {
            validadeNotaDias: Number(validade) as 30 | 60 | 90,
            prazoAjusteDias: Number(prazoAjuste),
            escopo,
            entregaveis,
        }
        if (prazoEnvio) dados.prazoEnvio = prazoEnvio
        if (vagas) dados.quantidadeVagas = Number(vagas)
        if (notaMinima) dados.notaMinima = Number(notaMinima)
        if (carga) dados.cargaSemanalHoras = Number(carga)
        if (duracao) dados.duracaoSemanas = Number(duracao)

        setSalvando(true)
        setErro(null)
        try {
            aoSalvar(await editarVersao(oportunidadeId, versao.id, dados))
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setSalvando(false)
        }
    }

    return (
        <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
                e.preventDefault()
                void salvar()
            }}
        >
            <Bloco titulo="Prazos e vagas" apoio={`Versão ${versao.numero} · em rascunho até a publicação.`}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Campo
                        rotulo="Inscrições até"
                        type="date"
                        min={hoje()}
                        value={prazoEnvio}
                        onChange={(e) => setPrazoEnvio(e.target.value)}
                        ajuda="Obrigatório para publicar. Depois de publicada, é o único campo que muda."
                    />
                    <Campo
                        rotulo="Vagas"
                        type="number"
                        min={1}
                        value={vagas}
                        onChange={(e) => setVagas(e.target.value)}
                        ajuda="Vazio = sem limite. Precisa estar preenchido para reservar vagas."
                    />
                    <Campo
                        rotulo="Nota mínima aceita"
                        type="number"
                        min={0}
                        max={999.99}
                        step="0.01"
                        value={notaMinima}
                        onChange={(e) => setNotaMinima(e.target.value)}
                    />
                    <CampoLista
                        rotulo="Validade máxima da nota"
                        value={validade}
                        onChange={(e) => setValidade(e.target.value)}
                        ajuda="A nota é da pessoa. O padrão é 90 dias."
                    >
                        <option value="30">30 dias</option>
                        <option value="60">60 dias</option>
                        <option value="90">90 dias</option>
                    </CampoLista>
                    <Campo
                        rotulo="Prazo do ajuste (dias)"
                        type="number"
                        min={3}
                        max={15}
                        value={prazoAjuste}
                        onChange={(e) => setPrazoAjuste(e.target.value)}
                        ajuda="De 3 a 15 dias, igual para todos. Contado de quando a rodada fecha em ajuste."
                    />
                </div>
            </Bloco>

            <Bloco
                titulo="Escopo e entregáveis"
                apoio={trilha === 'FORMACAO' ? 'Na Formação, o matching compara o escopo e os entregáveis com as competências da squad.' : undefined}
            >
                <div className="flex flex-col gap-4">
                    <CampoTexto rotulo="Escopo" value={escopo} onChange={(e) => setEscopo(e.target.value)} />
                    <CampoTexto rotulo="Entregáveis" value={entregaveis} onChange={(e) => setEntregaveis(e.target.value)} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Campo
                            rotulo="Carga semanal (horas)"
                            type="number"
                            min={1}
                            value={carga}
                            onChange={(e) => setCarga(e.target.value)}
                        />
                        <Campo
                            rotulo="Duração (semanas)"
                            type="number"
                            min={1}
                            value={duracao}
                            onChange={(e) => setDuracao(e.target.value)}
                        />
                    </div>
                </div>
            </Bloco>

            {erro && <Aviso tipo="erro">{erro}</Aviso>}

            <div className="flex justify-end">
                <Botao type="submit" variante="primario" disabled={salvando}>
                    {salvando ? 'Salvando…' : 'Salvar e seguir'}
                </Botao>
            </div>
        </form>
    )
}

export default EtapaVersao
