import { Link } from 'react-router-dom'

import { listarAjustes } from '../api/ajustes'
import { recomendadas, type Match } from '../api/matching'
import { listarMinhasProvas } from '../api/provas'
import CascaDoApp from '../components/CascaDoApp'
import {
    candidaturasComOportunidade,
    diasAteData,
    emAndamento,
    rotaDaCandidatura,
    talvez,
    textoDosDias,
    versaoPublicada,
} from '../components/candidato/apoio'
import { CustomButton } from '../components/CustomButton'
import SeloDeTrilha from '../components/SeloDeTrilha'
import SeloStatus from '../components/SeloStatus'
import { Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { ANEL_FOCO, CARTAO, CARTAO_INTERATIVO, TRANSICAO_COR } from '../estilos/classes'
import {
    formatarData,
    formatarDataHora,
    rotuloDoEstado,
    statusDoEstado,
    trilhaDoSelo,
} from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_CANDIDATO } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'

/**
 * 20 · Candidato — início · rota /candidato
 *
 * O que pede ação hoje (ajuste pedido, rascunho, prazo perto), as
 * oportunidades recomendadas pelo matching e, à direita, as candidaturas em
 * andamento e a nota de prova mais recente.
 */

/** Prazo que já conta como "perto" (em dias). */
const PRAZO_PERTO = 7
const QUANTAS_RECOMENDADAS = 3

interface AvisoDeAcao {
    id: string
    contexto: string
    chamada: string
    acao: string
    para: string
}

async function carregar(organizacaoId: number) {
    const [lista, matching, provas] = await Promise.all([
        candidaturasComOportunidade(organizacaoId),
        talvez(recomendadas(organizacaoId, 100)),
        listarMinhasProvas().catch(() => []),
    ])

    const avisos: AvisoDeAcao[] = []
    await Promise.all(
        lista.map(async ({ candidatura: c, oportunidade }) => {
            const titulo = oportunidade?.titulo ?? `Oportunidade ${c.oportunidadeId}`
            if (c.estado === 'AJUSTE') {
                const pedidos = await listarAjustes(c.id).catch(() => [])
                const pedido = pedidos.find((p) => p.situacao === 'AGUARDANDO')
                const dias = diasAteData(pedido?.prazoReenvio)
                avisos.push({
                    id: `ajuste-${c.id}`,
                    contexto: pedido
                        ? `Ajuste pedido · reenviar até ${formatarDataHora(pedido.prazoReenvio)}${
                              dias !== null && dias >= 0 ? ` (faltam ${dias} dias)` : ''
                          }`
                        : 'Ajuste pedido',
                    chamada: `${titulo} · a avaliação pediu ${pedido ? `${pedido.itens.length} correção(ões)` : 'correções'} antes de decidir`,
                    acao: 'Corrigir e reenviar',
                    para: `/candidato/candidaturas/${c.id}/ajuste`,
                })
            }
            if (c.estado === 'RASCUNHO') {
                const versao = await versaoPublicada(c.oportunidadeId).catch(() => null)
                const dias = diasAteData(versao?.prazoEnvio)
                avisos.push({
                    id: `rascunho-${c.id}`,
                    contexto:
                        versao?.prazoEnvio && dias !== null
                            ? `Rascunho · envio até ${formatarData(versao.prazoEnvio)} (${textoDosDias(dias)})`
                            : 'Candidatura em rascunho',
                    chamada: `${titulo} · sua candidatura ainda não foi enviada`,
                    acao: 'Continuar candidatura',
                    para: `/candidato/candidaturas/${c.id}/editar`,
                })
            }
            if (c.estado === 'PERDA_DE_PRAZO') {
                avisos.push({
                    id: `prazo-${c.id}`,
                    contexto: 'Perdeu o prazo do ajuste',
                    chamada: `${titulo} · o provedor pode reabrir o ajuste com um prazo novo`,
                    acao: 'Ver candidatura',
                    para: `/candidato/candidaturas/${c.id}`,
                })
            }
        }),
    )

    const abertas = matching.ok ? matching.valor : []
    for (const m of abertas) {
        const dias = diasAteData(m.prazoEnvio)
        if (!m.jaSeCandidatou && dias !== null && dias >= 0 && dias <= PRAZO_PERTO) {
            avisos.push({
                id: `perto-${m.oportunidadeId}`,
                contexto: `Prazo perto · ${textoDosDias(dias)}`,
                chamada: `${m.oportunidadeTitulo} · ${m.compatibilidade} de compatibilidade com o seu perfil`,
                acao: 'Ver detalhes',
                para: `/candidato/oportunidades/${m.oportunidadeId}`,
            })
        }
    }
    // ajuste primeiro, depois rascunho, perda de prazo e prazo perto
    const ordem = ['ajuste', 'rascunho', 'prazo', 'perto']
    avisos.sort((a, b) => ordem.indexOf(a.id.split('-')[0]) - ordem.indexOf(b.id.split('-')[0]))

    return { lista, matching, avisos, prova: provas[0] ?? null }
}

export default function CandidateHome() {
    const { pessoa, perfilAtivo } = useSessao()
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId
    const { dados, carregando, erro, recarregar } = useDados(
        () => carregar(organizacaoId as number),
        [organizacaoId],
        !!organizacaoId,
    )

    const primeiroNome = pessoa?.nome.split(' ')[0] ?? ''
    const sugestoes = dados?.matching.ok
        ? dados.matching.valor.filter((m) => !m.jaSeCandidatou).slice(0, QUANTAS_RECOMENDADAS)
        : []
    const andamento = (dados?.lista ?? []).filter((i) => emAndamento(i.candidatura.estado)).slice(0, 5)

    return (
        <CascaDoApp itens={MENU_CANDIDATO}>
            <h1 className="font-display text-tela text-titulo">Olá, {primeiroNome}</h1>
            <p className="mt-1 text-apoio text-secundario">
                {perfilAtivo?.vinculo.organizacaoNome}
                {dados?.matching.ok && ` · ${dados.matching.valor.length} oportunidades abertas para o perfil da organização`}
            </p>

            {carregando && !dados ? (
                <Carregando />
            ) : erro || !dados ? (
                <div className="mt-6">
                    <ErroNaTela mensagem={erro ?? 'Não foi possível carregar o início'} tentarDeNovo={recarregar} />
                </div>
            ) : (
                <div className="mt-6 flex flex-col items-start gap-6 lg:flex-row">
                    <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
                        {dados.avisos.length > 0 && (
                            <ul aria-label="Pede a sua ação" className="flex flex-col gap-4">
                                {dados.avisos.map((a) => (
                                    <li key={a.id}>
                                        <section
                                            aria-label={a.contexto}
                                            className="flex flex-wrap items-center gap-5 rounded-card border border-aviso-borda bg-aviso-fundo p-5"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-apoio text-ocre">{a.contexto}</p>
                                                <p className="mt-1 font-display text-bloco text-titulo">{a.chamada}</p>
                                            </div>
                                            <CustomButton to={a.para} variant="neutro" size="auto">
                                                {a.acao}
                                            </CustomButton>
                                        </section>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="mt-2 flex items-center gap-3">
                            <h2 className="font-display text-bloco text-titulo">Para você · ordenado por compatibilidade</h2>
                            <Link
                                to="/candidato/recomendadas"
                                className={`ml-auto rounded-card px-1 text-apoio text-acento hover:text-titulo ${TRANSICAO_COR} ${ANEL_FOCO}`}
                            >
                                Ver recomendadas
                            </Link>
                        </div>

                        {!dados.matching.ok ? (
                            <ErroNaTela mensagem={dados.matching.erro} tentarDeNovo={recarregar} />
                        ) : sugestoes.length === 0 ? (
                            <Vazio titulo="Nenhuma recomendação nova agora">
                                Complete o{' '}
                                <Link to="/candidato/organizacao" className="text-acento underline">
                                    perfil da organização
                                </Link>{' '}
                                para o matching encontrar mais oportunidades.
                            </Vazio>
                        ) : (
                            <ul className="flex flex-col gap-4">
                                {sugestoes.map((m) => (
                                    <li key={m.oportunidadeId}>
                                        <Sugestao match={m} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[344px]">
                        <section aria-labelledby="titulo-candidaturas" className={CARTAO}>
                            <header className="flex items-center justify-between gap-3 border-b border-sutil p-card">
                                <h2 id="titulo-candidaturas" className="font-display text-bloco text-titulo">
                                    Minhas candidaturas
                                </h2>
                                <Link
                                    to="/candidato/candidaturas"
                                    className={`rounded-card px-1 text-apoio text-acento ${TRANSICAO_COR} hover:text-titulo ${ANEL_FOCO}`}
                                >
                                    Ver todas
                                </Link>
                            </header>
                            {andamento.length === 0 ? (
                                <p className="p-card text-apoio text-secundario">Nenhuma candidatura em andamento.</p>
                            ) : (
                                <ul>
                                    {andamento.map(({ candidatura: c, oportunidade }) => (
                                        <li key={c.id} className="border-b border-sutil last:border-b-0">
                                            <Link
                                                to={rotaDaCandidatura(c).para}
                                                className={`flex items-center gap-3 px-card py-4 hover:bg-page ${TRANSICAO_COR} ${ANEL_FOCO}`}
                                            >
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-item text-titulo">
                                                        {oportunidade?.titulo ?? `Oportunidade ${c.oportunidadeId}`}
                                                    </span>
                                                    <span className="mt-1 block text-apoio text-secundario">
                                                        {c.enviadaEm
                                                            ? `enviada em ${formatarData(c.enviadaEm)}`
                                                            : `salva em ${formatarDataHora(c.salvaEm ?? c.criadaEm)}`}
                                                    </span>
                                                </span>
                                                <SeloStatus status={statusDoEstado(c.estado)} rotulo={rotuloDoEstado(c.estado)} comPonto />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        {dados.prova && (
                            <section aria-labelledby="titulo-nota" className={`${CARTAO} p-card`}>
                                <h2 id="titulo-nota" className="font-display text-bloco text-titulo">
                                    Minha nota de prova
                                </h2>
                                <p className="mt-3 rounded-card bg-status-aprovada-fundo px-4 py-3 text-apoio text-status-aprovada-texto">
                                    {dados.prova.nota}
                                    {dados.prova.area ? ` em ${dados.prova.area}` : ''} · prova em {formatarData(dados.prova.dataProva)}
                                </p>
                                <p className="mt-2 text-legenda text-secundario">
                                    A nota é sua, não da organização. A validade depende de cada oportunidade.
                                </p>
                            </section>
                        )}
                    </aside>
                </div>
            )}
        </CascaDoApp>
    )
}

function Sugestao({ match: m }: { match: Match }) {
    const melhor = [...m.motivos].sort((a, b) => b.pontos - a.pontos)[0]
    return (
        <article className={CARTAO_INTERATIVO}>
            <div className="flex items-center gap-3">
                <SeloDeTrilha trilha={trilhaDoSelo(m.trilhaCodigo)} />
                {m.area && <span className="text-apoio text-secundario">{m.area}</span>}
                <span className="ml-auto text-apoio text-acento">{m.compatibilidade} de compatibilidade</span>
            </div>
            <h3 className="mt-3 font-display text-bloco text-titulo">{m.oportunidadeTitulo}</h3>
            <div className="mt-2 flex flex-wrap items-end gap-5">
                <p className="min-w-0 flex-1 text-apoio text-secundario">
                    {melhor && (
                        <>
                            <span className="text-titulo">Por que apareceu:</span> {melhor.explicacao}
                        </>
                    )}
                    {m.prazoEnvio && (
                        <span className="block">Inscrições até {formatarData(m.prazoEnvio)}</span>
                    )}
                </p>
                <CustomButton to={`/candidato/oportunidades/${m.oportunidadeId}`} variant="neutro" size="auto">
                    Ver detalhes
                </CustomButton>
            </div>
        </article>
    )
}
