import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { listarCandidaturasDaOportunidade, moverNoFunil, type Candidatura, type EstagioFunil } from '../api/candidaturas'
import { mensagemDeErro } from '../api/erros'
import { matchingDaOportunidade } from '../api/matching'
import { buscarOportunidade } from '../api/oportunidades'
import CascaDoApp from '../components/CascaDoApp'
import SeloStatus from '../components/SeloStatus'
import { BotaoLink } from '../components/provedor/Botao'
import Cabecalho from '../components/provedor/Cabecalho'
import { avaliacoesDe, formatarNota, nomesDasOrganizacoes, notaFinal } from '../components/provedor/dados'
import { estaSuspensa, LINK_ACAO } from '../components/provedor/rotulos'
import { Aviso, Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { rotuloDoEstado, statusDoEstado } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_PROVEDOR } from '../navegacao/menus'

/** 72 · Provedor — funil do investimento (kanban) · rota /provedor/oportunidades/:id/funil */

const ESTAGIOS: { id: EstagioFunil; rotulo: string; acao: string | null }[] = [
    { id: 'INSCRITA', rotulo: 'Inscrita', acao: 'Triar' },
    { id: 'TRIADA', rotulo: 'Triada', acao: 'Levar para diligência' },
    { id: 'EM_DILIGENCIA', rotulo: 'Em diligência', acao: 'Selecionar' },
    { id: 'SELECIONADA', rotulo: 'Selecionada', acao: null },
]

/** Estados de onde a candidatura não sai mais (a máquina de estados do back-end). */
const FINAIS = ['NAO_ELEGIVEL', 'REPROVADA', 'DESISTENTE', 'NAO_CONVOCADA', 'DESCLASSIFICADA', 'DESCARTADA', 'CONCLUIDA']

function ProvedorFunil() {
    const { id } = useParams()
    const oportunidadeId = Number(id)
    const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)
    const [movendo, setMovendo] = useState<number | null>(null)

    const { dados, carregando, erro, recarregar } = useDados(
        async () => {
            const oportunidade = await buscarOportunidade(oportunidadeId)
            if (oportunidade.trilhaCodigo !== 'INVESTIMENTO') {
                return { oportunidade, candidaturas: [], nomes: new Map<number, string>(), compat: new Map<number, number>(), avaliacoes: new Map() }
            }
            const candidaturas = await listarCandidaturasDaOportunidade(oportunidadeId)
            const [nomes, matching, avaliacoes] = await Promise.all([
                nomesDasOrganizacoes(candidaturas.map((c) => c.organizacaoId)),
                matchingDaOportunidade(oportunidadeId, 100).catch(() => []),
                avaliacoesDe(candidaturas),
            ])
            return {
                oportunidade,
                candidaturas,
                nomes,
                compat: new Map(matching.map((m) => [m.organizacaoId, m.compatibilidade])),
                avaliacoes,
            }
        },
        [oportunidadeId],
    )

    async function mover(c: Candidatura, para: EstagioFunil, nome: string) {
        setMovendo(c.id)
        setAviso(null)
        try {
            await moverNoFunil(c.id, para)
            setAviso({ tipo: 'sucesso', texto: `${nome} foi para ${ESTAGIOS.find((e) => e.id === para)?.rotulo.toLowerCase()}.` })
            await recarregar()
        } catch (e) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
        } finally {
            setMovendo(null)
        }
    }

    const suspensa = dados ? estaSuspensa(dados.oportunidade) : false

    return (
        <CascaDoApp itens={MENU_PROVEDOR} voltarPara="/provedor">
            <Cabecalho
                titulo={`Funil · ${dados?.oportunidade.titulo ?? ''}`}
                apoio="Trilha Investimento · a candidatura só anda para a frente no funil, e o funil corre junto com a avaliação"
                acoes={<BotaoLink para={`/provedor/candidaturas?oportunidade=${oportunidadeId}`}>Ver lista</BotaoLink>}
            />

            <div className="mt-6 flex flex-col gap-5">
                {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
                {suspensa && <Aviso tipo="erro">Oportunidade pausada: a permissão de publicar foi revogada e o funil não anda.</Aviso>}
                {carregando && !dados && <Carregando />}
                {erro && <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />}

                {dados && dados.oportunidade.trilhaCodigo !== 'INVESTIMENTO' && (
                    <Vazio titulo="O funil só existe na trilha Investimento">
                        <Link to={`/provedor/candidaturas?oportunidade=${oportunidadeId}`} className={LINK_ACAO}>
                            Ver as candidaturas desta oportunidade
                        </Link>
                    </Vazio>
                )}

                {dados && dados.oportunidade.trilhaCodigo === 'INVESTIMENTO' && (
                    <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {ESTAGIOS.map((estagio, i) => {
                            const doEstagio = dados.candidaturas.filter((c) => c.estagioFunil === estagio.id)
                            const proximo = ESTAGIOS[i + 1]?.id
                            const anterior = ESTAGIOS[i - 1]?.id
                            return (
                                <section key={estagio.id} aria-label={estagio.rotulo} className="rounded-bloco bg-sutil/60 p-3">
                                    <h2 className="flex items-center gap-2 px-1 pb-3 text-item text-titulo">
                                        {estagio.rotulo}
                                        <span className="text-apoio text-secundario">· {doEstagio.length}</span>
                                    </h2>
                                    <ul className="flex flex-col gap-3">
                                        {doEstagio.length === 0 && (
                                            <li className="rounded-card border border-dashed border-sutil px-3 py-4 text-legenda text-secundario">
                                                Nenhuma candidatura
                                            </li>
                                        )}
                                        {doEstagio.map((c) => {
                                            const nome = dados.nomes.get(c.organizacaoId) ?? `Organização ${c.organizacaoId}`
                                            const compat = dados.compat.get(c.organizacaoId)
                                            const nota = notaFinal(dados.avaliacoes.get(c.id) ?? [])
                                            return (
                                                <li key={c.id} className="rounded-card border border-sutil bg-card p-3 shadow-card">
                                                    <Link to={`/provedor/candidaturas/${c.id}`} className="text-item text-titulo hover:underline">
                                                        {nome}
                                                    </Link>
                                                    <p className="mt-1 text-legenda text-secundario">
                                                        {compat !== undefined ? `compatibilidade ${compat}` : 'sem compatibilidade'}
                                                        {nota !== null ? ` · nota ${formatarNota(nota)}` : ''}
                                                    </p>
                                                    <div className="mt-2">
                                                        <SeloStatus status={statusDoEstado(c.estado)} rotulo={rotuloDoEstado(c.estado)} />
                                                    </div>
                                                    {proximo && estagio.acao && !suspensa && !FINAIS.includes(c.estado) && (
                                                        <button
                                                            type="button"
                                                            disabled={movendo === c.id}
                                                            onClick={() => void mover(c, proximo, nome)}
                                                            className={`mt-2 ${LINK_ACAO} disabled:opacity-50`}
                                                        >
                                                            {estagio.acao} ›
                                                        </button>
                                                    )}
                                                    {anterior && !suspensa && !FINAIS.includes(c.estado) && (
                                                        // o funil só anda para a frente: o botão existe para mostrar que o servidor recusa (409)
                                                        <button
                                                            type="button"
                                                            disabled={movendo === c.id}
                                                            onClick={() => void mover(c, anterior, nome)}
                                                            title="O funil só anda para a frente: o servidor recusa a volta"
                                                            className="mt-2 ml-3 text-legenda text-secundario underline hover:text-titulo disabled:opacity-50"
                                                        >
                                                            ‹ voltar
                                                        </button>
                                                    )}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </section>
                            )
                        })}
                    </div>
                )}

                <p className="rounded-card bg-page px-5 py-3 text-apoio text-secundario">
                    Estágios: Inscrita → Triada → Em diligência → Selecionada. Voltar um estágio não é permitido.
                </p>
            </div>
        </CascaDoApp>
    )
}

export default ProvedorFunil
