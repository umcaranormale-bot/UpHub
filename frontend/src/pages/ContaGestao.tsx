import { buscarPainel } from '../api/painel'
import { listarFila } from '../api/solicitacoesProvedor'
import CascaDoApp from '../components/CascaDoApp'
import PaginaDeConta, { BlocoDoPapel } from '../components/PaginaDeConta'
import { Carregando, ErroNaTela } from '../components/ui/Estados'
import useDados from '../hooks/useDados'
import { MENU_GESTAO } from '../navegacao/menus'

/** 61 · Gestão do PD — conta · rota /gestao/conta */

async function carregar() {
    const [painel, aguardando] = await Promise.all([buscarPainel(), listarFila('AGUARDANDO')])
    return { painel, aguardando }
}

function horas(n: number): string {
    return `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h`
}

function ContaGestao() {
    const { dados, carregando, erro, recarregar } = useDados(() => carregar(), [])

    const destaque =
        carregando && !dados ? (
            <Carregando />
        ) : erro || !dados ? (
            <div className="mt-3">
                <ErroNaTela mensagem={erro ?? 'Sem dados'} tentarDeNovo={() => void recarregar()} />
            </div>
        ) : (
            <>
                <div className="mt-3 rounded-card bg-status-aprovada-fundo px-4 py-3">
                    <p className="text-bloco text-status-aprovada-texto">
                        {dados.painel.mentoria.alocacoesAceitas === 1
                            ? '1 alocação aceita'
                            : `${dados.painel.mentoria.alocacoesAceitas} alocações aceitas`}
                    </p>
                    <p className="mt-1 text-apoio text-status-aprovada-texto">
                        {horas(dados.painel.mentoria.horasRealizadasMes)} realizadas de{' '}
                        {horas(dados.painel.mentoria.horasPrevistasMes)} previstas no mês
                    </p>
                </div>
                <p className="mt-3 text-apoio text-secundario">Os números vêm do painel do ecossistema.</p>
            </>
        )

    const pendencias: string[] = []
    if (dados) {
        const pedidos = dados.aguardando.length
        const segundos = dados.aguardando.filter((s) => s.solicitacaoAnteriorId !== null).length
        const acima = dados.painel.gargalos.reduce((t, g) => t + g.acimaDoLimite, 0)
        if (pedidos > 0) {
            pendencias.push(`${pedidos} pedido(s) de provedor aguardando${segundos > 0 ? ` (${segundos} novo(s) pedido(s))` : ''}`)
        }
        if (acima > 0) pendencias.push(`${acima} acima do limite nos gargalos`)
        if (dados.painel.avaliacao.pedidosDeAjusteAbertos > 0) {
            pendencias.push(`${dados.painel.avaliacao.pedidosDeAjusteAbertos} pedido(s) de ajuste abertos`)
        }
    }

    return (
        <CascaDoApp itens={MENU_GESTAO} voltarPara="/gestao">
            <PaginaDeConta destaqueTitulo="Mentoria no mês" destaque={destaque}>
                <BlocoDoPapel
                    titulo="Pendências da gestão"
                    status={pendencias.length > 0 ? 'pendente' : 'aprovada'}
                    rotuloDoStatus={pendencias.length > 0 ? 'Em aberto' : 'Em dia'}
                    chamada="Painel do ecossistema"
                    contexto={dados ? pendencias.join(' · ') || 'Nenhuma pendência agora' : 'Carregando…'}
                    explicacao="Os detalhes ficam no painel e nas filas do menu lateral."
                    acao="Abrir painel"
                    para="/gestao"
                />
            </PaginaDeConta>
        </CascaDoApp>
    )
}

export default ContaGestao
