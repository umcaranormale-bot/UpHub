import { useState } from 'react'

import { listarCandidaturasDaOportunidade, type Candidatura } from '../api/candidaturas'
import { listarMentores, listarMentoresDaCandidatura, type Alocacao } from '../api/mentoria'
import { listarOportunidades, type Oportunidade } from '../api/oportunidades'
import { listarOrganizacoes, type Organizacao } from '../api/organizacoes'
import CascaDoApp from '../components/CascaDoApp'
import Indicadores, { type Indicador } from '../components/Indicadores'
import SeloDeTrilha from '../components/SeloDeTrilha'
import SeloStatus, { type Status } from '../components/SeloStatus'
import { SITUACAO_ALOCACAO } from '../components/gestao/rotulos'
import { CampoLista } from '../components/ui/Campo'
import { Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { ANEL_FOCO, CARTAO, CARTAO_COM_RESPIRO, TRANSICAO_COR } from '../estilos/classes'
import { formatarData, rotuloDoEstado, statusDoEstado, TIPOS_PROVEDORES, trilhaDoSelo, ROTULO_TIPO_ORGANIZACAO } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_GESTAO } from '../navegacao/menus'

/**
 * 44 · Gestão do PD — alocação de mentores · rota /gestao/alocacao
 *
 * No back-end, quem convida o mentor é o provedor da oportunidade (tela 74).
 * Aqui a gestão acompanha: escolhe um provedor e vê os mentores dele, com as
 * horas livres, e as candidaturas homologadas ou em acompanhamento, com os
 * convites e as alocações de cada uma. Só leitura.
 */

interface Acompanhada {
    candidatura: Candidatura
    oportunidade: Oportunidade
    alocacoes: Alocacao[]
}

async function carregarDoProvedor(organizacaoId: number) {
    const [mentores, oportunidades] = await Promise.all([listarMentores(organizacaoId), listarOportunidades(organizacaoId)])
    const publicadas = oportunidades.filter((o) => o.estado !== 'RASCUNHO')
    const porOportunidade = await Promise.all(
        publicadas.map(async (o) => {
            const [homologadas, emAcompanhamento] = await Promise.all([
                listarCandidaturasDaOportunidade(o.id, 'HOMOLOGADA'),
                listarCandidaturasDaOportunidade(o.id, 'EM_ACOMPANHAMENTO'),
            ])
            return [...homologadas, ...emAcompanhamento].map((c) => ({ candidatura: c, oportunidade: o }))
        }),
    )
    const acompanhadas: Acompanhada[] = await Promise.all(
        porOportunidade.flat().map(async (item) => ({
            ...item,
            alocacoes: await listarMentoresDaCandidatura(item.candidatura.id),
        })),
    )
    return { mentores, acompanhadas }
}

function situacaoDaCandidatura(alocacoes: Alocacao[]): { rotulo: string; status: Status } {
    if (alocacoes.some((a) => a.situacao === 'ACEITA')) return SITUACAO_ALOCACAO.ACEITA
    if (alocacoes.some((a) => a.situacao === 'PENDENTE')) return SITUACAO_ALOCACAO.PENDENTE
    return { rotulo: 'Sem mentor', status: 'pendente' }
}

function horas(n: number | null): string {
    return n === null ? '—' : `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h`
}

function AlocacaoMentores() {
    const organizacoes = useDados(() => listarOrganizacoes(), [])
    const provedores = (organizacoes.dados ?? [])
        .filter((o) => (TIPOS_PROVEDORES as readonly string[]).includes(o.tipo))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    const nomes = new Map<number, Organizacao>((organizacoes.dados ?? []).map((o) => [o.id, o]))

    const [escolhido, setEscolhido] = useState<number | null>(null)
    const provedorId = escolhido ?? provedores[0]?.id ?? null
    const doProvedor = useDados(() => carregarDoProvedor(provedorId ?? 0), [provedorId], provedorId !== null)
    const [selecionada, setSelecionada] = useState<number | null>(null)

    const acompanhadas = doProvedor.dados?.acompanhadas ?? []
    const mentores = doProvedor.dados?.mentores ?? []
    const atual = acompanhadas.find((a) => a.candidatura.id === selecionada) ?? acompanhadas[0]

    const todas = acompanhadas.flatMap((a) => a.alocacoes)
    const indicadores: Indicador[] = [
        {
            id: 'sem-mentor',
            rotulo: 'Candidaturas sem mentor',
            valor: String(acompanhadas.filter((a) => situacaoDaCandidatura(a.alocacoes).rotulo === 'Sem mentor').length),
            cor: 'text-ocre',
        },
        { id: 'pendentes', rotulo: 'Convites pendentes', valor: String(todas.filter((a) => a.situacao === 'PENDENTE').length), cor: 'text-ocre' },
        {
            id: 'ativas',
            rotulo: 'Alocações ativas',
            valor: String(todas.filter((a) => a.situacao === 'ACEITA').length),
            cor: 'text-status-aprovada-texto',
        },
        {
            id: 'horas',
            rotulo: 'Horas previstas por mês',
            valor: horas(todas.filter((a) => a.situacao === 'ACEITA').reduce((t, a) => t + a.horasPrevistasMes, 0)),
            apoio: 'das alocações aceitas',
        },
    ]

    let corpo
    if (organizacoes.carregando && !organizacoes.dados) {
        corpo = <Carregando />
    } else if (organizacoes.erro && !organizacoes.dados) {
        corpo = <ErroNaTela mensagem={organizacoes.erro} tentarDeNovo={() => void organizacoes.recarregar()} />
    } else if (provedores.length === 0) {
        corpo = <Vazio titulo="Nenhuma organização provedora cadastrada">Os mentores ficam nos provedores das oportunidades.</Vazio>
    } else {
        corpo = (
            <div className="flex flex-col gap-6">
                <div className="max-w-[420px]">
                    <CampoLista
                        rotulo="Provedor"
                        value={provedorId ?? ''}
                        onChange={(e) => {
                            setEscolhido(Number(e.target.value))
                            setSelecionada(null)
                        }}
                    >
                        {provedores.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.nome} · {ROTULO_TIPO_ORGANIZACAO[o.tipo] ?? o.tipo}
                            </option>
                        ))}
                    </CampoLista>
                </div>

                {doProvedor.carregando && !doProvedor.dados ? (
                    <Carregando />
                ) : doProvedor.erro && !doProvedor.dados ? (
                    <ErroNaTela mensagem={doProvedor.erro} tentarDeNovo={() => void doProvedor.recarregar()} />
                ) : (
                    <>
                        <Indicadores itens={indicadores} rotulo="Indicadores de mentoria do provedor" />

                        {acompanhadas.length === 0 ? (
                            <Vazio titulo="Nenhuma candidatura homologada ou em acompanhamento">
                                O mentor entra depois da homologação. Quando houver, as candidaturas deste provedor aparecem aqui.
                            </Vazio>
                        ) : (
                            <section aria-label="Candidaturas que recebem mentor" className={`relative overflow-x-auto ${CARTAO}`}>
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-sutil bg-page">
                                            {['Candidatura', 'Oportunidade', 'Trilha', 'Estado', 'Mentor', 'Situação'].map((c) => (
                                                <th key={c} scope="col" className="px-card py-3 text-selo text-secundario uppercase">
                                                    {c}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {acompanhadas.map((a) => {
                                            const ativa = a.candidatura.id === atual?.candidatura.id
                                            const situacao = situacaoDaCandidatura(a.alocacoes)
                                            const mentor = a.alocacoes.find((x) => x.situacao === 'ACEITA') ?? a.alocacoes.find((x) => x.situacao === 'PENDENTE')
                                            return (
                                                <tr
                                                    key={a.candidatura.id}
                                                    className={`border-b border-sutil last:border-b-0 ${TRANSICAO_COR} ${ativa ? 'bg-acento-suave' : 'hover:bg-page'}`}
                                                >
                                                    <td className="px-card py-4">
                                                        <button
                                                            type="button"
                                                            aria-pressed={ativa}
                                                            onClick={() => setSelecionada(a.candidatura.id)}
                                                            className={`rounded-card text-left text-item text-titulo hover:text-acento ${ANEL_FOCO}`}
                                                        >
                                                            {nomes.get(a.candidatura.organizacaoId)?.nome ?? '—'}
                                                        </button>
                                                        {a.candidatura.tituloProposta && (
                                                            <p className="mt-1 text-apoio text-secundario">{a.candidatura.tituloProposta}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-card py-4 text-apoio text-secundario">{a.oportunidade.titulo}</td>
                                                    <td className="px-card py-4">
                                                        <SeloDeTrilha trilha={trilhaDoSelo(a.oportunidade.trilhaCodigo)} />
                                                    </td>
                                                    <td className="px-card py-4">
                                                        <SeloStatus status={statusDoEstado(a.candidatura.estado)} rotulo={rotuloDoEstado(a.candidatura.estado)} />
                                                    </td>
                                                    <td className="px-card py-4 text-apoio text-titulo">{mentor?.mentorNome ?? '—'}</td>
                                                    <td className="px-card py-4">
                                                        <SeloStatus status={situacao.status} rotulo={situacao.rotulo} comPonto />
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </section>
                        )}

                        {atual && (
                            <section aria-labelledby="titulo-alocacoes" className={CARTAO_COM_RESPIRO}>
                                <h2 id="titulo-alocacoes" className="font-display text-h3 text-titulo">
                                    {nomes.get(atual.candidatura.organizacaoId)?.nome ?? 'Candidatura'} · convites de mentoria
                                </h2>
                                <p className="mt-1 text-apoio text-secundario">{atual.oportunidade.titulo}</p>
                                {atual.alocacoes.length === 0 ? (
                                    <p className="mt-4 rounded-card bg-page p-5 text-apoio text-secundario">
                                        O provedor ainda não convidou nenhum mentor para esta candidatura.
                                    </p>
                                ) : (
                                    <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {atual.alocacoes.map((x) => {
                                            const s = SITUACAO_ALOCACAO[x.situacao]
                                            return (
                                                <li key={x.id} className="rounded-card bg-page p-5">
                                                    <div className="flex items-center gap-3">
                                                        <p className="min-w-0 flex-1 text-item text-titulo">{x.mentorNome}</p>
                                                        <SeloStatus status={s.status} rotulo={s.rotulo} comPonto />
                                                    </div>
                                                    <p className="mt-1 text-apoio text-secundario">
                                                        {x.areaAtuacao ?? 'área não informada'} · {horas(x.horasPrevistasMes)} por mês
                                                    </p>
                                                    <p className="mt-1 text-legenda text-secundario">
                                                        convidado em {formatarData(x.convidadaEm)} · responder até {formatarData(x.prazoResposta)}
                                                        {x.respondidaEm && ` · respondeu em ${formatarData(x.respondidaEm)}`}
                                                    </p>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                            </section>
                        )}

                        <section aria-labelledby="titulo-mentores" className={CARTAO}>
                            <header className="border-b border-sutil p-card">
                                <h2 id="titulo-mentores" className="font-display text-bloco text-titulo">
                                    Mentores do provedor
                                </h2>
                                <p className="mt-1 text-apoio text-secundario">Mais horas livres primeiro.</p>
                            </header>
                            {mentores.length === 0 ? (
                                <p className="p-card text-apoio text-secundario">Este provedor não tem mentores com vínculo ativo.</p>
                            ) : (
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-sutil bg-page">
                                            {['Mentor', 'Área de atuação', 'Disponíveis/mês', 'Comprometidas', 'Livres'].map((c) => (
                                                <th key={c} scope="col" className="px-card py-3 text-selo text-secundario uppercase">
                                                    {c}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mentores.map((m) => (
                                            <tr key={m.vinculoId} className="border-b border-sutil last:border-b-0">
                                                <td className="px-card py-4 text-item text-titulo">{m.nome}</td>
                                                <td className="px-card py-4 text-apoio text-secundario">{m.areaAtuacao ?? '—'}</td>
                                                <td className="px-card py-4 text-apoio text-titulo">{horas(m.horasDisponiveisMes)}</td>
                                                <td className="px-card py-4 text-apoio text-titulo">{horas(m.horasComprometidasMes)}</td>
                                                <td className="px-card py-4 text-apoio text-titulo">{horas(m.horasLivresMes)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </section>
                    </>
                )}
            </div>
        )
    }

    return (
        <CascaDoApp itens={MENU_GESTAO} voltarPara="/gestao">
            <h1 className="font-display text-tela text-titulo">Alocação de mentores</h1>
            <p className="mt-2 text-apoio text-secundario">
                Quem convida o mentor é o provedor da oportunidade, depois da homologação. Aqui a gestão acompanha os
                convites, as alocações e as horas livres dos mentores de cada provedor.
            </p>
            <div className="mt-6">{corpo}</div>
        </CascaDoApp>
    )
}

export default AlocacaoMentores
