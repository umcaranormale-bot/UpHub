import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'

import CascaDoApp from '../components/CascaDoApp'
import { CustomButton } from '../components/CustomButton'
import Modal from '../components/ui/Modal'
import { Aviso, Carregando, ErroNaTela } from '../components/ui/Estados'
import { Campo, CampoTexto } from '../components/ui/Campo'
import { SeloDaSprint } from '../components/squad/Sprints'
import {
    carregarAcompanhado,
    formatarHoras,
    formatarMinutos,
    mesAtual,
    nomeDoAcompanhado,
    nomeDoMes,
} from '../components/mentor/dados'
import { mensagemDeErro } from '../api/erros'
import { avaliarEntrega, criarSprint, iniciarSprint, type Sprint } from '../api/sprints'
import { useDados } from '../hooks/useDados'
import { MENU_MENTOR } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'
import { ANEL_FOCO, CARTAO, CARTAO_COM_RESPIRO, TRANSICAO_COR } from '../estilos/classes'
import { formatarData, hoje } from '../estilos/formatos'

/**
 * 77 · Mentor — sprints, avaliação da entrega e sessões · rota /mentor/acompanhados/:id/sprints
 *
 * O mentor planeja e inicia as sprints, avalia a entrega (nota de 0 a 10 e
 * feedback) e vê as sessões do mês. Tudo só com a candidatura em acompanhamento.
 */

const CABECALHO_TABELA = 'px-card py-3 text-left text-selo uppercase text-secundario'
const BOTAO_TEXTO = `rounded-card px-1 text-apoio text-acento ${TRANSICAO_COR} hover:text-titulo disabled:opacity-50 ${ANEL_FOCO}`

function AvaliacaoDaEntrega({ sprint, aoAvaliar }: { sprint: Sprint; aoAvaliar: (nota: number, feedback: string) => Promise<void> }) {
    const [nota, setNota] = useState('')
    const [feedback, setFeedback] = useState('')
    const [enviando, setEnviando] = useState(false)
    const valor = Number(nota.replace(',', '.'))
    const notaValida = nota.trim() !== '' && Number.isFinite(valor) && valor >= 0 && valor <= 10
    return (
        <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={async (e) => {
                e.preventDefault()
                setEnviando(true)
                await aoAvaliar(valor, feedback)
                setEnviando(false)
            }}
        >
            <div className="rounded-card bg-page p-4">
                <p className="text-item text-titulo">Entrega do candidato</p>
                <p className="mt-1 whitespace-pre-line text-apoio text-secundario">{sprint.entregaDescricao}</p>
                <p className="mt-1 text-legenda text-secundario">registrada em {formatarData(sprint.entregaRegistradaEm)}</p>
            </div>
            <Campo
                rotulo="Nota da entrega (0 a 10)"
                type="number"
                min={0}
                max={10}
                step={0.1}
                inputMode="decimal"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                required
            />
            <CampoTexto rotulo="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} required />
            <div>
                <CustomButton type="submit" variant="aprovar" size="auto" disabled={!notaValida || !feedback.trim() || enviando}>
                    {enviando ? 'Registrando…' : 'Registrar avaliação'}
                </CustomButton>
            </div>
        </form>
    )
}

function MentorSprints() {
    const { id } = useParams()
    const alocacaoId = Number(id)
    const { perfilAtivo } = useSessao()
    const vinculoId = perfilAtivo?.vinculo.id
    const { dados, carregando, erro, recarregar } = useDados(
        () => carregarAcompanhado(alocacaoId, vinculoId),
        [alocacaoId, vinculoId],
        !!vinculoId && Number.isFinite(alocacaoId),
    )
    const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)
    const [ocupado, setOcupado] = useState(false)
    const [avaliandoId, setAvaliandoId] = useState<number | null>(null)
    const [novaAberta, setNovaAberta] = useState(false)
    const [prazoNova, setPrazoNova] = useState('')
    const fecharNova = useCallback(() => setNovaAberta(false), [])

    async function executar(acao: () => Promise<unknown>, sucesso: string) {
        setOcupado(true)
        setAviso(null)
        try {
            await acao()
            await recarregar()
            setAviso({ tipo: 'sucesso', texto: sucesso })
            return true
        } catch (e) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
            return false
        } finally {
            setOcupado(false)
        }
    }

    if (!dados) {
        return (
            <CascaDoApp itens={MENU_MENTOR} voltarPara={`/mentor/acompanhados/${alocacaoId}`}>
                {carregando && <Carregando />}
                {erro && <ErroNaTela mensagem={erro} tentarDeNovo={recarregar} />}
            </CascaDoApp>
        )
    }

    const { item, sprints, sessoes, horas } = dados
    const { alocacao, candidatura, desafio } = item
    const candidaturaId = alocacao.candidaturaId
    const anda = alocacao.situacao === 'ACEITA' && candidatura?.estado === 'EM_ACOMPANHAMENTO'
    const temEmAndamento = sprints.some((s) => s.estado === 'EM_ANDAMENTO')
    const entregues = sprints.filter((s) => s.estado === 'ENTREGUE')
    const avaliando = entregues.find((s) => s.id === avaliandoId) ?? entregues[0] ?? null
    const mes = horas?.mes ?? mesAtual()
    const doMes = sessoes.filter((s) => s.dataSessao.startsWith(mes))

    return (
        <CascaDoApp itens={MENU_MENTOR} voltarPara={`/mentor/acompanhados/${alocacao.id}`}>
            <div className="flex flex-wrap items-start gap-5">
                <div className="min-w-0 flex-1">
                    <h1 className="font-display text-tela text-titulo">Sprints · {nomeDoAcompanhado(item)}</h1>
                    <p className="mt-2 text-apoio text-secundario">
                        {[desafio?.titulo, candidatura?.estado === 'EM_ACOMPANHAMENTO' ? 'em acompanhamento' : null]
                            .filter(Boolean)
                            .join(' · ')}{' '}
                        · você acompanha com {formatarHoras(alocacao.horasPrevistasMes)} por mês
                    </p>
                </div>
                {anda && (
                    <CustomButton
                        type="button"
                        variant="neutro"
                        size="auto"
                        onClick={() => {
                            setPrazoNova('')
                            setAviso(null)
                            setNovaAberta(true)
                        }}
                    >
                        Nova sprint
                    </CustomButton>
                )}
            </div>

            {aviso && (
                <div className="mt-4">
                    <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
                </div>
            )}
            {!anda && (
                <div className="mt-4">
                    <Aviso tipo="erro">As sprints só andam com a candidatura em acompanhamento. Aqui fica só o histórico.</Aviso>
                </div>
            )}

            <section aria-label="Sprints" className={`mt-6 relative overflow-x-auto ${CARTAO}`}>
                {sprints.length === 0 ? (
                    <p className="p-card text-apoio text-secundario">
                        Nenhuma sprint planejada ainda.{anda ? ' Use “Nova sprint” para planejar a primeira.' : ''}
                    </p>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-sutil">
                            <tr>
                                <th scope="col" className={CABECALHO_TABELA}>
                                    Sprint
                                </th>
                                <th scope="col" className={CABECALHO_TABELA}>
                                    Prazo de entrega
                                </th>
                                <th scope="col" className={CABECALHO_TABELA}>
                                    Situação
                                </th>
                                <th scope="col" className={CABECALHO_TABELA}>
                                    Nota da entrega
                                </th>
                                <th scope="col" className={CABECALHO_TABELA}>
                                    Feedback
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sprints.map((s) => (
                                <tr key={s.id} className="border-b border-sutil last:border-b-0">
                                    <td className="px-card py-3 text-item text-titulo">Sprint {s.numero}</td>
                                    <td className="px-card py-3 text-apoio text-secundario">{formatarData(s.prazoEntrega)}</td>
                                    <td className="px-card py-3">
                                        <SeloDaSprint estado={s.estado} />
                                    </td>
                                    <td className="px-card py-3 text-apoio text-secundario">{s.notaEntrega ?? '—'}</td>
                                    <td className="px-card py-3 text-apoio text-secundario">
                                        {s.estado === 'AVALIADA' && s.feedbackEntrega}
                                        {s.estado === 'ENTREGUE' &&
                                            (anda ? (
                                                <button type="button" className={BOTAO_TEXTO} onClick={() => setAvaliandoId(s.id)}>
                                                    Avaliar entrega
                                                </button>
                                            ) : (
                                                'aguardando avaliação'
                                            ))}
                                        {s.estado === 'PLANEJADA' &&
                                            (anda && !temEmAndamento ? (
                                                <button
                                                    type="button"
                                                    className={BOTAO_TEXTO}
                                                    disabled={ocupado}
                                                    onClick={() =>
                                                        executar(() => iniciarSprint(s.id), `Sprint ${s.numero} em andamento.`)
                                                    }
                                                >
                                                    Iniciar sprint
                                                </button>
                                            ) : (
                                                '—'
                                            ))}
                                        {s.estado === 'EM_ANDAMENTO' && 'aguardando a entrega'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
                <section aria-labelledby="titulo-avaliar" className={CARTAO_COM_RESPIRO}>
                    {avaliando && anda ? (
                        <>
                            <h2 id="titulo-avaliar" className="font-display text-bloco text-titulo">
                                Avaliar a entrega da sprint {avaliando.numero}
                            </h2>
                            <AvaliacaoDaEntrega
                                key={avaliando.id}
                                sprint={avaliando}
                                aoAvaliar={async (nota, feedback) => {
                                    await executar(
                                        () => avaliarEntrega(avaliando.id, { nota, feedback }),
                                        `Entrega da sprint ${avaliando.numero} avaliada.`,
                                    )
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <h2 id="titulo-avaliar" className="font-display text-bloco text-titulo">
                                Avaliação da entrega
                            </h2>
                            <p className="mt-2 text-apoio text-secundario">
                                Nenhuma entrega aguardando a sua avaliação. Quando a squad registrar a entrega da sprint em
                                andamento, ela aparece aqui.
                            </p>
                        </>
                    )}
                </section>

                <section aria-labelledby="titulo-sessoes" className={CARTAO_COM_RESPIRO}>
                    <h2 id="titulo-sessoes" className="font-display text-bloco text-titulo">
                        Sessões de {nomeDoMes(mes)}
                    </h2>
                    {doMes.length === 0 ? (
                        <p className="mt-2 text-apoio text-secundario">Nenhuma sessão registrada neste mês.</p>
                    ) : (
                        <div className={`mt-4 relative overflow-x-auto ${CARTAO} shadow-none`}>
                            <table className="w-full">
                                <thead className="border-b border-sutil">
                                    <tr>
                                        <th scope="col" className={CABECALHO_TABELA}>
                                            Data
                                        </th>
                                        <th scope="col" className={CABECALHO_TABELA}>
                                            Duração
                                        </th>
                                        <th scope="col" className={CABECALHO_TABELA}>
                                            Sprint
                                        </th>
                                        <th scope="col" className={CABECALHO_TABELA}>
                                            Feedback
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doMes.map((s) => (
                                        <tr key={s.id} className="border-b border-sutil last:border-b-0">
                                            <td className="px-card py-3 text-item text-titulo">{formatarData(s.dataSessao)}</td>
                                            <td className="px-card py-3 text-apoio text-secundario">{formatarMinutos(s.duracaoMinutos)}</td>
                                            <td className="px-card py-3 text-apoio text-secundario">{s.sprintNumero ?? '—'}</td>
                                            <td className="px-card py-3 text-apoio text-secundario">
                                                {s.situacao === 'RASCUNHO' ? 'rascunho · ' : ''}
                                                {s.feedback ?? '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {horas && (
                        <p className="mt-3 text-apoio text-acento">
                            {formatarMinutos(horas.minutosRealizados)} assinadas de {formatarHoras(horas.horasPrevistasMes)} previstas
                            no mês
                        </p>
                    )}
                    {anda && (
                        <div className="mt-4">
                            <CustomButton variant="neutro" size="auto" to={`/mentor/horas?alocacao=${alocacao.id}`}>
                                Registrar sessão
                            </CustomButton>
                        </div>
                    )}
                </section>
            </div>

            <p className="mt-5 rounded-card bg-page px-card py-3 text-apoio text-secundario">
                Só o mentor que aceitou acompanhar avalia a entrega, e só a sprint entregue recebe avaliação. Nota e feedback
                são obrigatórios. Uma sprint por vez em andamento.
            </p>

            <Modal
                aberto={novaAberta}
                titulo="Planejar nova sprint"
                descricao="O número da sprint é automático. O prazo de entrega é opcional e não pode ser no passado."
                aoFechar={fecharNova}
                acoes={
                    <>
                        <CustomButton type="button" variant="neutro" size="auto" onClick={fecharNova}>
                            Cancelar
                        </CustomButton>
                        <CustomButton
                            type="button"
                            variant="aprovar"
                            size="auto"
                            disabled={ocupado}
                            onClick={async () => {
                                const ok = await executar(
                                    () => criarSprint(candidaturaId, prazoNova || undefined),
                                    'Sprint planejada. Inicie quando a anterior estiver entregue.',
                                )
                                if (ok) setNovaAberta(false)
                            }}
                        >
                            Planejar sprint
                        </CustomButton>
                    </>
                }
            >
                <Campo
                    rotulo="Prazo de entrega (opcional)"
                    type="date"
                    min={hoje()}
                    value={prazoNova}
                    onChange={(e) => setPrazoNova(e.target.value)}
                />
                {aviso?.tipo === 'erro' && <Aviso tipo="erro">{aviso.texto}</Aviso>}
            </Modal>
        </CascaDoApp>
    )
}

export default MentorSprints
