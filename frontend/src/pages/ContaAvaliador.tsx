import CascaDoApp from '../components/CascaDoApp'
import PaginaDeConta, { BlocoDoPapel } from '../components/PaginaDeConta'
import { carregarFila, parecerEmVigor, ROTULO_DECISAO, situacaoNaFila } from '../components/avaliador/fila'
import { Carregando, ErroNaTela } from '../components/ui/Estados'
import { formatarData } from '../estilos/formatos'
import useDados from '../hooks/useDados'
import { MENU_AVALIADOR } from '../navegacao/menus'

/** 60 · Avaliador — conta · rota /avaliador/conta */
function ContaAvaliador() {
    const { dados: fila, carregando, erro, recarregar } = useDados(() => carregarFila(), [])

    const aguardando = (fila ?? []).filter((a) => {
        const s = situacaoNaFila(a)
        return s === 'avaliar' || s === 'rascunho'
    })
    const reenviadas = aguardando.filter((a) => a.rodada > 1).length
    const ultima = (fila ?? [])
        .filter((a) => a.assinadaEm)
        .sort((a, b) => (b.assinadaEm ?? '').localeCompare(a.assinadaEm ?? ''))[0]

    const destaque =
        carregando && !fila ? (
            <Carregando />
        ) : erro ? (
            <div className="mt-3">
                <ErroNaTela mensagem={erro} tentarDeNovo={() => void recarregar()} />
            </div>
        ) : (
            <>
                <div className="mt-3 rounded-card bg-status-aprovada-fundo px-4 py-3">
                    <p className="text-bloco text-status-aprovada-texto">
                        {aguardando.length === 1 ? '1 candidatura aguardando' : `${aguardando.length} candidaturas aguardando`}
                    </p>
                    <p className="mt-1 text-apoio text-status-aprovada-texto">
                        {reenviadas === 0
                            ? 'nenhuma reenviada após ajuste'
                            : `${reenviadas} reenviada(s) após ajuste`}
                    </p>
                </div>
                <p className="mt-3 text-apoio text-secundario">
                    Cada candidatura mostra a rodada. Na 2ª rodada você vê o que foi corrigido.
                </p>
            </>
        )

    return (
        <CascaDoApp itens={MENU_AVALIADOR} voltarPara="/avaliador">
            <PaginaDeConta destaqueTitulo="Minha fila" destaque={destaque}>
                {ultima ? (
                    <BlocoDoPapel
                        titulo="Último parecer registrado"
                        status={ultima.decisao === 'APROVADA' ? 'aprovada' : ultima.decisao === 'REPROVADA' ? 'reprovada' : 'pendente'}
                        rotuloDoStatus={ultima.decisao ? ROTULO_DECISAO[ultima.decisao] : undefined}
                        chamada={ultima.oportunidadeTitulo}
                        contexto={`${ultima.organizacaoNome} · ${ultima.rodada}ª rodada · assinado em ${formatarData(ultima.assinadaEm)}`}
                        explicacao={parecerEmVigor(ultima) || 'Sem parecer.'}
                        acao="Abrir fila"
                        para="/avaliador"
                    />
                ) : (
                    <BlocoDoPapel
                        titulo="Último parecer registrado"
                        status="rascunho"
                        rotuloDoStatus="Nenhum ainda"
                        chamada="Você ainda não assinou nenhuma avaliação"
                        contexto="As avaliações assinadas aparecem aqui."
                        explicacao="Depois de assinar, só o parecer pode ser retificado, com justificativa."
                        acao="Abrir fila"
                        para="/avaliador"
                    />
                )}
            </PaginaDeConta>
        </CascaDoApp>
    )
}

export default ContaAvaliador
