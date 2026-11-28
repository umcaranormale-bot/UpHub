import { useState } from 'react'
import { useParams } from 'react-router-dom'

import CascaDoApp from '../components/CascaDoApp'
import SeloStatus from '../components/SeloStatus'
import { CustomButton } from '../components/CustomButton'
import { Aviso, Carregando, ErroNaTela } from '../components/ui/Estados'
import { Campo, CampoTexto } from '../components/ui/Campo'
import { LinkDeTexto } from '../components/squad/AvisoComLink'
import { ESTADOS_COM_SPRINTS, squadOuNada, useSquadAtiva, versaoPublicada } from '../components/squad/dados'
import { buscarCandidatura, editarCandidatura, enviarCandidatura, type Candidatura } from '../api/candidaturas'
import { mensagemDeErro } from '../api/erros'
import { buscarOportunidade } from '../api/oportunidades'
import { buscarOrganizacao } from '../api/organizacoes'
import {
    adicionarParticipante,
    confirmarParticipacao,
    listarParticipantes,
    removerParticipante,
    type Participante,
} from '../api/participantes'
import { listarIntegrantes } from '../api/squads'
import { useDados } from '../hooks/useDados'
import { MENU_SQUAD } from '../navegacao/menus'
import { ANEL_FOCO, CARTAO, CARTAO_COM_RESPIRO, TRANSICAO_COR } from '../estilos/classes'
import { formatarData, formatarDataHora, rotuloDoEstado, ROTULO_TRILHA, statusDoEstado } from '../estilos/formatos'

/**
 * 43 · Squad — montar a squad e candidatar · rota /squad/candidaturas/:id/editar
 *
 * A proposta, os integrantes que participam (cada um confirma por si, logado)
 * e o envio. Só o representante mexe e envia; depois do envio a tela fica só
 * para leitura.
 */

async function carregar(id: number) {
    const candidatura = await buscarCandidatura(id)
    const [desafio, versao, squad, participantes] = await Promise.all([
        buscarOportunidade(candidatura.oportunidadeId).catch(() => null),
        versaoPublicada(candidatura.oportunidadeId).catch(() => null),
        squadOuNada(candidatura.organizacaoId),
        listarParticipantes(id),
    ])
    const [integrantes, provedor] = await Promise.all([
        squad ? listarIntegrantes(squad.organizacaoId) : Promise.resolve([]),
        desafio ? buscarOrganizacao(desafio.organizacaoId).catch(() => null) : Promise.resolve(null),
    ])
    return { candidatura, desafio, versao, squad, participantes, integrantes, provedor }
}

const BOTAO_TEXTO = `rounded-card px-2 py-1 text-apoio text-acento ${TRANSICAO_COR} hover:text-titulo disabled:opacity-50 ${ANEL_FOCO}`

function FormularioDaProposta({
    candidatura,
    podeEditar,
    aoSalvar,
}: {
    candidatura: Candidatura
    podeEditar: boolean
    aoSalvar: (titulo: string, resumo: string) => Promise<void>
}) {
    const [titulo, setTitulo] = useState(candidatura.tituloProposta ?? '')
    const [resumo, setResumo] = useState(candidatura.resumoExecutivo ?? '')
    const [salvando, setSalvando] = useState(false)
    const mudou = titulo !== (candidatura.tituloProposta ?? '') || resumo !== (candidatura.resumoExecutivo ?? '')

    return (
        <form
            className="flex flex-col gap-4"
            onSubmit={async (e) => {
                e.preventDefault()
                setSalvando(true)
                await aoSalvar(titulo, resumo)
                setSalvando(false)
            }}
        >
            <Campo
                rotulo="Título da proposta"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={200}
                disabled={!podeEditar}
                ajuda="Obrigatório para enviar. Até 200 caracteres."
            />
            <CampoTexto
                rotulo="Experiência do time e proposta"
                value={resumo}
                onChange={(e) => setResumo(e.target.value)}
                disabled={!podeEditar}
                placeholder="O que a squad já entregou e como pretende resolver o desafio"
            />
            {podeEditar && (
                <div>
                    <CustomButton type="submit" variant="neutro" size="auto" disabled={!mudou || salvando}>
                        {salvando ? 'Salvando…' : 'Salvar proposta'}
                    </CustomButton>
                </div>
            )}
        </form>
    )
}

function SquadMontarCandidatura() {
    const { id } = useParams()
    const candidaturaId = Number(id)
    const { representante, pessoaId } = useSquadAtiva()
    const { dados, carregando, erro, recarregar } = useDados(() => carregar(candidaturaId), [candidaturaId], Number.isFinite(candidaturaId))
    const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)
    const [ocupado, setOcupado] = useState(false)

    async function executar(acao: () => Promise<unknown>, sucesso: string) {
        setOcupado(true)
        setAviso(null)
        try {
            await acao()
            await recarregar()
            setAviso({ tipo: 'sucesso', texto: sucesso })
        } catch (e) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
        } finally {
            setOcupado(false)
        }
    }

    if (!dados) {
        return (
            <CascaDoApp itens={MENU_SQUAD} voltarPara="/squad/candidaturas">
                {carregando && <Carregando />}
                {erro && <ErroNaTela mensagem={erro} tentarDeNovo={recarregar} />}
            </CascaDoApp>
        )
    }

    const { candidatura, desafio, versao, squad, participantes, integrantes, provedor } = dados
    const rascunho = candidatura.estado === 'RASCUNHO'
    const podeEditar = rascunho && representante
    const participantePorPessoa = new Map<number, Participante>(participantes.map((p) => [p.pessoaId, p]))
    // participante que não está mais na lista de integrantes continua aparecendo
    const linhas = [
        ...integrantes.map((i) => ({ pessoaId: i.pessoaId, nome: i.nome, competencia: i.competencia })),
        ...participantes
            .filter((p) => !integrantes.some((i) => i.pessoaId === p.pessoaId))
            .map((p) => ({ pessoaId: p.pessoaId, nome: p.nome, competencia: null as string | null })),
    ]
    const faltamConfirmar = participantes.filter((p) => !p.confirmouEm)
    const bloqueios: string[] = []
    if (!candidatura.tituloProposta) bloqueios.push('Preencha e salve o título da proposta.')
    if (participantes.length === 0) bloqueios.push('Inclua os integrantes da squad que participam.')
    if (faltamConfirmar.length > 0)
        bloqueios.push(
            `${faltamConfirmar.length} ${faltamConfirmar.length === 1 ? 'integrante ainda não confirmou' : 'integrantes ainda não confirmaram'} a participação: ${faltamConfirmar.map((p) => p.nome).join(', ')}.`,
        )

    const subtitulo = [
        provedor?.nome,
        desafio ? ROTULO_TRILHA[desafio.trilhaCodigo] : null,
        versao?.prazoEnvio ? `encerra em ${formatarData(versao.prazoEnvio)}` : null,
        rascunho && candidatura.salvaEm ? `salva em ${formatarDataHora(candidatura.salvaEm)}` : null,
        candidatura.enviadaEm ? `enviada em ${formatarDataHora(candidatura.enviadaEm)}` : null,
    ]
        .filter(Boolean)
        .join(' · ')

    return (
        <CascaDoApp itens={MENU_SQUAD} voltarPara="/squad/candidaturas">
            <div className="flex flex-wrap items-start gap-5">
                <div className="min-w-0 flex-1">
                    <h1 className="font-display text-tela text-titulo">Candidatura · {desafio?.titulo ?? `#${candidatura.id}`}</h1>
                    <p className="mt-2 text-apoio text-secundario">{subtitulo}</p>
                </div>
                <SeloStatus status={statusDoEstado(candidatura.estado)} rotulo={rotuloDoEstado(candidatura.estado)} comPonto />
            </div>

            {aviso && (
                <div className="mt-4">
                    <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
                </div>
            )}

            <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-start">
                <div className="flex min-w-0 flex-1 flex-col gap-5">
                    <section aria-labelledby="titulo-squad" className={CARTAO_COM_RESPIRO}>
                        <h2 id="titulo-squad" className="font-display text-bloco text-titulo">
                            A squad
                        </h2>
                        {squad ? (
                            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-apoio text-secundario">Nome da squad</dt>
                                    <dd className="mt-1 text-item text-titulo">{squad.nome}</dd>
                                </div>
                                <div>
                                    <dt className="text-apoio text-secundario">Código da coordenação</dt>
                                    <dd className="mt-1 text-item text-titulo">{squad.codigoCoordenacao ?? '—'}</dd>
                                </div>
                                {squad.descricao && (
                                    <div className="col-span-2">
                                        <dt className="text-apoio text-secundario">Descrição</dt>
                                        <dd className="mt-1 text-apoio text-titulo">{squad.descricao}</dd>
                                    </div>
                                )}
                            </dl>
                        ) : (
                            <p className="mt-2 text-apoio text-secundario">
                                A organização ainda não foi cadastrada como squad.{' '}
                                <LinkDeTexto para="/squad/perfil">Cadastrar no perfil ›</LinkDeTexto>
                            </p>
                        )}
                        <div className="mt-5 border-t border-sutil pt-5">
                            <FormularioDaProposta
                                key={`${candidatura.id}-${candidatura.salvaEm ?? ''}`}
                                candidatura={candidatura}
                                podeEditar={podeEditar}
                                aoSalvar={(titulo, resumo) =>
                                    executar(
                                        () => editarCandidatura(candidatura.id, { tituloProposta: titulo, resumoExecutivo: resumo }),
                                        'Proposta salva.',
                                    )
                                }
                            />
                        </div>
                    </section>

                    <section aria-labelledby="titulo-integrantes" className={CARTAO}>
                        <header className="border-b border-sutil bg-page/50 p-card">
                            <h2 id="titulo-integrantes" className="font-display text-bloco text-titulo">
                                Integrantes e confirmação
                            </h2>
                            <p className="mt-1 text-apoio text-secundario">
                                Cada integrante confirma a própria participação; só o representante inclui e envia
                            </p>
                        </header>
                        {linhas.length === 0 ? (
                            <p className="p-card text-apoio text-secundario">
                                A squad ainda não tem integrantes.{' '}
                                <LinkDeTexto para="/squad/perfil">Adicionar no perfil da squad ›</LinkDeTexto>
                            </p>
                        ) : (
                            <ul>
                                {linhas.map((linha) => {
                                    const participante = participantePorPessoa.get(linha.pessoaId)
                                    const souEu = linha.pessoaId === pessoaId
                                    return (
                                        <li
                                            key={linha.pessoaId}
                                            className="flex items-center gap-3 border-b border-sutil px-card py-4 last:border-b-0"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-item text-titulo">
                                                    {linha.nome}
                                                    {souEu && <span className="text-apoio text-secundario"> · você</span>}
                                                </p>
                                                <p className="mt-1 text-apoio text-secundario">
                                                    {[
                                                        linha.competencia,
                                                        participante?.confirmouEm
                                                            ? `confirmou em ${formatarData(participante.confirmouEm)}`
                                                            : participante
                                                              ? `incluído em ${formatarData(participante.conviteEnviadoEm)}`
                                                              : 'fora desta candidatura',
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </p>
                                            </div>
                                            {participante ? (
                                                participante.confirmouEm ? (
                                                    <SeloStatus status="aprovada" rotulo="Confirmado" />
                                                ) : (
                                                    <SeloStatus status="pendente" rotulo="Falta confirmar" />
                                                )
                                            ) : (
                                                <SeloStatus status="rascunho" rotulo="Não participa" />
                                            )}
                                            {rascunho && souEu && participante && !participante.confirmouEm && (
                                                <button
                                                    type="button"
                                                    disabled={ocupado}
                                                    className={BOTAO_TEXTO}
                                                    onClick={() =>
                                                        executar(() => confirmarParticipacao(candidatura.id), 'Participação confirmada.')
                                                    }
                                                >
                                                    Confirmar
                                                </button>
                                            )}
                                            {podeEditar && !participante && (
                                                <button
                                                    type="button"
                                                    disabled={ocupado}
                                                    className={BOTAO_TEXTO}
                                                    onClick={() =>
                                                        executar(
                                                            () => adicionarParticipante(candidatura.id, linha.pessoaId),
                                                            `${linha.nome} entrou na candidatura e precisa confirmar.`,
                                                        )
                                                    }
                                                >
                                                    Incluir
                                                </button>
                                            )}
                                            {podeEditar && participante && (
                                                <button
                                                    type="button"
                                                    disabled={ocupado}
                                                    className={BOTAO_TEXTO}
                                                    aria-label={`Tirar ${linha.nome} da candidatura`}
                                                    onClick={() =>
                                                        executar(
                                                            () => removerParticipante(candidatura.id, linha.pessoaId),
                                                            `${linha.nome} saiu da candidatura.`,
                                                        )
                                                    }
                                                >
                                                    Tirar
                                                </button>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </section>
                </div>

                <aside className="flex w-full shrink-0 lg:w-[344px] flex-col gap-5">
                    <section aria-labelledby="titulo-enviar" className={CARTAO_COM_RESPIRO}>
                        <h2 id="titulo-enviar" className="font-display text-bloco text-titulo">
                            {rascunho ? 'Enviar candidatura' : 'Candidatura enviada'}
                        </h2>
                        {rascunho ? (
                            <>
                                {bloqueios.length > 0 && (
                                    <div className="mt-4 rounded-card border border-status-reprovada-borda bg-status-reprovada-fundo px-4 py-3">
                                        <p className="text-item text-status-reprovada-texto">Envio bloqueado</p>
                                        <ul className="mt-1 flex flex-col gap-1 text-apoio text-status-reprovada-texto">
                                            {bloqueios.map((b) => (
                                                <li key={b}>{b}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {representante ? (
                                    <CustomButton
                                        type="button"
                                        variant="aprovar"
                                        size="grande"
                                        className="mt-4"
                                        disabled={bloqueios.length > 0 || ocupado}
                                        onClick={() =>
                                            executar(
                                                () => enviarCandidatura(candidatura.id),
                                                'Candidatura enviada. A elegibilidade foi conferida e o provedor já pode ver.',
                                            )
                                        }
                                    >
                                        Enviar candidatura
                                    </CustomButton>
                                ) : (
                                    <p className="mt-4 text-apoio text-secundario">Só o representante da squad envia a candidatura.</p>
                                )}
                                <p className="mt-3 text-apoio text-secundario">
                                    Ao enviar, o perfil da squad fica congelado e a elegibilidade é conferida. Depois do envio a
                                    candidatura não é mais editável.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="mt-2 text-apoio text-secundario">
                                    Situação: {rotuloDoEstado(candidatura.estado)}. Os dados ficam como foram enviados.
                                </p>
                                {ESTADOS_COM_SPRINTS.includes(candidatura.estado) && (
                                    <CustomButton
                                        variant="aprovar"
                                        size="grande"
                                        className="mt-4"
                                        to={`/squad/candidaturas/${candidatura.id}/sprints`}
                                    >
                                        Ver sprints e entregas
                                    </CustomButton>
                                )}
                            </>
                        )}
                    </section>

                    {desafio && (
                        <p className="px-1 text-apoio text-secundario">
                            <LinkDeTexto para={`/squad/oportunidades/${desafio.id}`}>Ver o desafio ›</LinkDeTexto>
                        </p>
                    )}
                </aside>
            </div>
        </CascaDoApp>
    )
}

export default SquadMontarCandidatura
