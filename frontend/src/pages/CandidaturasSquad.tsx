import { useState } from 'react'

import CascaDoApp from '../components/CascaDoApp'
import SeloStatus from '../components/SeloStatus'
import SeloDeTrilha from '../components/SeloDeTrilha'
import AbasDeFiltro, { type Aba } from '../components/AbasDeFiltro'
import { CustomButton } from '../components/CustomButton'
import { Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { LinkDeTexto } from '../components/squad/AvisoComLink'
import {
    candidaturasComDesafio,
    ESTADOS_COM_SPRINTS,
    ESTADOS_DECIDIDOS,
    linhaDoTempo,
    organizacoesPorId,
    rotaDaCandidatura,
    useSquadAtiva,
} from '../components/squad/dados'
import type { EstadoCandidatura } from '../api/candidaturas'
import { useDados } from '../hooks/useDados'
import { MENU_SQUAD } from '../navegacao/menus'
import { CARTAO_INTERATIVO } from '../estilos/classes'
import { formatarData, rotuloDoEstado, statusDoEstado, trilhaDoSelo } from '../estilos/formatos'

/**
 * 55 · Candidato squad — minhas candidaturas · rota /squad/candidaturas
 *
 * O que a squad enviou ou deixou em rascunho, com o estado de cada uma e o
 * atalho para continuar (rascunho) ou acompanhar as sprints.
 */

async function carregar(squadId: number) {
    const itens = await candidaturasComDesafio(squadId)
    const provedores = await organizacoesPorId(itens.flatMap((i) => (i.desafio ? [i.desafio.organizacaoId] : [])))
    return { itens, provedores }
}

type AbaId = 'todas' | 'andamento' | 'decididas'

function acao(estado: EstadoCandidatura): string {
    if (estado === 'RASCUNHO') return 'Continuar'
    if (ESTADOS_COM_SPRINTS.includes(estado)) return 'Acompanhar'
    return 'Ver candidatura'
}

function CandidaturasSquad() {
    const { squadId, nome } = useSquadAtiva()
    const [aba, setAba] = useState<AbaId>('todas')
    const { dados, carregando, erro, recarregar } = useDados(() => carregar(squadId!), [squadId], !!squadId)

    const todas = dados?.itens ?? []
    const decididas = todas.filter((i) => ESTADOS_DECIDIDOS.includes(i.candidatura.estado))
    const emAndamento = todas.filter((i) => !ESTADOS_DECIDIDOS.includes(i.candidatura.estado))
    const lista = aba === 'andamento' ? emAndamento : aba === 'decididas' ? decididas : todas

    const abas: Aba<AbaId>[] = [
        { id: 'todas', rotulo: 'Todas', quantidade: todas.length },
        { id: 'andamento', rotulo: 'Em andamento', quantidade: emAndamento.length },
        { id: 'decididas', rotulo: 'Decididas', quantidade: decididas.length },
    ]

    return (
        <CascaDoApp itens={MENU_SQUAD} voltarPara="/squad">
            <h1 className="font-display text-tela text-titulo">Minhas candidaturas</h1>
            <p className="mt-2 text-apoio text-secundario">
                Escolha uma candidatura para continuar o rascunho ou acompanhar as sprints. Elas pertencem à {nome}.
            </p>

            {carregando && !dados && <Carregando />}
            {erro && (
                <div className="mt-6">
                    <ErroNaTela mensagem={erro} tentarDeNovo={recarregar} />
                </div>
            )}

            {dados && (
                <>
                    <div className="mt-6">
                        <AbasDeFiltro abas={abas} ativa={aba} aoEscolher={setAba} rotulo="Filtrar candidaturas" variante="pilula" />
                    </div>

                    {lista.length === 0 ? (
                        <div className="mt-6">
                            <Vazio
                                titulo={
                                    todas.length === 0
                                        ? 'A squad ainda não tem candidaturas'
                                        : aba === 'decididas'
                                          ? 'Nenhuma candidatura decidida ainda'
                                          : 'Nenhuma candidatura em andamento'
                                }
                            >
                                {todas.length === 0 ? (
                                    <LinkDeTexto para="/squad/oportunidades">Ver os desafios abertos ›</LinkDeTexto>
                                ) : (
                                    'Quando sair o resultado de alguma, ela aparece aqui.'
                                )}
                            </Vazio>
                        </div>
                    ) : (
                        <ul className="mt-6 flex flex-col gap-4">
                            {lista.map(({ candidatura, desafio }) => (
                                <li key={candidatura.id}>
                                    <article className={CARTAO_INTERATIVO}>
                                        <div className="flex items-center gap-3">
                                            {desafio && <SeloDeTrilha trilha={trilhaDoSelo(desafio.trilhaCodigo)} />}
                                            <span className="text-apoio text-secundario">
                                                {desafio ? dados.provedores.get(desafio.organizacaoId)?.nome : ''}
                                            </span>
                                            <span className="ml-auto">
                                                <SeloStatus
                                                    status={statusDoEstado(candidatura.estado)}
                                                    rotulo={rotuloDoEstado(candidatura.estado)}
                                                    comPonto
                                                />
                                            </span>
                                        </div>

                                        <h2 className="mt-3 font-display text-bloco text-titulo">
                                            {desafio?.titulo ?? `Candidatura #${candidatura.id}`}
                                        </h2>
                                        {candidatura.tituloProposta && candidatura.tituloProposta !== desafio?.titulo && (
                                            <p className="mt-1 text-apoio text-titulo">{candidatura.tituloProposta}</p>
                                        )}

                                        <div className="mt-2 flex items-end gap-5">
                                            <p className="min-w-0 flex-1 text-apoio text-secundario">
                                                {linhaDoTempo(candidatura, formatarData)}
                                            </p>
                                            <CustomButton
                                                variant={candidatura.estado === 'RASCUNHO' ? 'aprovar' : 'neutro'}
                                                size="auto"
                                                to={rotaDaCandidatura(candidatura)}
                                            >
                                                {acao(candidatura.estado)}
                                            </CustomButton>
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

export default CandidaturasSquad
