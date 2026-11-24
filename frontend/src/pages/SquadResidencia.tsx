import { useState, type FormEvent } from 'react'

import CascaDoApp from '../components/CascaDoApp'
import SeloStatus from '../components/SeloStatus'
import { CustomButton } from '../components/CustomButton'
import { Aviso, Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { Campo } from '../components/ui/Campo'
import { LinkDeTexto } from '../components/squad/AvisoComLink'
import { organizacoesPorId, squadOuNada, useSquadAtiva } from '../components/squad/dados'
import { mensagemDeErro } from '../api/erros'
import { recomendadas } from '../api/matching'
import { buscarResidencia, desafiosDaResidencia, entrarNaResidencia } from '../api/residencias'
import { useDados } from '../hooks/useDados'
import { MENU_SQUAD } from '../navegacao/menus'
import { CARTAO, CARTAO_COM_RESPIRO } from '../estilos/classes'
import { formatarData } from '../estilos/formatos'

/**
 * 67 · Squad — entrar na residência (código) · rota /squad/residencia
 *
 * A squad entra com o código que a coordenação passou e vê os desafios da
 * residência. Num desafio de residência, só se candidata a squad que entrou nela.
 */

async function carregar(squadId: number) {
    const squad = await squadOuNada(squadId)
    if (!squad?.residenciaId) return { squad, residencia: null, desafios: [], matches: [], provedores: new Map() }
    const [residencia, desafios, matches] = await Promise.all([
        buscarResidencia(squad.residenciaId),
        desafiosDaResidencia(squad.residenciaId),
        recomendadas(squadId, 100).catch(() => []),
    ])
    const provedores = await organizacoesPorId(desafios.map((d) => d.organizacaoId))
    return { squad, residencia, desafios, matches, provedores }
}

const CABECALHO_TABELA = 'px-card py-3 text-left text-selo uppercase text-secundario'

function SquadResidencia() {
    const { squadId, nome } = useSquadAtiva()
    const { dados, carregando, erro, recarregar } = useDados(() => carregar(squadId!), [squadId], !!squadId)
    const [codigo, setCodigo] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

    async function entrar(e: FormEvent) {
        e.preventDefault()
        if (!squadId) return
        setEnviando(true)
        setAviso(null)
        try {
            await entrarNaResidencia(squadId, codigo.trim())
            setCodigo('')
            await recarregar()
            setAviso({ tipo: 'sucesso', texto: 'A squad entrou na residência. Os desafios dela aparecem abaixo.' })
        } catch (erro) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(erro) })
        } finally {
            setEnviando(false)
        }
    }

    return (
        <CascaDoApp itens={MENU_SQUAD} voltarPara="/squad/perfil">
            <h1 className="font-display text-tela text-titulo">Residência</h1>
            <p className="mt-2 text-apoio text-secundario">
                {nome} · a squad só se candidata aos desafios da residência em que entrou
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

            {dados && !dados.squad && (
                <div className="mt-6">
                    <Vazio titulo="A squad ainda não foi cadastrada">
                        <LinkDeTexto para="/squad/perfil">Cadastrar no perfil da squad ›</LinkDeTexto>
                    </Vazio>
                </div>
            )}

            {dados?.squad && (
                <>
                    <div className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
                        <section aria-labelledby="titulo-entrar" className={CARTAO_COM_RESPIRO}>
                            <h2 id="titulo-entrar" className="font-display text-bloco text-titulo">
                                {dados.residencia ? 'Trocar de residência' : 'Entrar numa residência'}
                            </h2>
                            <p className="mt-2 text-apoio text-secundario">
                                A gestão do Porto Digital passa o código da residência para as squads.
                            </p>
                            <form className="mt-4 flex flex-col gap-4" onSubmit={entrar}>
                                <Campo
                                    rotulo="Código da residência"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value)}
                                    placeholder="RES-XXXXXX"
                                    autoComplete="off"
                                    required
                                    ajuda="Seis letras ou números depois de RES-. Maiúsculas e minúsculas não importam."
                                />
                                <div>
                                    <CustomButton type="submit" variant="aprovar" size="auto" disabled={!codigo.trim() || enviando}>
                                        {enviando ? 'Entrando…' : 'Entrar na residência'}
                                    </CustomButton>
                                </div>
                            </form>
                        </section>

                        <section aria-labelledby="titulo-atual" className={CARTAO_COM_RESPIRO}>
                            <h2 id="titulo-atual" className="font-display text-bloco text-titulo">
                                Residência atual
                            </h2>
                            {dados.residencia ? (
                                <>
                                    <div className="mt-3 flex items-center gap-3">
                                        <p className="font-display text-h3 text-titulo">{dados.residencia.nome}</p>
                                        <SeloStatus
                                            status={dados.residencia.estado === 'ABERTA' ? 'aprovada' : 'rascunho'}
                                            rotulo={dados.residencia.estado === 'ABERTA' ? 'Aberta' : 'Encerrada'}
                                            comPonto
                                        />
                                    </div>
                                    <p className="mt-2 text-apoio text-secundario">
                                        {formatarData(dados.residencia.inicio)} a {formatarData(dados.residencia.fim)}
                                        {dados.residencia.descricao ? ` · ${dados.residencia.descricao}` : ''}
                                    </p>
                                    <p className="mt-3 flex gap-2">
                                        <span className="rounded-badge bg-page px-2.5 py-1 text-selo text-secundario">
                                            {dados.residencia.squads} squads
                                        </span>
                                        <span className="rounded-badge bg-page px-2.5 py-1 text-selo text-secundario">
                                            {dados.residencia.desafios} desafios
                                        </span>
                                    </p>
                                </>
                            ) : (
                                <p className="mt-2 text-apoio text-secundario">A squad ainda não está em nenhuma residência.</p>
                            )}
                        </section>
                    </div>

                    {dados.residencia && (
                        <section aria-labelledby="titulo-desafios" className={`mt-5 ${CARTAO_COM_RESPIRO}`}>
                            <h2 id="titulo-desafios" className="font-display text-bloco text-titulo">
                                Desafios desta residência
                            </h2>
                            {dados.desafios.length === 0 ? (
                                <p className="mt-2 text-apoio text-secundario">Nenhum desafio publicado nesta residência ainda.</p>
                            ) : (
                                <div className={`mt-4 relative overflow-x-auto ${CARTAO} shadow-none`}>
                                    <table className="w-full">
                                        <thead className="border-b border-sutil">
                                            <tr>
                                                <th scope="col" className={CABECALHO_TABELA}>
                                                    Desafio
                                                </th>
                                                <th scope="col" className={CABECALHO_TABELA}>
                                                    Empresa proponente
                                                </th>
                                                <th scope="col" className={CABECALHO_TABELA}>
                                                    Inscrições até
                                                </th>
                                                <th scope="col" className={CABECALHO_TABELA}>
                                                    Compatibilidade
                                                </th>
                                                <th scope="col" className={CABECALHO_TABELA}>
                                                    <span className="sr-only">Ação</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dados.desafios.map((d) => {
                                                const match = dados.matches.find((m) => m.oportunidadeId === d.id)
                                                return (
                                                    <tr key={d.id} className="border-b border-sutil last:border-b-0">
                                                        <td className="px-card py-3 text-item text-titulo">{d.titulo}</td>
                                                        <td className="px-card py-3 text-apoio text-secundario">
                                                            {dados.provedores.get(d.organizacaoId)?.nome ?? '—'}
                                                        </td>
                                                        <td className="px-card py-3 text-apoio text-secundario">
                                                            {match ? formatarData(match.prazoEnvio) : '—'}
                                                        </td>
                                                        <td className="px-card py-3 text-apoio text-secundario">
                                                            {match ? `${match.compatibilidade}%` : 'fora do prazo ou inelegível'}
                                                        </td>
                                                        <td className="px-card py-3 text-right">
                                                            <LinkDeTexto para={`/squad/oportunidades/${d.id}`}>
                                                                {match?.jaSeCandidatou ? 'Ver candidatura' : 'Ver e candidatar'}
                                                            </LinkDeTexto>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    )}

                    <p className="mt-5 rounded-card bg-page px-card py-3 text-apoio text-secundario">
                        Na Formação, a compatibilidade pesa competências 50, elegibilidade 30 e área 20. Desafio de residência
                        só aceita candidatura de squad que entrou nela.
                    </p>
                </>
            )}
        </CascaDoApp>
    )
}

export default SquadResidencia
