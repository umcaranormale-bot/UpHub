import { useState } from 'react'

import {
    criarDocumentoExigido,
    editarDocumentoExigido,
    removerDocumentoExigido,
    type DocumentoExigido,
} from '../../../api/documentosExigidos'
import { mensagemDeErro } from '../../../api/erros'
import {
    criarRequisito,
    removerRequisito,
    type CampoDisponivel,
    type CampoRequisito,
    type Operador,
    type Requisito,
    type ValorRequisito,
} from '../../../api/requisitos'
import { Campo, CampoLista } from '../../ui/Campo'
import { Aviso } from '../../ui/Estados'
import Botao from '../Botao'
import { Bloco } from '../Cabecalho'
import { formatarValor, rotuloDoCampo, rotuloDoOperador } from '../rotulos'
import Tabela, { Celula, Linha } from '../Tabela'

/**
 * Etapa 4 · regras de elegibilidade (campo, operador, valor, obrigatória) e os
 * documentos que a candidatura precisa anexar.
 */
export function EtapaRequisitos({
    oportunidadeId,
    versaoId,
    campos,
    requisitos,
    documentos,
    aoMudar,
}: {
    oportunidadeId: number
    versaoId: number
    campos: CampoDisponivel[]
    requisitos: Requisito[]
    documentos: DocumentoExigido[]
    aoMudar: () => Promise<void>
}) {
    const [erro, setErro] = useState<string | null>(null)

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

    const ordenados = [...requisitos].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))

    return (
        <div className="flex flex-col gap-5">
            <Bloco
                titulo="Regras de elegibilidade"
                apoio="Regras montadas na tela, sem código: campo, operador e valor. Uma regra obrigatória não atendida deixa a candidatura não elegível; faltar o dado deixa pendente, e você decide."
            >
                {ordenados.length > 0 && (
                    <Tabela rotulo="Regras de elegibilidade" colunas={['Campo', 'Operador', 'Valor', 'Tipo', '']} semMoldura>
                        {ordenados.map((r) => (
                            <Linha key={r.id}>
                                <Celula forte>{rotuloDoCampo(r.campo)}</Celula>
                                <Celula>{rotuloDoOperador(r.operador)}</Celula>
                                <Celula>{formatarValor(r.valor)}</Celula>
                                <Celula>
                                    <span
                                        className={`rounded-badge px-2 py-1 text-selo ${
                                            r.obrigatoria ? 'bg-status-enviada-fundo text-status-enviada-texto' : 'bg-page text-secundario'
                                        }`}
                                    >
                                        {r.obrigatoria ? 'Obrigatória' : 'Desejável'}
                                    </span>
                                </Celula>
                                <Celula>
                                    <Botao onClick={() => void executar(() => removerRequisito(oportunidadeId, versaoId, r.id))}>
                                        Remover
                                    </Botao>
                                </Celula>
                            </Linha>
                        ))}
                    </Tabela>
                )}
                {ordenados.length === 0 && (
                    <p className="text-apoio text-secundario">Sem regras: qualquer organização do tipo da trilha é elegível.</p>
                )}

                <NovaRegra
                    campos={campos}
                    aoCriar={(campo, operador, valor, obrigatoria) =>
                        executar(() => criarRequisito(oportunidadeId, versaoId, { campo, operador, valor, obrigatoria }))
                    }
                />
            </Bloco>

            <Bloco titulo="Documentos exigidos" apoio="O que a candidatura precisa anexar, como certidão negativa ou plano de negócio.">
                {documentos.length > 0 ? (
                    <ul className="flex flex-col divide-y divide-sutil rounded-card border border-sutil">
                        {documentos.map((d) => (
                            <li key={d.id} className="flex items-center gap-3 px-4 py-3">
                                <span className="min-w-0 flex-1 text-item text-titulo">{d.nome}</span>
                                <label className="flex items-center gap-2 text-apoio text-secundario">
                                    <input
                                        type="checkbox"
                                        checked={d.obrigatorio}
                                        onChange={(e) =>
                                            void executar(() =>
                                                editarDocumentoExigido(oportunidadeId, versaoId, d.id, { obrigatorio: e.target.checked }),
                                            )
                                        }
                                    />
                                    Obrigatório
                                </label>
                                <Botao onClick={() => void executar(() => removerDocumentoExigido(oportunidadeId, versaoId, d.id))}>
                                    Remover
                                </Botao>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-apoio text-secundario">Nenhum documento exigido.</p>
                )}
                <NovoDocumento
                    aoCriar={(nome, obrigatorio) => executar(() => criarDocumentoExigido(oportunidadeId, versaoId, { nome, obrigatorio }))}
                />
            </Bloco>

            {erro && <Aviso tipo="erro">{erro}</Aviso>}
        </div>
    )
}

function NovaRegra({
    campos,
    aoCriar,
}: {
    campos: CampoDisponivel[]
    aoCriar: (campo: CampoRequisito, operador: Operador, valor: ValorRequisito, obrigatoria: boolean) => Promise<boolean>
}) {
    const [campo, setCampo] = useState<CampoRequisito | ''>('')
    const [operador, setOperador] = useState<Operador | ''>('')
    const [valor, setValor] = useState('')
    const [obrigatoria, setObrigatoria] = useState(true)
    const [ocupado, setOcupado] = useState(false)

    const disponivel = campos.find((c) => c.campo === campo)
    const lista = operador === 'EM' || operador === 'FORA_DE'
    const numero = disponivel?.tipo === 'NUMERO'
    const pronto = !!campo && !!operador && valor.trim() !== ''

    function valorFinal(): ValorRequisito {
        const converter = (v: string) => (numero ? Number(v) : v)
        if (lista) return valor.split(',').map((v) => v.trim()).filter(Boolean).map(converter)
        return converter(valor.trim())
    }

    return (
        <form
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.4fr_auto_auto] items-end gap-3 rounded-card bg-page p-4"
            onSubmit={async (e) => {
                e.preventDefault()
                if (!pronto || !campo || !operador) return
                setOcupado(true)
                const ok = await aoCriar(campo, operador, valorFinal(), obrigatoria)
                setOcupado(false)
                if (ok) {
                    setValor('')
                    setOperador('')
                }
            }}
        >
            <CampoLista
                rotulo="Campo"
                value={campo}
                onChange={(e) => {
                    setCampo(e.target.value as CampoRequisito)
                    setOperador('')
                }}
            >
                <option value="">Escolha</option>
                {campos.map((c) => (
                    <option key={c.campo} value={c.campo}>
                        {c.descricao || rotuloDoCampo(c.campo)}
                    </option>
                ))}
            </CampoLista>
            <CampoLista
                rotulo="Operador"
                value={operador}
                disabled={!disponivel}
                onChange={(e) => setOperador(e.target.value as Operador)}
            >
                <option value="">Escolha</option>
                {(disponivel?.operadores ?? []).map((o) => (
                    <option key={o} value={o}>
                        {rotuloDoOperador(o)}
                    </option>
                ))}
            </CampoLista>
            <Campo
                rotulo={lista ? 'Valores (separados por vírgula)' : 'Valor'}
                type={numero && !lista ? 'number' : 'text'}
                value={valor}
                placeholder={lista ? 'ME, EPP' : undefined}
                onChange={(e) => setValor(e.target.value)}
            />
            <label className="flex h-[42px] items-center gap-2 text-apoio text-secundario">
                <input type="checkbox" checked={obrigatoria} onChange={(e) => setObrigatoria(e.target.checked)} />
                Obrigatória
            </label>
            <Botao type="submit" variante="primario" disabled={!pronto || ocupado} className="h-[42px]">
                + Adicionar regra
            </Botao>
        </form>
    )
}

function NovoDocumento({ aoCriar }: { aoCriar: (nome: string, obrigatorio: boolean) => Promise<boolean> }) {
    const [nome, setNome] = useState('')
    const [obrigatorio, setObrigatorio] = useState(true)
    const [ocupado, setOcupado] = useState(false)

    return (
        <form
            className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-end gap-3 rounded-card bg-page p-4"
            onSubmit={async (e) => {
                e.preventDefault()
                if (!nome.trim()) return
                setOcupado(true)
                const ok = await aoCriar(nome.trim(), obrigatorio)
                setOcupado(false)
                if (ok) setNome('')
            }}
        >
            <Campo rotulo="Documento" maxLength={120} value={nome} onChange={(e) => setNome(e.target.value)} />
            <label className="flex h-[42px] items-center gap-2 text-apoio text-secundario">
                <input type="checkbox" checked={obrigatorio} onChange={(e) => setObrigatorio(e.target.checked)} />
                Obrigatório
            </label>
            <Botao type="submit" variante="primario" disabled={!nome.trim() || ocupado} className="h-[42px]">
                + Adicionar documento
            </Botao>
        </form>
    )
}

export default EtapaRequisitos
