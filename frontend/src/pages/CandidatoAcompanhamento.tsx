import { useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'

import { listarAjustes } from '../api/ajustes'
import { historicoDaCandidatura, type EventoAuditoria } from '../api/auditoria'
import { listarAvaliacoesDaCandidatura, type Avaliacao } from '../api/avaliacoes'
import { buscarCandidatura, type Candidatura, type EstadoCandidatura } from '../api/candidaturas'
import { mensagemDeErro } from '../api/erros'
import { buscarExtrato } from '../api/extratoElegibilidade'
import { buscarOportunidade } from '../api/oportunidades'
import { buscarOrganizacao } from '../api/organizacoes'
import { desistir } from '../api/resultado'
import CascaDoApp from '../components/CascaDoApp'
import { diasAteData, talvez } from '../components/candidato/apoio'
import {
    LinhaDoTempo,
    OQueFaltou,
    Secao,
    SeloDaElegibilidade,
    TabelaDeRequisitos,
    type PassoDaLinha,
} from '../components/candidato/Blocos'
import { CustomButton } from '../components/CustomButton'
import SeloDeTrilha from '../components/SeloDeTrilha'
import SeloStatus from '../components/SeloStatus'
import { Aviso, Carregando, ErroNaTela } from '../components/ui/Estados'
import Modal from '../components/ui/Modal'
import { CARTAO_COM_RESPIRO } from '../estilos/classes'
import {
    formatarData,
    formatarDataHora,
    rotuloDoEstado,
    ROTULO_TRILHA,
    statusDoEstado,
    trilhaDoSelo,
} from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_CANDIDATO } from '../navegacao/menus'

/**
 * 23, 23b, 08 e 42 · Candidato — acompanhamento, resultado e extrato · rota /candidato/candidaturas/:id
 *
 * A página muda conforme o estado: em análise (com quem está e o que vem
 * depois), pausada (a oportunidade tem suspensaEm), ajuste pedido, resultado
 * com os pareceres e o extrato da elegibilidade. Desistir aparece quando a
 * máquina de estados deixa.
 */

const ESTADOS_DA_ETAPA: EstadoCandidatura[][] = [
    ['RASCUNHO'],
    ['ENVIADA', 'ELEGIVEL', 'NAO_ELEGIVEL', 'DESCARTADA'],
    ['EM_ANALISE', 'AJUSTE', 'PERDA_DE_PRAZO'],
    ['APROVADA', 'REPROVADA', 'LISTA_DE_ESPERA', 'HOMOLOGADA', 'NAO_CONVOCADA', 'DESCLASSIFICADA'],
    ['EM_ACOMPANHAMENTO', 'DESISTENTE', 'CONCLUIDA'],
]

function etapaDo(estado: EstadoCandidatura): number {
    if (estado === 'NAO_ELEGIVEL' || estado === 'DESCARTADA') return 3
    return ESTADOS_DA_ETAPA.findIndex((e) => e.includes(estado))
}

function passosDa(c: Candidatura, eventos: EventoAuditoria[] | null): PassoDaLinha[] {
    const atual = etapaDo(c.estado)
    const final = c.estado === 'CONCLUIDA'
    const quando = (i: number): string | null => {
        const evento = (eventos ?? []).find((e) => e.estadoNovo && ESTADOS_DA_ETAPA[i].includes(e.estadoNovo as EstadoCandidatura))
        if (evento) {
            const autor = evento.autor?.nome ?? (evento.autorSistema ? 'sistema' : null)
            return `${formatarData(evento.ocorridoEm)}${autor ? ` · ${autor}` : ''}`
        }
        if (i === 0) return formatarData(c.criadaEm)
        if (i === 1 && c.enviadaEm) return formatarData(c.enviadaEm)
        return null
    }
    // barrada na elegibilidade: não passou pela análise
    if (c.estado === 'NAO_ELEGIVEL' || c.estado === 'DESCARTADA') {
        return [
            { rotulo: 'Rascunho', detalhe: quando(0) ?? '', situacao: 'feito' },
            { rotulo: 'Enviada', detalhe: quando(1) ?? '', situacao: 'feito' },
            { rotulo: rotuloDoEstado(c.estado), detalhe: quando(3) ?? 'na elegibilidade', situacao: 'atual' },
        ]
    }
    const rotulos = ['Rascunho', 'Enviada', 'Em análise', 'Decisão', 'Acompanhamento']
    return rotulos.map((rotulo, i) => {
        const situacao: PassoDaLinha['situacao'] = i < atual || final ? 'feito' : i === atual ? 'atual' : 'futuro'
        let nome = rotulo
        if (i === atual && i >= 2) nome = rotuloDoEstado(c.estado)
        const detalhe =
            quando(i) ??
            (situacao === 'futuro' ? (i === 4 ? 'se aprovada e homologada' : i === 3 ? 'depois da avaliação' : 'a seguir') : '')
        return { rotulo: nome, detalhe, situacao }
    })
}

/** Com quem está a candidatura e o que acontece depois, conforme o estado. */
function situacaoAgora(c: Candidatura, provedor: string): { agora: [string, string]; depois: [string, string] } | null {
    switch (c.estado) {
        case 'ENVIADA':
            return {
                agora: [`Conferência de ${provedor}`, 'Faltou um dado da organização para conferir algum requisito: o provedor confere e decide.'],
                depois: ['Elegível ou não elegível', 'Se for elegível, a candidatura segue para a avaliação.'],
            }
        case 'ELEGIVEL':
            return {
                agora: [provedor, 'A candidatura foi aceita na elegibilidade e espera o início da análise.'],
                depois: ['Avaliação', 'O provedor entrega a candidatura aos avaliadores.'],
            }
        case 'EM_ANALISE':
            return {
                agora: [`Avaliação de ${provedor}`, 'Os avaliadores estão avaliando. O resultado sai quando todos os avaliadores da rodada assinarem.'],
                depois: [
                    'Você recebe o resultado aqui',
                    'Com o extrato da elegibilidade, a nota final e o parecer de cada avaliação: aprovada, reprovada ou ajuste pedido.',
                ],
            }
        case 'APROVADA':
            return {
                agora: [provedor, 'A avaliação aprovou. Falta o provedor homologar o resultado dentro das vagas.'],
                depois: ['Homologação ou lista de espera', 'Se as vagas estiverem cheias, a candidatura entra na lista de espera.'],
            }
        case 'LISTA_DE_ESPERA':
            return {
                agora: [provedor, `A candidatura está na posição ${c.posicaoLista ?? '—'} da lista de espera.`],
                depois: ['Convocação', 'Quando abrir vaga, o provedor convoca pela ordem da lista.'],
            }
        case 'HOMOLOGADA':
            return {
                agora: [provedor, 'O resultado foi homologado: a organização ocupa uma vaga.'],
                depois: ['Acompanhamento', 'O provedor inicia o acompanhamento.'],
            }
        case 'EM_ACOMPANHAMENTO':
            return {
                agora: [provedor, 'A organização está em acompanhamento.'],
                depois: ['Conclusão', 'O provedor conclui o acompanhamento quando terminar.'],
            }
        default:
            return null
    }
}

export default function CandidatoAcompanhamento() {
    const { id } = useParams()
    const candidaturaId = Number(id)
    const { dados, carregando, erro, recarregar } = useDados(
        async () => {
            const candidatura = await buscarCandidatura(candidaturaId)
            const oportunidade = await buscarOportunidade(candidatura.oportunidadeId)
            const enviada = candidatura.estado !== 'RASCUNHO'
            const [provedor, extrato, avaliacoes, historico, ajustes] = await Promise.all([
                buscarOrganizacao(oportunidade.organizacaoId).catch(() => null),
                enviada ? talvez(buscarExtrato(candidaturaId)) : Promise.resolve(null),
                enviada ? talvez(listarAvaliacoesDaCandidatura(candidaturaId)) : Promise.resolve(null),
                talvez(historicoDaCandidatura(candidaturaId)),
                enviada ? talvez(listarAjustes(candidaturaId)) : Promise.resolve(null),
            ])
            return { candidatura, oportunidade, provedor, extrato, avaliacoes, historico, ajustes }
        },
        [candidaturaId],
        Number.isFinite(candidaturaId),
    )
    const [confirmarDesistencia, setConfirmarDesistencia] = useState(false)
    const [ocupado, setOcupado] = useState(false)
    const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

    const casca = (conteudo: ReactNode) => (
        <CascaDoApp itens={MENU_CANDIDATO} voltarPara="/candidato/candidaturas">
            {conteudo}
        </CascaDoApp>
    )
    if (carregando && !dados) return casca(<Carregando />)
    if (erro || !dados) return casca(<ErroNaTela mensagem={erro ?? 'Candidatura não encontrada'} tentarDeNovo={recarregar} />)

    const { candidatura: c, oportunidade, provedor, extrato, avaliacoes, historico, ajustes } = dados
    const nomeDoProvedor = provedor?.nome ?? 'o provedor'
    const eventos = historico.ok ? historico.valor : null
    const pausada = !!oportunidade.suspensaEm
    const agora = situacaoAgora(c, nomeDoProvedor)
    const pedidoAberto = ajustes?.ok ? ajustes.valor.find((p) => p.situacao === 'AGUARDANDO') : undefined
    const diasDoAjuste = diasAteData(pedidoAberto?.prazoReenvio)
    const visiveis: Avaliacao[] = avaliacoes?.ok ? avaliacoes.valor : []
    // pausada, nenhuma etapa anda (a API responde 409)
    const podeDesistir = c.proximosEstados.includes('DESISTENTE') && !pausada

    async function desistirAgora() {
        setOcupado(true)
        setAviso(null)
        try {
            await desistir(c.id)
            setConfirmarDesistencia(false)
            await recarregar()
            setAviso({ tipo: 'sucesso', texto: 'Desistência registrada. A vaga foi liberada.' })
        } catch (e) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
        } finally {
            setOcupado(false)
        }
    }

    return casca(
        <>
            <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <SeloDeTrilha trilha={trilhaDoSelo(oportunidade.trilhaCodigo)} />
                    </div>
                    <h1 className="mt-2 font-display text-tela text-titulo">{oportunidade.titulo}</h1>
                    <p className="mt-1 text-apoio text-secundario">
                        {provedor?.nome ?? 'Provedor'} · {ROTULO_TRILHA[oportunidade.trilhaCodigo]}
                        {c.enviadaEm ? ` · enviada em ${formatarData(c.enviadaEm)}` : ' · ainda não enviada'}
                        {c.tituloProposta && ` · ${c.tituloProposta}`}
                    </p>
                </div>
                <SeloStatus
                    status={pausada ? 'rascunho' : statusDoEstado(c.estado)}
                    rotulo={pausada ? `Pausada · ${rotuloDoEstado(c.estado)}` : rotuloDoEstado(c.estado)}
                    comPonto
                />
            </div>

            {aviso && (
                <div className="mt-4">
                    <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
                </div>
            )}

            {pausada && (
                <section className="mt-5 rounded-card border border-status-reprovada-borda bg-status-reprovada-fundo p-4">
                    <p className="text-bloco text-status-reprovada-texto">
                        Esta candidatura está pausada desde {formatarData(oportunidade.suspensaEm)}
                    </p>
                    <p className="mt-1 text-apoio text-titulo">
                        {provedor?.nome ?? 'O provedor'} está com a permissão de publicar suspensa pela gestão do Porto Digital.
                        Você não precisa fazer nada: nenhuma etapa anda durante a pausa, e a candidatura volta do ponto em que
                        parou quando a gestão aprovar um pedido novo do provedor.
                    </p>
                </section>
            )}

            {c.estado === 'RASCUNHO' && (
                <section className={`mt-5 flex flex-wrap items-center gap-4 ${CARTAO_COM_RESPIRO}`}>
                    <p className="min-w-0 flex-1 text-apoio text-secundario">
                        Esta candidatura ainda é um rascunho: o provedor só vê depois do envio.
                    </p>
                    <CustomButton to={`/candidato/candidaturas/${c.id}/editar`} variant="aprovar" size="auto">
                        Continuar a candidatura
                    </CustomButton>
                </section>
            )}

            {c.estado === 'AJUSTE' && (
                <section className="mt-5 flex flex-wrap items-center gap-4 rounded-card border border-aviso-borda bg-aviso-fundo p-5">
                    <div className="min-w-0 flex-1">
                        <p className="text-apoio text-ocre">
                            Ajuste pedido
                            {pedidoAberto && ` · reenviar até ${formatarDataHora(pedidoAberto.prazoReenvio)}`}
                            {diasDoAjuste !== null && diasDoAjuste >= 0 && ` (faltam ${diasDoAjuste} dias)`}
                        </p>
                        <p className="mt-1 font-display text-bloco text-titulo">
                            A avaliação pediu {pedidoAberto ? `${pedidoAberto.itens.length} correção(ões)` : 'correções'} antes de
                            decidir
                        </p>
                    </div>
                    <CustomButton to={`/candidato/candidaturas/${c.id}/ajuste`} variant="neutro" size="auto">
                        Corrigir e reenviar
                    </CustomButton>
                </section>
            )}

            {c.estado === 'PERDA_DE_PRAZO' && (
                <p className="mt-5 rounded-card border border-status-reprovada-borda bg-status-reprovada-fundo p-4 text-apoio text-status-reprovada-texto">
                    O prazo do ajuste venceu sem reenvio. O provedor pode reabrir o ajuste com um prazo novo; se isso acontecer, a
                    candidatura volta para Ajuste pedido.
                </p>
            )}

            <div className="mt-5">
                <Secao titulo="Linha do tempo">
                    <LinhaDoTempo passos={passosDa(c, eventos)} />
                    {eventos && eventos.length > 0 && (
                        <ol className="mt-5 flex flex-col gap-2 border-t border-sutil pt-4">
                            {eventos.map((e) => (
                                <li key={e.id} className="text-apoio text-secundario">
                                    <span className="text-titulo">{formatarDataHora(e.ocorridoEm)}</span> ·{' '}
                                    {e.estadoNovo ? rotuloDoEstado(e.estadoNovo) : e.acao}
                                    {(e.autor?.nome || e.autorSistema) && ` · ${e.autor?.nome ?? 'sistema'}`}
                                    {e.justificativa && ` · ${e.justificativa}`}
                                </li>
                            ))}
                        </ol>
                    )}
                    {!historico.ok && (
                        <p className="mt-4 text-legenda text-secundario">
                            O histórico detalhado (quem fez cada mudança) ainda não está disponível.
                        </p>
                    )}
                </Secao>
            </div>

            {agora && !pausada && (
                <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <section className={CARTAO_COM_RESPIRO}>
                        <p className="text-apoio text-secundario">Com quem está agora</p>
                        <p className="mt-1 font-display text-bloco text-titulo">{agora.agora[0]}</p>
                        <p className="mt-1 text-apoio text-secundario">{agora.agora[1]}</p>
                    </section>
                    <section className={CARTAO_COM_RESPIRO}>
                        <p className="text-apoio text-secundario">O que acontece depois</p>
                        <p className="mt-1 font-display text-bloco text-titulo">{agora.depois[0]}</p>
                        <p className="mt-1 text-apoio text-secundario">{agora.depois[1]}</p>
                    </section>
                </div>
            )}

            {c.estado !== 'RASCUNHO' && (
                <div className="mt-5 flex flex-col items-start gap-5 lg:flex-row">
                    <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
                        <Secao
                            titulo="Extrato da elegibilidade"
                            subtitulo="Guardado no envio: não muda mais, nem se o perfil da organização mudar depois."
                            acao={extrato?.ok ? <SeloDaElegibilidade situacao={extrato.valor.situacao} /> : undefined}
                        >
                            {!extrato?.ok ? (
                                <p className="text-apoio text-secundario">
                                    Não foi possível ler o extrato{extrato ? `: ${extrato.erro}` : ''}.
                                </p>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <OQueFaltou itens={extrato.valor.faltou} />
                                    <TabelaDeRequisitos
                                        linhas={extrato.valor.requisitos.map((r) => ({
                                            id: r.requisitoId,
                                            campo: r.campo,
                                            operador: r.operador,
                                            valorExigido: r.valorExigido,
                                            valorInformado: r.valorInformado,
                                            obrigatoria: r.obrigatoria,
                                            situacao: r.situacao,
                                        }))}
                                    />
                                </div>
                            )}
                        </Secao>

                        {visiveis.length > 0 && (
                            <Secao
                                titulo="Resultado das avaliações"
                                subtitulo="As avaliações assinadas aparecem quando a rodada fecha, sem o nome de quem avaliou."
                                acao={
                                    <CustomButton to={`/candidato/candidaturas/${c.id}/pareceres`} variant="neutro" size="auto">
                                        Ver pareceres e rodadas
                                    </CustomButton>
                                }
                                semRespiro
                            >
                                <ul>
                                    {visiveis.map((a, i) => (
                                        <li key={a.id} className="flex flex-col gap-2 border-b border-sutil px-card py-4 last:border-b-0">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="text-item text-titulo">
                                                    Avaliação {i + 1} · rodada {a.rodada}
                                                </span>
                                                {a.decisao && (
                                                    <SeloStatus status={statusDoEstado(a.decisao)} rotulo={rotuloDoEstado(a.decisao)} comPonto />
                                                )}
                                                {a.notaFinal !== null && (
                                                    <span className="ml-auto font-display text-bloco text-acento">
                                                        nota final {a.notaFinal}
                                                    </span>
                                                )}
                                            </div>
                                            {(a.parecerRetificado ?? a.parecer) && (
                                                <p className="text-apoio text-secundario">“{a.parecerRetificado ?? a.parecer}”</p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </Secao>
                        )}
                    </div>

                    <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-[344px]">
                        {visiveis.length === 0 && (
                            <section className={CARTAO_COM_RESPIRO}>
                                <h2 className="font-display text-bloco text-titulo">Pareceres</h2>
                                <p className="mt-2 text-apoio text-secundario">
                                    Os pareceres aparecem aqui quando a rodada de avaliação fechar.
                                </p>
                                <CustomButton to={`/candidato/candidaturas/${c.id}/pareceres`} variant="neutro" size="auto" className="mt-4">
                                    Ver elegibilidade e rodadas
                                </CustomButton>
                            </section>
                        )}
                        {podeDesistir && (
                            <section className="rounded-bloco border border-status-reprovada-borda bg-status-reprovada-fundo p-card">
                                <h2 className="font-display text-bloco text-status-reprovada-texto">Desistir da vaga</h2>
                                <p className="mt-2 text-apoio text-secundario">
                                    A desistência libera a vaga para a próxima da lista de espera e não pode ser desfeita.
                                </p>
                                <CustomButton
                                    type="button"
                                    variant="reprovar"
                                    size="grande"
                                    className="mt-4"
                                    onClick={() => setConfirmarDesistencia(true)}
                                >
                                    Desistir
                                </CustomButton>
                            </section>
                        )}
                    </aside>
                </div>
            )}

            <Modal
                aberto={confirmarDesistencia}
                titulo="Desistir desta candidatura?"
                descricao={`A organização sai de ${oportunidade.titulo} e a vaga passa para a próxima da lista de espera. Não dá para desfazer.`}
                aoFechar={() => setConfirmarDesistencia(false)}
                acoes={
                    <>
                        <CustomButton type="button" variant="neutro" size="auto" onClick={() => setConfirmarDesistencia(false)}>
                            Cancelar
                        </CustomButton>
                        <CustomButton type="button" variant="reprovar" size="auto" disabled={ocupado} onClick={desistirAgora}>
                            {ocupado ? 'Registrando…' : 'Confirmar desistência'}
                        </CustomButton>
                    </>
                }
            />
        </>,
    )
}
