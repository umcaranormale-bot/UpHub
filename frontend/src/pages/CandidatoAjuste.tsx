import { useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'

import { corrigirItem, listarAjustes, reenviarAjuste, type ItemAjuste, type PedidoAjuste } from '../api/ajustes'
import { buscarCandidatura } from '../api/candidaturas'
import { listarDocumentos, type Documento } from '../api/documentos'
import { mensagemDeErro } from '../api/erros'
import { buscarOportunidade } from '../api/oportunidades'
import { buscarOrganizacao } from '../api/organizacoes'
import CascaDoApp from '../components/CascaDoApp'
import { diasAteData, tamanhoDoArquivo } from '../components/candidato/apoio'
import { Secao } from '../components/candidato/Blocos'
import NovoDocumento from '../components/candidato/NovoDocumento'
import { CustomButton } from '../components/CustomButton'
import SeloStatus from '../components/SeloStatus'
import { CampoLista, CampoTexto } from '../components/ui/Campo'
import { Aviso, Carregando, ErroNaTela } from '../components/ui/Estados'
import { ANEL_FOCO, CARTAO_COM_RESPIRO, TRANSICAO_COR } from '../estilos/classes'
import { formatarData, formatarDataHora, hoje, rotuloDoEstado, ROTULO_TRILHA, statusDoEstado } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_CANDIDATO } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'

/**
 * 46 · Candidato — ajuste pedido (corrigir e reenviar) · rota /candidato/candidaturas/:id/ajuste
 *
 * Os itens que a avaliação pediu para corrigir, o prazo para reenviar e a
 * resposta. Item de documento exigido pede um documento novo; os outros só
 * são marcados como corrigidos. O reenvio abre uma rodada nova com os mesmos
 * avaliadores.
 */
export default function CandidatoAjuste() {
    const { id } = useParams()
    const candidaturaId = Number(id)
    const { perfilAtivo } = useSessao()
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId

    const { dados, carregando, erro, recarregar } = useDados(
        async () => {
            const candidatura = await buscarCandidatura(candidaturaId)
            const oportunidade = await buscarOportunidade(candidatura.oportunidadeId)
            const [provedor, ajustes, documentos] = await Promise.all([
                buscarOrganizacao(oportunidade.organizacaoId).catch(() => null),
                listarAjustes(candidaturaId),
                listarDocumentos(organizacaoId as number),
            ])
            return { candidatura, oportunidade, provedor, ajustes, documentos }
        },
        [candidaturaId, organizacaoId],
        !!organizacaoId && Number.isFinite(candidaturaId),
    )
    const [reenviado, setReenviado] = useState<PedidoAjuste | null>(null)

    const casca = (conteudo: ReactNode) => (
        <CascaDoApp itens={MENU_CANDIDATO} voltarPara={`/candidato/candidaturas/${candidaturaId}`}>
            {conteudo}
        </CascaDoApp>
    )
    if (carregando && !dados) return casca(<Carregando />)
    if (erro || !dados) return casca(<ErroNaTela mensagem={erro ?? 'Candidatura não encontrada'} tentarDeNovo={recarregar} />)

    const { candidatura: c, oportunidade, provedor, ajustes, documentos } = dados

    if (reenviado) {
        return casca(
            <div className={`${CARTAO_COM_RESPIRO} flex flex-col items-start gap-3`}>
                <h1 className="font-display text-tela text-titulo">Ajuste reenviado · {oportunidade.titulo}</h1>
                <Aviso tipo="sucesso">
                    Reenviado em {formatarDataHora(reenviado.reenviadoEm)}. A candidatura voltou para Em análise, numa rodada
                    nova, com os mesmos avaliadores.
                </Aviso>
                <CustomButton to={`/candidato/candidaturas/${c.id}`} variant="aprovar" size="auto">
                    Acompanhar a candidatura
                </CustomButton>
            </div>,
        )
    }

    const pedido = ajustes.find((p) => p.situacao === 'AGUARDANDO') ?? null
    if (c.estado !== 'AJUSTE' || !pedido) {
        return casca(
            <div className={`${CARTAO_COM_RESPIRO} flex flex-col items-start gap-3`}>
                <h1 className="font-display text-tela text-titulo">{oportunidade.titulo}</h1>
                <div className="flex items-center gap-2">
                    <SeloStatus status={statusDoEstado(c.estado)} rotulo={rotuloDoEstado(c.estado)} comPonto />
                    <span className="text-apoio text-secundario">Esta candidatura não está aguardando ajuste.</span>
                </div>
                <CustomButton to={`/candidato/candidaturas/${c.id}`} variant="neutro" size="auto">
                    Ver a candidatura
                </CustomButton>
            </div>,
        )
    }

    return casca(
        <Correcao
            key={pedido.id}
            pedido={pedido}
            documentos={documentos}
            titulo={oportunidade.titulo}
            subtitulo={`${provedor?.nome ?? 'Provedor'} · ${ROTULO_TRILHA[oportunidade.trilhaCodigo]}${
                c.enviadaEm ? ` · enviada em ${formatarData(c.enviadaEm)}` : ''
            }`}
            candidaturaId={c.id}
            organizacaoId={organizacaoId as number}
            recarregar={recarregar}
            aoReenviar={setReenviado}
        />,
    )
}

function Correcao({
    pedido,
    documentos,
    titulo,
    subtitulo,
    candidaturaId,
    organizacaoId,
    recarregar,
    aoReenviar,
}: {
    pedido: PedidoAjuste
    documentos: Documento[]
    titulo: string
    subtitulo: string
    candidaturaId: number
    organizacaoId: number
    recarregar: () => Promise<void>
    aoReenviar: (p: PedidoAjuste) => void
}) {
    const [resposta, setResposta] = useState(pedido.resposta ?? '')
    const [ocupado, setOcupado] = useState(false)
    const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

    const dias = diasAteData(pedido.prazoReenvio)
    const faltam = pedido.itens.filter((i) => !i.corrigidoEm)
    const podeReenviar = faltam.length === 0 && resposta.trim().length > 0

    async function corrigir(item: ItemAjuste, documentoNovoId?: number) {
        setOcupado(true)
        setAviso(null)
        try {
            await corrigirItem(candidaturaId, item.id, documentoNovoId)
            await recarregar()
            setAviso({ tipo: 'sucesso', texto: `${item.descricao}: corrigido.` })
        } catch (e) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
        } finally {
            setOcupado(false)
        }
    }

    async function reenviar() {
        setOcupado(true)
        setAviso(null)
        try {
            const feito = await reenviarAjuste(candidaturaId, resposta.trim())
            aoReenviar(feito)
            await recarregar()
        } catch (e) {
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
        } finally {
            setOcupado(false)
        }
    }

    return (
        <>
            <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="font-display text-tela text-titulo">{titulo}</h1>
                    <p className="mt-1 text-apoio text-secundario">{subtitulo}</p>
                </div>
                <SeloStatus status="pendente" rotulo="Ajuste pedido" comPonto />
            </div>

            {aviso && (
                <div className="mt-4">
                    <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
                </div>
            )}

            <div className="mt-6 flex flex-col items-start gap-6 lg:flex-row">
                <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
                    <Secao
                        titulo="O que a avaliação pediu"
                        subtitulo={`Pedido em ${formatarDataHora(pedido.pedidoEm)}${pedido.rodada ? ` · rodada ${pedido.rodada}` : ''}`}
                        semRespiro
                    >
                        <ul>
                            {pedido.itens.map((item) => (
                                <ItemDoAjuste
                                    key={item.id}
                                    item={item}
                                    documentos={documentos}
                                    organizacaoId={organizacaoId}
                                    ocupado={ocupado}
                                    corrigir={corrigir}
                                />
                            ))}
                        </ul>
                    </Secao>

                    <Secao
                        titulo="Reenviar"
                        subtitulo="Só os itens pedidos ficam abertos. O resto da proposta continua como foi enviado."
                    >
                        <div className="flex flex-col gap-4">
                            <CampoTexto
                                rotulo="O que você mudou (obrigatório)"
                                value={resposta}
                                onChange={(e) => setResposta(e.target.value)}
                                required
                            />
                            <div>
                                <CustomButton
                                    type="button"
                                    variant="aprovar"
                                    size="auto"
                                    disabled={ocupado || !podeReenviar}
                                    onClick={reenviar}
                                >
                                    {ocupado ? 'Enviando…' : 'Reenviar para avaliação'}
                                </CustomButton>
                            </div>
                            <p className="text-legenda text-secundario">
                                O botão só libera com todos os itens corrigidos e o texto preenchido
                                {faltam.length > 0 && ` (falta corrigir: ${faltam.map((i) => i.descricao).join(', ')})`}.
                            </p>
                        </div>
                    </Secao>
                </div>

                <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-[344px]">
                    <Secao titulo="Prazo para reenvio">
                        <p className="font-display text-h3 text-ocre">
                            {dias === null ? '—' : dias < 0 ? 'Prazo vencido' : dias === 0 ? 'Hoje' : `${dias} ${dias === 1 ? 'dia' : 'dias'}`}
                        </p>
                        <p className="mt-2 text-apoio text-secundario">até {formatarDataHora(pedido.prazoReenvio)}</p>
                        <p className="mt-2 text-legenda text-status-reprovada-texto">
                            Se o prazo vencer sem reenvio, a candidatura fica como “Perdeu o prazo”. O provedor pode reabrir com um
                            prazo novo.
                        </p>
                    </Secao>
                    <Secao titulo="Como fica a avaliação">
                        <ul className="flex list-disc flex-col gap-2 pl-5 text-apoio text-titulo">
                            <li>Depois do reenvio, a candidatura volta para Em análise, numa rodada nova.</li>
                            <li>Os mesmos avaliadores recebem a candidatura de novo.</li>
                            <li>São no máximo 3 rodadas: na terceira, a avaliação só aprova ou reprova.</li>
                        </ul>
                    </Secao>
                </aside>
            </div>
        </>
    )
}

function ItemDoAjuste({
    item,
    documentos,
    organizacaoId,
    ocupado,
    corrigir,
}: {
    item: ItemAjuste
    documentos: Documento[]
    organizacaoId: number
    ocupado: boolean
    corrigir: (item: ItemAjuste, documentoNovoId?: number) => Promise<void>
}) {
    const [escolhido, setEscolhido] = useState('')
    const [novo, setNovo] = useState(false)
    const [trocar, setTrocar] = useState(false)
    const pedeDocumento = item.documentoExigidoId !== null
    const docNovo = documentos.find((d) => d.id === item.documentoNovoId)
    const validos = documentos.filter((d) => !d.validade || d.validade >= hoje())
    const aberto = !item.corrigidoEm || trocar

    return (
        <li className="flex flex-col gap-3 border-b border-sutil px-card py-4 last:border-b-0">
            <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-item text-titulo">{item.descricao}</p>
                    {item.detalhe && <p className="mt-1 text-apoio text-secundario">{item.detalhe}</p>}
                    {pedeDocumento && (
                        <p className="mt-1 text-legenda text-secundario">
                            Troca o documento “{item.documentoExigidoNome}”
                            {docNovo && ` · novo: ${docNovo.nomeArquivo} · ${tamanhoDoArquivo(docNovo.tamanhoBytes)}`}
                        </p>
                    )}
                </div>
                {item.corrigidoEm ? (
                    <>
                        <SeloStatus status="aprovada" rotulo={pedeDocumento ? 'Substituído' : 'Corrigido'} />
                        {!trocar && (
                            <button
                                type="button"
                                onClick={() => setTrocar(true)}
                                className={`rounded-card px-1 text-apoio text-acento hover:text-titulo ${TRANSICAO_COR} ${ANEL_FOCO}`}
                            >
                                {pedeDocumento ? 'Trocar' : 'Refazer'}
                            </button>
                        )}
                    </>
                ) : (
                    <SeloStatus status="pendente" rotulo="Corrigir" />
                )}
            </div>

            {aberto && !pedeDocumento && !item.corrigidoEm && (
                <div>
                    <CustomButton type="button" variant="neutro" size="auto" disabled={ocupado} onClick={() => corrigir(item)}>
                        Marcar como corrigido
                    </CustomButton>
                </div>
            )}

            {aberto && pedeDocumento && (
                <>
                    {validos.length > 0 && (
                        <div className="flex items-end gap-3">
                            <div className="min-w-0 flex-1">
                                <CampoLista rotulo="Documento novo" value={escolhido} onChange={(e) => setEscolhido(e.target.value)}>
                                    <option value="">Escolha um documento da organização</option>
                                    {validos.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nomeArquivo} · {d.tipo} · enviado em {formatarData(d.enviadoEm)}
                                        </option>
                                    ))}
                                </CampoLista>
                            </div>
                            <CustomButton
                                type="button"
                                variant="neutro"
                                size="auto"
                                disabled={ocupado || !escolhido}
                                onClick={() =>
                                    void corrigir(item, Number(escolhido)).then(() => {
                                        setEscolhido('')
                                        setTrocar(false)
                                    })
                                }
                            >
                                Usar este
                            </CustomButton>
                        </div>
                    )}
                    {novo ? (
                        <NovoDocumento
                            organizacaoId={organizacaoId}
                            tipoSugerido={(item.documentoExigidoNome ?? '').toUpperCase().slice(0, 60)}
                            aoCriar={async (doc) => {
                                setNovo(false)
                                setTrocar(false)
                                await corrigir(item, doc.id)
                            }}
                            aoCancelar={() => setNovo(false)}
                        />
                    ) : (
                        <div>
                            <button
                                type="button"
                                onClick={() => setNovo(true)}
                                className={`rounded-card px-1 text-apoio text-acento hover:text-titulo ${TRANSICAO_COR} ${ANEL_FOCO}`}
                            >
                                Enviar arquivo novo
                            </button>
                        </div>
                    )}
                </>
            )}
        </li>
    )
}
