import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { listarCriterios } from '../api/criterios'
import { listarDocumentosExigidos } from '../api/documentosExigidos'
import { mensagemDeErro } from '../api/erros'
import { buscarOportunidade } from '../api/oportunidades'
import { listarCamposDeRequisito, listarRequisitos } from '../api/requisitos'
import { listarReservas } from '../api/reservas'
import { criarVersao, listarVersoes } from '../api/versoes'
import CascaDoApp from '../components/CascaDoApp'
import SeloDeTrilha from '../components/SeloDeTrilha'
import Botao from '../components/provedor/Botao'
import Cabecalho from '../components/provedor/Cabecalho'
import EtapaCriterios from '../components/provedor/criacao/EtapaCriterios'
import EtapaDados from '../components/provedor/criacao/EtapaDados'
import EtapaPublicar from '../components/provedor/criacao/EtapaPublicar'
import EtapaRequisitos from '../components/provedor/criacao/EtapaRequisitos'
import EtapaVersao from '../components/provedor/criacao/EtapaVersao'
import { somaDosPesos, ultimoPedido } from '../components/provedor/dados'
import { LINK_ACAO } from '../components/provedor/rotulos'
import { Aviso, Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { ANEL_FOCO, TRANSICAO_COR } from '../estilos/classes'
import { trilhaDoSelo } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_PROVEDOR } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'

/**
 * 03 e 69 · Provedor — criar oportunidade · rotas /provedor/oportunidades/nova
 * e /provedor/oportunidades/:id/editar
 *
 * Em etapas: a primeira cria o rascunho (e a versão); as outras completam a
 * versão — prazos, critérios, regras, documentos e reservas — até publicar.
 */

const ETAPAS = ['Dados', 'Prazos e vagas', 'Critérios e pesos', 'Elegibilidade e documentos', 'Reserva e publicação'] as const

function ProvedorNovaOportunidade() {
    const { id } = useParams()
    const oportunidadeId = id ? Number(id) : null
    const { perfilAtivo } = useSessao()
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId
    const navigate = useNavigate()
    const [parametros, setParametros] = useSearchParams()
    const etapa = Math.min(5, Math.max(1, Number(parametros.get('etapa')) || (oportunidadeId ? 2 : 1)))
    const [aviso, setAviso] = useState<string | null>(null)

    const irPara = (n: number) => {
        setAviso(null)
        setParametros({ etapa: String(n) }, { replace: true })
    }

    const { dados, carregando, erro, recarregar } = useDados(
        async () => {
            const oportunidade = await buscarOportunidade(oportunidadeId!)
            const versoes = await listarVersoes(oportunidadeId!)
            const versao = [...versoes].filter((v) => !v.publicada).sort((a, b) => b.numero - a.numero)[0] ?? null
            const [criterios, requisitos, documentos, reservas, campos, pedido] = await Promise.all([
                versao ? listarCriterios(oportunidadeId!, versao.id) : Promise.resolve([]),
                versao ? listarRequisitos(oportunidadeId!, versao.id) : Promise.resolve([]),
                versao ? listarDocumentosExigidos(oportunidadeId!, versao.id) : Promise.resolve([]),
                versao ? listarReservas(oportunidadeId!, versao.id) : Promise.resolve([]),
                listarCamposDeRequisito(),
                ultimoPedido(oportunidade.organizacaoId).catch(() => null),
            ])
            return { oportunidade, versao, criterios, requisitos, documentos, reservas, campos, pedido }
        },
        [oportunidadeId],
        !!oportunidadeId,
    )

    const [criandoVersao, setCriandoVersao] = useState(false)
    const [erroVersao, setErroVersao] = useState<string | null>(null)

    const titulo = dados?.oportunidade ? `Criar oportunidade · ${dados.oportunidade.titulo}` : 'Nova oportunidade'

    return (
        <CascaDoApp itens={MENU_PROVEDOR} voltarPara="/provedor">
            <Cabecalho
                titulo={titulo}
                apoio="Só o rascunho pode ser editado. Depois de publicada, só o prazo de envio muda."
                acoes={dados?.oportunidade && <SeloDeTrilha trilha={trilhaDoSelo(dados.oportunidade.trilhaCodigo)} />}
            />

            <nav aria-label="Etapas" className="mt-5">
                <ol className="flex flex-wrap gap-3">
                    {ETAPAS.map((nome, i) => {
                        const n = i + 1
                        const ativa = n === etapa
                        const liberada = n === 1 || !!oportunidadeId
                        return (
                            <li key={nome}>
                                <button
                                    type="button"
                                    disabled={!liberada}
                                    aria-current={ativa ? 'step' : undefined}
                                    onClick={() => irPara(n)}
                                    className={`rounded-card border px-4 py-2 text-apoio ${TRANSICAO_COR} disabled:cursor-not-allowed disabled:opacity-50 ${
                                        ativa ? 'border-acento bg-acento text-white' : 'border-sutil bg-card text-titulo hover:bg-page'
                                    } ${ANEL_FOCO}`}
                                >
                                    {n} · {nome}
                                </button>
                            </li>
                        )
                    })}
                </ol>
            </nav>

            <div className="mt-5 flex flex-col gap-5">
                {aviso && <Aviso tipo="sucesso">{aviso}</Aviso>}

                {!oportunidadeId && organizacaoId && (
                    <EtapaDados
                        organizacaoId={organizacaoId}
                        oportunidade={null}
                        aoSalvar={(criada) =>
                            navigate(`/provedor/oportunidades/${criada.id}/editar?etapa=2`, { replace: true })
                        }
                    />
                )}

                {oportunidadeId && carregando && !dados && <Carregando />}
                {oportunidadeId && erro && <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />}

                {dados && dados.oportunidade.estado !== 'RASCUNHO' && (
                    <Vazio titulo="Esta oportunidade já foi publicada">
                        Depois de publicada, só o prazo de envio muda, pelo painel.{' '}
                        <Link to="/provedor" className={LINK_ACAO}>
                            Voltar ao painel
                        </Link>
                    </Vazio>
                )}

                {dados && dados.oportunidade.estado === 'RASCUNHO' && organizacaoId && (
                    <>
                        {etapa === 1 && (
                            <EtapaDados
                                organizacaoId={organizacaoId}
                                oportunidade={dados.oportunidade}
                                aoSalvar={async () => {
                                    await recarregar()
                                    irPara(2)
                                }}
                            />
                        )}

                        {etapa > 1 && !dados.versao && (
                            <Vazio titulo="Este rascunho ainda não tem versão">
                                <p>A versão guarda os prazos, os critérios e as regras.</p>
                                {erroVersao && <Aviso tipo="erro">{erroVersao}</Aviso>}
                                <Botao
                                    variante="primario"
                                    className="mt-3"
                                    disabled={criandoVersao}
                                    onClick={async () => {
                                        setCriandoVersao(true)
                                        setErroVersao(null)
                                        try {
                                            await criarVersao(dados.oportunidade.id)
                                            await recarregar()
                                        } catch (e) {
                                            setErroVersao(mensagemDeErro(e))
                                        } finally {
                                            setCriandoVersao(false)
                                        }
                                    }}
                                >
                                    Criar a versão
                                </Botao>
                            </Vazio>
                        )}

                        {dados.versao && etapa === 2 && (
                            <EtapaVersao
                                key={dados.versao.id}
                                oportunidadeId={dados.oportunidade.id}
                                trilha={dados.oportunidade.trilhaCodigo}
                                versao={dados.versao}
                                aoSalvar={async () => {
                                    await recarregar()
                                    irPara(3)
                                }}
                            />
                        )}

                        {dados.versao && etapa === 3 && (
                            <>
                                <EtapaCriterios
                                    oportunidadeId={dados.oportunidade.id}
                                    versaoId={dados.versao.id}
                                    criterios={dados.criterios}
                                    aoMudar={recarregar}
                                />
                                <Seguir aoSeguir={() => irPara(4)} />
                            </>
                        )}

                        {dados.versao && etapa === 4 && (
                            <>
                                <EtapaRequisitos
                                    oportunidadeId={dados.oportunidade.id}
                                    versaoId={dados.versao.id}
                                    campos={dados.campos}
                                    requisitos={dados.requisitos}
                                    documentos={dados.documentos}
                                    aoMudar={recarregar}
                                />
                                <Seguir aoSeguir={() => irPara(5)} />
                            </>
                        )}

                        {dados.versao && etapa === 5 && (
                            <EtapaPublicar
                                oportunidadeId={dados.oportunidade.id}
                                versao={dados.versao}
                                reservas={dados.reservas}
                                somaPesos={somaDosPesos(dados.criterios)}
                                totalCriterios={dados.criterios.length}
                                pedido={dados.pedido}
                                aoMudar={recarregar}
                                aoPublicar={() =>
                                    navigate('/provedor', {
                                        state: { aviso: `${dados.oportunidade.titulo} foi publicada e já recebe candidaturas.` },
                                    })
                                }
                            />
                        )}
                    </>
                )}
            </div>
        </CascaDoApp>
    )
}

function Seguir({ aoSeguir }: { aoSeguir: () => void }) {
    return (
        <div className="flex justify-end">
            <Botao variante="primario" onClick={aoSeguir}>
                Seguir para a próxima etapa
            </Botao>
        </div>
    )
}

export default ProvedorNovaOportunidade
