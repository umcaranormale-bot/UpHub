import { useState } from 'react'

import { mensagemDeErro } from '../api/erros'
import {
    abrirResidencia,
    desafiosDaResidencia,
    editarResidencia,
    encerrarResidencia,
    listarResidencias,
    squadsDaResidencia,
    type Residencia,
} from '../api/residencias'
import CascaDoApp from '../components/CascaDoApp'
import { CustomButton } from '../components/CustomButton'
import SeloDeTrilha from '../components/SeloDeTrilha'
import SeloStatus from '../components/SeloStatus'
import { Campo, CampoTexto } from '../components/ui/Campo'
import { Aviso, Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import Modal from '../components/ui/Modal'
import { ANEL_FOCO, CARTAO, CARTAO_COM_RESPIRO, TRANSICAO_COR } from '../estilos/classes'
import { formatarData, trilhaDoSelo } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_GESTAO } from '../navegacao/menus'

/**
 * 78 · Gestão do PD — residências (abrir, código e squads) · rota /gestao/residencias
 *
 * A gestão abre a residência e passa o código às squads. Aqui ela vê as squads
 * que entraram e os desafios, edita enquanto está aberta e encerra.
 */

interface Formulario {
    nome: string
    descricao: string
    inicio: string
    fim: string
}

const VAZIO: Formulario = { nome: '', descricao: '', inicio: '', fim: '' }

// ---------- formulário de abrir / editar

function FormularioDeResidencia({
    editando,
    aoConcluir,
    aoCancelar,
}: {
    editando: Residencia | null
    aoConcluir: (r: Residencia, nova: boolean) => void
    aoCancelar: () => void
}) {
    const [campos, setCampos] = useState<Formulario>(
        editando
            ? { nome: editando.nome, descricao: editando.descricao ?? '', inicio: editando.inicio, fim: editando.fim }
            : VAZIO,
    )
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const periodoInvalido = campos.inicio !== '' && campos.fim !== '' && campos.fim < campos.inicio
    const pronto = campos.nome.trim() !== '' && campos.inicio !== '' && campos.fim !== '' && !periodoInvalido

    function mudar(campo: keyof Formulario, valor: string) {
        setCampos((atual) => ({ ...atual, [campo]: valor }))
    }

    async function enviar() {
        if (!pronto) return
        setEnviando(true)
        setErro(null)
        const dados = {
            nome: campos.nome.trim(),
            descricao: campos.descricao.trim() || undefined,
            inicio: campos.inicio,
            fim: campos.fim,
        }
        try {
            const r = editando ? await editarResidencia(editando.id, dados) : await abrirResidencia(dados)
            if (!editando) setCampos(VAZIO)
            aoConcluir(r, !editando)
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <section aria-labelledby="titulo-formulario" className={`${CARTAO_COM_RESPIRO} flex flex-col gap-4`}>
            <h2 id="titulo-formulario" className="font-display text-bloco text-titulo">
                {editando ? `Editar ${editando.nome}` : 'Abrir residência'}
            </h2>
            <Campo rotulo="Nome" value={campos.nome} maxLength={200} onChange={(e) => mudar('nome', e.target.value)} />
            <CampoTexto rotulo="Descrição (opcional)" rows={3} value={campos.descricao} onChange={(e) => mudar('descricao', e.target.value)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo rotulo="Início" type="date" value={campos.inicio} onChange={(e) => mudar('inicio', e.target.value)} />
                <Campo rotulo="Fim" type="date" value={campos.fim} onChange={(e) => mudar('fim', e.target.value)} />
            </div>
            {periodoInvalido && <Aviso tipo="erro">O fim não pode ser antes do início.</Aviso>}
            {!editando && <p className="text-legenda text-secundario">O código RES-XXXXXX é gerado ao abrir.</p>}
            {erro && <Aviso tipo="erro">{erro}</Aviso>}
            <div className="flex gap-3">
                <CustomButton variant="aprovar" size="auto" type="button" disabled={!pronto || enviando} onClick={() => void enviar()}>
                    {enviando ? 'Salvando…' : editando ? 'Salvar mudanças' : 'Abrir residência'}
                </CustomButton>
                {editando && (
                    <CustomButton variant="neutro" size="auto" type="button" onClick={aoCancelar}>
                        Cancelar
                    </CustomButton>
                )}
            </div>
        </section>
    )
}

// ---------- squads e desafios da residência escolhida

function DetalheDaResidencia({ residencia }: { residencia: Residencia }) {
    const { dados, carregando, erro, recarregar } = useDados(
        () => Promise.all([squadsDaResidencia(residencia.id), desafiosDaResidencia(residencia.id)]),
        [residencia.id, residencia.squads, residencia.desafios],
    )
    const [squads, desafios] = dados ?? [[], []]

    return (
        <section aria-labelledby="titulo-detalhe" className={CARTAO_COM_RESPIRO}>
            <h2 id="titulo-detalhe" className="font-display text-bloco text-titulo">
                {residencia.nome}
            </h2>
            <p className="mt-1 text-apoio text-secundario">
                Código para as squads: <strong className="text-titulo">{residencia.codigo ?? '—'}</strong>
            </p>

            {carregando && !dados ? (
                <Carregando />
            ) : erro ? (
                <div className="mt-4">
                    <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />
                </div>
            ) : (
                <>
                    <h3 className="mt-5 text-item text-titulo">Squads ({squads.length})</h3>
                    {squads.length === 0 ? (
                        <p className="mt-2 text-apoio text-secundario">Nenhuma squad entrou com o código ainda.</p>
                    ) : (
                        <ul className="mt-2 overflow-hidden rounded-card border border-sutil">
                            {squads.map((s) => (
                                <li key={s.organizacaoId} className="border-b border-sutil px-4 py-3 last:border-b-0">
                                    <p className="text-item text-titulo">{s.nome}</p>
                                    {s.descricao && <p className="mt-1 text-legenda text-secundario">{s.descricao}</p>}
                                </li>
                            ))}
                        </ul>
                    )}

                    <h3 className="mt-5 text-item text-titulo">Desafios ({desafios.length})</h3>
                    {desafios.length === 0 ? (
                        <p className="mt-2 text-apoio text-secundario">Nenhum desafio publicado nesta residência.</p>
                    ) : (
                        <ul className="mt-2 overflow-hidden rounded-card border border-sutil">
                            {desafios.map((d) => (
                                <li key={d.id} className="flex items-center gap-3 border-b border-sutil px-4 py-3 last:border-b-0">
                                    <span className="min-w-0 flex-1 text-item text-titulo">{d.titulo}</span>
                                    <SeloDeTrilha trilha={trilhaDoSelo(d.trilhaCodigo)} />
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </section>
    )
}

// ---------- a página

function GestaoResidencias() {
    const { dados: residencias, carregando, erro, recarregar } = useDados(() => listarResidencias(), [])
    const [selecionada, setSelecionada] = useState<number | null>(null)
    const [editando, setEditando] = useState<Residencia | null>(null)
    const [encerrando, setEncerrando] = useState<Residencia | null>(null)
    const [enviando, setEnviando] = useState(false)
    const [erroAoEncerrar, setErroAoEncerrar] = useState<string | null>(null)
    const [aviso, setAviso] = useState<string | null>(null)

    const lista = residencias ?? []
    const escolhida = lista.find((r) => r.id === selecionada) ?? lista.find((r) => r.estado === 'ABERTA') ?? lista[0]

    async function encerrar() {
        if (!encerrando) return
        setEnviando(true)
        setErroAoEncerrar(null)
        try {
            const r = await encerrarResidencia(encerrando.id)
            setEncerrando(null)
            if (editando?.id === r.id) setEditando(null)
            setAviso(`${r.nome} foi encerrada. Ela não aceita squads novas nem desafios novos.`)
            await recarregar()
        } catch (e) {
            setErroAoEncerrar(mensagemDeErro(e))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <CascaDoApp itens={MENU_GESTAO} voltarPara="/gestao">
            <h1 className="font-display text-tela text-titulo">Residências</h1>
            <p className="mt-2 text-apoio text-secundario">
                Abra a residência, passe o código às squads e acompanhe os desafios de formação.
            </p>

            {aviso && (
                <div className="mt-6">
                    <Aviso tipo="sucesso">{aviso}</Aviso>
                </div>
            )}

            <div className="mt-6">
                {carregando && !residencias ? (
                    <Carregando />
                ) : erro && !residencias ? (
                    <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />
                ) : lista.length === 0 ? (
                    <Vazio titulo="Nenhuma residência aberta ainda">Use o formulário abaixo para abrir a primeira.</Vazio>
                ) : (
                    <section aria-label="Residências" className={`relative overflow-x-auto ${CARTAO}`}>
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-sutil bg-page">
                                    {['Residência', 'Código', 'Período', 'Squads', 'Desafios', 'Situação', 'Ações'].map((c) => (
                                        <th key={c} scope="col" className="px-card py-3 text-selo text-secundario uppercase">
                                            {c}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {lista.map((r) => {
                                    const ativa = r.id === escolhida?.id
                                    const aberta = r.estado === 'ABERTA'
                                    return (
                                        <tr
                                            key={r.id}
                                            className={`border-b border-sutil last:border-b-0 ${TRANSICAO_COR} ${ativa ? 'bg-acento-suave' : 'hover:bg-page'}`}
                                        >
                                            <td className="px-card py-4">
                                                <p className="text-item text-titulo">{r.nome}</p>
                                                {r.descricao && <p className="mt-1 text-legenda text-secundario">{r.descricao}</p>}
                                            </td>
                                            <td className="px-card py-4 text-apoio text-titulo">{r.codigo ?? '—'}</td>
                                            <td className="px-card py-4 text-apoio text-secundario">
                                                {formatarData(r.inicio)} a {formatarData(r.fim)}
                                            </td>
                                            <td className="px-card py-4 text-apoio text-titulo">{r.squads}</td>
                                            <td className="px-card py-4 text-apoio text-titulo">{r.desafios}</td>
                                            <td className="px-card py-4">
                                                <SeloStatus
                                                    status={aberta ? 'aprovada' : 'rascunho'}
                                                    rotulo={aberta ? 'Aberta' : `Encerrada em ${formatarData(r.encerradaEm)}`}
                                                    comPonto
                                                />
                                            </td>
                                            <td className="px-card py-4">
                                                <span className="flex flex-wrap gap-3">
                                                    <button
                                                        type="button"
                                                        aria-pressed={ativa}
                                                        onClick={() => setSelecionada(r.id)}
                                                        className={`rounded-card text-apoio font-semibold text-acento hover:text-titulo ${ANEL_FOCO}`}
                                                    >
                                                        Ver<span className="sr-only"> squads e desafios de {r.nome}</span>
                                                    </button>
                                                    {aberta && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setAviso(null)
                                                                    setEditando(r)
                                                                }}
                                                                className={`rounded-card text-apoio font-semibold text-acento hover:text-titulo ${ANEL_FOCO}`}
                                                            >
                                                                Editar<span className="sr-only"> {r.nome}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setErroAoEncerrar(null)
                                                                    setEncerrando(r)
                                                                }}
                                                                className={`rounded-card text-apoio font-semibold text-status-reprovada-texto hover:text-titulo ${ANEL_FOCO}`}
                                                            >
                                                                Encerrar<span className="sr-only"> {r.nome}</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </section>
                )}
            </div>

            <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                <FormularioDeResidencia
                    key={editando?.id ?? 'nova'}
                    editando={editando}
                    aoCancelar={() => setEditando(null)}
                    aoConcluir={(r, nova) => {
                        setEditando(null)
                        setSelecionada(r.id)
                        setAviso(
                            nova
                                ? `Residência ${r.nome} aberta. Passe o código ${r.codigo ?? ''} às squads para elas entrarem.`
                                : `Residência ${r.nome} atualizada.`,
                        )
                        void recarregar()
                    }}
                />
                {escolhida && <DetalheDaResidencia residencia={escolhida} />}
            </div>

            <p className="mt-6 rounded-card bg-page p-5 text-apoio text-secundario">
                Só a gestão abre, edita e encerra residências. Encerrada, a residência não aceita squads novas nem desafios
                novos.
            </p>

            <Modal
                aberto={encerrando !== null}
                titulo={`Encerrar ${encerrando?.nome ?? 'residência'}`}
                descricao="Depois de encerrada, a residência não aceita squads novas nem desafios novos, e não pode ser editada. As squads e os desafios que já estão nela continuam."
                aoFechar={() => setEncerrando(null)}
                acoes={
                    <>
                        <CustomButton variant="neutro" size="auto" type="button" onClick={() => setEncerrando(null)}>
                            Cancelar
                        </CustomButton>
                        <CustomButton variant="reprovar" size="auto" type="button" disabled={enviando} onClick={() => void encerrar()}>
                            {enviando ? 'Encerrando…' : 'Encerrar residência'}
                        </CustomButton>
                    </>
                }
            >
                {erroAoEncerrar && <Aviso tipo="erro">{erroAoEncerrar}</Aviso>}
            </Modal>
        </CascaDoApp>
    )
}

export default GestaoResidencias
