import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import CascaDoApp from '../components/CascaDoApp'
import SeloStatus from '../components/SeloStatus'
import { CustomButton } from '../components/CustomButton'
import Modal from '../components/ui/Modal'
import { Aviso, Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { Campo, CampoLista, CampoTexto } from '../components/ui/Campo'
import { LinkDeTexto } from '../components/squad/AvisoComLink'
import {
    alocacoesDetalhadas,
    carregarAcompanhado,
    formatarHoras,
    formatarMinutos,
    nomeDoAcompanhado,
    nomeDoMes,
} from '../components/mentor/dados'
import { mensagemDeErro } from '../api/erros'
import { apagarSessao, assinarSessao, registrarSessao, type SessaoMentoria } from '../api/sessoes'
import type { Sprint } from '../api/sprints'
import { useDados } from '../hooks/useDados'
import { MENU_MENTOR } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'
import { ANEL_FOCO, CARTAO, CARTAO_COM_RESPIRO, TRANSICAO_COR } from '../estilos/classes'
import { formatarData, hoje } from '../estilos/formatos'

/**
 * 40 · Mentor — registrar feedback e horas · rota /mentor/horas (?alocacao=)
 *
 * Tela de tarefa: o mentor registra a sessão que já aconteceu (data, duração,
 * sprint e feedback) e assina. Assinada, ela não muda mais e entra nas horas
 * do mês; em rascunho, só o mentor vê.
 */

const BOTAO_TEXTO = `rounded-card px-1 text-apoio text-acento ${TRANSICAO_COR} hover:text-titulo disabled:opacity-50 ${ANEL_FOCO}`

interface Registro {
    dataSessao: string
    duracaoMinutos: number
    sprintId?: number
    feedback?: string
}

function FormularioDeSessao({
    sprints,
    ocupado,
    aoSalvar,
}: {
    sprints: Sprint[]
    ocupado: boolean
    aoSalvar: (registro: Registro, assinar: boolean) => Promise<boolean>
}) {
    const emAndamento = sprints.find((s) => s.estado === 'EM_ANDAMENTO')
    const [data, setData] = useState(hoje())
    const [duracao, setDuracao] = useState('60')
    const [sprintId, setSprintId] = useState(emAndamento ? String(emAndamento.id) : '')
    const [feedback, setFeedback] = useState('')
    const minutos = Number(duracao)
    const valido = !!data && Number.isInteger(minutos) && minutos >= 1 && minutos <= 600
    const podeAssinar = valido && feedback.trim().length > 0

    async function salvar(assinar: boolean) {
        const ok = await aoSalvar(
            {
                dataSessao: data,
                duracaoMinutos: minutos,
                sprintId: sprintId ? Number(sprintId) : undefined,
                feedback: feedback.trim() || undefined,
            },
            assinar,
        )
        if (ok) setFeedback('')
    }

    return (
        <form
            className="mt-5 flex flex-col gap-5"
            onSubmit={(e) => {
                e.preventDefault()
                void salvar(true)
            }}
        >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Campo
                    rotulo="Data da sessão"
                    type="date"
                    max={hoje()}
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                    ajuda="A sessão é registrada depois que acontece."
                />
                <Campo
                    rotulo="Duração (minutos)"
                    type="number"
                    min={1}
                    max={600}
                    step={1}
                    value={duracao}
                    onChange={(e) => setDuracao(e.target.value)}
                    required
                    ajuda={valido ? formatarMinutos(minutos) : 'De 1 a 600 minutos.'}
                />
                <CampoLista rotulo="Sprint (opcional)" value={sprintId} onChange={(e) => setSprintId(e.target.value)}>
                    <option value="">Sem sprint</option>
                    {sprints.map((s) => (
                        <option key={s.id} value={s.id}>
                            Sprint {s.numero}
                            {s.prazoEntrega ? ` · entrega até ${formatarData(s.prazoEntrega)}` : ''}
                        </option>
                    ))}
                </CampoLista>
            </div>
            <CampoTexto
                rotulo="Feedback (texto final seu)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                ajuda="Para assinar, o feedback é obrigatório. A squad só vê depois de assinado."
            />
            <div className="flex items-center gap-4 border-t border-sutil pt-5">
                <CustomButton type="submit" variant="aprovar" size="auto" disabled={!podeAssinar || ocupado}>
                    Salvar e assinar
                </CustomButton>
                <CustomButton type="button" variant="neutro" size="auto" disabled={!valido || ocupado} onClick={() => salvar(false)}>
                    Salvar rascunho
                </CustomButton>
                {!podeAssinar && <p className="ml-auto text-apoio text-secundario">Escreva o feedback para liberar a assinatura</p>}
            </div>
        </form>
    )
}

function RegistrarSessao() {
    const { perfilAtivo } = useSessao()
    const vinculoId = perfilAtivo?.vinculo.id
    const [parametros, setParametros] = useSearchParams()
    const lista = useDados(
        async () =>
            (await alocacoesDetalhadas(vinculoId)).filter(
                (i) => i.alocacao.situacao === 'ACEITA' && i.candidatura?.estado === 'EM_ACOMPANHAMENTO',
            ),
        [vinculoId],
        !!vinculoId,
    )
    const pedida = Number(parametros.get('alocacao'))
    const alocacaoId = lista.dados?.some((i) => i.alocacao.id === pedida) ? pedida : lista.dados?.[0]?.alocacao.id
    const atual = useDados(() => carregarAcompanhado(alocacaoId!, vinculoId), [alocacaoId, vinculoId], !!alocacaoId)

    const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)
    const [ocupado, setOcupado] = useState(false)
    const [apagando, setApagando] = useState<SessaoMentoria | null>(null)
    const fecharApagar = useCallback(() => setApagando(null), [])

    async function executar(acao: () => Promise<unknown>, sucesso: string) {
        setOcupado(true)
        setAviso(null)
        try {
            await acao()
            await atual.recarregar()
            setAviso({ tipo: 'sucesso', texto: sucesso })
            return true
        } catch (e) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
            await atual.recarregar()
            return false
        } finally {
            setOcupado(false)
        }
    }

    function salvar(registro: Registro, assinar: boolean) {
        if (!alocacaoId) return Promise.resolve(false)
        return executar(
            async () => {
                const nova = await registrarSessao(alocacaoId, registro)
                if (assinar) await assinarSessao(nova.id)
            },
            assinar ? 'Sessão registrada e assinada. As horas entraram no mês.' : 'Sessão salva em rascunho. Só você vê até assinar.',
        )
    }

    const rascunhos = atual.dados?.sessoes.filter((s) => s.situacao === 'RASCUNHO') ?? []
    const horas = atual.dados?.horas

    return (
        <CascaDoApp itens={MENU_MENTOR} voltarPara="/mentor" tituloDoTopo="Registrar sessão" semMenu>
            <h1 className="font-display text-tela text-titulo">Registrar feedback e horas</h1>

            {aviso && (
                <div className="mt-4">
                    <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
                </div>
            )}

            {lista.carregando && !lista.dados && <Carregando />}
            {lista.erro && (
                <div className="mt-6">
                    <ErroNaTela mensagem={lista.erro} tentarDeNovo={lista.recarregar} />
                </div>
            )}
            {lista.dados && lista.dados.length === 0 && (
                <div className="mt-6">
                    <Vazio titulo="Nenhum acompanhamento em andamento">
                        As sessões são registradas com a alocação aceita e a candidatura em acompanhamento.{' '}
                        <LinkDeTexto para="/mentor/convites">Ver convites ›</LinkDeTexto>
                    </Vazio>
                </div>
            )}

            {lista.dados && lista.dados.length > 0 && (
                <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-start">
                    <div className="flex min-w-0 flex-1 flex-col gap-5">
                        <section aria-labelledby="titulo-feedback" className={CARTAO_COM_RESPIRO}>
                            <h2 id="titulo-feedback" className="font-display text-bloco text-titulo">
                                Feedback da sessão
                            </h2>
                            <div className="mt-4 max-w-[480px]">
                                <CampoLista
                                    rotulo="Acompanhamento"
                                    value={alocacaoId ?? ''}
                                    onChange={(e) => setParametros({ alocacao: e.target.value }, { replace: true })}
                                >
                                    {lista.dados.map((i) => (
                                        <option key={i.alocacao.id} value={i.alocacao.id}>
                                            {nomeDoAcompanhado(i)}
                                            {i.desafio ? ` · ${i.desafio.titulo}` : ''}
                                        </option>
                                    ))}
                                </CampoLista>
                            </div>
                            {atual.carregando && !atual.dados && <Carregando />}
                            {atual.erro && (
                                <div className="mt-4">
                                    <ErroNaTela mensagem={atual.erro} tentarDeNovo={atual.recarregar} />
                                </div>
                            )}
                            {atual.dados && atual.dados.item.alocacao.id === alocacaoId && (
                                <FormularioDeSessao
                                    key={alocacaoId}
                                    sprints={atual.dados.sprints}
                                    ocupado={ocupado}
                                    aoSalvar={salvar}
                                />
                            )}
                        </section>

                        {rascunhos.length > 0 && (
                            <section aria-labelledby="titulo-rascunhos" className={CARTAO}>
                                <header className="border-b border-sutil p-card">
                                    <h2 id="titulo-rascunhos" className="font-display text-bloco text-titulo">
                                        Sessões em rascunho
                                    </h2>
                                    <p className="mt-1 text-apoio text-secundario">Só você vê. Assine para a squad ver e as horas contarem.</p>
                                </header>
                                <ul>
                                    {rascunhos.map((s) => (
                                        <li key={s.id} className="flex items-center gap-4 border-b border-sutil px-card py-4 last:border-b-0">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-item text-titulo">
                                                    {formatarData(s.dataSessao)} · {formatarMinutos(s.duracaoMinutos)}
                                                    {s.sprintNumero ? ` · sprint ${s.sprintNumero}` : ''}
                                                </p>
                                                <p className="mt-1 text-apoio text-secundario">{s.feedback ?? 'sem feedback: escreva antes de assinar'}</p>
                                            </div>
                                            <SeloStatus status="rascunho" rotulo="Rascunho" />
                                            <button
                                                type="button"
                                                className={BOTAO_TEXTO}
                                                disabled={ocupado || !s.feedback}
                                                onClick={() => executar(() => assinarSessao(s.id), 'Sessão assinada.')}
                                            >
                                                Assinar
                                            </button>
                                            <button
                                                type="button"
                                                className={BOTAO_TEXTO}
                                                disabled={ocupado}
                                                onClick={() => setApagando(s)}
                                            >
                                                Apagar
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    <aside className="flex w-full shrink-0 lg:w-[344px] flex-col gap-5">
                        <section aria-labelledby="titulo-horas" className={CARTAO_COM_RESPIRO}>
                            <h2 id="titulo-horas" className="font-display text-bloco text-titulo">
                                {horas ? `Horas doadas em ${nomeDoMes(horas.mes)}` : 'Horas doadas no mês'}
                            </h2>
                            <p className="mt-3 text-apoio text-secundario">
                                {horas
                                    ? `${formatarMinutos(horas.minutosRealizados)} em ${horas.sessoesAssinadas} ${
                                          horas.sessoesAssinadas === 1 ? 'sessão assinada' : 'sessões assinadas'
                                      }, de ${formatarHoras(horas.horasPrevistasMes)} previstas neste acompanhamento.`
                                    : 'Escolha um acompanhamento para ver as horas.'}
                            </p>
                            {alocacaoId && (
                                <p className="mt-4">
                                    <LinkDeTexto para={`/mentor/acompanhados/${alocacaoId}`}>Ver todas as sessões ›</LinkDeTexto>
                                </p>
                            )}
                        </section>

                        <section aria-labelledby="titulo-visibilidade" className="rounded-bloco bg-acento-suave p-card">
                            <h2 id="titulo-visibilidade" className="font-display text-bloco text-acento">
                                Visibilidade
                            </h2>
                            <p className="mt-2 text-apoio text-titulo">
                                O feedback só aparece para a squad depois de assinado. Enquanto estiver em rascunho, só você vê.
                                Assinada, a sessão não muda mais.
                            </p>
                        </section>
                    </aside>
                </div>
            )}

            <Modal
                aberto={!!apagando}
                titulo="Apagar esta sessão?"
                descricao={apagando && `Sessão de ${formatarData(apagando.dataSessao)} em rascunho. Isso não pode ser desfeito.`}
                aoFechar={fecharApagar}
                acoes={
                    <>
                        <CustomButton type="button" variant="neutro" size="auto" onClick={fecharApagar}>
                            Não
                        </CustomButton>
                        <CustomButton
                            type="button"
                            variant="reprovar"
                            size="auto"
                            disabled={ocupado}
                            onClick={async () => {
                                if (!apagando) return
                                const alvo = apagando
                                setApagando(null)
                                await executar(() => apagarSessao(alvo.id), 'Sessão apagada.')
                            }}
                        >
                            Sim, apagar
                        </CustomButton>
                    </>
                }
            />
        </CascaDoApp>
    )
}

export default RegistrarSessao
