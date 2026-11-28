import CascaDoApp from '../components/CascaDoApp'
import SeloStatus from '../components/SeloStatus'
import SeloDeTrilha from '../components/SeloDeTrilha'
import { CustomButton } from '../components/CustomButton'
import { Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { AvisoComLink, LinkDeTexto } from '../components/squad/AvisoComLink'
import { candidaturasComDesafio, ESTADOS_DECIDIDOS, rotaDaCandidatura, useSquadAtiva } from '../components/squad/dados'
import { recomendadas } from '../api/matching'
import { listarMinhasProvas } from '../api/provas'
import { listarSprints, type Sprint } from '../api/sprints'
import { useDados } from '../hooks/useDados'
import { MENU_SQUAD } from '../navegacao/menus'
import { CARTAO, CARTAO_COM_RESPIRO, CARTAO_INTERATIVO } from '../estilos/classes'
import { formatarData, rotuloDoEstado, statusDoEstado, trilhaDoSelo } from '../estilos/formatos'

/**
 * 52 · Candidato squad — início · rota /squad
 *
 * O que precisa de ação hoje (rascunhos e sprints em andamento), os desafios
 * de Formação ordenados por compatibilidade e as candidaturas em andamento.
 */

async function carregar(squadId: number) {
    const [desafios, candidaturas, provas] = await Promise.all([
        recomendadas(squadId, 5),
        candidaturasComDesafio(squadId),
        listarMinhasProvas().catch(() => []),
    ])
    // a sprint em andamento de cada candidatura em acompanhamento vira um aviso
    const emAcompanhamento = candidaturas.filter((c) => c.candidatura.estado === 'EM_ACOMPANHAMENTO')
    const sprints = await Promise.all(
        emAcompanhamento.map(async (c) => {
            const lista = await listarSprints(c.candidatura.id).catch(() => [] as Sprint[])
            return { item: c, sprint: lista.find((s) => s.estado === 'EM_ANDAMENTO') ?? null }
        }),
    )
    const prova = [...provas].sort((a, b) => b.dataProva.localeCompare(a.dataProva))[0] ?? null
    return {
        desafios: desafios.filter((d) => d.trilhaCodigo === 'FORMACAO'),
        candidaturas,
        sprints: sprints.filter((s) => s.sprint),
        prova,
    }
}

function InicioSquad() {
    const { squadId, nome, primeiroNome } = useSquadAtiva()
    const { dados, carregando, erro, recarregar } = useDados(() => carregar(squadId!), [squadId], !!squadId)

    const rascunhos = dados?.candidaturas.filter((c) => c.candidatura.estado === 'RASCUNHO') ?? []
    const emAndamento = dados?.candidaturas.filter((c) => !ESTADOS_DECIDIDOS.includes(c.candidatura.estado)) ?? []
    const combinam = dados?.desafios.filter((d) => d.compatibilidade >= 70).length ?? 0

    return (
        <CascaDoApp itens={MENU_SQUAD}>
            <h1 className="font-display text-tela text-titulo">Olá, {primeiroNome}</h1>
            <p className="mt-2 text-apoio text-secundario">
                {nome}
                {dados && ` · ${combinam} ${combinam === 1 ? 'desafio combina' : 'desafios combinam'} com o perfil da squad hoje`}
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
                        {dados.sprints.map(({ item, sprint }) => (
                            <AvisoComLink
                                key={`sprint-${sprint!.id}`}
                                contexto={`Sprint ${sprint!.numero}${sprint!.prazoEntrega ? ` · entrega até ${formatarData(sprint!.prazoEntrega)}` : ''}`}
                                acao="Registrar entrega"
                                para={`/squad/candidaturas/${item.candidatura.id}/sprints`}
                            >
                                {item.desafio?.titulo ?? 'Desafio'} · registre a entrega da sprint {sprint!.numero} para o mentor avaliar
                            </AvisoComLink>
                        ))}
                        {rascunhos.map(({ candidatura, desafio }) => (
                            <AvisoComLink
                                key={`rascunho-${candidatura.id}`}
                                contexto="Candidatura em rascunho"
                                acao="Continuar candidatura"
                                para={`/squad/candidaturas/${candidatura.id}/editar`}
                            >
                                {desafio?.titulo ?? 'Desafio'} · confira os integrantes e envie a candidatura
                            </AvisoComLink>
                        ))}

                        <h2 className="mt-4 font-display text-bloco text-titulo">Para você · ordenado por compatibilidade</h2>

                        {dados.desafios.length === 0 ? (
                            <Vazio titulo="Nenhum desafio aberto combina com a squad agora">
                                Os desafios de Formação aparecem aqui quando estão publicados, no prazo e a squad é elegível.
                            </Vazio>
                        ) : (
                            <ul className="flex flex-col gap-4">
                                {dados.desafios.map((desafio) => {
                                    const motivo = [...desafio.motivos].sort((a, b) => b.pontos - a.pontos)[0]
                                    return (
                                        <li key={desafio.oportunidadeId}>
                                            <article className={CARTAO_INTERATIVO}>
                                                <div className="flex items-center gap-3">
                                                    <SeloDeTrilha trilha={trilhaDoSelo(desafio.trilhaCodigo)} />
                                                    {desafio.area && (
                                                        <span className="text-apoio text-secundario">{desafio.area}</span>
                                                    )}
                                                    <span className="ml-auto text-apoio text-acento">
                                                        {desafio.compatibilidade}% de match
                                                    </span>
                                                </div>
                                                <h3 className="mt-3 font-display text-bloco text-titulo">
                                                    {desafio.oportunidadeTitulo}
                                                </h3>
                                                <div className="mt-2 flex items-end gap-5">
                                                    <p className="min-w-0 flex-1 text-apoio text-secundario">
                                                        {motivo && (
                                                            <>
                                                                <span className="text-titulo">Por que apareceu:</span>{' '}
                                                                {motivo.explicacao}
                                                            </>
                                                        )}
                                                    </p>
                                                    <CustomButton
                                                        variant="neutro"
                                                        size="auto"
                                                        to={`/squad/oportunidades/${desafio.oportunidadeId}`}
                                                    >
                                                        Ver detalhes
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
                        <section aria-labelledby="titulo-candidaturas" className={CARTAO}>
                            <header className="flex items-center justify-between gap-3 border-b border-sutil p-card">
                                <h2 id="titulo-candidaturas" className="font-display text-bloco text-titulo">
                                    Minhas candidaturas
                                </h2>
                                <LinkDeTexto para="/squad/candidaturas">Ver todas</LinkDeTexto>
                            </header>
                            {emAndamento.length === 0 ? (
                                <p className="p-card text-apoio text-secundario">Nenhuma candidatura em andamento.</p>
                            ) : (
                                <ul>
                                    {emAndamento.slice(0, 5).map(({ candidatura, desafio }) => (
                                        <li
                                            key={candidatura.id}
                                            className="flex items-center gap-3 border-b border-sutil px-card py-4 last:border-b-0"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <LinkDeTexto para={rotaDaCandidatura(candidatura)}>
                                                    <span className="text-item text-titulo">
                                                        {desafio?.titulo ?? candidatura.tituloProposta ?? 'Candidatura'}
                                                    </span>
                                                </LinkDeTexto>
                                                <p className="mt-1 text-apoio text-secundario">
                                                    {candidatura.enviadaEm
                                                        ? `enviada em ${formatarData(candidatura.enviadaEm)}`
                                                        : `criada em ${formatarData(candidatura.criadaEm)}`}
                                                </p>
                                            </div>
                                            <SeloStatus
                                                status={statusDoEstado(candidatura.estado)}
                                                rotulo={rotuloDoEstado(candidatura.estado)}
                                                comPonto
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section aria-labelledby="titulo-nota" className={CARTAO_COM_RESPIRO}>
                            <h2 id="titulo-nota" className="font-display text-bloco text-titulo">
                                Minha nota no match
                            </h2>
                            {dados.prova ? (
                                <p className="mt-3 rounded-card bg-status-aprovada-fundo px-4 py-3 text-apoio text-status-aprovada-texto">
                                    {dados.prova.nota}
                                    {dados.prova.area ? ` em ${dados.prova.area}` : ''} · prova de{' '}
                                    {formatarData(dados.prova.dataProva)}
                                </p>
                            ) : (
                                <p className="mt-3 text-apoio text-secundario">Você ainda não tem nota de prova registrada.</p>
                            )}
                        </section>
                    </aside>
                </div>
            )}
        </CascaDoApp>
    )
}

export default InicioSquad
