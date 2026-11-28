import { Link } from 'react-router-dom'

import { buscarPainel, type TrilhaNoPainel } from '../api/painel'
import { listarFila } from '../api/solicitacoesProvedor'
import CascaDoApp from '../components/CascaDoApp'
import { CustomButton } from '../components/CustomButton'
import BlocoGargalos from '../components/gestao/BlocoGargalos'
import CartaoDeNumeros from '../components/gestao/CartaoDeNumeros'
import { ROTULO_FUNIL } from '../components/gestao/rotulos'
import { Carregando, ErroNaTela } from '../components/ui/Estados'
import { ANEL_FOCO, CARTAO } from '../estilos/classes'
import { formatarDataHora, rotuloDoEstado, ROTULO_TIPO_ORGANIZACAO, ROTULO_TRILHA } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_GESTAO } from '../navegacao/menus'

/**
 * 09 e 79 · Gestão do PD — painel do ecossistema · rota /gestao
 *
 * As três trilhas numa tela só e os blocos que o GET /api/painel devolve:
 * candidaturas por estado, funil do Investimento, organizações por tipo,
 * residências, avaliação, mentoria e os gargalos, com o limite de cada etapa.
 */

function porcento(valor: number): string {
    return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}

function numero(valor: number): string {
    return valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
}

function nomeDaTrilha(t: TrilhaNoPainel): string {
    return t.trilhaCodigo === 'TODAS' ? 'Total' : ROTULO_TRILHA[t.trilhaCodigo]
}

const COLUNAS_TRILHA: { rotulo: string; valor: (t: TrilhaNoPainel) => string }[] = [
    { rotulo: 'Oport. ativas', valor: (t) => numero(t.oportunidadesAtivas) },
    { rotulo: 'Pausadas', valor: (t) => numero(t.oportunidadesPausadas) },
    { rotulo: 'Enviadas', valor: (t) => numero(t.candidaturasEnviadas) },
    { rotulo: 'Aprovadas', valor: (t) => numero(t.aprovadas) },
    { rotulo: 'Taxa de conexão', valor: (t) => porcento(t.taxaDeConexao) },
    { rotulo: 'Em acompanh.', valor: (t) => numero(t.emAcompanhamento) },
    { rotulo: 'Concluídas', valor: (t) => numero(t.concluidas) },
]

function PainelEcossistema() {
    const { dados: painel, carregando, erro, recarregar } = useDados(() => buscarPainel(), [])
    const segundos = useDados(() => listarFila('AGUARDANDO'), [])
    const reenviados = (segundos.dados ?? []).filter((s) => s.solicitacaoAnteriorId !== null)

    const mes = painel
        ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Recife', month: 'long' }).format(new Date(painel.geradoEm))
        : ''
    const maiorDoFunil = painel ? Math.max(1, ...Object.values(painel.funilInvestimento)) : 1

    return (
        <CascaDoApp itens={MENU_GESTAO}>
            <div className="flex items-start justify-between gap-6">
                <div>
                    <h1 className="font-display text-tela text-titulo">Painel do ecossistema</h1>
                    <p className="mt-2 text-apoio text-secundario">
                        As três trilhas numa tela só
                        {painel && ` · gerado em ${formatarDataHora(painel.geradoEm)}`} · nenhum número é digitado à mão
                    </p>
                </div>
                <CustomButton variant="neutro" size="auto" type="button" disabled={carregando} onClick={() => void recarregar()}>
                    {carregando && painel ? 'Atualizando…' : 'Atualizar'}
                </CustomButton>
            </div>

            {reenviados.length > 0 && (
                <section
                    aria-label="Pedidos de provedor reenviados"
                    className="mt-6 flex items-center gap-5 rounded-card bg-acento-suave p-5"
                >
                    <div className="min-w-0 flex-1">
                        <p className="font-display text-bloco text-acento">
                            {reenviados.length === 1 ? 'Pedido de publicação reenviado' : `${reenviados.length} pedidos de publicação reenviados`}
                        </p>
                        <p className="mt-1 text-apoio text-titulo">
                            {reenviados.map((s) => s.organizacaoNome).join(', ')} respondeu à recusa anterior. O novo pedido
                            aguarda análise.
                        </p>
                    </div>
                    <Link
                        to="/gestao/provedores"
                        className={`rounded-lg border border-profundo bg-card px-4 py-3 font-semibold text-profundo hover:bg-profundo hover:text-white ${ANEL_FOCO}`}
                    >
                        Analisar pedidos
                    </Link>
                </section>
            )}

            <div className="mt-6">
                {carregando && !painel ? (
                    <Carregando />
                ) : erro && !painel ? (
                    <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />
                ) : (
                    painel && (
                        <div className="flex flex-col gap-6">
                            <section aria-label="Resultados por trilha" className={`relative overflow-x-auto ${CARTAO}`}>
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-sutil bg-page">
                                            <th scope="col" className="px-card py-3 text-selo text-secundario uppercase">
                                                Trilha
                                            </th>
                                            {COLUNAS_TRILHA.map((c) => (
                                                <th key={c.rotulo} scope="col" className="px-card py-3 text-selo text-secundario uppercase">
                                                    {c.rotulo}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...painel.trilhas, painel.total].map((t) => {
                                            const total = t === painel.total
                                            return (
                                                <tr key={t.trilhaCodigo + (total ? '-total' : '')} className={`border-b border-sutil last:border-b-0 ${total ? 'bg-page' : ''}`}>
                                                    <th scope="row" className="px-card py-4 text-item text-titulo">
                                                        {total ? 'Total' : nomeDaTrilha(t)}
                                                    </th>
                                                    {COLUNAS_TRILHA.map((c) => (
                                                        <td key={c.rotulo} className={`px-card py-4 text-apoio ${total ? 'text-titulo' : 'text-secundario'}`}>
                                                            {c.valor(t)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </section>
                            <p className="-mt-3 text-legenda text-secundario">
                                Taxa de conexão: das candidaturas enviadas, quantas chegaram à aprovação. Oportunidades pausadas são
                                as de provedores com a permissão revogada.
                            </p>

                            <BlocoGargalos gargalos={painel.gargalos} aoMudarLimite={() => void recarregar()} />

                            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                                <section aria-labelledby="titulo-funil" className={`${CARTAO} p-card`}>
                                    <h2 id="titulo-funil" className="font-display text-bloco text-titulo">
                                        Funil do investimento
                                    </h2>
                                    <ul className="mt-3 flex flex-col gap-2">
                                        {(Object.keys(ROTULO_FUNIL) as (keyof typeof ROTULO_FUNIL)[]).map((estagio) => {
                                            const quantidade = painel.funilInvestimento[estagio] ?? 0
                                            return (
                                                <li key={estagio} className="flex items-center gap-3">
                                                    <span className="w-[96px] shrink-0 text-apoio text-secundario">{ROTULO_FUNIL[estagio]}</span>
                                                    <span aria-hidden="true" className="h-2 min-w-0 flex-1 overflow-hidden rounded-badge bg-page">
                                                        <span
                                                            className="block h-full rounded-badge bg-acento transition-[width] duration-[var(--dur-lenta)] ease-padrao"
                                                            style={{ width: `${(quantidade / maiorDoFunil) * 100}%` }}
                                                        />
                                                    </span>
                                                    <span className="w-8 shrink-0 text-right text-item text-titulo">{quantidade}</span>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </section>

                                <CartaoDeNumeros
                                    titulo="Avaliação"
                                    linhas={[
                                        { rotulo: 'Aguardando assinatura', valor: painel.avaliacao.aguardandoAssinatura, cor: 'text-ocre' },
                                        { rotulo: 'Assinadas', valor: painel.avaliacao.assinadas, cor: 'text-status-aprovada-texto' },
                                        { rotulo: 'Pedidos de ajuste abertos', valor: painel.avaliacao.pedidosDeAjusteAbertos, cor: 'text-acento' },
                                    ]}
                                />

                                <CartaoDeNumeros
                                    titulo={`Mentoria · ${mes}`}
                                    linhas={[
                                        { rotulo: 'Alocações aceitas', valor: painel.mentoria.alocacoesAceitas },
                                        { rotulo: 'Horas previstas no mês', valor: `${numero(painel.mentoria.horasPrevistasMes)} h` },
                                        {
                                            rotulo: 'Horas realizadas no mês',
                                            valor: `${numero(painel.mentoria.horasRealizadasMes)} h`,
                                            cor: 'text-status-aprovada-texto',
                                        },
                                        { rotulo: 'Sessões assinadas no mês', valor: painel.mentoria.sessoesAssinadasMes },
                                    ]}
                                />

                                <CartaoDeNumeros
                                    titulo="Residências"
                                    linhas={[
                                        { rotulo: 'Abertas', valor: painel.residencias.abertas, cor: 'text-status-aprovada-texto' },
                                        { rotulo: 'Encerradas', valor: painel.residencias.encerradas },
                                        { rotulo: 'Squads nas abertas', valor: painel.residencias.squadsNasAbertas },
                                        { rotulo: 'Desafios nas abertas', valor: painel.residencias.desafiosNasAbertas },
                                    ]}
                                />

                                <CartaoDeNumeros
                                    titulo="Organizações por tipo"
                                    linhas={Object.entries(painel.organizacoesPorTipo).map(([tipo, n]) => ({
                                        rotulo: ROTULO_TIPO_ORGANIZACAO[tipo] ?? tipo,
                                        valor: n,
                                    }))}
                                />

                                <CartaoDeNumeros
                                    titulo="Candidaturas por estado"
                                    linhas={Object.entries(painel.candidaturasPorEstado).map(([estado, n]) => ({
                                        rotulo: rotuloDoEstado(estado),
                                        valor: n,
                                    }))}
                                />
                            </div>
                        </div>
                    )
                )}
            </div>
        </CascaDoApp>
    )
}

export default PainelEcossistema
