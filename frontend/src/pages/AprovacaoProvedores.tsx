import { useState } from 'react'
import { Link } from 'react-router-dom'

import { listarOrganizacoes, type Organizacao } from '../api/organizacoes'
import { listarFila, type SituacaoSolicitacao, type Solicitacao } from '../api/solicitacoesProvedor'
import AbasDeFiltro from '../components/AbasDeFiltro'
import CascaDoApp from '../components/CascaDoApp'
import { CustomButton } from '../components/CustomButton'
import Indicadores, { type Indicador } from '../components/Indicadores'
import SeloStatus from '../components/SeloStatus'
import ConferenciaDoPedido from '../components/gestao/ConferenciaDoPedido'
import ModalDoPedido, { type AcaoDoPedido } from '../components/gestao/ModaisDoPedido'
import { mesDe, SITUACAO_SOLICITACAO } from '../components/gestao/rotulos'
import { Aviso, Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { ANEL_FOCO, CARTAO, CARTAO_COM_RESPIRO, TRANSICAO_COR } from '../estilos/classes'
import { formatarData, hoje, ROTULO_TIPO_ORGANIZACAO } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_GESTAO } from '../navegacao/menus'

/**
 * 18 · Gestão do PD — aprovação de provedores · rota /gestao/provedores
 *
 * A fila de pedidos de permissão para publicar, com os modais de aprovar e
 * recusar e os estados 35 (decisão registrada), 37 (recusa registrada) e
 * 49 (2º pedido, com a recusa anterior e a resposta da organização).
 */

type Filtro = SituacaoSolicitacao | 'TODAS'

async function carregar() {
    const [pedidos, organizacoes] = await Promise.all([listarFila(), listarOrganizacoes()])
    return { pedidos, organizacoes: new Map<number, Organizacao>(organizacoes.map((o) => [o.id, o])) }
}

function ehSegundoPedido(p: Solicitacao) {
    return p.solicitacaoAnteriorId !== null
}

function AprovacaoProvedores() {
    const { dados, carregando, erro, recarregar } = useDados(() => carregar(), [])
    const [filtro, setFiltro] = useState<Filtro>('AGUARDANDO')
    const [selecionado, setSelecionado] = useState<number | null>(null)
    const [acao, setAcao] = useState<AcaoDoPedido | null>(null)
    const [aviso, setAviso] = useState<string | null>(null)

    const pedidos = dados?.pedidos ?? []
    const visiveis = filtro === 'TODAS' ? pedidos : pedidos.filter((p) => p.situacao === filtro)
    const pedido = visiveis.find((p) => p.id === selecionado) ?? visiveis[0]
    const anterior = pedido?.solicitacaoAnteriorId ? pedidos.find((p) => p.id === pedido.solicitacaoAnteriorId) : undefined

    const esteMes = hoje().slice(0, 7)
    const decididosNoMes = (situacao: SituacaoSolicitacao) =>
        pedidos.filter((p) => p.situacao === situacao && p.decididaEm && mesDe(p.decididaEm) === esteMes).length
    const decididos = pedidos.filter((p) => p.decididaEm)
    const mediaDias =
        decididos.length === 0
            ? null
            : decididos.reduce((t, p) => t + (new Date(p.decididaEm ?? p.pedidaEm).getTime() - new Date(p.pedidaEm).getTime()), 0) /
              decididos.length /
              86_400_000

    const indicadores: Indicador[] = [
        {
            id: 'aguardando',
            rotulo: 'Aguardando análise',
            valor: String(pedidos.filter((p) => p.situacao === 'AGUARDANDO').length),
            cor: 'text-ocre',
        },
        { id: 'aprovadas', rotulo: 'Aprovados no mês', valor: String(decididosNoMes('APROVADA')), cor: 'text-status-aprovada-texto' },
        { id: 'recusadas', rotulo: 'Recusados no mês', valor: String(decididosNoMes('RECUSADA')), cor: 'text-status-reprovada-texto' },
        {
            id: 'tempo',
            rotulo: 'Tempo médio de análise',
            valor: mediaDias === null ? '—' : mediaDias < 1 ? 'menos de 1 dia' : `${Math.round(mediaDias)} dia(s)`,
            apoio: 'do pedido até a decisão',
        },
    ]

    const abas: { id: Filtro; rotulo: string; quantidade: number }[] = [
        ...(['AGUARDANDO', 'APROVADA', 'RECUSADA', 'REVOGADA'] as SituacaoSolicitacao[]).map((s) => ({
            id: s as Filtro,
            rotulo: SITUACAO_SOLICITACAO[s].rotulo,
            quantidade: pedidos.filter((p) => p.situacao === s).length,
        })),
        { id: 'TODAS', rotulo: 'Todos', quantidade: pedidos.length },
    ]

    function concluir(resultado: Solicitacao, feita: AcaoDoPedido) {
        setAcao(null)
        setAviso(
            feita === 'aprovar'
                ? `Decisão registrada: ${resultado.organizacaoNome} já pode publicar oportunidades.`
                : feita === 'recusar'
                  ? `Recusa registrada para ${resultado.organizacaoNome}. A organização vê o motivo e pode pedir de novo.`
                  : `Permissão de ${resultado.organizacaoNome} revogada. As oportunidades dela ficaram suspensas.`,
        )
        setFiltro(resultado.situacao)
        setSelecionado(resultado.id)
        void recarregar()
    }

    const organizacao = pedido ? dados?.organizacoes.get(pedido.organizacaoId) : undefined

    return (
        <CascaDoApp itens={MENU_GESTAO} voltarPara="/gestao">
            <h1 className="font-display text-tela text-titulo">Aprovação de provedores</h1>
            <p className="mt-2 text-apoio text-secundario">
                Organizações que pediram permissão para publicar oportunidades. Enquanto o pedido não é aprovado, ela navega
                mas não publica.
            </p>

            {aviso && (
                <div className="mt-6">
                    <Aviso tipo="sucesso">{aviso}</Aviso>
                </div>
            )}

            <div className="mt-6">
                {carregando && !dados ? (
                    <Carregando />
                ) : erro && !dados ? (
                    <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />
                ) : (
                    <div className="flex flex-col gap-6">
                        <Indicadores itens={indicadores} rotulo="Indicadores dos pedidos" />

                        <AbasDeFiltro abas={abas} ativa={filtro} aoEscolher={(id) => setFiltro(id)} rotulo="Filtrar pedidos pela situação" />

                        {visiveis.length === 0 ? (
                            <Vazio titulo="Nenhum pedido nesta situação">
                                Quando uma organização pedir permissão para publicar, o pedido aparece aqui.
                            </Vazio>
                        ) : (
                            <section aria-label="Fila de pedidos" className={`relative overflow-x-auto ${CARTAO}`}>
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-sutil bg-page">
                                            {['Organização', 'CNPJ', 'Tipo', 'Pedido em', 'Situação'].map((c) => (
                                                <th key={c} scope="col" className="px-card py-3 text-selo text-secundario uppercase">
                                                    {c}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visiveis.map((p) => {
                                            const org = dados?.organizacoes.get(p.organizacaoId)
                                            const ativo = p.id === pedido?.id
                                            const situacao = SITUACAO_SOLICITACAO[p.situacao]
                                            return (
                                                <tr
                                                    key={p.id}
                                                    className={`border-b border-sutil last:border-b-0 ${TRANSICAO_COR} ${ativo ? 'bg-acento-suave' : 'hover:bg-page'}`}
                                                >
                                                    <td className="px-card py-4">
                                                        <button
                                                            type="button"
                                                            aria-pressed={ativo}
                                                            onClick={() => setSelecionado(p.id)}
                                                            className={`rounded-card text-left text-item text-titulo hover:text-acento ${ANEL_FOCO}`}
                                                        >
                                                            {p.organizacaoNome}
                                                        </button>
                                                        <p className="mt-1 text-apoio text-secundario">
                                                            {p.solicitanteNome} · {p.emailInstitucional}
                                                            {ehSegundoPedido(p) && ' · novo pedido, responde à recusa anterior'}
                                                        </p>
                                                    </td>
                                                    <td className="px-card py-4 text-apoio text-titulo">{org?.cnpj ?? '—'}</td>
                                                    <td className="px-card py-4 text-apoio text-titulo">
                                                        {org ? (ROTULO_TIPO_ORGANIZACAO[org.tipo] ?? org.tipo) : '—'}
                                                    </td>
                                                    <td className="px-card py-4 text-apoio text-titulo">{formatarData(p.pedidaEm)}</td>
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

                        {pedido && (
                            <section aria-label={`Conferência de ${pedido.organizacaoNome}`} className={CARTAO_COM_RESPIRO}>
                                <div className="flex items-center gap-3">
                                    <h2 className="font-display text-h3 text-titulo">{pedido.organizacaoNome}</h2>
                                    <SeloStatus
                                        status={SITUACAO_SOLICITACAO[pedido.situacao].status}
                                        rotulo={SITUACAO_SOLICITACAO[pedido.situacao].rotulo}
                                        comPonto
                                    />
                                    {ehSegundoPedido(pedido) && <SeloStatus status="enviada" rotulo="Novo pedido" />}
                                    <span className="ml-auto text-apoio text-secundario">
                                        pedido em {formatarData(pedido.pedidaEm)}
                                        {pedido.decididaEm && ` · decidido em ${formatarData(pedido.decididaEm)}`}
                                    </span>
                                </div>

                                <div className="mt-5">
                                    <ConferenciaDoPedido pedido={pedido} organizacao={organizacao} anterior={anterior} />
                                </div>

                                {pedido.situacao === 'RECUSADA' && (
                                    <p className="mt-5 rounded-card bg-page p-4 text-apoio text-titulo">
                                        Recusado: {pedido.motivo ?? '—'}
                                        {pedido.recusaPorDocumento && ' · recusa por documento'}
                                    </p>
                                )}

                                <div className="mt-6 flex items-center gap-4 border-t border-sutil pt-5">
                                    {pedido.situacao === 'AGUARDANDO' && (
                                        <>
                                            <CustomButton variant="aprovar" size="auto" type="button" onClick={() => setAcao('aprovar')}>
                                                Aprovar e liberar publicação
                                            </CustomButton>
                                            <CustomButton variant="reprovar" size="auto" type="button" onClick={() => setAcao('recusar')}>
                                                Recusar
                                            </CustomButton>
                                        </>
                                    )}
                                    {(pedido.situacao === 'APROVADA' || pedido.situacao === 'REVOGADA') && (
                                        <Link
                                            to={`/gestao/provedores/${pedido.id}`}
                                            className={`rounded-lg border border-profundo bg-card px-4 py-3 font-semibold text-profundo hover:bg-profundo hover:text-white ${ANEL_FOCO}`}
                                        >
                                            {pedido.situacao === 'APROVADA' ? 'Abrir provedor aprovado' : 'Ver a revogação'}
                                        </Link>
                                    )}
                                    <p className="ml-auto text-apoio text-secundario">
                                        A decisão fica registrada no histórico de auditoria, com autor e data.
                                    </p>
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>

            <ModalDoPedido
                key={`${acao ?? 'fechado'}-${pedido?.id ?? 0}`}
                pedido={acao ? (pedido ?? null) : null}
                acao={acao}
                aoFechar={() => setAcao(null)}
                aoConcluir={concluir}
            />
        </CascaDoApp>
    )
}

export default AprovacaoProvedores
