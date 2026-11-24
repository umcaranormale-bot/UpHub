import { CustomButton } from '../components/CustomButton'
import SeloStatus, { type Status } from '../components/SeloStatus'
import SeloDeTrilha, { type Trilha } from '../components/SeloDeTrilha'
import CartaoDeAviso from '../components/CartaoDeAviso'
import { ANEL_FOCO, TRANSICAO_COR } from '../estilos/classes'

/**
 * 58 · Mentor — início · rota /mentor
 *
 * Primeira tela do mentor voluntário: o que espera resposta dele hoje,
 * os convites e as squads que ele acompanha e, na coluna da direita,
 * o resumo do acompanhamento e as horas doadas no mês.
 *
 * Dados simulados nesta etapa, conforme o Bloco 4: nenhuma chamada à API.
 */


interface Aviso {
    id: string
    contexto: string
    chamada: string
    acao: string
}

const avisos: Aviso[] = [
    {
        id: 'convites',
        contexto: '2 convites aguardando resposta',
        chamada:
            'Squad Alpha (Logística Urbana) e CESAR (Saúde Conectada) · o primeiro vence em 08/11',
        acao: 'Ver convites',
    },
    {
        id: 'sessao',
        contexto: 'Sessão sem registro',
        chamada:
            'Squad 3 · FICR · registre o feedback e as horas da sessão da sprint 3',
        acao: 'Registrar sessão',
    },
]


/** Na tela 58 o estado do item vira texto, e não selo: é assim no protótipo. */
type Situacao = 'pendente' | 'acompanhando'

interface Item {
    id: number
    trilha: Trilha
    ofertante: string
    situacao: Situacao
    titulo: string
    apoio: string
    acao: string
}

const itens: Item[] = [
    {
        id: 1,
        trilha: 'formacao',
        ofertante: 'Movetech',
        situacao: 'pendente',
        titulo: 'Desafio Logística Urbana · Squad Alpha',
        apoio:
            '8 h/mês previstas · responder até 08/11/2026 · enviado pela Gestão do PD',
        acao: 'Ver convite',
    },
    {
        id: 2,
        trilha: 'formacao',
        ofertante: 'CESAR',
        situacao: 'pendente',
        titulo: 'Desafio Saúde Conectada',
        apoio: '6 h/mês previstas · responder até 15/11/2026',
        acao: 'Ver convite',
    },
    {
        id: 3,
        trilha: 'formacao',
        ofertante: 'Movetech',
        situacao: 'acompanhando',
        titulo: 'Desafio Logística Urbana · Squad 3 · FICR',
        apoio:
            'Sprint 3 em andamento · entrega até 10/10 · 12h30min doadas em outubro',
        acao: 'Abrir histórico',
    },
]



const rotuloDaSituacao: Record<Situacao, string> = {
    pendente: 'Convite pendente',
    acompanhando: 'Em acompanhamento',
}

interface Acompanhado {
    id: number
    squad: string
    quando: string
    status: Status
    rotulo: string
}

const acompanhados: Acompanhado[] = [
    {
        id: 1,
        squad: 'Squad 3 · FICR',
        quando: 'início 05/09',
        status: 'aprovada',
        rotulo: 'Em acompanhamento',
    },
    {
        id: 2,
        squad: 'Squad Alpha',
        quando: 'convite até 08/11',
        status: 'pendente',
        rotulo: 'Pendente',
    },
]

function InicioMentor() {
    const pendentes = itens.filter((item) => item.situacao === 'pendente').length
    const acompanhando = itens.length - pendentes

    return (
        <div>
            <h1 className="font-display text-tela text-titulo">Olá, Paulo</h1>
            <p className="mt-2 text-apoio text-secundario">
                Movetech · mentor voluntário · {acompanhando} squad acompanhada e{' '}
                {pendentes} convites pendentes
            </p>

            <div className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-start">
                <div className="flex min-w-0 flex-1 flex-col gap-4">
                    {avisos.map((aviso) => (
                        <CartaoDeAviso
                            key={aviso.id}
                            contexto={aviso.contexto}
                            acao={aviso.acao}
                        >
                            {aviso.chamada}
                        </CartaoDeAviso>
                    ))}

                    <h2 className="mt-4 font-display text-bloco text-titulo">
                        Convites e acompanhamentos
                    </h2>

                    <ul className="flex flex-col gap-4">
                        {itens.map((item) => (
                            <li key={item.id}>
                                <article className="rounded-bloco border border-sutil bg-card p-card shadow-card transition-[box-shadow,border-color,transform] duration-[var(--dur-padrao)] ease-padrao hover:-translate-y-px hover:shadow-card-hover">
                                    <div className="flex items-center gap-3">
                                        <SeloDeTrilha trilha={item.trilha} />
                                        <span className="text-apoio text-secundario">
                                            {item.ofertante}
                                        </span>
                                        <span className="ml-auto text-apoio text-acento">
                                            {rotuloDaSituacao[item.situacao]}
                                        </span>
                                    </div>

                                    <h3 className="mt-3 font-display text-bloco text-titulo">
                                        {item.titulo}
                                    </h3>

                                    <div className="mt-2 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:gap-5">
                                        <p className="min-w-0 flex-1 text-apoio text-secundario">
                                            {item.apoio}
                                        </p>
                                        <CustomButton variant="neutro" size="auto">
                                            {item.acao}
                                        </CustomButton>
                                    </div>
                                </article>
                            </li>
                        ))}
                    </ul>
                </div>

                <aside className="flex w-full shrink-0 xl:w-[344px] flex-col gap-4">
                    <section
                        aria-labelledby="titulo-acompanhados"
                        className="rounded-bloco border border-sutil bg-card shadow-card"
                    >
                        <header className="flex items-center justify-between gap-3 border-b border-sutil p-card">
                            <h2
                                id="titulo-acompanhados"
                                className="font-display text-bloco text-titulo"
                            >
                                Acompanhados
                            </h2>
                            <a
                                href="/mentor/acompanhados"
                                className={`rounded-card px-1 text-apoio text-acento ${TRANSICAO_COR} hover:text-titulo ${ANEL_FOCO}`}
                            >
                                Ver histórico
                            </a>
                        </header>

                        <ul>
                            {acompanhados.map((acompanhado) => (
                                <li
                                    key={acompanhado.id}
                                    className="flex items-center gap-3 border-b border-sutil px-card py-4 last:border-b-0"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-item text-titulo">
                                            {acompanhado.squad}
                                        </p>
                                        <p className="mt-1 text-apoio text-secundario">
                                            {acompanhado.quando}
                                        </p>
                                    </div>
                                    <SeloStatus
                                        status={acompanhado.status}
                                        comPonto
                                        rotulo={acompanhado.rotulo}
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section
                        aria-labelledby="titulo-horas"
                        className="rounded-bloco border border-sutil bg-card p-card shadow-card"
                    >
                        <h2 id="titulo-horas" className="font-display text-bloco text-titulo">
                            Horas doadas no mês
                        </h2>
                        <p className="mt-3 rounded-card bg-status-aprovada-fundo px-4 py-3 text-apoio text-status-aprovada-texto">
                            12 h 30 min em outubro · 5 sessões
                        </p>
                    </section>
                </aside>
            </div>
        </div>
    )
}

export default InicioMentor
