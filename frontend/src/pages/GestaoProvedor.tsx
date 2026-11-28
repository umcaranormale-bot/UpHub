import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { listarOportunidades } from '../api/oportunidades'
import { buscarOrganizacao } from '../api/organizacoes'
import { buscarPedido, listarPedidos, type Solicitacao } from '../api/solicitacoesProvedor'
import CascaDoApp from '../components/CascaDoApp'
import { CustomButton } from '../components/CustomButton'
import SeloDeTrilha from '../components/SeloDeTrilha'
import SeloStatus from '../components/SeloStatus'
import ConferenciaDoPedido from '../components/gestao/ConferenciaDoPedido'
import ModalDoPedido from '../components/gestao/ModaisDoPedido'
import { SITUACAO_SOLICITACAO } from '../components/gestao/rotulos'
import { Aviso, Carregando, ErroNaTela } from '../components/ui/Estados'
import { ANEL_FOCO, CARTAO, CARTAO_COM_RESPIRO } from '../estilos/classes'
import { formatarData, trilhaDoSelo } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_GESTAO } from '../navegacao/menus'

/**
 * 18b e 18c · Gestão do PD — provedor aprovado e permissão revogada ·
 * rota /gestao/provedores/:id
 *
 * O pedido aprovado, com o modal de revogar a permissão (motivo obrigatório).
 * Depois de revogada, as oportunidades da organização aparecem suspensas.
 */

const ROTULO_ESTADO_OPORTUNIDADE: Record<string, string> = {
    RASCUNHO: 'Rascunho',
    PUBLICADA: 'Publicada',
    EM_AVALIACAO: 'Em avaliação',
    ENCERRADA: 'Encerrada',
}

async function carregar(id: number) {
    const pedido = await buscarPedido(id)
    const [organizacao, historico, oportunidades] = await Promise.all([
        buscarOrganizacao(pedido.organizacaoId),
        listarPedidos(pedido.organizacaoId),
        listarOportunidades(pedido.organizacaoId),
    ])
    return { pedido, organizacao, historico, oportunidades }
}

function GestaoProvedor() {
    const { id } = useParams()
    const pedidoId = Number(id)
    const valido = Number.isInteger(pedidoId) && pedidoId > 0
    const { dados, carregando, erro, recarregar } = useDados(() => carregar(pedidoId), [pedidoId], valido)
    const [revogando, setRevogando] = useState(false)
    const [aviso, setAviso] = useState<string | null>(null)

    let conteudo
    if (!valido) {
        conteudo = <ErroNaTela mensagem="Solicitação não encontrada" />
    } else if (carregando && !dados) {
        conteudo = <Carregando />
    } else if (erro && !dados) {
        conteudo = <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />
    } else if (dados) {
        const { pedido, organizacao, historico, oportunidades } = dados
        const situacao = SITUACAO_SOLICITACAO[pedido.situacao]
        const anterior = pedido.solicitacaoAnteriorId ? historico.find((h) => h.id === pedido.solicitacaoAnteriorId) : undefined
        const outros = historico.filter((h) => h.id !== pedido.id)
        const publicadas = oportunidades.filter((o) => o.estado !== 'RASCUNHO')
        const suspensas = oportunidades.filter((o) => o.suspensaEm)

        conteudo = (
            <>
                <h1 className="font-display text-tela text-titulo">{pedido.organizacaoNome}</h1>
                <p className="mt-2 text-apoio text-secundario">
                    Pedido de permissão para publicar · pedido em {formatarData(pedido.pedidaEm)} por {pedido.solicitanteNome}
                </p>

                {aviso && (
                    <div className="mt-6">
                        <Aviso tipo="sucesso">{aviso}</Aviso>
                    </div>
                )}

                <section aria-label="Situação da permissão" className={`mt-6 ${CARTAO_COM_RESPIRO}`}>
                    <div className="flex items-center gap-3">
                        <h2 className="font-display text-h3 text-titulo">Permissão de provedor</h2>
                        <SeloStatus status={situacao.status} rotulo={situacao.rotulo} comPonto />
                        <span className="ml-auto text-apoio text-secundario">
                            {pedido.situacao === 'REVOGADA'
                                ? `revogada em ${formatarData(pedido.revogadaEm)}`
                                : pedido.decididaEm
                                  ? `decidido em ${formatarData(pedido.decididaEm)}`
                                  : 'aguardando decisão'}
                        </span>
                    </div>

                    <div className="mt-5">
                        <ConferenciaDoPedido pedido={pedido} organizacao={organizacao} anterior={anterior} />
                    </div>

                    {pedido.situacao === 'REVOGADA' && (
                        <div className="mt-5 rounded-card border border-status-reprovada-borda bg-status-reprovada-fundo p-5">
                            <p className="text-item text-status-reprovada-texto">
                                Permissão revogada em {formatarData(pedido.revogadaEm)}
                            </p>
                            <p className="mt-2 text-apoio text-titulo">Motivo: {pedido.motivoRevogacao ?? '—'}</p>
                            <p className="mt-1 text-legenda text-secundario">
                                As oportunidades publicadas ficaram suspensas e as candidaturas pausam até uma nova aprovação.
                                Para voltar a publicar, a organização faz um novo pedido.
                            </p>
                        </div>
                    )}
                    {pedido.situacao === 'RECUSADA' && (
                        <p className="mt-5 rounded-card bg-page p-4 text-apoio text-titulo">
                            Recusado: {pedido.motivo ?? '—'}
                            {pedido.recusaPorDocumento && ' · recusa por documento'}
                        </p>
                    )}

                    <div className="mt-6 flex items-center gap-4 border-t border-sutil pt-5">
                        {pedido.situacao === 'APROVADA' && (
                            <CustomButton variant="reprovar" size="auto" type="button" onClick={() => setRevogando(true)}>
                                Revogar permissão
                            </CustomButton>
                        )}
                        {pedido.situacao === 'AGUARDANDO' && (
                            <Link
                                to="/gestao/provedores"
                                className={`rounded-lg border border-profundo bg-card px-4 py-3 font-semibold text-profundo hover:bg-profundo hover:text-white ${ANEL_FOCO}`}
                            >
                                Decidir na fila de pedidos
                            </Link>
                        )}
                        <p className="max-w-[460px] sm:ml-auto sm:text-right text-apoio text-secundario">
                            {pedido.situacao === 'APROVADA'
                                ? 'Revogar retira a permissão de publicar. As oportunidades ficam suspensas e as candidaturas pausam até uma nova aprovação.'
                                : 'A decisão fica registrada no histórico de auditoria, com autor e data.'}
                        </p>
                    </div>
                </section>

                <section aria-labelledby="titulo-oportunidades" className={`mt-6 ${CARTAO}`}>
                    <header className="flex items-center gap-3 border-b border-sutil p-card">
                        <h2 id="titulo-oportunidades" className="font-display text-bloco text-titulo">
                            Oportunidades da organização
                        </h2>
                        {suspensas.length > 0 && (
                            <SeloStatus status="pendente" rotulo={`${suspensas.length} suspensa(s)`} comPonto />
                        )}
                    </header>
                    {publicadas.length === 0 ? (
                        <p className="p-card text-apoio text-secundario">Nenhuma oportunidade publicada.</p>
                    ) : (
                        <ul>
                            {publicadas.map((o) => (
                                <li key={o.id} className="flex items-center gap-3 border-b border-sutil px-card py-4 last:border-b-0">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-item text-titulo">{o.titulo}</p>
                                        <p className="mt-1 text-apoio text-secundario">
                                            {ROTULO_ESTADO_OPORTUNIDADE[o.estado] ?? o.estado}
                                            {o.publicadaEm && ` · publicada em ${formatarData(o.publicadaEm)}`}
                                        </p>
                                    </div>
                                    <SeloDeTrilha trilha={trilhaDoSelo(o.trilhaCodigo)} />
                                    {o.suspensaEm ? (
                                        <SeloStatus status="pendente" rotulo={`Suspensa em ${formatarData(o.suspensaEm)}`} comPonto />
                                    ) : (
                                        <SeloStatus status="aprovada" rotulo="Andando" comPonto />
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {outros.length > 0 && (
                    <section aria-labelledby="titulo-historico" className={`mt-6 ${CARTAO}`}>
                        <header className="border-b border-sutil p-card">
                            <h2 id="titulo-historico" className="font-display text-bloco text-titulo">
                                Outros pedidos da organização
                            </h2>
                        </header>
                        <ul>
                            {outros.map((h: Solicitacao) => (
                                <li key={h.id} className="flex items-center gap-3 border-b border-sutil px-card py-4 last:border-b-0">
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            to={`/gestao/provedores/${h.id}`}
                                            className={`rounded-card text-item text-titulo hover:text-acento ${ANEL_FOCO}`}
                                        >
                                            Pedido de {formatarData(h.pedidaEm)}
                                        </Link>
                                        <p className="mt-1 text-apoio text-secundario">
                                            {h.motivoRevogacao ?? h.motivo ?? h.emailInstitucional}
                                        </p>
                                    </div>
                                    <SeloStatus
                                        status={SITUACAO_SOLICITACAO[h.situacao].status}
                                        rotulo={SITUACAO_SOLICITACAO[h.situacao].rotulo}
                                        comPonto
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <ModalDoPedido
                    key={revogando ? 'aberto' : 'fechado'}
                    pedido={revogando ? pedido : null}
                    acao={revogando ? 'revogar' : null}
                    aoFechar={() => setRevogando(false)}
                    aoConcluir={(resultado) => {
                        setRevogando(false)
                        setAviso(
                            `Permissão de ${resultado.organizacaoNome} revogada. As oportunidades publicadas ficaram suspensas até uma nova aprovação.`,
                        )
                        void recarregar()
                    }}
                />
            </>
        )
    }

    return (
        <CascaDoApp itens={MENU_GESTAO} voltarPara="/gestao/provedores">
            {conteudo}
        </CascaDoApp>
    )
}

export default GestaoProvedor
