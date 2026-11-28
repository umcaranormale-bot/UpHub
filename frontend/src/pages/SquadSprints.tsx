import { useState } from 'react'
import { useParams } from 'react-router-dom'

import CascaDoApp from '../components/CascaDoApp'
import SeloStatus from '../components/SeloStatus'
import { CustomButton } from '../components/CustomButton'
import { Aviso, Carregando, ErroNaTela } from '../components/ui/Estados'
import { CampoTexto } from '../components/ui/Campo'
import { LinhaDoTempoDeSprints, SeloDaSprint } from '../components/squad/Sprints'
import { buscarCandidatura } from '../api/candidaturas'
import { mensagemDeErro } from '../api/erros'
import { listarMentoresDaCandidatura } from '../api/mentoria'
import { buscarOportunidade } from '../api/oportunidades'
import { buscarOrganizacao } from '../api/organizacoes'
import { listarSessoes } from '../api/sessoes'
import { entregarSprint, listarSprints, type Sprint } from '../api/sprints'
import { useDados } from '../hooks/useDados'
import { MENU_SQUAD } from '../navegacao/menus'
import { CARTAO, CARTAO_COM_RESPIRO } from '../estilos/classes'
import { formatarData, rotuloDoEstado, ROTULO_TRILHA, statusDoEstado } from '../estilos/formatos'

/**
 * 41 · Squad — sprints e entregas · rota /squad/candidaturas/:id/sprints
 *
 * A linha do tempo das sprints, a entrega da sprint em andamento (a squad
 * registra aqui) e o feedback do mentor. A squad vê só as sessões assinadas.
 */

async function carregar(id: number) {
    const candidatura = await buscarCandidatura(id)
    const [desafio, sprints, sessoes, alocacoes] = await Promise.all([
        buscarOportunidade(candidatura.oportunidadeId).catch(() => null),
        listarSprints(id),
        listarSessoes(id).catch(() => []),
        listarMentoresDaCandidatura(id).catch(() => []),
    ])
    const provedor = desafio ? await buscarOrganizacao(desafio.organizacaoId).catch(() => null) : null
    return {
        candidatura,
        desafio,
        provedor,
        sprints,
        sessoes: [...sessoes].sort((a, b) => b.dataSessao.localeCompare(a.dataSessao)),
        mentores: alocacoes.filter((a) => a.situacao === 'ACEITA'),
    }
}

function FormularioDeEntrega({ sprint, aoEntregar }: { sprint: Sprint; aoEntregar: (descricao: string) => Promise<void> }) {
    const [descricao, setDescricao] = useState('')
    const [enviando, setEnviando] = useState(false)
    return (
        <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={async (e) => {
                e.preventDefault()
                setEnviando(true)
                await aoEntregar(descricao)
                setEnviando(false)
            }}
        >
            <CampoTexto
                rotulo={`O que a squad entregou na sprint ${sprint.numero}`}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Funcionalidades, links do repositório ou do protótipo, o que ficou para a próxima"
                required
            />
            <div>
                <CustomButton type="submit" variant="aprovar" size="auto" disabled={!descricao.trim() || enviando}>
                    {enviando ? 'Registrando…' : 'Registrar entrega'}
                </CustomButton>
            </div>
        </form>
    )
}

function SquadSprints() {
    const { id } = useParams()
    const candidaturaId = Number(id)
    const { dados, carregando, erro, recarregar } = useDados(() => carregar(candidaturaId), [candidaturaId], Number.isFinite(candidaturaId))
    const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

    if (!dados) {
        return (
            <CascaDoApp itens={MENU_SQUAD} voltarPara="/squad/candidaturas">
                {carregando && <Carregando />}
                {erro && <ErroNaTela mensagem={erro} tentarDeNovo={recarregar} />}
            </CascaDoApp>
        )
    }

    const { candidatura, desafio, provedor, sprints, sessoes, mentores } = dados
    const emAndamento = sprints.find((s) => s.estado === 'EM_ANDAMENTO') ?? null
    const ultimaAvaliada = [...sprints].reverse().find((s) => s.estado === 'AVALIADA') ?? null
    const acompanha = candidatura.estado === 'EM_ACOMPANHAMENTO'

    async function entregar(sprint: Sprint, descricao: string) {
        setAviso(null)
        try {
            await entregarSprint(sprint.id, descricao)
            await recarregar()
            setAviso({ tipo: 'sucesso', texto: `Entrega da sprint ${sprint.numero} registrada. O mentor já pode avaliar.` })
        } catch (e) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
        }
    }

    const subtitulo = [
        provedor?.nome,
        desafio ? ROTULO_TRILHA[desafio.trilhaCodigo] : null,
        mentores.length > 0 ? `mentor${mentores.length > 1 ? 'es' : ''}: ${mentores.map((m) => m.mentorNome).join(', ')}` : null,
    ]
        .filter(Boolean)
        .join(' · ')

    return (
        <CascaDoApp itens={MENU_SQUAD} voltarPara="/squad/candidaturas">
            <div className="flex flex-wrap items-start gap-5">
                <div className="min-w-0 flex-1">
                    <h1 className="font-display text-tela text-titulo">{desafio?.titulo ?? `Candidatura #${candidatura.id}`}</h1>
                    <p className="mt-2 text-apoio text-secundario">{subtitulo}</p>
                </div>
                <SeloStatus status={statusDoEstado(candidatura.estado)} rotulo={rotuloDoEstado(candidatura.estado)} comPonto />
            </div>

            {aviso && (
                <div className="mt-4">
                    <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
                </div>
            )}

            <div className="mt-6">
                <LinhaDoTempoDeSprints sprints={sprints} />
            </div>

            <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
                <section aria-labelledby="titulo-entrega" className={CARTAO_COM_RESPIRO}>
                    {emAndamento ? (
                        <>
                            <p className="text-apoio text-secundario">Entrega da sprint {emAndamento.numero}</p>
                            <h2 id="titulo-entrega" className="mt-1 font-display text-bloco text-titulo">
                                Em andamento
                                {emAndamento.prazoEntrega ? ` · prazo ${formatarData(emAndamento.prazoEntrega)}` : ''}
                            </h2>
                            <p className="mt-2 text-apoio text-secundario">
                                A squad registra a entrega aqui e ela fica no histórico depois do encerramento, como portfólio.
                            </p>
                            {acompanha ? (
                                <FormularioDeEntrega
                                    key={emAndamento.id}
                                    sprint={emAndamento}
                                    aoEntregar={(descricao) => entregar(emAndamento, descricao)}
                                />
                            ) : (
                                <p className="mt-3 text-apoio text-secundario">
                                    As entregas só são registradas com a candidatura em acompanhamento.
                                </p>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="text-apoio text-secundario">Entrega</p>
                            <h2 id="titulo-entrega" className="mt-1 font-display text-bloco text-titulo">
                                Nenhuma sprint em andamento
                            </h2>
                            <p className="mt-2 text-apoio text-secundario">
                                Quando o mentor ou o provedor iniciar a próxima sprint, a entrega dela é registrada aqui.
                            </p>
                        </>
                    )}
                </section>

                <section aria-labelledby="titulo-feedback" className={CARTAO_COM_RESPIRO}>
                    <p className="text-apoio text-secundario">Feedback do mentor</p>
                    {ultimaAvaliada ? (
                        <>
                            <h2 id="titulo-feedback" className="mt-1 font-display text-bloco text-titulo">
                                Sprint {ultimaAvaliada.numero} · nota {ultimaAvaliada.notaEntrega ?? '—'} ·{' '}
                                {formatarData(ultimaAvaliada.avaliadaEm)}
                            </h2>
                            <p className="mt-2 whitespace-pre-line text-apoio text-secundario">
                                “{ultimaAvaliada.feedbackEntrega}”
                            </p>
                        </>
                    ) : (
                        <h2 id="titulo-feedback" className="mt-1 font-display text-bloco text-titulo">
                            Nenhuma entrega avaliada ainda
                        </h2>
                    )}
                    <p className="mt-3 text-apoio text-secundario">
                        Feedback de sessão em rascunho não aparece aqui: a squad vê só o que o mentor assinou.
                    </p>
                </section>
            </div>

            {sprints.some((s) => s.entregaDescricao) && (
                <section aria-labelledby="titulo-historico" className={`mt-5 ${CARTAO}`}>
                    <header className="border-b border-sutil p-card">
                        <h2 id="titulo-historico" className="font-display text-bloco text-titulo">
                            Histórico das entregas
                        </h2>
                    </header>
                    <ul>
                        {sprints
                            .filter((s) => s.entregaDescricao)
                            .map((s) => (
                                <li key={s.id} className="flex items-start gap-4 border-b border-sutil px-card py-4 last:border-b-0">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-item text-titulo">
                                            Sprint {s.numero} · entregue em {formatarData(s.entregaRegistradaEm)}
                                        </p>
                                        <p className="mt-1 whitespace-pre-line text-apoio text-secundario">{s.entregaDescricao}</p>
                                        {s.feedbackEntrega && (
                                            <p className="mt-2 text-apoio text-titulo">
                                                Nota {s.notaEntrega ?? '—'} · {s.feedbackEntrega}
                                            </p>
                                        )}
                                    </div>
                                    <SeloDaSprint estado={s.estado} />
                                </li>
                            ))}
                    </ul>
                </section>
            )}

            {sessoes.length > 0 && (
                <section aria-labelledby="titulo-sessoes" className={`mt-5 ${CARTAO}`}>
                    <header className="border-b border-sutil p-card">
                        <h2 id="titulo-sessoes" className="font-display text-bloco text-titulo">
                            Sessões de mentoria
                        </h2>
                    </header>
                    <ul>
                        {sessoes.map((s) => (
                            <li key={s.id} className="border-b border-sutil px-card py-4 last:border-b-0">
                                <p className="text-item text-titulo">
                                    {formatarData(s.dataSessao)} · {s.duracaoMinutos} min
                                    {s.sprintNumero ? ` · sprint ${s.sprintNumero}` : ''}
                                    {s.mentorNome ? ` · ${s.mentorNome}` : ''}
                                </p>
                                {s.feedback && <p className="mt-1 whitespace-pre-line text-apoio text-secundario">{s.feedback}</p>}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </CascaDoApp>
    )
}

export default SquadSprints
