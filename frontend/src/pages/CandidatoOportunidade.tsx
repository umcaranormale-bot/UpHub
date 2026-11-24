import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { criarCandidatura, listarCandidaturasDaOrganizacao } from '../api/candidaturas'
import { listarDocumentosExigidos } from '../api/documentosExigidos'
import { mensagemDeErro } from '../api/erros'
import { recomendadas } from '../api/matching'
import { buscarOportunidade } from '../api/oportunidades'
import { buscarOrganizacao } from '../api/organizacoes'
import { conferirElegibilidade, listarRequisitos, type Elegibilidade } from '../api/requisitos'
import { listarReservas } from '../api/reservas'
import { registrarVisualizacao } from '../api/visualizacoes'
import CascaDoApp from '../components/CascaDoApp'
import {
    diasAteData,
    formatarValor,
    podeCandidatar,
    QUEM_SE_CANDIDATA,
    rotaDaCandidatura,
    rotuloDoCampo,
    rotuloDoOperador,
    talvez,
    textoDosDias,
    versaoPublicada,
} from '../components/candidato/apoio'
import { BarrasDoMatch, LinhaDeLista, OQueFaltou, Secao, SeloDaElegibilidade, SeloDoRequisito } from '../components/candidato/Blocos'
import { BotaoFavorito } from '../components/candidato/CartaoDeOportunidade'
import useFavoritas from '../components/candidato/useFavoritas'
import { CustomButton } from '../components/CustomButton'
import SeloDeTrilha from '../components/SeloDeTrilha'
import SeloStatus from '../components/SeloStatus'
import { Aviso, Carregando, ErroNaTela } from '../components/ui/Estados'
import { CARTAO_COM_RESPIRO } from '../estilos/classes'
import {
    formatarData,
    rotuloDoEstado,
    ROTULO_TIPO_ORGANIZACAO,
    ROTULO_TRILHA,
    statusDoEstado,
    trilhaDoSelo,
} from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_CANDIDATO } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'

/**
 * 05, 24, 25 e 26 · Candidato — detalhe da oportunidade · rota /candidato/oportunidades/:id
 *
 * Uma página só para as três trilhas: a versão publicada (prazo, escopo,
 * vagas e reservas), os requisitos com o "conferir elegibilidade", os
 * documentos exigidos, o porquê da compatibilidade e o "Candidatar-se".
 * Registra a visualização ao abrir.
 */
export default function CandidatoOportunidade() {
    const { id } = useParams()
    const oportunidadeId = Number(id)
    const navigate = useNavigate()
    const { perfilAtivo } = useSessao()
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId
    const tipo = perfilAtivo?.organizacao?.tipo

    const { dados, carregando, erro, recarregar } = useDados(
        async () => {
            const oportunidade = await buscarOportunidade(oportunidadeId)
            const [versao, provedor, minhas, matching] = await Promise.all([
                versaoPublicada(oportunidadeId).catch(() => null),
                buscarOrganizacao(oportunidade.organizacaoId).catch(() => null),
                listarCandidaturasDaOrganizacao(organizacaoId as number),
                talvez(recomendadas(organizacaoId as number, 100)),
            ])
            const [requisitos, documentos, reservas] = versao
                ? await Promise.all([
                      talvez(listarRequisitos(oportunidadeId, versao.id)),
                      talvez(listarDocumentosExigidos(oportunidadeId, versao.id)),
                      talvez(listarReservas(oportunidadeId, versao.id)),
                  ])
                : [null, null, null]
            return {
                oportunidade,
                versao,
                provedor,
                candidatura: minhas.find((c) => c.oportunidadeId === oportunidadeId) ?? null,
                match: matching.ok ? (matching.valor.find((m) => m.oportunidadeId === oportunidadeId) ?? null) : null,
                requisitos,
                documentos,
                reservas,
            }
        },
        [oportunidadeId, organizacaoId],
        !!organizacaoId && Number.isFinite(oportunidadeId),
    )

    const favoritas = useFavoritas(organizacaoId)

    // a visualização conta uma vez por abertura da tela
    const registrada = useRef<string | null>(null)
    useEffect(() => {
        const chave = `${oportunidadeId}-${organizacaoId}`
        if (!organizacaoId || !Number.isFinite(oportunidadeId) || registrada.current === chave) return
        registrada.current = chave
        registrarVisualizacao(oportunidadeId, organizacaoId).catch(() => undefined)
    }, [oportunidadeId, organizacaoId])

    const [elegibilidade, setElegibilidade] = useState<Elegibilidade | null>(null)
    const [conferindo, setConferindo] = useState(false)
    const [candidatando, setCandidatando] = useState(false)
    const [erroAcao, setErroAcao] = useState<string | null>(null)

    if (carregando && !dados) {
        return (
            <CascaDoApp itens={MENU_CANDIDATO} voltarPara="/candidato/oportunidades">
                <Carregando />
            </CascaDoApp>
        )
    }
    if (erro || !dados) {
        return (
            <CascaDoApp itens={MENU_CANDIDATO} voltarPara="/candidato/oportunidades">
                <ErroNaTela mensagem={erro ?? 'Oportunidade não encontrada'} tentarDeNovo={recarregar} />
            </CascaDoApp>
        )
    }

    const { oportunidade, versao, provedor, candidatura, match, requisitos, documentos, reservas } = dados
    const trilha = oportunidade.trilhaCodigo
    const dias = diasAteData(versao?.prazoEnvio)
    const tipoAceito = podeCandidatar(trilha, tipo)
    const resultadoDo = new Map((elegibilidade?.requisitos ?? []).map((r) => [r.requisitoId, r]))

    // por que não dá para se candidatar (null = pode)
    const impedimento = !tipoAceito
        ? `Nesta trilha, só ${QUEM_SE_CANDIDATA[trilha]} se candidatam. A sua organização é do tipo ${
              ROTULO_TIPO_ORGANIZACAO[tipo ?? ''] ?? tipo ?? 'desconhecido'
          }.`
        : oportunidade.suspensaEm
          ? `Esta oportunidade está pausada desde ${formatarData(oportunidade.suspensaEm)}: a permissão do provedor foi revogada. Ela volta quando a gestão aprovar um pedido novo.`
          : oportunidade.estado !== 'PUBLICADA' || !versao
            ? 'Esta oportunidade não está recebendo candidaturas.'
            : dias !== null && dias < 0
              ? 'O prazo de envio desta oportunidade já passou.'
              : null

    async function conferir() {
        if (!versao || !organizacaoId) return
        setConferindo(true)
        setErroAcao(null)
        try {
            setElegibilidade(await conferirElegibilidade(oportunidadeId, versao.id, organizacaoId))
        } catch (e) {
            setErroAcao(mensagemDeErro(e))
        } finally {
            setConferindo(false)
        }
    }

    async function candidatar() {
        if (!organizacaoId) return
        setCandidatando(true)
        setErroAcao(null)
        try {
            const nova = await criarCandidatura(oportunidadeId, { organizacaoId })
            navigate(`/candidato/candidaturas/${nova.id}/editar`)
        } catch (e) {
            setErroAcao(mensagemDeErro(e))
            await recarregar()
        } finally {
            setCandidatando(false)
        }
    }

    return (
        <CascaDoApp itens={MENU_CANDIDATO} voltarPara="/candidato/oportunidades">
            <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <SeloDeTrilha trilha={trilhaDoSelo(trilha)} />
                        {oportunidade.area && <span className="text-apoio text-secundario">{oportunidade.area}</span>}
                    </div>
                    <h1 className="mt-2 font-display text-tela text-titulo">{oportunidade.titulo}</h1>
                    <p className="mt-1 text-apoio text-secundario">
                        {provedor?.nome ?? 'Provedor'} · {ROTULO_TRILHA[trilha]}
                        {versao?.prazoEnvio && ` · inscrições até ${formatarData(versao.prazoEnvio)}`}
                        {dias !== null && ` (${textoDosDias(dias)})`}
                    </p>
                </div>
                {favoritas.ids && (
                    <BotaoFavorito
                        favorita={favoritas.ids.has(oportunidadeId)}
                        titulo={oportunidade.titulo}
                        aoAlternar={() => favoritas.alternar(oportunidadeId)}
                    />
                )}
                {match && <SeloDaElegibilidade situacao={match.elegibilidade} />}
            </div>

            {oportunidade.suspensaEm && (
                <p className="mt-5 rounded-card border border-status-reprovada-borda bg-status-reprovada-fundo p-4 text-apoio text-status-reprovada-texto">
                    Oportunidade pausada desde {formatarData(oportunidade.suspensaEm)}: o provedor está com a permissão de publicar
                    suspensa. Nenhuma candidatura nova entra até a pausa terminar.
                </p>
            )}

            {(erroAcao || favoritas.erroDaAcao) && (
                <div className="mt-4">
                    <Aviso tipo="erro">{erroAcao ?? favoritas.erroDaAcao}</Aviso>
                </div>
            )}

            <div className="mt-6 flex flex-col items-start gap-6 lg:flex-row">
                <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
                    {(oportunidade.resumo || oportunidade.tese || versao?.escopo || versao?.entregaveis) && (
                        <Secao titulo="Sobre a oportunidade">
                            <dl className="flex flex-col gap-4">
                                {oportunidade.resumo && <Item rotulo="Resumo">{oportunidade.resumo}</Item>}
                                {oportunidade.tese && <Item rotulo="Tese de investimento">{oportunidade.tese}</Item>}
                                {versao?.escopo && <Item rotulo="Escopo">{versao.escopo}</Item>}
                                {versao?.entregaveis && <Item rotulo="Entregáveis">{versao.entregaveis}</Item>}
                            </dl>
                        </Secao>
                    )}

                    <Secao
                        titulo={elegibilidade ? 'Resultado da elegibilidade' : 'Requisitos de elegibilidade'}
                        subtitulo={
                            elegibilidade
                                ? 'Requisito por requisito, com o perfil atual da organização.'
                                : 'Confira, antes de se candidatar, se a organização atende cada regra.'
                        }
                        acao={
                            versao && requisitos?.ok && requisitos.valor.length > 0 ? (
                                <CustomButton type="button" variant="neutro" size="auto" onClick={conferir} disabled={conferindo}>
                                    {conferindo ? 'Conferindo…' : elegibilidade ? 'Conferir de novo' : 'Conferir elegibilidade'}
                                </CustomButton>
                            ) : undefined
                        }
                        semRespiro
                    >
                        {!versao ? (
                            <p className="p-card text-apoio text-secundario">Esta oportunidade ainda não tem versão publicada.</p>
                        ) : !requisitos?.ok ? (
                            <p className="p-card text-apoio text-secundario">
                                Não foi possível ler os requisitos{requisitos ? `: ${requisitos.erro}` : ''}.
                            </p>
                        ) : requisitos.valor.length === 0 ? (
                            <p className="p-card text-apoio text-secundario">Esta oportunidade não tem requisitos de elegibilidade.</p>
                        ) : (
                            <>
                                {elegibilidade && (
                                    <div className="flex flex-col gap-3 border-b border-sutil p-card">
                                        <div className="flex items-center gap-3">
                                            <span className="text-item text-titulo">Situação da organização</span>
                                            <SeloDaElegibilidade situacao={elegibilidade.situacao} />
                                        </div>
                                        <OQueFaltou itens={elegibilidade.faltou} />
                                        {elegibilidade.situacao === 'PENDENTE' && (
                                            <p className="text-apoio text-secundario">
                                                Pendente se resolve completando o{' '}
                                                <Link to="/candidato/organizacao" className="text-acento underline">
                                                    perfil da organização
                                                </Link>
                                                .
                                            </p>
                                        )}
                                    </div>
                                )}
                                <ul>
                                    {requisitos.valor.map((r) => {
                                        const resultado = resultadoDo.get(r.id)
                                        return (
                                            <LinhaDeLista
                                                key={r.id}
                                                titulo={rotuloDoCampo(r.campo)}
                                                apoio={
                                                    <>
                                                        exigido: {rotuloDoOperador(r.operador)} {formatarValor(r.valor)} ·{' '}
                                                        {r.obrigatoria ? 'obrigatória' : 'desejável'}
                                                        {resultado && (
                                                            <>
                                                                <br />
                                                                {resultado.explicacao}
                                                            </>
                                                        )}
                                                    </>
                                                }
                                            >
                                                {resultado && <SeloDoRequisito situacao={resultado.situacao} />}
                                            </LinhaDeLista>
                                        )
                                    })}
                                </ul>
                            </>
                        )}
                    </Secao>

                    {versao && (
                        <Secao titulo="Documentos exigidos" subtitulo="Anexados na hora de montar a candidatura." semRespiro>
                            {!documentos?.ok ? (
                                <p className="p-card text-apoio text-secundario">Não foi possível ler os documentos exigidos.</p>
                            ) : documentos.valor.length === 0 ? (
                                <p className="p-card text-apoio text-secundario">Esta oportunidade não exige documentos.</p>
                            ) : (
                                <ul>
                                    {documentos.valor.map((d) => (
                                        <LinhaDeLista key={d.id} titulo={d.nome}>
                                            <SeloStatus
                                                status={d.obrigatorio ? 'pendente' : 'rascunho'}
                                                rotulo={d.obrigatorio ? 'Obrigatório' : 'Opcional'}
                                            />
                                        </LinhaDeLista>
                                    ))}
                                </ul>
                            )}
                        </Secao>
                    )}

                    {match && match.motivos.length > 0 && (
                        <Secao
                            titulo={`De onde vem a compatibilidade de ${match.compatibilidade}`}
                            subtitulo="Pontos de cada critério do matching, com os pesos desta trilha."
                        >
                            <BarrasDoMatch motivos={match.motivos} />
                        </Secao>
                    )}
                </div>

                <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-[344px]">
                    <section className={CARTAO_COM_RESPIRO}>
                        <h2 className="font-display text-bloco text-titulo">Sua candidatura</h2>
                        {candidatura ? (
                            <>
                                <div className="mt-3 flex items-center gap-2">
                                    <SeloStatus
                                        status={statusDoEstado(candidatura.estado)}
                                        rotulo={rotuloDoEstado(candidatura.estado)}
                                        comPonto
                                    />
                                    <span className="text-apoio text-secundario">
                                        {candidatura.enviadaEm
                                            ? `enviada em ${formatarData(candidatura.enviadaEm)}`
                                            : `salva em ${formatarData(candidatura.salvaEm ?? candidatura.criadaEm)}`}
                                    </span>
                                </div>
                                <CustomButton
                                    to={rotaDaCandidatura(candidatura).para}
                                    variant="aprovar"
                                    size="grande"
                                    className="mt-4"
                                >
                                    {candidatura.estado === 'RASCUNHO' ? 'Continuar candidatura' : 'Ver candidatura'}
                                </CustomButton>
                            </>
                        ) : impedimento ? (
                            <p className="mt-3 rounded-card border border-aviso-borda bg-aviso-fundo p-4 text-apoio text-ocre">
                                {impedimento}
                            </p>
                        ) : (
                            <>
                                <p className="mt-2 text-apoio text-secundario">
                                    A candidatura nasce como rascunho. Você preenche, anexa os documentos e envia quando estiver
                                    pronta.
                                </p>
                                <CustomButton
                                    type="button"
                                    variant="aprovar"
                                    size="grande"
                                    className="mt-4"
                                    onClick={candidatar}
                                    disabled={candidatando}
                                >
                                    {candidatando ? 'Criando…' : 'Candidatar-se'}
                                </CustomButton>
                            </>
                        )}
                    </section>

                    {versao && (
                        <section className={CARTAO_COM_RESPIRO}>
                            <h2 className="font-display text-bloco text-titulo">Regras da versão publicada</h2>
                            <dl className="mt-3 flex flex-col gap-3">
                                <Item rotulo="Prazo de envio">{formatarData(versao.prazoEnvio)}</Item>
                                <Item rotulo="Vagas">
                                    {versao.quantidadeVagas ? `${versao.quantidadeVagas} vagas` : 'Sem limite de vagas'}
                                </Item>
                                {versao.notaMinima !== null && (
                                    <Item rotulo="Nota de prova">
                                        mínima {versao.notaMinima} · a nota vale {versao.validadeNotaDias} dias
                                    </Item>
                                )}
                                <Item rotulo="Prazo para ajuste">{versao.prazoAjusteDias} dias, se o avaliador pedir</Item>
                                {versao.cargaSemanalHoras !== null && (
                                    <Item rotulo="Carga semanal">{versao.cargaSemanalHoras} horas</Item>
                                )}
                                {versao.duracaoSemanas !== null && <Item rotulo="Duração">{versao.duracaoSemanas} semanas</Item>}
                            </dl>
                        </section>
                    )}

                    {reservas?.ok && reservas.valor.length > 0 && (
                        <section className={CARTAO_COM_RESPIRO}>
                            <h2 className="font-display text-bloco text-titulo">Vagas reservadas</h2>
                            <ul className="mt-3 flex flex-col gap-2">
                                {reservas.valor.map((r) => (
                                    <li key={r.id} className="flex items-center justify-between gap-3 text-apoio">
                                        <span className="text-titulo">{r.criterio}</span>
                                        <span className="text-secundario">
                                            {r.quantidade} {r.quantidade === 1 ? 'vaga' : 'vagas'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-3 text-legenda text-secundario">
                                Para concorrer a uma vaga reservada, marque a autodeclaração ao montar a candidatura. O provedor
                                confere depois da homologação.
                            </p>
                        </section>
                    )}
                </aside>
            </div>
        </CascaDoApp>
    )
}

function Item({ rotulo, children }: { rotulo: string; children: ReactNode }) {
    return (
        <div>
            <dt className="text-legenda text-secundario">{rotulo}</dt>
            <dd className="mt-1 whitespace-pre-line text-apoio text-titulo">{children}</dd>
        </div>
    )
}
