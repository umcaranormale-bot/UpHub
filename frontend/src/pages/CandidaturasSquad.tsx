import { useState } from 'react'

import { CustomButton } from '../components/CustomButton'
import CascaDoApp from '../components/CascaDoApp'
import SeloStatus, { type Status } from '../components/SeloStatus'
import { MENU_SQUAD } from '../navegacao/menus'

/**
 * 55 · Candidato squad — minhas candidaturas · rota /candidaturas
 *
 * A lista do que a squad já enviou ou deixou em rascunho, com o estado de
 * cada uma e o atalho para continuar de onde parou.
 *
 * Dados simulados nesta etapa, conforme o Bloco 4: nenhuma chamada à API.
 */

type Trilha = 'fomento' | 'investimento' | 'formacao'

interface Candidatura {
    id: number
    trilha: Trilha
    ofertante: string
    titulo: string
    linhaDoTempo: string
    status: Status
    rotulo?: string
    acao: string
    decidida: boolean
}

const candidaturas: Candidatura[] = [
    {
        id: 1,
        trilha: 'formacao',
        ofertante: 'Movetech',
        titulo: 'Desafio Logística Urbana',
        linhaDoTempo:
            'Aprovada em 28/08 · em acompanhamento desde 02/09 · mentor Paulo Tavares',
        status: 'aprovada',
        rotulo: 'Em acompanhamento',
        acao: 'Acompanhar',
        decidida: false,
    },
    {
        id: 2,
        trilha: 'formacao',
        ofertante: 'Movetech',
        titulo: 'Desafio Rotas Verdes',
        linhaDoTempo:
            'Salva hoje às 19:08 · falta 1 integrante confirmar · encerra em 30/11',
        status: 'rascunho',
        acao: 'Continuar',
        decidida: false,
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

type Aba = 'todas' | 'andamento' | 'decididas'

function CandidaturasSquad() {
    const [aba, setAba] = useState<Aba>('todas')

    const emAndamento = candidaturas.filter((c) => !c.decidida)
    const decididas = candidaturas.filter((c) => c.decidida)

    const lista =
        aba === 'andamento' ? emAndamento : aba === 'decididas' ? decididas : candidaturas

    const abas: { id: Aba; rotulo: string; quantidade: number }[] = [
        { id: 'todas', rotulo: 'Todas', quantidade: candidaturas.length },
        { id: 'andamento', rotulo: 'Em andamento', quantidade: emAndamento.length },
        { id: 'decididas', rotulo: 'Decididas', quantidade: decididas.length },
    ]

    return (
        <CascaDoApp
            organizacao="Squad 3 · FICR"
            papel="Candidato · squad"
            iniciais="SC"
            nome="Sua Chen Letícia"
            itens={MENU_SQUAD}
            voltarPara="/inicio/squad"
        >
            <h1 className="font-display text-tela text-titulo">Minhas candidaturas</h1>
            <p className="mt-2 text-apoio text-secundario">
                Escolha uma candidatura para ver a linha do tempo e o resultado. Elas
                pertencem à Squad 3 · FICR.
            </p>

            <div
                role="tablist"
                aria-label="Filtrar candidaturas"
                className="mt-6 flex flex-wrap items-center gap-3"
            >
                {abas.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={aba === item.id}
                        onClick={() => setAba(item.id)}
                        className={`inline-flex items-center gap-2 rounded-badge border px-4 py-2 text-item transition-colors duration-[var(--dur-rapida)] ease-padrao focus-visible:shadow-foco focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento ${
                            aba === item.id
                                ? 'border-profundo bg-profundo text-white'
                                : 'border-sutil bg-card text-secundario hover:border-secundario'
                        }`}
                    >
                        {item.rotulo}
                        <span className={aba === item.id ? 'text-white' : 'text-secundario'}>
                            {item.quantidade}
                        </span>
                    </button>
                ))}
            </div>

            {lista.length === 0 ? (
                <p className="mt-8 rounded-bloco border border-sutil bg-card p-card text-apoio text-secundario shadow-card">
                    Nenhuma candidatura decidida ainda. Quando sair o resultado de alguma,
                    ela aparece aqui.
                </p>
            ) : (
                <ul className="mt-6 flex flex-col gap-4">
                    {lista.map((candidatura) => (
                        <li key={candidatura.id}>
                            <article className="rounded-bloco border border-sutil bg-card p-card shadow-card transition-[box-shadow,border-color,transform] duration-[var(--dur-padrao)] ease-padrao hover:-translate-y-px hover:shadow-card-hover">
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`rounded-badge px-2 py-1 text-selo ${corDaTrilha[candidatura.trilha]}`}
                                    >
                                        {rotuloDaTrilha[candidatura.trilha]}
                                    </span>
                                    <span className="text-apoio text-secundario">
                                        {candidatura.ofertante}
                                    </span>
                                    <span className="ml-auto">
                                        <SeloStatus
                                            status={candidatura.status}
                                            rotulo={candidatura.rotulo}
                                            comPonto
                                        />
                                    </span>
                                </div>

                                <h2 className="mt-3 font-display text-bloco text-titulo">
                                    {candidatura.titulo}
                                </h2>

                                <div className="mt-2 flex items-end gap-5">
                                    <p className="min-w-0 flex-1 text-apoio text-secundario">
                                        {candidatura.linhaDoTempo}
                                    </p>
                                    <CustomButton
                                        variant={
                                            candidatura.status === 'rascunho'
                                                ? 'aprovar'
                                                : 'neutro'
                                        }
                                        size="auto"
                                    >
                                        {candidatura.acao}
                                    </CustomButton>
                                </div>
                            </article>
                        </li>
                    ))}
                </ul>
            )}
        </CascaDoApp>
    )
}

export default CandidaturasSquad
