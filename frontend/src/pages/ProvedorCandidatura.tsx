import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { listarAjustes, type PedidoAjuste } from '../api/ajustes'
import { historicoDaCandidatura, type EventoAuditoria } from '../api/auditoria'
import { listarAutodeclaracoes, type Autodeclaracao } from '../api/autodeclaracoes'
import { listarAvaliacoesDaCandidatura } from '../api/avaliacoes'
import { buscarCandidatura } from '../api/candidaturas'
import { buscarExtrato, type Extrato } from '../api/extratoElegibilidade'
import { listarNotas, type NotaCriterio } from '../api/notasPorCriterio'
import { buscarOportunidade } from '../api/oportunidades'
import { listarVersoes } from '../api/versoes'
import CascaDoApp from '../components/CascaDoApp'
import SeloStatus, { type Status } from '../components/SeloStatus'
import AcoesDaCandidatura from '../components/provedor/AcoesDaCandidatura'
import Cabecalho, { Bloco } from '../components/provedor/Cabecalho'
import { formatarNota, nomeDaOrganizacao, versaoEmVigor } from '../components/provedor/dados'
import { estaSuspensa, formatarValor, LINK_ACAO, rotuloDoCampo, rotuloDoOperador } from '../components/provedor/rotulos'
import { Aviso, Carregando, ErroNaTela } from '../components/ui/Estados'
import { formatarData, formatarDataHora, formatarMoeda, rotuloDoEstado, statusDoEstado } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_PROVEDOR } from '../navegacao/menus'

/**
 * 08 e 42 · Provedor — extrato da candidatura, na visão do provedor ·
 * rota /provedor/candidaturas/:id
 *
 * Linha do tempo (histórico de auditoria), extrato da elegibilidade, notas por
 * critério de cada avaliação, pareceres, ajustes e autodeclaração.
 */

const SITUACAO: Record<string, { rotulo: string; status: Status }> = {
    ATENDIDO: { rotulo: 'Atendido', status: 'aprovada' },
    NAO_ATENDIDO: { rotulo: 'Não atendido', status: 'reprovada' },
    PENDENTE: { rotulo: 'Pendente', status: 'pendente' },
}

function ProvedorCandidatura() {
    const { id } = useParams()
    const candidaturaId = Number(id)
    const [aviso, setAviso] = useState<string | null>(null)

    const { dados, carregando, erro, recarregar } = useDados(
        async () => {
            const candidatura = await buscarCandidatura(candidaturaId)
            const [oportunidade, nome, extrato, avaliacoes, historico, ajustes, autodeclaracoes, versoes] = await Promise.all([
                buscarOportunidade(candidatura.oportunidadeId),
                nomeDaOrganizacao(candidatura.organizacaoId),
                buscarExtrato(candidaturaId).catch(() => null as Extrato | null),
                listarAvaliacoesDaCandidatura(candidaturaId).catch(() => []),
                historicoDaCandidatura(candidaturaId).catch(() => null as EventoAuditoria[] | null),
                listarAjustes(candidaturaId).catch(() => [] as PedidoAjuste[]),
                listarAutodeclaracoes(candidaturaId).catch(() => [] as Autodeclaracao[]),
                listarVersoes(candidatura.oportunidadeId).catch(() => []),
            ])
            const notas = new Map<number, NotaCriterio[]>(
                await Promise.all(
                    avaliacoes
                        .filter((a) => a.assinadaEm)
                        .map(async (a) => [a.id, await listarNotas(a.id).catch(() => [] as NotaCriterio[])] as const),
                ),
            )
            return { candidatura, oportunidade, nome, extrato, avaliacoes, historico, ajustes, autodeclaracoes, notas, versao: versaoEmVigor(versoes) }
        },
        [candidaturaId],
    )

    const c = dados?.candidatura

    return (
        <CascaDoApp itens={MENU_PROVEDOR} voltarPara={c ? `/provedor/candidaturas?oportunidade=${c.oportunidadeId}` : '/provedor/candidaturas'}>
            {carregando && !dados && <Carregando />}
            {erro && <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />}

            {dados && c && (
                <>
                    <Cabecalho
                        titulo={`${dados.nome} · ${dados.oportunidade.titulo}`}
                        apoio={`${c.tituloProposta ?? 'Sem título de proposta'} · enviada em ${formatarData(c.enviadaEm)}${
                            c.valorSolicitado !== null ? ` · valor solicitado ${formatarMoeda(c.valorSolicitado)}` : ''
                        }`}
                        acoes={<SeloStatus status={statusDoEstado(c.estado)} rotulo={rotuloDoEstado(c.estado)} comPonto />}
                    />

                    <div className="mt-6 flex flex-col gap-5">
                        {aviso && <Aviso tipo="sucesso">{aviso}</Aviso>}

                        <AcoesDaCandidatura
                            candidatura={c}
                            nome={dados.nome}
                            prazoAjusteDias={dados.versao?.prazoAjusteDias ?? null}
                            autodeclaracoes={dados.autodeclaracoes}
                            suspensa={estaSuspensa(dados.oportunidade)}
                            aoMudar={async (mensagem) => {
                                setAviso(mensagem)
                                await recarregar()
                            }}
                        />

                        <Bloco titulo="Linha do tempo da candidatura" apoio="Cada mudança de estado, com a data e o autor.">
                            {dados.historico === null ? (
                                <p className="text-apoio text-secundario">O histórico desta candidatura não pôde ser carregado agora.</p>
                            ) : dados.historico.length === 0 ? (
                                <p className="text-apoio text-secundario">Nenhum evento registrado ainda.</p>
                            ) : (
                                <ol className="flex flex-col gap-3 border-l-2 border-sutil pl-4">
                                    {[...dados.historico]
                                        .sort((a, b) => a.ocorridoEm.localeCompare(b.ocorridoEm))
                                        .map((ev) => (
                                            <li key={ev.id}>
                                                <p className="text-item text-titulo">
                                                    {ev.estadoNovo ? rotuloDoEstado(ev.estadoNovo) : ev.acao}
                                                    {ev.estadoAnterior && (
                                                        <span className="text-apoio text-secundario"> · de {rotuloDoEstado(ev.estadoAnterior)}</span>
                                                    )}
                                                </p>
                                                <p className="text-legenda text-secundario">
                                                    {formatarDataHora(ev.ocorridoEm)} ·{' '}
                                                    {ev.autorSistema === 'AGENDADOR'
                                                        ? 'Agendador (automático)'
                                                        : ev.autorSistema === 'SISTEMA'
                                                          ? 'Sistema'
                                                          : (ev.autor?.nome ?? '—')}
                                                    {ev.justificativa ? ` · ${ev.justificativa}` : ''}
                                                </p>
                                            </li>
                                        ))}
                                </ol>
                            )}
                        </Bloco>

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                            <div className="flex min-w-0 flex-1 flex-col gap-5">
                                <Bloco titulo="Requisitos de elegibilidade" apoio="Guardado no envio: não muda se a organização mudar o perfil depois.">
                                    {!dados.extrato ? (
                                        <p className="text-apoio text-secundario">Sem extrato de elegibilidade.</p>
                                    ) : (
                                        <>
                                            <ul className="flex flex-col divide-y divide-sutil">
                                                {dados.extrato.requisitos.map((r) => (
                                                    <li key={r.requisitoId} className="flex items-center gap-3 py-2">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-item text-titulo">
                                                                {rotuloDoCampo(r.campo)} {rotuloDoOperador(r.operador)} {formatarValor(r.valorExigido)}
                                                                {!r.obrigatoria && <span className="text-apoio text-secundario"> · desejável</span>}
                                                            </p>
                                                            <p className="text-legenda text-secundario">Informado: {r.valorInformado ?? '—'}</p>
                                                        </div>
                                                        <SeloStatus
                                                            status={SITUACAO[r.situacao].status}
                                                            rotulo={SITUACAO[r.situacao].rotulo}
                                                        />
                                                    </li>
                                                ))}
                                                {dados.extrato.requisitos.length === 0 && (
                                                    <li className="py-2 text-apoio text-secundario">A oportunidade não tinha regras de elegibilidade.</li>
                                                )}
                                            </ul>
                                            {dados.extrato.faltou.length > 0 && (
                                                <p className="mt-3 rounded-card bg-aviso-fundo p-3 text-apoio text-ocre">
                                                    Faltou: {dados.extrato.faltou.join(' · ')}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </Bloco>

                                {dados.avaliacoes.length === 0 ? (
                                    <Bloco titulo="Avaliações">
                                        <p className="text-apoio text-secundario">
                                            Nenhum avaliador recebeu esta candidatura ainda.{' '}
                                            {c.estado === 'EM_ANALISE' && (
                                                <Link to={`/provedor/avaliadores?oportunidade=${c.oportunidadeId}`} className={LINK_ACAO}>
                                                    Atribuir avaliadores
                                                </Link>
                                            )}
                                        </p>
                                    </Bloco>
                                ) : (
                                    dados.avaliacoes.map((a) => {
                                        const notas = dados.notas.get(a.id) ?? []
                                        return (
                                            <Bloco
                                                key={a.id}
                                                titulo={`Rodada ${a.rodada} · ${a.avaliadorNome ?? 'Avaliador'}`}
                                                apoio={
                                                    a.assinadaEm
                                                        ? `Assinada em ${formatarDataHora(a.assinadaEm)} · decisão: ${a.decisao ? rotuloDoEstado(a.decisao) : '—'}`
                                                        : `Atribuída em ${formatarData(a.atribuidaEm)}${a.prazoAvaliacao ? ` · prazo ${formatarData(a.prazoAvaliacao)}` : ''} · aguardando a assinatura`
                                                }
                                            >
                                                {notas.length > 0 && (
                                                    <ul className="flex flex-col gap-2">
                                                        {notas.map((n) => (
                                                            <li key={n.criterioId} className="flex items-center gap-3 rounded-card bg-page px-4 py-2">
                                                                <span className="min-w-0 flex-1 text-item text-titulo">{n.descricao}</span>
                                                                <span className="text-apoio text-secundario">peso {n.peso}%</span>
                                                                <span className="rounded-card border border-sutil bg-card px-3 py-1 text-item text-titulo">
                                                                    {n.nota === null ? '—' : n.nota.toLocaleString('pt-BR')} / {n.escalaMax}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {a.notaFinal !== null && (
                                                    <p className="mt-3 flex items-center justify-between rounded-card bg-acento-suave px-4 py-3">
                                                        <span className="text-item text-acento">Nota final ponderada</span>
                                                        <span className="font-display text-h3 text-acento">{formatarNota(a.notaFinal)}</span>
                                                    </p>
                                                )}
                                                {(a.parecerRetificado ?? a.parecer) && (
                                                    <blockquote className="mt-3 border-l-2 border-acento pl-3 text-apoio text-titulo">
                                                        “{a.parecerRetificado ?? a.parecer}”
                                                        {a.parecerRetificado && (
                                                            <span className="block text-legenda text-secundario">
                                                                Retificado em {formatarDataHora(a.retificadaEm)}
                                                            </span>
                                                        )}
                                                    </blockquote>
                                                )}
                                            </Bloco>
                                        )
                                    })
                                )}
                            </div>

                            <aside className="flex w-full shrink-0 lg:w-[344px] flex-col gap-5">
                                {c.resumoExecutivo && (
                                    <Bloco titulo="Resumo executivo">
                                        <p className="whitespace-pre-line text-apoio text-titulo">{c.resumoExecutivo}</p>
                                    </Bloco>
                                )}

                                {dados.ajustes.length > 0 && (
                                    <Bloco titulo="Pedidos de ajuste">
                                        <ul className="flex flex-col gap-3">
                                            {dados.ajustes.map((p) => (
                                                <li key={p.id} className="rounded-card border border-sutil p-3">
                                                    <p className="text-item text-titulo">
                                                        Rodada {p.rodada ?? '—'} ·{' '}
                                                        {p.situacao === 'AGUARDANDO'
                                                            ? `reenvio até ${formatarDataHora(p.prazoReenvio)}`
                                                            : p.situacao === 'REENVIADO'
                                                              ? `reenviado em ${formatarDataHora(p.reenviadoEm)}`
                                                              : `perdeu o prazo em ${formatarDataHora(p.prazoPerdidoEm)}`}
                                                    </p>
                                                    <ul className="mt-1 list-disc pl-5 text-apoio text-secundario">
                                                        {p.itens.map((i) => (
                                                            <li key={i.id}>
                                                                {i.descricao}
                                                                {i.corrigidoEm ? ' · corrigido' : ''}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    {p.resposta && <p className="mt-1 text-apoio text-titulo">Resposta: {p.resposta}</p>}
                                                </li>
                                            ))}
                                        </ul>
                                    </Bloco>
                                )}

                                {dados.autodeclaracoes.length > 0 && (
                                    <Bloco titulo="Autodeclaração (vaga reservada)" apoio="O avaliador não vê esta parte.">
                                        <ul className="flex flex-col gap-2">
                                            {dados.autodeclaracoes.map((a) => (
                                                <li key={a.criterio} className="flex items-center gap-2">
                                                    <span className="min-w-0 flex-1 text-item text-titulo">{a.criterio}</span>
                                                    <SeloStatus
                                                        status={a.situacao === 'CONFIRMADA' ? 'aprovada' : a.situacao === 'RECUSADA' ? 'reprovada' : 'pendente'}
                                                        rotulo={a.situacao === 'CONFIRMADA' ? 'Confirmada' : a.situacao === 'RECUSADA' ? 'Recusada' : 'Declarada'}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    </Bloco>
                                )}

                                {dados.oportunidade.trilhaCodigo === 'INVESTIMENTO' && (
                                    <Bloco titulo="Funil do investimento">
                                        <p className="text-apoio text-titulo">
                                            Estágio: {c.estagioFunil ? c.estagioFunil.replace('_', ' ').toLowerCase() : '—'}
                                        </p>
                                        <Link to={`/provedor/oportunidades/${c.oportunidadeId}/funil`} className={LINK_ACAO}>
                                            Abrir o funil
                                        </Link>
                                    </Bloco>
                                )}
                            </aside>
                        </div>
                    </div>
                </>
            )}
        </CascaDoApp>
    )
}

export default ProvedorCandidatura
