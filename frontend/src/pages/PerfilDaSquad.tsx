import CascaDoApp from '../components/CascaDoApp'
import { MENU_SQUAD } from '../navegacao/menus'

/**
 * 56 · Candidato squad — perfil da squad · rota /organizacao
 *
 * Os dados cadastrais da squad. Os campos marcados com ponto são os que o
 * motor de elegibilidade lê nos desafios de Formação, por isso ganham destaque.
 *
 * Dados simulados nesta etapa, conforme o Bloco 4: nenhuma chamada à API.
 */

interface Campo {
    rotulo: string
    valor: string
    /** Entra no motor de elegibilidade. */
    usadoNaElegibilidade: boolean
}

const campos: Campo[] = [
    { rotulo: 'Nome da squad', valor: 'Squad 3 · FICR', usadoNaElegibilidade: false },
    {
        rotulo: 'Instituição',
        valor: 'FICR · Residência Porto Digital',
        usadoNaElegibilidade: false,
    },
    {
        rotulo: 'Código da coordenação',
        valor: 'FICR-2026-S3',
        usadoNaElegibilidade: true,
    },
    {
        rotulo: 'Área de atuação',
        valor: 'Desenvolvimento de software',
        usadoNaElegibilidade: true,
    },
    {
        rotulo: 'Formada em',
        valor: '03/2026 · residência 2026.1',
        usadoNaElegibilidade: true,
    },
    { rotulo: 'Sede', valor: 'Recife · PE', usadoNaElegibilidade: true },
    { rotulo: 'Integrantes', valor: '4', usadoNaElegibilidade: true },
    {
        rotulo: 'Representante',
        valor: 'Sua Chen Letícia',
        usadoNaElegibilidade: false,
    },
]

interface Integrante {
    nome: string
    competencia: string
}

const integrantes: Integrante[] = [
    { nome: 'Sua Chen Letícia', competencia: 'Back-end e dados · representante' },
    { nome: 'Marcus Silva', competencia: 'Front-end' },
    { nome: 'Júlio Pereira', competencia: 'Banco de dados' },
    { nome: 'Mylena Costa', competencia: 'UX e protótipo' },
]

const COMPLETUDE = 100

function PerfilDaSquad() {
    return (
        <CascaDoApp
            organizacao="Squad 3 · FICR"
            papel="Candidato · squad"
            iniciais="SC"
            nome="Sua Chen Letícia"
            itens={MENU_SQUAD}
            voltarPara="/inicio/squad"
        >
            <h1 className="font-display text-tela text-titulo">Perfil da squad</h1>
            <p className="mt-2 text-apoio text-secundario">
                Dados da Squad 3 · FICR. Os campos com ponto são os que o motor de
                elegibilidade usa nos desafios de Formação.
            </p>

            <div className="mt-6 flex items-start gap-6">
                <section
                    aria-labelledby="titulo-dados"
                    className="min-w-0 flex-1 rounded-bloco border border-sutil bg-card shadow-card"
                >
                    <header className="border-b border-sutil p-card">
                        <h2 id="titulo-dados" className="font-display text-bloco text-titulo">
                            Dados da squad
                        </h2>
                    </header>

                    <dl>
                        {campos.map((campo) => (
                            <div
                                key={campo.rotulo}
                                className="flex items-center gap-5 border-b border-sutil px-card py-3 last:border-b-0"
                            >
                                <dt className="flex min-w-0 flex-1 items-center gap-2 text-apoio text-secundario">
                                    {campo.usadoNaElegibilidade && (
                                        <span
                                            aria-hidden="true"
                                            className="size-1.5 shrink-0 rounded-full bg-acento"
                                        />
                                    )}
                                    {campo.rotulo}
                                    {campo.usadoNaElegibilidade && (
                                        <span className="sr-only">
                                            {' '}
                                            (usado na elegibilidade)
                                        </span>
                                    )}
                                </dt>
                                <dd className="text-item text-titulo">{campo.valor}</dd>
                            </div>
                        ))}
                    </dl>
                </section>

                <aside className="flex w-[376px] shrink-0 flex-col gap-5">
                    <section
                        aria-labelledby="titulo-completude"
                        className="rounded-bloco border border-sutil bg-card p-card shadow-card"
                    >
                        <div className="flex items-center gap-3">
                            <h2
                                id="titulo-completude"
                                className="font-display text-bloco text-titulo"
                            >
                                Perfil {COMPLETUDE}% completo
                            </h2>
                            <span className="ml-auto text-apoio text-secundario">
                                nenhuma pendência
                            </span>
                        </div>

                        <div
                            role="progressbar"
                            aria-valuenow={COMPLETUDE}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-labelledby="titulo-completude"
                            className="mt-4 h-2 overflow-hidden rounded-badge bg-page"
                        >
                            <span
                                className="block h-full rounded-badge bg-acento transition-[width] duration-[var(--dur-lenta)] ease-padrao"
                                style={{ width: `${COMPLETUDE}%` }}
                            />
                        </div>
                    </section>

                    <section
                        aria-labelledby="titulo-integrantes"
                        className="rounded-bloco border border-sutil bg-card shadow-card"
                    >
                        <header className="border-b border-sutil p-card">
                            <h2
                                id="titulo-integrantes"
                                className="font-display text-bloco text-titulo"
                            >
                                Integrantes e competências
                            </h2>
                        </header>

                        <ul>
                            {integrantes.map((integrante) => (
                                <li
                                    key={integrante.nome}
                                    className="flex items-center gap-3 border-b border-sutil px-card py-4 last:border-b-0"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-item text-titulo">
                                            {integrante.nome}
                                        </p>
                                        <p className="mt-1 text-apoio text-secundario">
                                            {integrante.competencia}
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center gap-2 rounded-badge bg-status-aprovada-fundo px-2.5 py-1 text-selo text-status-aprovada-texto">
                                        <span
                                            aria-hidden="true"
                                            className="size-1.5 rounded-full bg-current"
                                        />
                                        Integrante
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <p className="rounded-card border border-aviso-borda bg-aviso-fundo p-5 text-apoio text-ocre">
                        A quantidade de integrantes entra no requisito "de 4 a 6 pessoas" dos
                        desafios de Formação. A confirmação de cada um é pedida por
                        candidatura.
                    </p>
                </aside>
            </div>
        </CascaDoApp>
    )
}

export default PerfilDaSquad
