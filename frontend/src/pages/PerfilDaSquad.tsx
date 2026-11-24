import { useState } from 'react'

import CascaDoApp from '../components/CascaDoApp'
import CartaoDeAviso from '../components/CartaoDeAviso'
import SeloStatus from '../components/SeloStatus'
import { CustomButton } from '../components/CustomButton'
import { Aviso, Carregando, ErroNaTela } from '../components/ui/Estados'
import { Campo, CampoLista, CampoTexto } from '../components/ui/Campo'
import { LinkDeTexto } from '../components/squad/AvisoComLink'
import { squadOuNada, useSquadAtiva } from '../components/squad/dados'
import { mensagemDeErro } from '../api/erros'
import { buscarOrganizacao } from '../api/organizacoes'
import { buscarResidencia } from '../api/residencias'
import { adicionarIntegrante, cadastrarSquad, listarIntegrantes } from '../api/squads'
import { listarVinculos } from '../api/vinculos'
import { useDados } from '../hooks/useDados'
import { MENU_SQUAD } from '../navegacao/menus'
import { CARTAO, CARTAO_COM_RESPIRO } from '../estilos/classes'
import { formatarData, ROTULO_TIPO_ORGANIZACAO } from '../estilos/formatos'

/**
 * 56 · Candidato squad — perfil da squad · rota /squad/perfil
 *
 * Os dados da squad e da organização, os integrantes com as competências
 * (o matching da Formação usa) e a residência em que a squad entrou.
 */

async function carregar(squadId: number) {
    const [squad, organizacao, vinculos] = await Promise.all([
        squadOuNada(squadId),
        buscarOrganizacao(squadId),
        listarVinculos({ organizacaoId: squadId }).catch(() => []),
    ])
    const [integrantes, residencia] = await Promise.all([
        squad ? listarIntegrantes(squadId) : Promise.resolve([]),
        squad?.residenciaId ? buscarResidencia(squad.residenciaId).catch(() => null) : Promise.resolve(null),
    ])
    return { squad, organizacao, vinculos: vinculos.filter((v) => !v.encerradoEm), integrantes, residencia }
}

function CadastroDaSquad({ squadId, aoCadastrar }: { squadId: number; aoCadastrar: () => Promise<void> }) {
    const [descricao, setDescricao] = useState('')
    const [codigo, setCodigo] = useState('')
    const [erro, setErro] = useState<string | null>(null)
    const [enviando, setEnviando] = useState(false)
    return (
        <section aria-labelledby="titulo-cadastro" className={`mt-6 max-w-[640px] ${CARTAO_COM_RESPIRO}`}>
            <h2 id="titulo-cadastro" className="font-display text-bloco text-titulo">
                Cadastrar a squad
            </h2>
            <p className="mt-2 text-apoio text-secundario">
                A organização já existe; falta o cadastro da squad para adicionar integrantes e se candidatar.
            </p>
            <form
                className="mt-4 flex flex-col gap-4"
                onSubmit={async (e) => {
                    e.preventDefault()
                    setEnviando(true)
                    setErro(null)
                    try {
                        await cadastrarSquad({
                            organizacaoId: squadId,
                            descricao: descricao.trim() || undefined,
                            codigoCoordenacao: codigo.trim() || undefined,
                        })
                        await aoCadastrar()
                    } catch (e) {
                        setErro(mensagemDeErro(e))
                    } finally {
                        setEnviando(false)
                    }
                }}
            >
                <CampoTexto rotulo="Descrição da squad" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                <Campo
                    rotulo="Código da coordenação (opcional)"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    maxLength={40}
                    ajuda="Até 40 caracteres. Ao entrar numa residência, ele passa a ser o código dela."
                />
                {erro && <Aviso tipo="erro">{erro}</Aviso>}
                <div>
                    <CustomButton type="submit" variant="aprovar" size="auto" disabled={enviando}>
                        {enviando ? 'Cadastrando…' : 'Cadastrar squad'}
                    </CustomButton>
                </div>
            </form>
        </section>
    )
}

function NovoIntegrante({
    opcoes,
    aoAdicionar,
}: {
    opcoes: { pessoaId: number; nome: string }[]
    aoAdicionar: (pessoaId: number, competencia: string) => Promise<boolean>
}) {
    const [pessoaId, setPessoaId] = useState('')
    const [competencia, setCompetencia] = useState('')
    const [enviando, setEnviando] = useState(false)
    if (opcoes.length === 0) {
        return (
            <p className="p-card text-apoio text-secundario">
                Todas as pessoas com vínculo na squad já são integrantes.
            </p>
        )
    }
    return (
        <form
            className="flex flex-col gap-3 p-card"
            onSubmit={async (e) => {
                e.preventDefault()
                setEnviando(true)
                const ok = await aoAdicionar(Number(pessoaId), competencia)
                setEnviando(false)
                if (ok) {
                    setPessoaId('')
                    setCompetencia('')
                }
            }}
        >
            <CampoLista rotulo="Pessoa com vínculo na squad" value={pessoaId} onChange={(e) => setPessoaId(e.target.value)} required>
                <option value="">Escolha</option>
                {opcoes.map((o) => (
                    <option key={o.pessoaId} value={o.pessoaId}>
                        {o.nome}
                    </option>
                ))}
            </CampoLista>
            <Campo
                rotulo="Competência"
                value={competencia}
                onChange={(e) => setCompetencia(e.target.value)}
                maxLength={120}
                placeholder="Ex.: Front-end"
                ajuda="O matching compara as competências com o escopo e os entregáveis dos desafios."
            />
            <div>
                <CustomButton type="submit" variant="neutro" size="auto" disabled={!pessoaId || enviando}>
                    {enviando ? 'Adicionando…' : 'Adicionar integrante'}
                </CustomButton>
            </div>
        </form>
    )
}

function PerfilDaSquad() {
    const { squadId, nome } = useSquadAtiva()
    const { dados, carregando, erro, recarregar } = useDados(() => carregar(squadId!), [squadId], !!squadId)
    const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

    async function adicionar(pessoaId: number, competencia: string) {
        if (!squadId) return false
        setAviso(null)
        try {
            const novo = await adicionarIntegrante(squadId, { pessoaId, competencia: competencia.trim() || undefined })
            await recarregar()
            setAviso({ tipo: 'sucesso', texto: `${novo.nome} agora é integrante da squad.` })
            return true
        } catch (e) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
            return false
        }
    }

    const cabecalho = (
        <>
            <h1 className="font-display text-tela text-titulo">Perfil da squad</h1>
            <p className="mt-2 text-apoio text-secundario">
                Dados da {nome}. Os campos com ponto são os que o motor de elegibilidade usa nos desafios de Formação.
            </p>
        </>
    )

    if (!dados) {
        return (
            <CascaDoApp itens={MENU_SQUAD} voltarPara="/squad">
                {cabecalho}
                {carregando && <Carregando />}
                {erro && (
                    <div className="mt-6">
                        <ErroNaTela mensagem={erro} tentarDeNovo={recarregar} />
                    </div>
                )}
            </CascaDoApp>
        )
    }

    const { squad, organizacao, vinculos, integrantes, residencia } = dados

    if (!squad) {
        return (
            <CascaDoApp itens={MENU_SQUAD} voltarPara="/squad">
                {cabecalho}
                <CadastroDaSquad squadId={organizacao.id} aoCadastrar={recarregar} />
            </CascaDoApp>
        )
    }

    const representantes = vinculos.filter((v) => v.representante).map((v) => v.pessoaNome)
    const sede = [organizacao.sedeCidade, organizacao.sedeUf].filter(Boolean).join(' · ')
    const campos = [
        { rotulo: 'Nome da squad', valor: squad.nome, elegibilidade: false },
        { rotulo: 'Tipo', valor: ROTULO_TIPO_ORGANIZACAO[organizacao.tipo] ?? organizacao.tipo, elegibilidade: true },
        { rotulo: 'Código da coordenação', valor: squad.codigoCoordenacao, elegibilidade: false },
        { rotulo: 'Área de atuação (setor)', valor: organizacao.setor, elegibilidade: true },
        { rotulo: 'Formada em', valor: organizacao.anoFundacao ? String(organizacao.anoFundacao) : null, elegibilidade: true },
        { rotulo: 'Sede', valor: sede || null, elegibilidade: true },
        { rotulo: 'Integrantes', valor: String(integrantes.length), elegibilidade: false },
        { rotulo: 'Representante', valor: representantes.join(', ') || null, elegibilidade: false },
    ]
    const conferidos = [
        organizacao.setor,
        sede,
        squad.descricao ?? organizacao.descricao,
        integrantes.length > 0 ? 'ok' : null,
        integrantes.length > 0 && integrantes.every((i) => i.competencia) ? 'ok' : null,
    ]
    const completude = Math.round((conferidos.filter(Boolean).length / conferidos.length) * 100)
    const pendencias = conferidos.length - conferidos.filter(Boolean).length
    const opcoes = vinculos
        .filter((v) => v.papel === 'CANDIDATO' && !integrantes.some((i) => i.pessoaId === v.pessoaId))
        .map((v) => ({ pessoaId: v.pessoaId, nome: v.pessoaNome }))

    return (
        <CascaDoApp itens={MENU_SQUAD} voltarPara="/squad">
            {cabecalho}

            {aviso && (
                <div className="mt-4">
                    <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
                </div>
            )}

            <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="flex min-w-0 flex-1 flex-col gap-5">
                    <section aria-labelledby="titulo-dados" className={CARTAO}>
                        <header className="border-b border-sutil p-card">
                            <h2 id="titulo-dados" className="font-display text-bloco text-titulo">
                                Dados da squad
                            </h2>
                        </header>
                        <dl>
                            {campos.map((campo) => (
                                <div
                                    key={campo.rotulo}
                                    className="flex items-center gap-5 border-b border-sutil px-card py-3 last:border-b-0"
                                >
                                    <dt className="flex min-w-0 flex-1 items-center gap-2 text-apoio text-secundario">
                                        {campo.elegibilidade && (
                                            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-acento" />
                                        )}
                                        {campo.rotulo}
                                        {campo.elegibilidade && <span className="sr-only"> (usado na elegibilidade)</span>}
                                    </dt>
                                    <dd className="text-item text-titulo">{campo.valor || '—'}</dd>
                                </div>
                            ))}
                        </dl>
                        {(squad.descricao || organizacao.descricao) && (
                            <p className="border-t border-sutil p-card text-apoio text-secundario">
                                {squad.descricao ?? organizacao.descricao}
                            </p>
                        )}
                    </section>

                    <section aria-labelledby="titulo-residencia" className={CARTAO_COM_RESPIRO}>
                        <div className="flex items-center gap-3">
                            <h2 id="titulo-residencia" className="font-display text-bloco text-titulo">
                                Residência
                            </h2>
                            {residencia && (
                                <span className="ml-auto">
                                    <SeloStatus
                                        status={residencia.estado === 'ABERTA' ? 'aprovada' : 'rascunho'}
                                        rotulo={residencia.estado === 'ABERTA' ? 'Aberta' : 'Encerrada'}
                                        comPonto
                                    />
                                </span>
                            )}
                        </div>
                        <p className="mt-2 text-apoio text-secundario">
                            {residencia
                                ? `${residencia.nome} · ${formatarData(residencia.inicio)} a ${formatarData(residencia.fim)}`
                                : 'A squad ainda não entrou numa residência. Os desafios de residência pedem o código da coordenação.'}
                        </p>
                        <p className="mt-3">
                            <LinkDeTexto para="/squad/residencia">
                                {residencia ? 'Ver a residência e os desafios ›' : 'Entrar numa residência ›'}
                            </LinkDeTexto>
                        </p>
                    </section>
                </div>

                <aside className="flex w-full shrink-0 lg:w-[376px] flex-col gap-5">
                    <section aria-labelledby="titulo-completude" className={CARTAO_COM_RESPIRO}>
                        <div className="flex items-center gap-3">
                            <h2 id="titulo-completude" className="font-display text-bloco text-titulo">
                                Perfil {completude}% completo
                            </h2>
                            <span className="ml-auto text-apoio text-secundario">
                                {pendencias === 0 ? 'nenhuma pendência' : `${pendencias} ${pendencias === 1 ? 'pendência' : 'pendências'}`}
                            </span>
                        </div>
                        <div
                            role="progressbar"
                            aria-valuenow={completude}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-labelledby="titulo-completude"
                            className="mt-4 h-2 overflow-hidden rounded-badge bg-page"
                        >
                            <span
                                className="block h-full rounded-badge bg-acento transition-[width] duration-[var(--dur-lenta)] ease-padrao"
                                style={{ width: `${completude}%` }}
                            />
                        </div>
                        <p className="mt-3 text-apoio text-secundario">
                            Conta setor, sede, descrição, integrantes e a competência de cada um.
                        </p>
                    </section>

                    <section aria-labelledby="titulo-integrantes" className={CARTAO}>
                        <header className="border-b border-sutil p-card">
                            <h2 id="titulo-integrantes" className="font-display text-bloco text-titulo">
                                Integrantes e competências
                            </h2>
                        </header>
                        {integrantes.length === 0 ? (
                            <p className="border-b border-sutil p-card text-apoio text-secundario">Nenhum integrante ainda.</p>
                        ) : (
                            <ul className="border-b border-sutil">
                                {integrantes.map((integrante) => (
                                    <li
                                        key={integrante.pessoaId}
                                        className="flex items-center gap-3 border-b border-sutil px-card py-4 last:border-b-0"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-item text-titulo">{integrante.nome}</p>
                                            <p className="mt-1 text-apoio text-secundario">
                                                {[
                                                    integrante.competencia ?? 'competência não informada',
                                                    representantes.includes(integrante.nome) ? 'representante' : null,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </p>
                                        </div>
                                        <SeloStatus status="aprovada" rotulo="Integrante" comPonto />
                                    </li>
                                ))}
                            </ul>
                        )}
                        <NovoIntegrante opcoes={opcoes} aoAdicionar={adicionar} />
                    </section>

                    <CartaoDeAviso>
                        A confirmação de cada integrante é pedida por candidatura: quem não confirmar segura o envio.
                    </CartaoDeAviso>
                </aside>
            </div>
        </CascaDoApp>
    )
}

export default PerfilDaSquad
