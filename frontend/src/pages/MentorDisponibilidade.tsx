import { useState } from 'react'

import CascaDoApp from '../components/CascaDoApp'
import { CustomButton } from '../components/CustomButton'
import { Aviso, Carregando, ErroNaTela } from '../components/ui/Estados'
import { Campo } from '../components/ui/Campo'
import { LinkDeTexto } from '../components/squad/AvisoComLink'
import {
    alocacoesDetalhadas,
    formatarHoras,
    formatarMinutos,
    horasDasAceitas,
    nomeDoAcompanhado,
    nomeDoMes,
} from '../components/mentor/dados'
import { mensagemDeErro } from '../api/erros'
import { definirMentoria, listarMentores, type Mentor } from '../api/mentoria'
import { useDados } from '../hooks/useDados'
import { MENU_MENTOR } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'
import { CARTAO, CARTAO_COM_RESPIRO } from '../estilos/classes'

/**
 * 76 · Mentor — área de atuação e disponibilidade · rota /mentor/disponibilidade
 *
 * O provedor encontra o mentor pela área de atuação e pelas horas livres. As
 * horas comprometidas (convites em aberto e aceitos) não passam das disponíveis.
 */

async function carregar(organizacaoId: number, vinculoId: number) {
    const [mentores, itens] = await Promise.all([listarMentores(organizacaoId), alocacoesDetalhadas(vinculoId)])
    const aceitas = itens.filter((i) => i.alocacao.situacao === 'ACEITA')
    const horas = await horasDasAceitas(aceitas.map((i) => i.alocacao))
    return { mentor: mentores.find((m) => m.vinculoId === vinculoId) ?? null, aceitas, horas }
}

const CABECALHO_TABELA = 'px-card py-3 text-left text-selo uppercase text-secundario'

function FormularioDeMentoria({ mentor, aoSalvar }: { mentor: Mentor | null; aoSalvar: (area: string, horas: string) => Promise<void> }) {
    const [area, setArea] = useState(mentor?.areaAtuacao ?? '')
    const [horas, setHoras] = useState(mentor?.horasDisponiveisMes != null ? String(mentor.horasDisponiveisMes) : '')
    const [salvando, setSalvando] = useState(false)
    const numero = Number(horas.replace(',', '.'))
    const horasValidas = horas.trim() === '' || (Number.isFinite(numero) && numero > 0)
    return (
        <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={async (e) => {
                e.preventDefault()
                setSalvando(true)
                await aoSalvar(area, horas)
                setSalvando(false)
            }}
        >
            <Campo
                rotulo="Área de atuação"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                maxLength={80}
                placeholder="Ex.: dados, logística, IA"
                ajuda="Palavras separadas por vírgula. O provedor busca mentores por estas palavras. Até 80 caracteres."
            />
            <Campo
                rotulo="Horas disponíveis por mês"
                type="number"
                min={0.5}
                step={0.5}
                inputMode="decimal"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                ajuda="O total dos convites (em aberto e aceitos) não pode passar deste número. Vazio = sem limite informado."
            />
            <div>
                <CustomButton type="submit" variant="aprovar" size="auto" disabled={!horasValidas || salvando}>
                    {salvando ? 'Salvando…' : 'Salvar'}
                </CustomButton>
            </div>
        </form>
    )
}

function MentorDisponibilidade() {
    const { pessoa, perfilAtivo } = useSessao()
    const vinculoId = perfilAtivo?.vinculo.id
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId
    const { dados, carregando, erro, recarregar, definir } = useDados(
        () => carregar(organizacaoId!, vinculoId!),
        [organizacaoId, vinculoId],
        !!organizacaoId && !!vinculoId,
    )
    const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

    async function salvar(area: string, horas: string) {
        if (!vinculoId || !dados) return
        setAviso(null)
        try {
            const mentor = await definirMentoria(vinculoId, {
                areaAtuacao: area.trim() || undefined,
                horasDisponiveisMes: horas.trim() ? Number(horas.replace(',', '.')) : undefined,
            })
            definir({ ...dados, mentor })
            setAviso({ tipo: 'sucesso', texto: 'Área e disponibilidade salvas. Os provedores já encontram você por elas.' })
        } catch (e) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
        }
    }

    return (
        <CascaDoApp itens={MENU_MENTOR} voltarPara="/mentor/conta">
            <h1 className="font-display text-tela text-titulo">Mentoria</h1>
            <p className="mt-2 text-apoio text-secundario">
                {pessoa?.nome} · {perfilAtivo?.vinculo.organizacaoNome} · os provedores encontram você pela área de atuação e
                pelas horas livres
            </p>

            {aviso && (
                <div className="mt-4">
                    <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
                </div>
            )}

            {carregando && !dados && <Carregando />}
            {erro && (
                <div className="mt-6">
                    <ErroNaTela mensagem={erro} tentarDeNovo={recarregar} />
                </div>
            )}

            {dados && (
                <>
                    <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
                        <section aria-labelledby="titulo-como" className={CARTAO_COM_RESPIRO}>
                            <h2 id="titulo-como" className="font-display text-bloco text-titulo">
                                Como você mentora
                            </h2>
                            <FormularioDeMentoria
                                key={`${dados.mentor?.areaAtuacao ?? ''}-${dados.mentor?.horasDisponiveisMes ?? ''}`}
                                mentor={dados.mentor}
                                aoSalvar={salvar}
                            />
                        </section>

                        <section aria-labelledby="titulo-mes" className={CARTAO_COM_RESPIRO}>
                            <h2 id="titulo-mes" className="font-display text-bloco text-titulo">
                                {nomeDoMes(dados.horas.mes).replace(/^./, (l) => l.toUpperCase())} de {dados.horas.mes.slice(0, 4)}
                            </h2>
                            <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <dt className="text-apoio text-secundario">Comprometidas</dt>
                                    <dd className="mt-1 font-display text-tela text-titulo">
                                        {formatarHoras(dados.mentor?.horasComprometidasMes ?? 0)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-apoio text-secundario">Livres</dt>
                                    <dd className="mt-1 font-display text-tela text-status-aprovada-texto">
                                        {dados.mentor?.horasLivresMes != null ? formatarHoras(dados.mentor.horasLivresMes) : 'sem limite'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-apoio text-secundario">Registradas</dt>
                                    <dd className="mt-1 font-display text-tela text-acento">{formatarMinutos(dados.horas.minutos)}</dd>
                                </div>
                            </dl>
                            <p className="mt-3 text-apoio text-secundario">
                                Comprometidas é a soma das horas previstas dos convites em aberto e aceitos. Registradas é a soma
                                das sessões assinadas do mês.
                            </p>
                        </section>
                    </div>

                    <section aria-labelledby="titulo-ativos" className={`mt-5 ${CARTAO_COM_RESPIRO}`}>
                        <h2 id="titulo-ativos" className="font-display text-bloco text-titulo">
                            Acompanhamentos ativos
                        </h2>
                        {dados.aceitas.length === 0 ? (
                            <p className="mt-2 text-apoio text-secundario">Nenhum acompanhamento ativo.</p>
                        ) : (
                            <div className={`mt-4 relative overflow-x-auto ${CARTAO} shadow-none`}>
                                <table className="w-full">
                                    <thead className="border-b border-sutil">
                                        <tr>
                                            <th scope="col" className={CABECALHO_TABELA}>
                                                Candidatura
                                            </th>
                                            <th scope="col" className={CABECALHO_TABELA}>
                                                Oportunidade
                                            </th>
                                            <th scope="col" className={CABECALHO_TABELA}>
                                                Horas previstas por mês
                                            </th>
                                            <th scope="col" className={CABECALHO_TABELA}>
                                                Registradas no mês
                                            </th>
                                            <th scope="col" className={CABECALHO_TABELA}>
                                                <span className="sr-only">Ação</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dados.aceitas.map((item) => (
                                            <tr key={item.alocacao.id} className="border-b border-sutil last:border-b-0">
                                                <td className="px-card py-3 text-item text-titulo">{nomeDoAcompanhado(item)}</td>
                                                <td className="px-card py-3 text-apoio text-secundario">{item.desafio?.titulo ?? '—'}</td>
                                                <td className="px-card py-3 text-apoio text-secundario">
                                                    {formatarHoras(item.alocacao.horasPrevistasMes)}
                                                </td>
                                                <td className="px-card py-3 text-apoio text-secundario">
                                                    {formatarMinutos(dados.horas.porAlocacao.get(item.alocacao.id)?.minutosRealizados ?? 0)}
                                                </td>
                                                <td className="px-card py-3 text-right">
                                                    <LinkDeTexto para={`/mentor/acompanhados/${item.alocacao.id}/sprints`}>
                                                        Abrir sprints
                                                    </LinkDeTexto>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </CascaDoApp>
    )
}

export default MentorDisponibilidade
