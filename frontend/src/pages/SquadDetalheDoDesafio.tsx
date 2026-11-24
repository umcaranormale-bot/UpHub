import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import CascaDoApp from '../components/CascaDoApp'
import SeloStatus, { type Status } from '../components/SeloStatus'
import { CustomButton } from '../components/CustomButton'
import { Aviso, Carregando, ErroNaTela } from '../components/ui/Estados'
import { LinkDeTexto } from '../components/squad/AvisoComLink'
import { rotaDaCandidatura, squadOuNada, useSquadAtiva, versaoPublicada } from '../components/squad/dados'
import { criarCandidatura, listarCandidaturasDaOrganizacao } from '../api/candidaturas'
import { mensagemDeErro } from '../api/erros'
import { recomendadas } from '../api/matching'
import { buscarOportunidade } from '../api/oportunidades'
import { buscarOrganizacao } from '../api/organizacoes'
import { conferirElegibilidade, listarCamposDeRequisito, type ResultadoRequisito, type ValorRequisito } from '../api/requisitos'
import { buscarResidencia } from '../api/residencias'
import { registrarVisualizacao } from '../api/visualizacoes'
import { useDados } from '../hooks/useDados'
import { MENU_SQUAD } from '../navegacao/menus'
import { CARTAO, CARTAO_COM_RESPIRO } from '../estilos/classes'
import { diasAte, formatarData, hoje, ROTULO_TRILHA } from '../estilos/formatos'

/**
 * 54 · Candidato squad — detalhe do desafio · rota /squad/oportunidades/:id
 *
 * Requisito por requisito (o que a squad atende), de onde vem a nota de
 * compatibilidade e o botão de montar a candidatura. Num desafio de
 * residência, só a squad que entrou nela se candidata.
 */

async function carregar(id: number, squadId: number) {
    const desafio = await buscarOportunidade(id)
    const [versao, provedor, squad, residencia, campos, matches, candidaturas] = await Promise.all([
        versaoPublicada(id).catch(() => null),
        buscarOrganizacao(desafio.organizacaoId).catch(() => null),
        squadOuNada(squadId),
        desafio.residenciaId ? buscarResidencia(desafio.residenciaId).catch(() => null) : Promise.resolve(null),
        listarCamposDeRequisito().catch(() => []),
        recomendadas(squadId, 100).catch(() => []),
        listarCandidaturasDaOrganizacao(squadId),
    ])
    const elegibilidade = versao ? await conferirElegibilidade(id, versao.id, squadId).catch(() => null) : null
    return {
        desafio,
        versao,
        provedor,
        squad,
        residencia,
        elegibilidade,
        descricaoDoCampo: new Map(campos.map((c) => [c.campo, c.descricao])),
        match: matches.find((m) => m.oportunidadeId === id) ?? null,
        candidatura: candidaturas.find((c) => c.oportunidadeId === id) ?? null,
    }
}

const SELO_DO_REQUISITO: Record<ResultadoRequisito['situacao'], { status: Status; rotulo: string }> = {
    ATENDIDO: { status: 'aprovada', rotulo: 'Atendido' },
    NAO_ATENDIDO: { status: 'reprovada', rotulo: 'Não atendido' },
    PENDENTE: { status: 'pendente', rotulo: 'Pendente' },
}

const SELO_DA_ELEGIBILIDADE: Record<string, { status: Status; rotulo: string }> = {
    ELEGIVEL: { status: 'aprovada', rotulo: 'Elegível' },
    INELEGIVEL: { status: 'reprovada', rotulo: 'Não elegível' },
    PENDENTE: { status: 'pendente', rotulo: 'Elegibilidade pendente' },
}

function valor(v: ValorRequisito | null): string {
    if (v === null || v === '') return 'não informado'
    return Array.isArray(v) ? v.join(', ') : String(v)
}

function SquadDetalheDoDesafio() {
    const { id } = useParams()
    const oportunidadeId = Number(id)
    const navigate = useNavigate()
    const { squadId, nome, representante } = useSquadAtiva()
    const { dados, carregando, erro, recarregar } = useDados(
        () => carregar(oportunidadeId, squadId!),
        [oportunidadeId, squadId],
        !!squadId && Number.isFinite(oportunidadeId),
    )
    const [criando, setCriando] = useState(false)
    const [erroAcao, setErroAcao] = useState<string | null>(null)

    // o provedor vê quem abriu o desafio (tela de visualizações dele)
    useEffect(() => {
        if (squadId && Number.isFinite(oportunidadeId)) {
            registrarVisualizacao(oportunidadeId, squadId).catch(() => undefined)
        }
    }, [oportunidadeId, squadId])

    async function montarCandidatura() {
        if (!squadId || !dados) return
        setCriando(true)
        setErroAcao(null)
        try {
            const nova = await criarCandidatura(oportunidadeId, {
                organizacaoId: squadId,
                tituloProposta: dados.desafio.titulo,
            })
            navigate(`/squad/candidaturas/${nova.id}/editar`)
        } catch (e) {
            setErroAcao(mensagemDeErro(e))
            setCriando(false)
        }
    }

    if (!dados) {
        return (
            <CascaDoApp itens={MENU_SQUAD} voltarPara="/squad/oportunidades">
                {carregando && <Carregando />}
                {erro && <ErroNaTela mensagem={erro} tentarDeNovo={recarregar} />}
            </CascaDoApp>
        )
    }

    const { desafio, versao, provedor, squad, residencia, elegibilidade, match, candidatura } = dados
    const prazo = versao?.prazoEnvio ?? null
    const prazoPassou = !!prazo && prazo < hoje()
    const foraDaResidencia = !!desafio.residenciaId && squad?.residenciaId !== desafio.residenciaId
    const atendidos = elegibilidade?.requisitos.filter((r) => r.situacao === 'ATENDIDO').length ?? 0

    // o que impede a candidatura, na ordem em que a squad resolveria
    let bloqueio: string | null = null
    if (desafio.suspensaEm) bloqueio = 'Este desafio está pausado: a permissão do provedor foi revogada.'
    else if (desafio.estado !== 'PUBLICADA' || !versao) bloqueio = 'Este desafio não está recebendo candidaturas.'
    else if (prazoPassou) bloqueio = 'O prazo de envio deste desafio já passou.'
    else if (!squad) bloqueio = 'Cadastre a squad no Perfil da squad antes de se candidatar.'
    else if (foraDaResidencia)
        bloqueio = `Este desafio é da residência ${residencia?.nome ?? ''}: a squad precisa entrar nela com o código da coordenação.`
    else if (elegibilidade?.situacao === 'INELEGIVEL')
        bloqueio = `A squad não atende aos requisitos obrigatórios${elegibilidade.faltou.length ? `: ${elegibilidade.faltou.join(', ')}` : ''}.`

    const selo = elegibilidade ? SELO_DA_ELEGIBILIDADE[elegibilidade.situacao] : null
    const subtitulo = [
        provedor?.nome,
        ROTULO_TRILHA[desafio.trilhaCodigo],
        residencia ? `residência ${residencia.nome}` : null,
        prazo ? `encerra em ${formatarData(prazo)}` : null,
    ]
        .filter(Boolean)
        .join(' · ')

    return (
        <CascaDoApp itens={MENU_SQUAD} voltarPara="/squad/oportunidades">
            <div className="flex flex-wrap items-start gap-5">
                <div className="min-w-0 flex-1">
                    <h1 className="font-display text-tela text-titulo">{desafio.titulo}</h1>
                    <p className="mt-2 text-apoio text-secundario">{subtitulo}</p>
                </div>
                {selo && <SeloStatus status={selo.status} rotulo={selo.rotulo} comPonto />}
            </div>

            {desafio.suspensaEm && (
                <div className="mt-4">
                    <Aviso tipo="erro">Desafio pausado desde {formatarData(desafio.suspensaEm)}: o provedor está sem permissão.</Aviso>
                </div>
            )}

            <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-start">
                <div className="flex min-w-0 flex-1 flex-col gap-5">
                    {(desafio.resumo || versao?.escopo || versao?.entregaveis) && (
                        <section aria-labelledby="titulo-sobre" className={CARTAO_COM_RESPIRO}>
                            <h2 id="titulo-sobre" className="font-display text-bloco text-titulo">
                                Sobre o desafio
                            </h2>
                            {desafio.resumo && <p className="mt-2 text-apoio text-secundario">{desafio.resumo}</p>}
                            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {versao?.escopo && (
                                    <div>
                                        <dt className="text-apoio text-secundario">Escopo</dt>
                                        <dd className="mt-1 whitespace-pre-line text-item text-titulo">{versao.escopo}</dd>
                                    </div>
                                )}
                                {versao?.entregaveis && (
                                    <div>
                                        <dt className="text-apoio text-secundario">Entregáveis</dt>
                                        <dd className="mt-1 whitespace-pre-line text-item text-titulo">{versao.entregaveis}</dd>
                                    </div>
                                )}
                                {versao?.cargaSemanalHoras != null && (
                                    <div>
                                        <dt className="text-apoio text-secundario">Carga semanal</dt>
                                        <dd className="mt-1 text-item text-titulo">{versao.cargaSemanalHoras} h por semana</dd>
                                    </div>
                                )}
                                {versao?.duracaoSemanas != null && (
                                    <div>
                                        <dt className="text-apoio text-secundario">Duração</dt>
                                        <dd className="mt-1 text-item text-titulo">{versao.duracaoSemanas} semanas</dd>
                                    </div>
                                )}
                                {versao?.quantidadeVagas != null && (
                                    <div>
                                        <dt className="text-apoio text-secundario">Vagas</dt>
                                        <dd className="mt-1 text-item text-titulo">{versao.quantidadeVagas}</dd>
                                    </div>
                                )}
                            </dl>
                        </section>
                    )}

                    <section aria-labelledby="titulo-requisitos" className={CARTAO}>
                        <header className="border-b border-sutil bg-page/50 p-card">
                            <h2 id="titulo-requisitos" className="font-display text-bloco text-titulo">
                                Requisitos de elegibilidade
                            </h2>
                            <p className="mt-1 text-apoio text-secundario">
                                Requisito por requisito: cada um não atendido indica o campo que resolve
                            </p>
                        </header>
                        {!elegibilidade || elegibilidade.requisitos.length === 0 ? (
                            <p className="p-card text-apoio text-secundario">
                                {elegibilidade ? 'Este desafio não tem requisitos de elegibilidade.' : 'Não foi possível conferir os requisitos agora.'}
                            </p>
                        ) : (
                            <ul>
                                {elegibilidade.requisitos.map((r) => (
                                    <li
                                        key={r.requisitoId}
                                        className="flex items-center gap-4 border-b border-sutil px-card py-4 last:border-b-0"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-item text-titulo">
                                                {dados.descricaoDoCampo.get(r.campo) ?? r.campo}
                                                <span className="text-apoio text-secundario">
                                                    {' '}
                                                    · {r.obrigatoria ? 'obrigatório' : 'desejável'}
                                                </span>
                                            </p>
                                            <p className="mt-1 text-apoio text-secundario">
                                                exigido: {valor(r.valorExigido)} · a squad tem: {valor(r.valorInformado)}
                                            </p>
                                            {r.situacao !== 'ATENDIDO' && r.explicacao && (
                                                <p className="mt-1 text-apoio text-secundario">{r.explicacao}</p>
                                            )}
                                        </div>
                                        <SeloStatus
                                            status={SELO_DO_REQUISITO[r.situacao].status}
                                            rotulo={SELO_DO_REQUISITO[r.situacao].rotulo}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {match && (
                        <section aria-labelledby="titulo-nota" className={CARTAO}>
                            <header className="border-b border-sutil bg-page/50 p-card">
                                <h2 id="titulo-nota" className="font-display text-bloco text-titulo">
                                    De onde vem a nota de compatibilidade · {match.compatibilidade}%
                                </h2>
                                <p className="mt-1 text-apoio text-secundario">
                                    Critérios e pesos da trilha Formação; critério sem dado sai da conta
                                </p>
                            </header>
                            <ul>
                                {match.motivos.map((m) => (
                                    <li
                                        key={m.criterio}
                                        className="flex items-center gap-4 border-b border-sutil px-card py-3 last:border-b-0"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-item text-titulo">{m.criterio}</p>
                                            <p className="mt-1 text-apoio text-secundario">{m.explicacao}</p>
                                        </div>
                                        <span className="text-apoio text-secundario">peso {m.peso}%</span>
                                        <span className="w-10 text-right font-display text-bloco text-titulo">{m.pontos}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <aside className="flex w-full shrink-0 lg:w-[344px] flex-col gap-5">
                    <section aria-labelledby="titulo-candidatar" className={CARTAO_COM_RESPIRO}>
                        {candidatura ? (
                            <>
                                <h2 id="titulo-candidatar" className="font-display text-bloco text-titulo">
                                    A {nome} já se candidatou
                                </h2>
                                <p className="mt-2 text-apoio text-secundario">
                                    Acompanhe a candidatura, os integrantes e, depois da aprovação, as sprints.
                                </p>
                                <CustomButton variant="aprovar" size="grande" className="mt-4" to={rotaDaCandidatura(candidatura)}>
                                    Ver candidatura
                                </CustomButton>
                            </>
                        ) : bloqueio ? (
                            <>
                                <h2 id="titulo-candidatar" className="font-display text-bloco text-titulo">
                                    A candidatura ainda não está liberada
                                </h2>
                                <p className="mt-2 text-apoio text-secundario">{bloqueio}</p>
                                {!squad && (
                                    <p className="mt-3">
                                        <LinkDeTexto para="/squad/perfil">Abrir o perfil da squad ›</LinkDeTexto>
                                    </p>
                                )}
                                {squad && foraDaResidencia && (
                                    <p className="mt-3">
                                        <LinkDeTexto para="/squad/residencia">Entrar na residência ›</LinkDeTexto>
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <h2 id="titulo-candidatar" className="font-display text-bloco text-titulo">
                                    A {nome} pode se candidatar
                                </h2>
                                <p className="mt-2 text-apoio text-secundario">
                                    {elegibilidade?.requisitos.length
                                        ? `A squad atende ${atendidos} de ${elegibilidade.requisitos.length} requisitos. `
                                        : ''}
                                    Monte a candidatura e peça a confirmação de cada integrante.
                                </p>
                                {prazo && diasAte(prazo) <= 7 && (
                                    <p className="mt-2 text-apoio text-ocre">
                                        {diasAte(prazo) === 0 ? 'Encerra hoje.' : `Faltam ${diasAte(prazo)} dias para o prazo.`}
                                    </p>
                                )}
                                {representante ? (
                                    <CustomButton
                                        type="button"
                                        variant="aprovar"
                                        size="grande"
                                        className="mt-4"
                                        onClick={montarCandidatura}
                                        disabled={criando}
                                    >
                                        {criando ? 'Criando…' : 'Montar candidatura'}
                                    </CustomButton>
                                ) : (
                                    <p className="mt-3 text-apoio text-secundario">
                                        Só o representante da squad monta e envia a candidatura.
                                    </p>
                                )}
                                {erroAcao && (
                                    <div className="mt-3">
                                        <Aviso tipo="erro">{erroAcao}</Aviso>
                                    </div>
                                )}
                            </>
                        )}
                    </section>

                    {residencia && (
                        <section aria-labelledby="titulo-residencia" className={CARTAO_COM_RESPIRO}>
                            <h2 id="titulo-residencia" className="font-display text-bloco text-titulo">
                                Desafio de residência
                            </h2>
                            <p className="mt-2 text-apoio text-secundario">
                                {residencia.nome} · {formatarData(residencia.inicio)} a {formatarData(residencia.fim)}. Só a squad
                                que entrou nesta residência se candidata.
                            </p>
                            <p className="mt-3 text-apoio">
                                {foraDaResidencia ? (
                                    <span className="text-ocre">A squad ainda não está nesta residência.</span>
                                ) : (
                                    <span className="text-status-aprovada-texto">A squad está nesta residência.</span>
                                )}
                            </p>
                        </section>
                    )}
                </aside>
            </div>
        </CascaDoApp>
    )
}

export default SquadDetalheDoDesafio
