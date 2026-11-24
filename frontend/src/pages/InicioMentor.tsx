import CascaDoApp from '../components/CascaDoApp'
import SeloStatus from '../components/SeloStatus'
import SeloDeTrilha from '../components/SeloDeTrilha'
import { CustomButton } from '../components/CustomButton'
import { Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { AvisoComLink, LinkDeTexto } from '../components/squad/AvisoComLink'
import {
    alocacoesDetalhadas,
    formatarHoras,
    formatarMinutos,
    horasDasAceitas,
    nomeDoAcompanhado,
    nomeDoMes,
} from '../components/mentor/dados'
import { listarSprints, type Sprint } from '../api/sprints'
import { useDados } from '../hooks/useDados'
import { MENU_MENTOR } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'
import { CARTAO, CARTAO_COM_RESPIRO, CARTAO_INTERATIVO } from '../estilos/classes'
import { formatarData, trilhaDoSelo } from '../estilos/formatos'

/**
 * 58 · Mentor — início · rota /mentor
 *
 * O que espera resposta do mentor hoje (convites e entregas para avaliar), os
 * convites e acompanhamentos e, à direita, os acompanhados e as horas do mês.
 */

async function carregar(vinculoId: number) {
    const itens = await alocacoesDetalhadas(vinculoId)
    const aceitas = itens.filter((i) => i.alocacao.situacao === 'ACEITA')
    const [horas, entregas] = await Promise.all([
        horasDasAceitas(itens.map((i) => i.alocacao)),
        Promise.all(
            aceitas
                .filter((i) => i.candidatura?.estado === 'EM_ACOMPANHAMENTO')
                .map(async (item) => {
                    const sprints = await listarSprints(item.alocacao.candidaturaId).catch(() => [] as Sprint[])
                    return sprints.filter((s) => s.estado === 'ENTREGUE').map((sprint) => ({ item, sprint }))
                }),
        ),
    ])
    return { itens, horas, entregas: entregas.flat() }
}

function InicioMentor() {
    const { pessoa, perfilAtivo } = useSessao()
    const vinculoId = perfilAtivo?.vinculo.id
    const { dados, carregando, erro, recarregar } = useDados(() => carregar(vinculoId!), [vinculoId], !!vinculoId)

    const pendentes = dados?.itens.filter((i) => i.alocacao.situacao === 'PENDENTE') ?? []
    const aceitas = dados?.itens.filter((i) => i.alocacao.situacao === 'ACEITA') ?? []
    const lista = [...pendentes, ...aceitas]
    const primeiroNome = pessoa?.nome.trim().split(/\s+/)[0] ?? ''

    return (
        <CascaDoApp itens={MENU_MENTOR}>
            <h1 className="font-display text-tela text-titulo">Olá, {primeiroNome}</h1>
            <p className="mt-2 text-apoio text-secundario">
                {perfilAtivo?.vinculo.organizacaoNome} · mentor voluntário
                {dados &&
                    ` · ${aceitas.length} ${aceitas.length === 1 ? 'acompanhamento' : 'acompanhamentos'} e ${pendentes.length} ${
                        pendentes.length === 1 ? 'convite pendente' : 'convites pendentes'
                    }`}
            </p>

            {carregando && !dados && <Carregando />}
            {erro && (
                <div className="mt-6">
                    <ErroNaTela mensagem={erro} tentarDeNovo={recarregar} />
                </div>
            )}

            {dados && (
                <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                        {pendentes.length > 0 && (
                            <AvisoComLink
                                contexto={`${pendentes.length} ${pendentes.length === 1 ? 'convite aguardando' : 'convites aguardando'} resposta`}
                                acao="Ver convites"
                                para="/mentor/convites"
                            >
                                {pendentes.map((p) => nomeDoAcompanhado(p)).join(' e ')} · o primeiro vence em{' '}
                                {formatarData([...pendentes].sort((a, b) => a.alocacao.prazoResposta.localeCompare(b.alocacao.prazoResposta))[0].alocacao.prazoResposta)}
                            </AvisoComLink>
                        )}
                        {dados.entregas.map(({ item, sprint }) => (
                            <AvisoComLink
                                key={sprint.id}
                                contexto="Entrega aguardando avaliação"
                                acao="Avaliar entrega"
                                para={`/mentor/acompanhados/${item.alocacao.id}/sprints`}
                            >
                                {nomeDoAcompanhado(item)} · entregou a sprint {sprint.numero} em {formatarData(sprint.entregaRegistradaEm)}
                            </AvisoComLink>
                        ))}

                        <h2 className="mt-4 font-display text-bloco text-titulo">Convites e acompanhamentos</h2>

                        {lista.length === 0 ? (
                            <Vazio titulo="Nenhum convite ou acompanhamento agora">
                                Quando um provedor convidar você para acompanhar uma candidatura, o convite aparece aqui.
                            </Vazio>
                        ) : (
                            <ul className="flex flex-col gap-4">
                                {lista.map((item) => {
                                    const { alocacao, desafio, provedor } = item
                                    const pendente = alocacao.situacao === 'PENDENTE'
                                    const horas = dados.horas.porAlocacao.get(alocacao.id)
                                    return (
                                        <li key={alocacao.id}>
                                            <article className={CARTAO_INTERATIVO}>
                                                <div className="flex items-center gap-3">
                                                    {desafio && <SeloDeTrilha trilha={trilhaDoSelo(desafio.trilhaCodigo)} />}
                                                    <span className="text-apoio text-secundario">{provedor?.nome}</span>
                                                    <span className={`ml-auto text-apoio ${pendente ? 'text-ocre' : 'text-acento'}`}>
                                                        {pendente ? 'Convite pendente' : 'Em acompanhamento'}
                                                    </span>
                                                </div>
                                                <h3 className="mt-3 font-display text-bloco text-titulo">
                                                    {desafio ? `${desafio.titulo} · ` : ''}
                                                    {nomeDoAcompanhado(item)}
                                                </h3>
                                                <div className="mt-2 flex items-end gap-5">
                                                    <p className="min-w-0 flex-1 text-apoio text-secundario">
                                                        {pendente
                                                            ? `${formatarHoras(alocacao.horasPrevistasMes)}/mês previstas · responder até ${formatarData(alocacao.prazoResposta)}`
                                                            : `aceita em ${formatarData(alocacao.respondidaEm)} · ${formatarMinutos(horas?.minutosRealizados ?? 0)} registradas em ${nomeDoMes(dados.horas.mes)}`}
                                                    </p>
                                                    <CustomButton
                                                        variant="neutro"
                                                        size="auto"
                                                        to={pendente ? '/mentor/convites' : `/mentor/acompanhados/${alocacao.id}`}
                                                    >
                                                        {pendente ? 'Ver convite' : 'Abrir histórico'}
                                                    </CustomButton>
                                                </div>
                                            </article>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>

                    <aside className="flex w-full shrink-0 lg:w-[344px] flex-col gap-4">
                        <section aria-labelledby="titulo-acompanhados" className={CARTAO}>
                            <header className="flex items-center justify-between gap-3 border-b border-sutil p-card">
                                <h2 id="titulo-acompanhados" className="font-display text-bloco text-titulo">
                                    Acompanhados
                                </h2>
                                <LinkDeTexto para="/mentor/acompanhados">Ver histórico</LinkDeTexto>
                            </header>
                            {aceitas.length === 0 ? (
                                <p className="p-card text-apoio text-secundario">Nenhum acompanhamento ativo.</p>
                            ) : (
                                <ul>
                                    {aceitas.map((item) => (
                                        <li
                                            key={item.alocacao.id}
                                            className="flex items-center gap-3 border-b border-sutil px-card py-4 last:border-b-0"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-item text-titulo">{nomeDoAcompanhado(item)}</p>
                                                <p className="mt-1 text-apoio text-secundario">
                                                    início {formatarData(item.alocacao.respondidaEm)}
                                                </p>
                                            </div>
                                            <SeloStatus status="aprovada" rotulo="Em acompanhamento" comPonto />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section aria-labelledby="titulo-horas" className={CARTAO_COM_RESPIRO}>
                            <h2 id="titulo-horas" className="font-display text-bloco text-titulo">
                                Horas doadas no mês
                            </h2>
                            <p className="mt-3 rounded-card bg-status-aprovada-fundo px-4 py-3 text-apoio text-status-aprovada-texto">
                                {formatarMinutos(dados.horas.minutos)} em {nomeDoMes(dados.horas.mes)} · {dados.horas.sessoes}{' '}
                                {dados.horas.sessoes === 1 ? 'sessão assinada' : 'sessões assinadas'}
                            </p>
                            <p className="mt-3">
                                <LinkDeTexto para="/mentor/horas">Registrar sessão ›</LinkDeTexto>
                            </p>
                        </section>
                    </aside>
                </div>
            )}
        </CascaDoApp>
    )
}

export default InicioMentor
