import { useState } from 'react'
import { Link } from 'react-router-dom'

import { atribuirAvaliacao, removerAvaliacao, type Avaliacao } from '../api/avaliacoes'
import { designarAvaliador, listarAvaliadores, removerAvaliador } from '../api/avaliadores'
import { listarCandidaturasDaOportunidade } from '../api/candidaturas'
import { convidar, listarConvites, type PapelConvite } from '../api/convites'
import { mensagemDeErro } from '../api/erros'
import { listarVinculos } from '../api/vinculos'
import CascaDoApp from '../components/CascaDoApp'
import SeloStatus from '../components/SeloStatus'
import Botao from '../components/provedor/Botao'
import Cabecalho, { Bloco } from '../components/provedor/Cabecalho'
import { avaliacoesDe, nomesDasOrganizacoes, rodadaAtual } from '../components/provedor/dados'
import { LINK_ACAO } from '../components/provedor/rotulos'
import SeletorDeOportunidade from '../components/provedor/SeletorDeOportunidade'
import Tabela, { Celula, Linha } from '../components/provedor/Tabela'
import useOportunidadeEscolhida from '../components/provedor/useOportunidadeEscolhida'
import { Campo, CampoLista } from '../components/ui/Campo'
import { Aviso, Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import Modal from '../components/ui/Modal'
import { iniciais, ROTULO_DA_AREA } from '../navegacao/areas'
import { formatarData, hoje, rotuloDoEstado, statusDoEstado } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_PROVEDOR } from '../navegacao/menus'

/**
 * 28 e 71 · Provedor — avaliadores: os da organização, designar numa
 * oportunidade e atribuir as candidaturas em análise (o avaliador pode ser
 * da organização candidata), e o modal Convidar avaliador · rota /provedor/avaliadores?oportunidade=12
 */
function ProvedorAvaliadores() {
    const escolha = useOportunidadeEscolhida()
    const op = escolha.escolhida
    const organizacaoId = escolha.organizacaoId
    const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)
    const [convidando, setConvidando] = useState(false)
    const [designando, setDesignando] = useState(false)

    const daOrganizacao = useDados(
        async () => {
            const [vinculos, convites] = await Promise.all([listarVinculos({ organizacaoId: organizacaoId! }), listarConvites(organizacaoId!)])
            return {
                avaliadores: vinculos.filter((v) => v.papel === 'AVALIADOR' && !v.encerradoEm),
                convites: convites.filter((c) => c.situacao === 'AGUARDANDO').sort((a, b) => b.enviadoEm.localeCompare(a.enviadoEm)),
            }
        },
        [organizacaoId],
        !!organizacaoId,
    )

    const daOportunidade = useDados(
        async () => {
            const [designados, candidaturas] = await Promise.all([listarAvaliadores(op!.id), listarCandidaturasDaOportunidade(op!.id)])
            const [avaliacoes, nomes] = await Promise.all([
                avaliacoesDe(candidaturas.filter((c) => !['ENVIADA', 'ELEGIVEL', 'NAO_ELEGIVEL'].includes(c.estado))),
                nomesDasOrganizacoes(candidaturas.map((c) => c.organizacaoId)),
            ])
            return { designados, candidaturas, avaliacoes, nomes }
        },
        [op?.id],
        !!op,
    )

    async function agir(acao: () => Promise<unknown>, texto: string) {
        setAviso(null)
        try {
            await acao()
            setAviso({ tipo: 'sucesso', texto })
            await Promise.all([daOportunidade.recarregar(), daOrganizacao.recarregar()])
            return true
        } catch (e) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
            return false
        }
    }

    const todas: Avaliacao[] = daOportunidade.dados ? [...daOportunidade.dados.avaliacoes.values()].flat() : []
    const designados = daOportunidade.dados?.designados ?? []
    const naoDesignados = (daOrganizacao.dados?.avaliadores ?? []).filter((v) => !designados.some((d) => d.vinculoId === v.id))
    const emAnalise = daOportunidade.dados?.candidaturas.filter((c) => c.estado === 'EM_ANALISE') ?? []

    return (
        <CascaDoApp itens={MENU_PROVEDOR}>
            <Cabecalho
                titulo={op ? `Avaliadores · ${op.titulo}` : 'Avaliadores'}
                apoio="Designe quem avalia cada oportunidade e distribua as candidaturas em análise. Avaliador entra por convite, nunca por cadastro aberto."
                acoes={
                    <>
                        {escolha.oportunidades.length > 0 && (
                            <SeletorDeOportunidade
                                oportunidades={escolha.oportunidades}
                                escolhida={op}
                                aoEscolher={(id) => {
                                    setAviso(null)
                                    escolha.escolher(id)
                                }}
                            />
                        )}
                        <Botao onClick={() => setConvidando(true)}>Convidar avaliador</Botao>
                        {op && (
                            <Botao variante="primario" onClick={() => setDesignando(true)} disabled={naoDesignados.length === 0}>
                                Designar avaliador
                            </Botao>
                        )}
                    </>
                }
            />

            <div className="mt-6 flex flex-col gap-5">
                {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}

                {daOrganizacao.carregando && !daOrganizacao.dados && <Carregando />}
                {daOrganizacao.erro && <ErroNaTela mensagem={daOrganizacao.erro} tentarDeNovo={() => void daOrganizacao.recarregar()} />}

                {daOrganizacao.dados && (
                    <Bloco titulo="Avaliadores da organização">
                        {daOrganizacao.dados.avaliadores.length === 0 ? (
                            <p className="text-apoio text-secundario">
                                Nenhum avaliador ainda. Use “Convidar avaliador”: a pessoa recebe um link por e-mail, cria a senha e entra
                                vinculada à organização.
                            </p>
                        ) : (
                            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {daOrganizacao.dados.avaliadores.map((v) => {
                                    const designado = designados.find((d) => d.vinculoId === v.id)
                                    const minhas = todas.filter((a) => a.vinculoId === v.id)
                                    return (
                                        <li key={v.id} className="flex items-start gap-3 rounded-card border border-sutil p-4">
                                            <span
                                                aria-hidden="true"
                                                className="grid size-10 shrink-0 place-items-center rounded-full bg-acento-suave text-selo text-acento"
                                            >
                                                {iniciais(v.pessoaNome)}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-item text-titulo">{v.pessoaNome}</p>
                                                <p className="text-legenda text-secundario">
                                                    {v.funcao ?? ROTULO_DA_AREA.avaliador} · desde {formatarData(v.ativoDesde)}
                                                </p>
                                                {op && (
                                                    <p className="mt-2 text-apoio text-secundario">
                                                        {designado
                                                            ? `Designado em ${op.titulo} · ${minhas.length} atribuídas, ${minhas.filter((a) => a.assinadaEm).length} assinadas`
                                                            : `Não designado em ${op.titulo}`}
                                                    </p>
                                                )}
                                            </div>
                                            <SeloStatus status="aprovada" rotulo="Ativo" comPonto />
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </Bloco>
                )}

                {escolha.dados && escolha.oportunidades.length === 0 && (
                    <Vazio titulo="Nenhuma oportunidade publicada">
                        Os avaliadores são designados numa oportunidade publicada.{' '}
                        <Link to="/provedor" className={LINK_ACAO}>
                            Ir para o painel
                        </Link>
                    </Vazio>
                )}

                {op && daOportunidade.carregando && !daOportunidade.dados && <Carregando />}
                {op && daOportunidade.erro && <ErroNaTela mensagem={daOportunidade.erro} tentarDeNovo={() => void daOportunidade.recarregar()} />}

                {op && daOportunidade.dados && (
                    <>
                        {designados.length === 0 && daOportunidade.dados.candidaturas.length > 0 && (
                            <section className="flex flex-wrap items-center gap-4 rounded-card border border-aviso-borda bg-aviso-fundo p-5">
                                <div className="min-w-0 flex-1">
                                    <p className="text-bloco text-ocre">{op.titulo} está sem avaliador</p>
                                    <p className="mt-1 text-apoio text-ocre">
                                        {daOportunidade.dados.candidaturas.length} candidaturas esperando. Enquanto ninguém for designado, a fila
                                        fica parada.
                                    </p>
                                </div>
                                {naoDesignados.length > 0 && <Botao onClick={() => setDesignando(true)}>Designar avaliador</Botao>}
                            </section>
                        )}

                        <Bloco titulo="Designados nesta oportunidade">
                            {designados.length === 0 ? (
                                <p className="text-apoio text-secundario">Ninguém designado ainda.</p>
                            ) : (
                                <Tabela rotulo="Avaliadores designados" colunas={['Avaliador', 'Prazo', 'Atribuídas', 'Assinadas', '']} semMoldura>
                                    {designados.map((d) => {
                                        const minhas = todas.filter((a) => a.vinculoId === d.vinculoId)
                                        return (
                                            <Linha key={d.vinculoId}>
                                                <Celula forte>{d.nome}</Celula>
                                                <Celula>{formatarData(d.prazoAvaliacao)}</Celula>
                                                <Celula>{minhas.length}</Celula>
                                                <Celula>{minhas.filter((a) => a.assinadaEm).length}</Celula>
                                                <Celula>
                                                    {minhas.length === 0 && (
                                                        <button
                                                            type="button"
                                                            className={LINK_ACAO}
                                                            onClick={() =>
                                                                void agir(() => removerAvaliador(op.id, d.vinculoId), `${d.nome} não avalia mais ${op.titulo}.`)
                                                            }
                                                        >
                                                            Remover
                                                        </button>
                                                    )}
                                                </Celula>
                                            </Linha>
                                        )
                                    })}
                                </Tabela>
                            )}
                        </Bloco>

                        <Bloco
                            titulo="Atribuir candidaturas"
                            apoio="Só as candidaturas em análise recebem avaliadores."
                        >
                            {emAnalise.length === 0 ? (
                                <p className="text-apoio text-secundario">
                                    Nenhuma candidatura em análise. Em Candidaturas, use “Iniciar análise” nas elegíveis.
                                </p>
                            ) : (
                                <Tabela rotulo="Candidaturas em análise" colunas={['Candidatura', 'Estado', 'Avaliadores da rodada', 'Atribuir a']} semMoldura>
                                    {emAnalise.map((c) => (
                                        <LinhaDeAtribuicao
                                            key={c.id}
                                            nome={daOportunidade.dados!.nomes.get(c.organizacaoId) ?? `Organização ${c.organizacaoId}`}
                                            estado={c.estado}
                                            avaliacoes={rodadaAtual(daOportunidade.dados!.avaliacoes.get(c.id) ?? [])}
                                            designados={designados.map((d) => ({ vinculoId: d.vinculoId, nome: d.nome }))}
                                            aoAtribuir={(vinculoId, nomeAvaliador, nome) =>
                                                agir(() => atribuirAvaliacao(c.id, vinculoId), `${nome} foi atribuída a ${nomeAvaliador}.`)
                                            }
                                            aoRemover={(a, nome) =>
                                                agir(() => removerAvaliacao(a.id), `${a.avaliadorNome ?? 'O avaliador'} não avalia mais ${nome}.`)
                                            }
                                        />
                                    ))}
                                </Tabela>
                            )}
                            <p className="mt-4 rounded-card bg-page px-5 py-3 text-apoio text-secundario">
                                O avaliador pode ser da organização candidata: a atribuição é permitida, e a avaliação assinada guarda quem
                                avaliou.
                            </p>
                        </Bloco>
                    </>
                )}

                {daOrganizacao.dados && (
                    <Bloco titulo="Convites em aberto">
                        {daOrganizacao.dados.convites.length === 0 ? (
                            <p className="text-apoio text-secundario">Nenhum convite aguardando resposta.</p>
                        ) : (
                            <Tabela rotulo="Convites em aberto" colunas={['E-mail', 'Papel', 'Enviado em', 'Expira em', 'Situação']} semMoldura>
                                {daOrganizacao.dados.convites.map((c) => (
                                    <Linha key={c.id}>
                                        <Celula forte>{c.email}</Celula>
                                        <Celula>{c.papel === 'AVALIADOR' ? 'Avaliador' : 'Mentor'}</Celula>
                                        <Celula>{formatarData(c.enviadoEm)}</Celula>
                                        <Celula>{formatarData(c.expiraEm)}</Celula>
                                        <Celula>
                                            <SeloStatus status="pendente" rotulo="Aguardando" comPonto />
                                        </Celula>
                                    </Linha>
                                ))}
                            </Tabela>
                        )}
                    </Bloco>
                )}

                <p className="rounded-card bg-page px-5 py-3 text-apoio text-secundario">
                    Cada avaliador vê só as candidaturas atribuídas a ele. Quando todos assinam, a rodada fecha: qualquer pedido de ajuste
                    vira ajuste; sem ajuste, vale a maioria, e o empate reprova.
                </p>
            </div>

            {convidando && organizacaoId && (
                <ModalConvidar
                    organizacaoId={organizacaoId}
                    aoFechar={() => setConvidando(false)}
                    aoEnviar={async (email, papel) => {
                        setConvidando(false)
                        setAviso({
                            tipo: 'sucesso',
                            texto: `Convite enviado para ${email}. A pessoa recebe um link por e-mail, define a senha e entra vinculada como ${papel === 'AVALIADOR' ? 'avaliadora' : 'mentora'}.`,
                        })
                        await daOrganizacao.recarregar()
                    }}
                />
            )}

            {designando && op && (
                <ModalDesignar
                    titulo={op.titulo}
                    opcoes={naoDesignados.map((v) => ({ vinculoId: v.id, nome: v.pessoaNome }))}
                    aoFechar={() => setDesignando(false)}
                    aoDesignar={async (vinculoId, prazo, nome) => {
                        setDesignando(false)
                        await agir(
                            () => designarAvaliador(op.id, { vinculoId, prazoAvaliacao: prazo || undefined }),
                            `${nome} foi designado para avaliar ${op.titulo}.`,
                        )
                    }}
                />
            )}
        </CascaDoApp>
    )
}

function LinhaDeAtribuicao({
    nome,
    estado,
    avaliacoes,
    designados,
    aoAtribuir,
    aoRemover,
}: {
    nome: string
    estado: string
    avaliacoes: Avaliacao[]
    designados: { vinculoId: number; nome: string }[]
    aoAtribuir: (vinculoId: number, nomeAvaliador: string, nome: string) => Promise<boolean>
    aoRemover: (a: Avaliacao, nome: string) => Promise<boolean>
}) {
    const livres = designados.filter((d) => !avaliacoes.some((a) => a.vinculoId === d.vinculoId))
    const [vinculo, setVinculo] = useState('')
    const [ocupado, setOcupado] = useState(false)

    return (
        <Linha>
            <Celula forte>{nome}</Celula>
            <Celula>
                <SeloStatus status={statusDoEstado(estado)} rotulo={rotuloDoEstado(estado)} comPonto />
            </Celula>
            <Celula>
                {avaliacoes.length === 0 ? (
                    '—'
                ) : (
                    <ul className="flex flex-col gap-1">
                        {avaliacoes.map((a) => (
                            <li key={a.id} className="flex items-center gap-2">
                                <span className="text-titulo">{a.avaliadorNome ?? 'Avaliador'}</span>
                                <span className="text-legenda">{a.assinadaEm ? '· assinou' : '· pendente'}</span>
                                {!a.assinadaEm && (
                                    <button type="button" className={`text-legenda ${LINK_ACAO}`} onClick={() => void aoRemover(a, nome)}>
                                        tirar
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </Celula>
            <Celula>
                {livres.length === 0 ? (
                    <span className="text-legenda">{designados.length === 0 ? 'designe um avaliador antes' : 'todos já receberam'}</span>
                ) : (
                    <form
                        className="flex items-center gap-2"
                        onSubmit={async (e) => {
                            e.preventDefault()
                            const escolhido = livres.find((d) => String(d.vinculoId) === vinculo)
                            if (!escolhido) return
                            setOcupado(true)
                            const ok = await aoAtribuir(escolhido.vinculoId, escolhido.nome, nome)
                            setOcupado(false)
                            if (ok) setVinculo('')
                        }}
                    >
                        <select
                            aria-label={`Avaliador para ${nome}`}
                            value={vinculo}
                            onChange={(e) => setVinculo(e.target.value)}
                            className="rounded-lg border border-sutil bg-card px-2 py-1.5 text-apoio text-titulo"
                        >
                            <option value="">Escolher</option>
                            {livres.map((d) => (
                                <option key={d.vinculoId} value={d.vinculoId}>
                                    {d.nome}
                                </option>
                            ))}
                        </select>
                        <Botao type="submit" disabled={!vinculo || ocupado}>
                            Atribuir
                        </Botao>
                    </form>
                )}
            </Celula>
        </Linha>
    )
}

/** Modal · convidar avaliador. A API convida para a organização (o papel pode ser avaliador ou mentor). */
function ModalConvidar({
    organizacaoId,
    aoFechar,
    aoEnviar,
}: {
    organizacaoId: number
    aoFechar: () => void
    aoEnviar: (email: string, papel: PapelConvite) => Promise<void>
}) {
    const [email, setEmail] = useState('')
    const [papel, setPapel] = useState<PapelConvite>('AVALIADOR')
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    async function enviar() {
        setEnviando(true)
        setErro(null)
        try {
            await convidar({ email: email.trim(), papel, organizacaoId })
            await aoEnviar(email.trim(), papel)
        } catch (e) {
            setErro(mensagemDeErro(e))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <Modal
            aberto
            titulo="Convidar avaliador"
            descricao="A pessoa recebe um link por e-mail, define a senha e entra já vinculada à organização. Ela não precisa se cadastrar. O convite vale 7 dias."
            aoFechar={aoFechar}
            acoes={
                <>
                    <Botao onClick={aoFechar}>Cancelar</Botao>
                    <Botao variante="primario" disabled={!email.includes('@') || enviando} onClick={() => void enviar()}>
                        {enviando ? 'Enviando…' : 'Enviar convite'}
                    </Botao>
                </>
            }
        >
            <Campo
                rotulo="E-mail da pessoa"
                type="email"
                maxLength={254}
                placeholder="nome@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <CampoLista rotulo="Papel" value={papel} onChange={(e) => setPapel(e.target.value as PapelConvite)}>
                <option value="AVALIADOR">Avaliador</option>
                <option value="MENTOR">Mentor</option>
            </CampoLista>
            <p className="text-legenda text-secundario">
                Depois que a pessoa aceitar, designe-a na oportunidade que ela vai avaliar.
            </p>
            {erro && <Aviso tipo="erro">{erro}</Aviso>}
        </Modal>
    )
}

function ModalDesignar({
    titulo,
    opcoes,
    aoFechar,
    aoDesignar,
}: {
    titulo: string
    opcoes: { vinculoId: number; nome: string }[]
    aoFechar: () => void
    aoDesignar: (vinculoId: number, prazo: string, nome: string) => Promise<void>
}) {
    const [vinculo, setVinculo] = useState(opcoes[0] ? String(opcoes[0].vinculoId) : '')
    const [prazo, setPrazo] = useState('')
    const [ocupado, setOcupado] = useState(false)
    const escolhido = opcoes.find((o) => String(o.vinculoId) === vinculo)

    return (
        <Modal
            aberto
            titulo={`Designar avaliador em ${titulo}`}
            descricao="Escolha entre os avaliadores da organização. O prazo de avaliação é opcional."
            aoFechar={aoFechar}
            acoes={
                <>
                    <Botao onClick={aoFechar}>Cancelar</Botao>
                    <Botao
                        variante="primario"
                        disabled={!escolhido || ocupado}
                        onClick={async () => {
                            if (!escolhido) return
                            setOcupado(true)
                            await aoDesignar(escolhido.vinculoId, prazo, escolhido.nome)
                            setOcupado(false)
                        }}
                    >
                        Designar
                    </Botao>
                </>
            }
        >
            <CampoLista rotulo="Avaliador" value={vinculo} onChange={(e) => setVinculo(e.target.value)}>
                {opcoes.map((o) => (
                    <option key={o.vinculoId} value={o.vinculoId}>
                        {o.nome}
                    </option>
                ))}
            </CampoLista>
            <Campo rotulo="Prazo de avaliação (opcional)" type="date" min={hoje()} value={prazo} onChange={(e) => setPrazo(e.target.value)} />
        </Modal>
    )
}

export default ProvedorAvaliadores
