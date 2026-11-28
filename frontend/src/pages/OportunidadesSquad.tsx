import { useState } from 'react'

import CascaDoApp from '../components/CascaDoApp'
import SeloDeTrilha from '../components/SeloDeTrilha'
import AbasDeFiltro, { type Aba } from '../components/AbasDeFiltro'
import { CustomButton } from '../components/CustomButton'
import { Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { useSquadAtiva } from '../components/squad/dados'
import { recomendadas, type Match } from '../api/matching'
import { useDados } from '../hooks/useDados'
import { MENU_SQUAD } from '../navegacao/menus'
import { CARTAO_INTERATIVO, TRANSICAO_COR } from '../estilos/classes'
import { diasAte, formatarData, trilhaDoSelo } from '../estilos/formatos'

/**
 * 53 · Candidato squad — oportunidades · rota /squad/oportunidades
 *
 * Os desafios da trilha Formação abertos para a squad, em ordem de
 * compatibilidade (matching). Desafio em que a squad é inelegível não aparece.
 */

type AbaId = 'todas' | 'recomendadas' | 'candidatadas'

/** A partir daqui o desafio conta como recomendado. */
const CORTE_RECOMENDADA = 70

function prazo(m: Match): string {
    if (!m.prazoEnvio) return 'Sem prazo de envio'
    const dias = diasAte(m.prazoEnvio)
    return `Inscrições até ${formatarData(m.prazoEnvio)}${dias <= 7 ? ` · ${dias === 0 ? 'encerra hoje' : `faltam ${dias} dias`}` : ''}`
}

function OportunidadesSquad() {
    const { squadId, nome } = useSquadAtiva()
    const [aba, setAba] = useState<AbaId>('todas')
    const [busca, setBusca] = useState('')
    const { dados, carregando, erro, recarregar } = useDados(
        async () => (await recomendadas(squadId!, 100)).filter((m) => m.trilhaCodigo === 'FORMACAO'),
        [squadId],
        !!squadId,
    )

    const todas = dados ?? []
    const recomendadasLista = todas.filter((m) => m.compatibilidade >= CORTE_RECOMENDADA)
    const candidatadas = todas.filter((m) => m.jaSeCandidatou)
    const daAba = aba === 'recomendadas' ? recomendadasLista : aba === 'candidatadas' ? candidatadas : todas
    const termo = busca.trim().toLowerCase()
    const lista = termo
        ? daAba.filter((m) => `${m.oportunidadeTitulo} ${m.area ?? ''}`.toLowerCase().includes(termo))
        : daAba

    const abas: Aba<AbaId>[] = [
        { id: 'todas', rotulo: 'Todas', quantidade: todas.length },
        { id: 'recomendadas', rotulo: 'Recomendadas', quantidade: recomendadasLista.length },
        { id: 'candidatadas', rotulo: 'Já me candidatei', quantidade: candidatadas.length },
    ]

    return (
        <CascaDoApp itens={MENU_SQUAD} voltarPara="/squad">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                <div className="min-w-0 flex-1">
                    <h1 className="font-display text-tela text-titulo">Oportunidades</h1>
                    <p className="mt-2 text-apoio text-secundario">
                        {dados
                            ? `${todas.length} ${todas.length === 1 ? 'desafio de Formação aberto' : 'desafios de Formação abertos'} para a squad`
                            : 'Desafios de Formação abertos para a squad'}
                    </p>
                </div>

                <label className="w-full shrink-0 md:w-[320px]">
                    <span className="sr-only">Buscar oportunidade</span>
                    <input
                        type="search"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar por título ou área"
                        className={`w-full rounded-card border border-sutil bg-card px-4 py-3 text-apoio text-titulo outline-none ${TRANSICAO_COR} placeholder:text-secundario focus:border-acento focus-visible:shadow-foco`}
                    />
                </label>
            </div>

            {carregando && !dados && <Carregando />}
            {erro && (
                <div className="mt-6">
                    <ErroNaTela mensagem={erro} tentarDeNovo={recarregar} />
                </div>
            )}

            {dados && (
                <>
                    {recomendadasLista.length > 0 && (
                        <section
                            aria-label="Recomendação para a squad"
                            className="mt-6 flex items-center gap-5 rounded-card bg-acento-suave p-5"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="font-display text-bloco text-acento">
                                    {recomendadasLista.length}{' '}
                                    {recomendadasLista.length === 1 ? 'desafio combina' : 'desafios combinam'} com o perfil da{' '}
                                    {nome}
                                </p>
                                <p className="mt-1 text-apoio text-secundario">
                                    Na Formação, a compatibilidade pesa as competências dos integrantes, a elegibilidade e a área
                                </p>
                            </div>
                            <CustomButton variant="neutro" size="auto" onClick={() => setAba('recomendadas')}>
                                Ver recomendadas
                            </CustomButton>
                        </section>
                    )}

                    <div className="mt-6">
                        <AbasDeFiltro
                            abas={abas}
                            ativa={aba}
                            aoEscolher={setAba}
                            rotulo="Filtrar oportunidades"
                            variante="sublinhado"
                        />
                    </div>

                    {lista.length === 0 ? (
                        <div className="mt-6">
                            <Vazio titulo={termo ? 'Nenhum desafio com esse termo' : 'Nenhum desafio nesta aba'}>
                                {termo
                                    ? 'Tente outra palavra do título ou da área.'
                                    : 'Os desafios aparecem aqui quando estão publicados, no prazo e a squad é elegível.'}
                            </Vazio>
                        </div>
                    ) : (
                        <ul className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                            {lista.map((m) => (
                                <li key={m.oportunidadeId}>
                                    <article className={`flex h-full flex-col ${CARTAO_INTERATIVO}`}>
                                        <div className="flex items-center gap-3">
                                            <SeloDeTrilha trilha={trilhaDoSelo(m.trilhaCodigo)} />
                                            <span className="ml-auto text-apoio text-acento">{m.compatibilidade}% de match</span>
                                        </div>
                                        <h2 className="mt-3 font-display text-bloco text-titulo">{m.oportunidadeTitulo}</h2>
                                        {m.area && <p className="mt-1 text-apoio text-secundario">Área: {m.area}</p>}

                                        <div className="mt-auto flex items-center gap-3 pt-5">
                                            <span
                                                className={`inline-flex items-center gap-2 text-apoio ${
                                                    m.elegibilidade === 'ELEGIVEL' ? 'text-status-aprovada-texto' : 'text-ocre'
                                                }`}
                                            >
                                                <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                                                {m.jaSeCandidatou
                                                    ? 'Já se candidatou'
                                                    : m.elegibilidade === 'ELEGIVEL'
                                                      ? 'Elegível'
                                                      : 'Elegibilidade pendente'}
                                            </span>
                                            <span className="text-apoio text-secundario">{prazo(m)}</span>
                                            <span className="ml-auto">
                                                <CustomButton variant="aprovar" size="auto" to={`/squad/oportunidades/${m.oportunidadeId}`}>
                                                    Ver detalhes
                                                </CustomButton>
                                            </span>
                                        </div>
                                    </article>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </CascaDoApp>
    )
}

export default OportunidadesSquad
