import { Link } from 'react-router-dom'

import { listarOportunidades } from '../api/oportunidades'
import { listarTrilhasDasOrganizacoes } from '../api/organizacaoTrilhas'
import CascaDoApp from '../components/CascaDoApp'
import PaginaDeConta from '../components/PaginaDeConta'
import SeloStatus from '../components/SeloStatus'
import { ultimoPedido } from '../components/provedor/dados'
import { LINK_ACAO, ROTULO_PEDIDO, STATUS_PEDIDO } from '../components/provedor/rotulos'
import { Carregando, ErroNaTela } from '../components/ui/Estados'
import { formatarData, ROTULO_TIPO_ORGANIZACAO } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_PROVEDOR } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'

/**
 * 31 e 32 · Provedor — conta · rota /provedor/conta
 *
 * A API ainda não tem a edição dos dados da pessoa, então a tela 32 (editar
 * perfil) fica de fora. No destaque, a situação da permissão de publicar.
 */
function ProvedorConta() {
    const { perfilAtivo } = useSessao()
    const organizacaoId = perfilAtivo?.vinculo.organizacaoId

    const { dados, carregando, erro, recarregar } = useDados(
        async () => {
            const [pedido, oportunidades, trilhas] = await Promise.all([
                ultimoPedido(organizacaoId!).catch(() => null),
                listarOportunidades(organizacaoId!).catch(() => []),
                listarTrilhasDasOrganizacoes(organizacaoId!).catch(() => []),
            ])
            return { pedido, oportunidades, trilhas }
        },
        [organizacaoId],
        !!organizacaoId,
    )

    const pedido = dados?.pedido ?? null
    const contar = (estados: string[]) => dados?.oportunidades.filter((o) => estados.includes(o.estado)).length ?? 0

    return (
        <CascaDoApp itens={MENU_PROVEDOR} voltarPara="/provedor">
            <PaginaDeConta
                destaqueTitulo="Permissão de publicar"
                destaque={
                    <div className="mt-3 flex flex-col gap-3">
                        {carregando && !dados && <Carregando />}
                        {erro && <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />}
                        {dados && (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="min-w-0 flex-1 text-item text-titulo">{perfilAtivo?.vinculo.organizacaoNome}</span>
                                    {pedido ? (
                                        <SeloStatus status={STATUS_PEDIDO[pedido.situacao]} rotulo={ROTULO_PEDIDO[pedido.situacao]} comPonto />
                                    ) : (
                                        <SeloStatus status="rascunho" rotulo="Sem pedido" comPonto />
                                    )}
                                </div>
                                <dl className="flex flex-col gap-2 rounded-card bg-page p-4 text-apoio">
                                    <div className="flex justify-between gap-3">
                                        <dt className="text-secundario">Tipo</dt>
                                        <dd className="text-right text-titulo">
                                            {perfilAtivo?.organizacao ? (ROTULO_TIPO_ORGANIZACAO[perfilAtivo.organizacao.tipo] ?? perfilAtivo.organizacao.tipo) : '—'}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <dt className="text-secundario">Trilhas</dt>
                                        <dd className="text-right text-titulo">
                                            {dados.trilhas.length > 0 ? dados.trilhas.map((t) => t.trilhaNome).join(', ') : '—'}
                                        </dd>
                                    </div>
                                </dl>
                                <p className="text-apoio text-secundario">{textoDaPermissao(pedido)}</p>
                                {pedido?.situacao !== 'APROVADA' && (
                                    <Link to="/provedor/pedido" className={LINK_ACAO}>
                                        {pedido ? 'Ver o pedido de permissão' : 'Pedir a permissão de publicar'}
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                }
            >
                <section aria-labelledby="titulo-atuacao" className="rounded-bloco border border-sutil bg-card p-card shadow-card">
                    <h2 id="titulo-atuacao" className="font-display text-bloco text-titulo">
                        Resumo da atuação como provedor
                    </h2>
                    {dados && (
                        <ul className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                            {[
                                { rotulo: 'Publicadas', valor: contar(['PUBLICADA', 'EM_AVALIACAO']) },
                                { rotulo: 'Encerradas', valor: contar(['ENCERRADA']) },
                                { rotulo: 'Rascunhos', valor: contar(['RASCUNHO']) },
                                { rotulo: 'Suspensas', valor: dados.oportunidades.filter((o) => o.suspensaEm).length },
                            ].map((item) => (
                                <li key={item.rotulo} className="rounded-card bg-page p-4">
                                    <p className="text-apoio text-secundario">{item.rotulo}</p>
                                    <p className="mt-1 font-display text-tela text-acento">{item.valor}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Link to="/provedor" className={`mt-4 inline-block ${LINK_ACAO}`}>
                        Ver o painel de oportunidades
                    </Link>
                </section>
            </PaginaDeConta>
        </CascaDoApp>
    )
}

function textoDaPermissao(pedido: Awaited<ReturnType<typeof ultimoPedido>>): string {
    if (!pedido) return 'A organização ainda não pediu a permissão. Sem ela, dá para montar rascunhos, mas não publicar.'
    switch (pedido.situacao) {
        case 'AGUARDANDO':
            return `Pedido enviado em ${formatarData(pedido.pedidaEm)}, na fila da gestão do Porto Digital.`
        case 'APROVADA':
            return `Aprovada em ${formatarData(pedido.decididaEm)}. A organização publica oportunidades.`
        case 'RECUSADA':
            return `Recusada em ${formatarData(pedido.decididaEm)}. Motivo: ${pedido.motivo ?? '—'}`
        case 'REVOGADA':
            return `Revogada em ${formatarData(pedido.revogadaEm)}: as oportunidades publicadas estão suspensas. Motivo: ${pedido.motivoRevogacao ?? '—'}`
    }
}

export default ProvedorConta
