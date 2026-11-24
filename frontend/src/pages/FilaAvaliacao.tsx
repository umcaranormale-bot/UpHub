import { useMemo, useState } from 'react'

import { CustomButton } from '../components/CustomButton'
import SeloStatus from '../components/SeloStatus'
import { ANEL_FOCO, TRANSICAO_COR, TRANSICAO_ELEVACAO } from '../estilos/classes'

/**
 * 07 · Avaliador — rubrica e parecer · rota /avaliacao
 *
 * Tela inicial do avaliador: a fila já filtrada pela elegibilidade à esquerda
 * e a ficha da candidatura à direita, com a rubrica publicada e o parecer.
 *
 * Dados simulados nesta etapa, conforme o Bloco 4: nenhuma chamada à API.
 * A nota final é calculada aqui pelos pesos, nunca digitada à mão.
 */

// Transições do design system: cor em 140ms, elevação e layout em 200ms.


const PRAZO = { data: '30/11/2026', diasRestantes: 28 }
const TOTAL_NA_FILA = 17

interface Candidatura {
    id: number
    nome: string
    situacao: string
    compatibilidade: number
}

interface Criterio {
    id: string
    titulo: string
    /** Percentual; a soma dos pesos fecha em 100. */
    peso: number
    nota: number
}

const candidaturas: Candidatura[] = [
    { id: 1, nome: 'Nordeste Dados ME', situacao: 'em avaliação por mim', compatibilidade: 81 },
    { id: 2, nome: 'Colab Software', situacao: 'aguardando', compatibilidade: 74 },
    { id: 3, nome: 'Rota Verde Tech', situacao: 'aguardando', compatibilidade: 69 },
    { id: 4, nome: 'Mobi Recife', situacao: 'aguardando', compatibilidade: 66 },
]

const criteriosDaOportunidade: Criterio[] = [
    { id: 'aderencia', titulo: 'Aderência ao tema do edital', peso: 40, nota: 9 },
    { id: 'tecnica', titulo: 'Capacidade técnica do time', peso: 30, nota: 9.5 },
    { id: 'historico', titulo: 'Histórico de entrega', peso: 20, nota: 9 },
    { id: 'contrapartida', titulo: 'Contrapartida oferecida', peso: 10, nota: 8.5 },
]

const PARECER_INICIAL =
    'Proposta aderente ao tema do edital, com equipe técnica comprovada e ' +
    'histórico de entrega consistente. Contrapartida adequada ao porte da empresa.'

function FilaAvaliacao() {
    const [selecionada, setSelecionada] = useState(candidaturas[0].id)
    const [notas, setNotas] = useState<Record<string, number>>(
        Object.fromEntries(criteriosDaOportunidade.map((c) => [c.id, c.nota])),
    )
    const [parecer, setParecer] = useState(PARECER_INICIAL)

    const notaFinal = useMemo(
        () =>
            criteriosDaOportunidade.reduce(
                (total, criterio) => total + (notas[criterio.id] ?? 0) * (criterio.peso / 100),
                0,
            ),
        [notas],
    )

    const candidatura = candidaturas.find((c) => c.id === selecionada) ?? candidaturas[0]
    const podeDecidir = parecer.trim().length > 0

    return (
        <div>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between sm:gap-6">
                <div>
                    <h1 className="font-display text-tela text-titulo">
                        Ficha da candidatura · {candidatura.nome}
                    </h1>
                    <p className="mt-2 text-apoio text-secundario">
                        Inova PE 2026 · candidatura 1 de 17 · passo 4 do fluxo do avaliador
                    </p>
                </div>
                <SeloStatus status="avaliacao" />
            </div>

            <div className="mt-8 flex flex-col gap-6 xl:flex-row">
                {/* Coluna da fila */}
                <section
                    aria-labelledby="titulo-fila"
                    className="w-full shrink-0 xl:w-[300px]"
                >
                    <h2
                        id="titulo-fila"
                        className="text-selo text-titulo uppercase"
                    >
                        Minha fila · {TOTAL_NA_FILA} candidaturas
                    </h2>
                    <p className="mt-2 text-apoio text-secundario">
                        Só candidaturas elegíveis entram aqui. Ordenada por
                        compatibilidade: a ordem é sugestão, não decisão.
                    </p>
                    <p className="mt-3 text-apoio text-acento">
                        Prazo para avaliar: {PRAZO.data} · faltam {PRAZO.diasRestantes} dias
                    </p>

                    <ul className="mt-4 flex flex-col gap-3">
                        {candidaturas.map((item) => {
                            const ativa = item.id === selecionada
                            return (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => setSelecionada(item.id)}
                                        aria-current={ativa ? 'true' : undefined}
                                        className={[
                                            'w-full rounded-bloco border bg-card p-card text-left shadow-card',
                                            'hover:-translate-y-px hover:shadow-card-hover',
                                            TRANSICAO_ELEVACAO,
                                            ANEL_FOCO,
                                            ativa
                                                ? 'border-acento shadow-acento'
                                                : 'border-sutil hover:border-acento',
                                        ].join(' ')}
                                    >
                                        <span className="block text-item text-titulo">
                                            {item.nome}
                                        </span>
                                        <span className="mt-1 block text-apoio text-secundario">
                                            {item.situacao}
                                        </span>
                                        <span className="mt-1 block text-apoio text-acento">
                                            compatibilidade {item.compatibilidade}
                                        </span>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </section>

                {/* Coluna da ficha */}
                <div className="flex min-w-0 flex-1 flex-col gap-6">
                    <section
                        aria-labelledby="titulo-rubrica"
                        className="rounded-bloco border border-sutil bg-card shadow-card"
                    >
                        <header className="border-b border-sutil p-card">
                            <h2
                                id="titulo-rubrica"
                                className="font-display text-bloco text-titulo"
                            >
                                Pontuar pela rubrica
                            </h2>
                            <p className="mt-1 text-apoio text-secundario">
                                US-20 · critérios e pesos vêm da oportunidade, nunca do
                                código. A nota final é calculada pelo sistema.
                            </p>
                        </header>

                        {criteriosDaOportunidade.map((criterio) => (
                            <div
                                key={criterio.id}
                                className={`flex items-center gap-4 border-b border-sutil px-card py-4 hover:bg-page ${TRANSICAO_COR}`}
                            >
                                <label
                                    htmlFor={`nota-${criterio.id}`}
                                    className="min-w-0 flex-1 text-corpo text-titulo"
                                >
                                    {criterio.titulo}
                                </label>
                                <span className="text-apoio text-secundario">
                                    peso {criterio.peso}%
                                </span>
                                <span className="flex items-center gap-1">
                                    <input
                                        id={`nota-${criterio.id}`}
                                        type="number"
                                        min={0}
                                        max={10}
                                        step={0.5}
                                        value={notas[criterio.id]}
                                        onChange={(evento) =>
                                            setNotas((atual) => ({
                                                ...atual,
                                                [criterio.id]: Number(evento.target.value),
                                            }))
                                        }
                                        className={`w-16 rounded-card border border-sutil px-2 py-1 text-right text-corpo text-titulo ${TRANSICAO_ELEVACAO} ${ANEL_FOCO} hover:border-acento`}
                                    />
                                    <span className="text-corpo text-secundario">/ 10</span>
                                </span>
                            </div>
                        ))}

                        <div className="flex items-center justify-between bg-acento-suave px-card py-4">
                            <span className="text-corpo text-acento">
                                Nota final ponderada
                            </span>
                            <output
                                aria-live="polite"
                                className="font-display text-bloco text-acento"
                            >
                                {notaFinal.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </output>
                        </div>
                    </section>

                    <section
                        aria-labelledby="titulo-parecer"
                        className="rounded-bloco border border-sutil bg-card p-card shadow-card"
                    >
                        <div className="flex items-center gap-3">
                            <h2
                                id="titulo-parecer"
                                className="font-display text-bloco text-titulo"
                            >
                                Parecer (obrigatório)
                            </h2>
                            <span className="rounded-badge bg-acento-suave px-2 py-1 text-selo text-acento">
                                Diferencial 02
                            </span>
                        </div>

                        <p className="mt-1 text-apoio text-secundario" id="ajuda-parecer">
                            É exatamente este texto que o candidato lê no extrato. Decisão
                            sem parecer é recusada pelo sistema (US-21).
                        </p>

                        <label htmlFor="parecer" className="sr-only">
                            Parecer da avaliação
                        </label>
                        <textarea
                            id="parecer"
                            rows={4}
                            value={parecer}
                            aria-describedby="ajuda-parecer"
                            onChange={(evento) => setParecer(evento.target.value)}
                            className={`mt-4 w-full rounded-card border border-sutil p-4 text-corpo text-titulo ${TRANSICAO_ELEVACAO} ${ANEL_FOCO} hover:border-acento`}
                        />
                    </section>

                    <div className="flex flex-wrap items-center gap-3">
                        <CustomButton variant="aprovar" size="auto" disabled={!podeDecidir}>
                            Aprovar
                        </CustomButton>
                        <CustomButton variant="reprovar" size="auto" disabled={!podeDecidir}>
                            Reprovar
                        </CustomButton>
                        <CustomButton variant="neutro" size="auto">
                            Pedir ajuste
                        </CustomButton>

                        {!podeDecidir && (
                            <p role="alert" className="text-corpo text-status-reprovada-texto">
                                Escreva o parecer para liberar a decisão.
                            </p>
                        )}

                        <button
                            type="button"
                            className={`ml-auto rounded-card px-1 text-corpo text-acento underline hover:text-titulo ${TRANSICAO_COR} ${ANEL_FOCO}`}
                        >
                            Salvar pontuação sem decidir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FilaAvaliacao
