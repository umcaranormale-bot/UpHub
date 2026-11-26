import { useState } from 'react'

import { CustomButton } from '../components/CustomButton'
import SeloStatus, { type Status } from '../components/SeloStatus'
import SeloDeTrilha, { type Trilha } from '../components/SeloDeTrilha'
import AbasDeFiltro, { type Aba } from '../components/AbasDeFiltro'

/**
 * 55 · Candidato squad — minhas candidaturas · rota /candidaturas
 *
 * A lista do que a squad já enviou ou deixou em rascunho, com o estado de
 * cada uma e o atalho para continuar de onde parou.
 *
 * Dados simulados nesta etapa, conforme o Bloco 4: nenhuma chamada à API.
 */


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



type AbaId = 'todas' | 'andamento' | 'decididas'

function CandidaturasSquad() {
    const [aba, setAba] = useState<AbaId>('todas')

    const emAndamento = candidaturas.filter((c) => !c.decidida)
    const decididas = candidaturas.filter((c) => c.decidida)

    const lista =
        aba === 'andamento' ? emAndamento : aba === 'decididas' ? decididas : candidaturas

    const abas: Aba<AbaId>[] = [
        { id: 'todas', rotulo: 'Todas', quantidade: candidaturas.length },
        { id: 'andamento', rotulo: 'Em andamento', quantidade: emAndamento.length },
        { id: 'decididas', rotulo: 'Decididas', quantidade: decididas.length },
    ]

    return (
        <div>
            <h1 className="font-display text-tela text-titulo">Minhas candidaturas</h1>
            <p className="mt-2 text-apoio text-secundario">
                Escolha uma candidatura para ver a linha do tempo e o resultado. Elas
                pertencem à Squad 3 · FICR.
            </p>

            <div className="mt-6">

                <AbasDeFiltro
                    abas={abas}
                    ativa={aba}
                    aoEscolher={setAba}
                    rotulo="Filtrar candidaturas"
                    variante="pilula"
                />

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
                                    <SeloDeTrilha trilha={candidatura.trilha} />
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

                                <div className="mt-2 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:gap-5">
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
        </div>
    )
}

export default CandidaturasSquad
