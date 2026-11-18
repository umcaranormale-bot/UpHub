import { CustomButton } from '../components/CustomButton'
import CascaDoApp from '../components/CascaDoApp'
import SeloStatus, { type Status } from '../components/SeloStatus'
import { MENU_SQUAD } from '../navegacao/menus'

/**
 * 52 · Candidato squad — início · rota /inicio/squad
 *
 * Primeira tela de quem representa uma squad: o que precisa de ação hoje,
 * os desafios ordenados por compatibilidade e, na coluna da direita, as
 * candidaturas em andamento e a nota do match.
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
        id: 'sprint',
        contexto: 'Sprint 3 · entrega até 10/10',
        chamada:
            'Desafio Logística Urbana · registre a entrega da sprint 3 para o mentor avaliar',
        acao: 'Registrar entrega',
    },
    {
        id: 'rascunho',
        contexto: 'Candidatura em rascunho · falta 1 confirmação',
        chamada:
            'Desafio Rotas Verdes · a Mylena ainda não confirmou a participação',
        acao: 'Continuar candidatura',
    },
]

type Trilha = 'fomento' | 'investimento' | 'formacao'

interface Desafio {
    id: number
    trilha: Trilha
    ofertante: string
    titulo: string
    porQue: string
    match: number
}

const desafios: Desafio[] = [
    {
        id: 1,
        trilha: 'formacao',
        ofertante: 'Movetech',
        titulo: 'Desafio Rotas Verdes · roteirização sustentável',
        porQue: 'a squad tem 4 integrantes e já entregou um desafio de logística.',
        match: 88,
    },
    {
        id: 2,
        trilha: 'formacao',
        ofertante: 'Porto Digital + CESAR',
        titulo: 'Residência Saúde Digital 2026',
        porQue: 'pede back-end e dados, as competências mais fortes da squad.',
        match: 72,
    },
    {
        id: 3,
        trilha: 'formacao',
        ofertante: 'Sebrae PE',
        titulo: 'Desafio Cidades Inteligentes',
        porQue: 'tema próximo, mas o desafio pede 6 integrantes.',
        match: 59,
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

interface Candidatura {
    id: number
    titulo: string
    quando: string
    status: Status
}

const candidaturas: Candidatura[] = [
    { id: 1, titulo: 'Desafio Logística Urbana', quando: 'desde 02/09', status: 'aprovada' },
    { id: 2, titulo: 'Desafio Rotas Verdes', quando: 'salva hoje às 19:08', status: 'rascunho' },
]

function InicioSquad() {
    return (
        <CascaDoApp
            organizacao="Squad 3 · FICR"
            papel="Candidato · squad"
            iniciais="SC"
            nome="Sua Chen Letícia"
            itens={MENU_SQUAD}
        >
            <h1 className="font-display text-tela text-titulo">Olá, Letícia</h1>
            <p className="mt-2 text-apoio text-secundario">
                Squad 3 · FICR · {desafios.filter((d) => d.match >= 70).length} desafios
                combinam com o perfil da squad hoje
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
                        Para você · ordenado por compatibilidade
                    </h2>

                    <ul className="flex flex-col gap-4">
                        {desafios.map((desafio) => (
                            <li key={desafio.id}>
                                <article className="rounded-bloco border border-sutil bg-card p-card shadow-card transition-[box-shadow,border-color,transform] duration-[var(--dur-padrao)] ease-padrao hover:-translate-y-px hover:shadow-card-hover">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`rounded-badge px-2 py-1 text-selo ${corDaTrilha[desafio.trilha]}`}
                                        >
                                            {rotuloDaTrilha[desafio.trilha]}
                                        </span>
                                        <span className="text-apoio text-secundario">
                                            {desafio.ofertante}
                                        </span>
                                        <span className="ml-auto text-apoio text-acento">
                                            {desafio.match}% de match
                                        </span>
                                    </div>

                                    <h3 className="mt-3 font-display text-bloco text-titulo">
                                        {desafio.titulo}
                                    </h3>

                                    <div className="mt-2 flex items-end gap-5">
                                        <p className="min-w-0 flex-1 text-apoio text-secundario">
                                            <span className="text-titulo">Por que apareceu:</span>{' '}
                                            {desafio.porQue}
                                        </p>
                                        <CustomButton variant="neutro" size="auto">
                                            Ver detalhes
                                        </CustomButton>
                                    </div>
                                </article>
                            </li>
                        ))}
                    </ul>
                </div>

                <aside className="flex w-[344px] shrink-0 flex-col gap-4">
                    <section
                        aria-labelledby="titulo-candidaturas"
                        className="rounded-bloco border border-sutil bg-card shadow-card"
                    >
                        <header className="flex items-center justify-between gap-3 border-b border-sutil p-card">
                            <h2
                                id="titulo-candidaturas"
                                className="font-display text-bloco text-titulo"
                            >
                                Minhas candidaturas
                            </h2>
                            <a
                                href="/squad/candidaturas"
                                className="rounded-card px-1 text-apoio text-acento transition-colors duration-[var(--dur-rapida)] ease-padrao hover:text-titulo focus-visible:shadow-foco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento"
                            >
                                Ver todas
                            </a>
                        </header>

                        <ul>
                            {candidaturas.map((candidatura) => (
                                <li
                                    key={candidatura.id}
                                    className="flex items-center gap-3 border-b border-sutil px-card py-4 last:border-b-0"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-item text-titulo">
                                            {candidatura.titulo}
                                        </p>
                                        <p className="mt-1 text-apoio text-secundario">
                                            {candidatura.quando}
                                        </p>
                                    </div>
                                    <SeloStatus
                                        status={candidatura.status}
                                        comPonto
                                        rotulo={
                                            candidatura.status === 'aprovada'
                                                ? 'Em acompanhamento'
                                                : undefined
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section
                        aria-labelledby="titulo-nota"
                        className="rounded-bloco border border-sutil bg-card p-card shadow-card"
                    >
                        <h2 id="titulo-nota" className="font-display text-bloco text-titulo">
                            Minha nota no match
                        </h2>
                        <p className="mt-3 rounded-card bg-status-aprovada-fundo px-4 py-3 text-apoio text-status-aprovada-texto">
                            82 em lógica e dados · válida até 30/12
                        </p>
                    </section>
                </aside>
            </div>
        </CascaDoApp>
    )
}

export default InicioSquad
