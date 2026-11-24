import { useState } from 'react'

import { CustomButton } from '../components/CustomButton'
import SeloStatus, { type Status } from '../components/SeloStatus'
import SeloDeTrilha, { type Trilha } from '../components/SeloDeTrilha'
import AbasDeFiltro, { type Aba } from '../components/AbasDeFiltro'

/**
 * 38 · Mentor — convites de alocação · rota /convites
 *
 * HU-15: cada convite traz organização, desafio, horas previstas e prazo de
 * resposta. Sem resposta até o prazo, o convite expira sozinho.
 *
 * Dados simulados nesta etapa, conforme o Bloco 4: nenhuma chamada à API.
 */


interface Convite {
    id: number
    trilha: Trilha
    ofertante: string
    titulo: string
    condicoes: string
    status: Status
    rotulo: string
    acao: string
    aceita: boolean
}

const convites: Convite[] = [
    {
        id: 1,
        trilha: 'formacao',
        ofertante: 'Movetech',
        titulo: 'Desafio Logística Urbana · Squad Alpha',
        condicoes: '8 h/mês previstas · responder até 08/11/2026 · faltam 3 dias',
        status: 'pendente',
        rotulo: 'Pendente',
        acao: 'Ver convite',
        aceita: false,
    },
    {
        id: 2,
        trilha: 'formacao',
        ofertante: 'CESAR',
        titulo: 'Desafio Saúde Conectada',
        condicoes: '6 h/mês previstas · responder até 12/11/2026 · faltam 7 dias',
        status: 'pendente',
        rotulo: 'Pendente',
        acao: 'Ver convite',
        aceita: false,
    },
    {
        id: 3,
        trilha: 'formacao',
        ofertante: 'Movetech',
        titulo: 'Desafio Logística Urbana · Squad 3 · FICR',
        condicoes: 'Aceita em 02/09 · 12 h 30 min registradas · 2 sprints avaliadas',
        status: 'aprovada',
        rotulo: 'Aceita',
        acao: 'Abrir histórico',
        aceita: true,
    },
]



type AbaId = 'todas' | 'pendentes' | 'aceitas'

function ConvitesMentor() {
    const [aba, setAba] = useState<AbaId>('todas')

    const pendentes = convites.filter((c) => !c.aceita)
    const aceitas = convites.filter((c) => c.aceita)

    const lista = aba === 'pendentes' ? pendentes : aba === 'aceitas' ? aceitas : convites

    const abas: Aba<AbaId>[] = [
        { id: 'todas', rotulo: 'Todas', quantidade: convites.length },
        { id: 'pendentes', rotulo: 'Pendentes', quantidade: pendentes.length },
        { id: 'aceitas', rotulo: 'Aceitas', quantidade: aceitas.length },
    ]

    return (
        <div>
            <h1 className="font-display text-tela text-titulo">Convites de alocação</h1>
            <p className="mt-2 text-apoio text-secundario">
                HU-15 · cada convite traz organização, desafio, horas previstas e prazo de
                resposta. Sem resposta até o prazo, o convite expira sozinho.
            </p>

            <div className="mt-6">

                <AbasDeFiltro
                    abas={abas}
                    ativa={aba}
                    aoEscolher={setAba}
                    rotulo="Filtrar convites"
                    variante="pilula"
                />

            </div>

            <ul className="mt-6 flex flex-col gap-4">
                {lista.map((convite) => (
                    <li key={convite.id}>
                        <article className="rounded-bloco border border-sutil bg-card p-card shadow-card transition-[box-shadow,border-color,transform] duration-[var(--dur-padrao)] ease-padrao hover:-translate-y-px hover:shadow-card-hover">
                            <div className="flex flex-wrap items-center gap-3">
                                <SeloDeTrilha trilha={convite.trilha} />
                                <span className="text-apoio text-secundario">
                                    {convite.ofertante}
                                </span>
                                <span className="ml-auto flex flex-wrap items-center gap-4">
                                    <SeloStatus
                                        status={convite.status}
                                        rotulo={convite.rotulo}
                                        comPonto
                                    />
                                    <CustomButton
                                        variant={convite.aceita ? 'aprovar' : 'neutro'}
                                        size="auto"
                                    >
                                        {convite.acao}
                                    </CustomButton>
                                </span>
                            </div>

                            <h2 className="mt-3 font-display text-bloco text-titulo">
                                {convite.titulo}
                            </h2>
                            <p className="mt-1 text-apoio text-secundario">
                                {convite.condicoes}
                            </p>
                        </article>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default ConvitesMentor
