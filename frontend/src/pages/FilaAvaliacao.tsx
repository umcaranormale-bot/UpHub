import { useState } from 'react'
import { Link } from 'react-router-dom'

import CascaDoApp from '../components/CascaDoApp'
import { CustomButton } from '../components/CustomButton'
import Indicadores, { type Indicador } from '../components/Indicadores'
import SeloStatus from '../components/SeloStatus'
import { carregarFila, situacaoNaFila, SITUACAO_NA_FILA, type ItemDaFila } from '../components/avaliador/fila'
import ModalRetificar from '../components/avaliador/ModalRetificar'
import { Aviso, Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { ANEL_FOCO, CARTAO, TRANSICAO_COR } from '../estilos/classes'
import { diasAte, formatarData } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_AVALIADOR } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'

/** 75 · Avaliador — fila de avaliação (rodadas, rascunho e retificação) · rota /avaliador */

function Prazo({ data }: { data: string | null }) {
    if (!data) return <span className="text-apoio text-secundario">sem prazo</span>
    const dias = diasAte(data)
    return (
        <span className="text-apoio text-titulo">
            {formatarData(data)}
            <span className={`block text-legenda ${dias < 0 ? 'text-status-reprovada-texto' : 'text-secundario'}`}>
                {dias < 0 ? `venceu há ${-dias} dia(s)` : dias === 0 ? 'vence hoje' : `faltam ${dias} dia(s)`}
            </span>
        </span>
    )
}

function FilaAvaliacao() {
    const { pessoa, perfilAtivo } = useSessao()
    const { dados: fila, carregando, erro, recarregar } = useDados(() => carregarFila(), [])
    const [retificando, setRetificando] = useState<ItemDaFila | null>(null)
    const [aviso, setAviso] = useState<string | null>(null)

    const contagem = { avaliar: 0, rascunho: 0, assinada: 0, parada: 0 }
    for (const a of fila ?? []) contagem[situacaoNaFila(a)]++

    const indicadores: Indicador[] = [
        { id: 'avaliar', rotulo: 'A avaliar', valor: String(contagem.avaliar) },
        { id: 'rascunho', rotulo: 'Em rascunho', valor: String(contagem.rascunho), cor: 'text-ocre' },
        { id: 'assinadas', rotulo: 'Assinadas', valor: String(contagem.assinada), cor: 'text-status-aprovada-texto' },
        {
            id: 'fora',
            rotulo: 'Fora de análise',
            valor: String(contagem.parada),
            cor: 'text-secundario',
            apoio: 'a candidatura saiu da análise antes da sua assinatura',
        },
    ]

    return (
        <CascaDoApp itens={MENU_AVALIADOR}>
            <h1 className="font-display text-tela text-titulo">Fila de avaliação</h1>
            <p className="mt-2 text-apoio text-secundario">
                {pessoa?.nome} · {perfilAtivo?.vinculo.organizacaoNome} · aparecem só as candidaturas
                atribuídas a você
            </p>

            {aviso && (
                <div className="mt-6">
                    <Aviso tipo="sucesso">{aviso}</Aviso>
                </div>
            )}

            <div className="mt-6">
                {carregando && !fila ? (
                    <Carregando />
                ) : erro ? (
                    <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />
                ) : !fila || fila.length === 0 ? (
                    <Vazio titulo="Nenhuma candidatura na sua fila">
                        Quando o provedor atribuir uma candidatura a você, ela aparece aqui com o prazo e a
                        rodada.
                    </Vazio>
                ) : (
                    <>
                        <Indicadores itens={indicadores} rotulo="Resumo da fila" />

                        <section aria-label="Candidaturas atribuídas a você" className={`mt-6 relative overflow-x-auto ${CARTAO}`}>
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-sutil bg-page">
                                        {['Candidatura', 'Oportunidade', 'Rodada', 'Prazo', 'Situação', 'Ação'].map((c) => (
                                            <th key={c} scope="col" className="px-card py-3 text-selo text-secundario uppercase">
                                                {c}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {fila.map((a) => {
                                        const situacao = situacaoNaFila(a)
                                        const { rotulo, status } = SITUACAO_NA_FILA[situacao]
                                        return (
                                            <tr
                                                key={a.id}
                                                className={`border-b border-sutil last:border-b-0 hover:bg-page ${TRANSICAO_COR}`}
                                            >
                                                <td className="px-card py-4">
                                                    <p className="text-item text-titulo">{a.organizacaoNome}</p>
                                                    {a.tituloProposta && (
                                                        <p className="mt-1 text-apoio text-secundario">{a.tituloProposta}</p>
                                                    )}
                                                </td>
                                                <td className="px-card py-4 text-apoio text-secundario">
                                                    {a.oportunidadeTitulo}
                                                </td>
                                                <td className="px-card py-4">
                                                    {a.rodada > 1 ? (
                                                        <SeloStatus
                                                            status="pendente"
                                                            rotulo={`Rodada ${a.rodada} · reenviada`}
                                                            comPonto
                                                        />
                                                    ) : (
                                                        <span className="text-apoio text-secundario">Rodada 1</span>
                                                    )}
                                                </td>
                                                <td className="px-card py-4">
                                                    {a.assinadaEm ? (
                                                        <span className="text-apoio text-secundario">
                                                            assinada em {formatarData(a.assinadaEm)}
                                                        </span>
                                                    ) : (
                                                        <Prazo data={a.prazoAvaliacao} />
                                                    )}
                                                </td>
                                                <td className="px-card py-4">
                                                    <SeloStatus status={status} rotulo={rotulo} comPonto />
                                                    {a.parecerRetificado && (
                                                        <span className="mt-1 block text-legenda text-secundario">
                                                            parecer retificado
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-card py-4">
                                                    {situacao === 'avaliar' && (
                                                        <CustomButton variant="aprovar" size="auto" to={`/avaliador/avaliacoes/${a.id}`}>
                                                            Avaliar
                                                        </CustomButton>
                                                    )}
                                                    {situacao === 'rascunho' && (
                                                        <CustomButton variant="neutro" size="auto" to={`/avaliador/avaliacoes/${a.id}`}>
                                                            Continuar
                                                        </CustomButton>
                                                    )}
                                                    {situacao === 'assinada' && (
                                                        <div className="flex flex-col items-start gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setAviso(null)
                                                                    setRetificando(a)
                                                                }}
                                                                className={`rounded-card text-apoio font-semibold text-acento hover:text-titulo ${TRANSICAO_COR} ${ANEL_FOCO}`}
                                                            >
                                                                Retificar parecer
                                                            </button>
                                                            <Link
                                                                to={`/avaliador/avaliacoes/${a.id}`}
                                                                className={`rounded-card text-apoio text-secundario underline hover:text-titulo ${ANEL_FOCO}`}
                                                            >
                                                                Ver ficha
                                                            </Link>
                                                        </div>
                                                    )}
                                                    {situacao === 'parada' && (
                                                        <Link
                                                            to={`/avaliador/avaliacoes/${a.id}`}
                                                            className={`rounded-card text-apoio text-secundario underline hover:text-titulo ${ANEL_FOCO}`}
                                                        >
                                                            Ver ficha
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </section>
                    </>
                )}
            </div>

            <p className="mt-6 rounded-card bg-page p-5 text-apoio text-secundario">
                A avaliação tem nota por critério (de 0 a 10 quando o critério não tem escala), decisão e
                parecer. A nota final é a média ponderada, de 0 a 100. Pedir ajuste exige pelo menos um item;
                na rodada 3 não existe mais pedido de ajuste. Depois de assinar, só dá para retificar o parecer,
                com justificativa.
            </p>

            <ModalRetificar
                key={retificando?.id ?? 'fechado'}
                avaliacao={retificando}
                aoFechar={() => setRetificando(null)}
                aoRetificar={() => {
                    setRetificando(null)
                    setAviso('Parecer retificado. O candidato passa a ler o texto novo; o original fica no histórico.')
                    void recarregar()
                }}
            />
        </CascaDoApp>
    )
}

export default FilaAvaliacao
