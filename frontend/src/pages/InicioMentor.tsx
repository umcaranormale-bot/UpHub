import { CustomButton } from '../components/CustomButton'
import CascaDoApp from '../components/CascaDoApp'
import SeloStatus, { type Status } from '../components/SeloStatus'
import { MENU_MENTOR } from '../navegacao/menus'

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

type Trilha = 'fomento' | 'investimento' | 'formacao'

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

const rotuloDaTrilha: Record<Trilha, string> = {
    fomento: 'Fomento',
    investimento: 'Investimento',
    formacao: 'Formação',
}

const corDaTrilha: Record<Trilha, string> = {
    fomento: 'bg-trilha-fomento-suave text-trilha-fomento',
    investimento: 'bg-trilha-investimento-suave text-trilha-investimento',
    formacao: 'bg-trilha-formacao-suave text-trilha-formacao',
}

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
        <CascaDoApp
            organizacao="Movetech"
            papel="Mentor"
            iniciais="PT"
            nome="Paulo Tavares"
            itens={MENU_MENTOR}
        >
            <h1 className="font-display text-tela text-titulo">Olá, Paulo</h1>
            <p className="mt-2 text-apoio text-secundario">
                Movetech · mentor voluntário · {acompanhando} squad acompanhada e{' '}
                {pendentes} convites pendentes
            </p>

            <div className="mt-6 flex items-start gap-6">
                <div className="flex min-w-0 flex-1 flex-col gap-4">
                    {avisos.map((aviso) => (
                        <section
                            key={aviso.id}
                            aria-label={aviso.contexto}
                            className="flex items-center gap-5 rounded-card border border-aviso-borda bg-aviso-fundo p-5"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-apoio text-ocre">{aviso.contexto}</p>
                                <p className="mt-1 font-display text-bloco text-titulo">
                                    {aviso.chamada}
                                </p>
                            </div>
                            <CustomButton variant="neutro" size="auto">
                                {aviso.acao}
                            </CustomButton>
                        </section>
                    ))}

                    <h2 className="mt-4 font-display text-bloco text-titulo">
                        Convites e acompanhamentos
                    </h2>

                    <ul className="flex flex-col gap-4">
                        {itens.map((item) => (
                            <li key={item.id}>
                                <article className="rounded-bloco border border-sutil bg-card p-card shadow-card transition-[box-shadow,border-color,transform] duration-[var(--dur-padrao)] ease-padrao hover:-translate-y-px hover:shadow-card-hover">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`rounded-badge px-2 py-1 text-selo ${corDaTrilha[item.trilha]}`}
                                        >
                                            {rotuloDaTrilha[item.trilha]}
                                        </span>
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

                                    <div className="mt-2 flex items-end gap-5">
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

                <aside className="flex w-[344px] shrink-0 flex-col gap-4">
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
                                href="/acompanhados"
                                className="rounded-card px-1 text-apoio text-acento transition-colors duration-[var(--dur-rapida)] ease-padrao hover:text-titulo focus-visible:shadow-foco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
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
        </CascaDoApp>
    )
}

export default InicioMentor
