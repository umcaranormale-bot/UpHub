import CascaDoApp from '../components/CascaDoApp'
import PaginaDeConta, { BlocoDoPapel } from '../components/PaginaDeConta'
import { Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { LinkDeTexto } from '../components/squad/AvisoComLink'
import { candidaturasComDesafio, linhaDoTempo, rotaDaCandidatura, useSquadAtiva } from '../components/squad/dados'
import { listarMinhasProvas } from '../api/provas'
import { useDados } from '../hooks/useDados'
import { MENU_SQUAD } from '../navegacao/menus'
import { formatarData, rotuloDoEstado, statusDoEstado } from '../estilos/formatos'

/** 57 · Candidato squad — conta · rota /squad/conta */

async function carregar(squadId: number) {
    const [candidaturas, provas] = await Promise.all([candidaturasComDesafio(squadId), listarMinhasProvas().catch(() => [])])
    return {
        ultima: candidaturas[0] ?? null,
        prova: [...provas].sort((a, b) => b.dataProva.localeCompare(a.dataProva))[0] ?? null,
    }
}

function ContaSquad() {
    const { squadId } = useSquadAtiva()
    const { dados, carregando, erro, recarregar } = useDados(() => carregar(squadId!), [squadId], !!squadId)

    return (
        <CascaDoApp itens={MENU_SQUAD} voltarPara="/squad">
            <PaginaDeConta
                destaqueTitulo="Minha nota do match"
                destaque={
                    dados?.prova ? (
                        <>
                            <div className="mt-3 rounded-card bg-status-aprovada-fundo px-4 py-3">
                                <p className="text-bloco text-status-aprovada-texto">
                                    {dados.prova.nota}
                                    {dados.prova.area ? ` em ${dados.prova.area}` : ''}
                                </p>
                                <p className="mt-1 text-apoio text-status-aprovada-texto">
                                    prova de {formatarData(dados.prova.dataProva)}
                                </p>
                            </div>
                            <p className="mt-3 text-apoio text-secundario">
                                A nota é sua, não da organização, e acompanha você em qualquer vínculo.
                            </p>
                        </>
                    ) : (
                        <p className="mt-3 text-apoio text-secundario">Você ainda não tem nota de prova registrada.</p>
                    )
                }
            >
                {carregando && !dados && <Carregando />}
                {erro && <ErroNaTela mensagem={erro} tentarDeNovo={recarregar} />}
                {dados &&
                    (dados.ultima ? (
                        <BlocoDoPapel
                            titulo="Última candidatura"
                            status={statusDoEstado(dados.ultima.candidatura.estado)}
                            rotuloDoStatus={rotuloDoEstado(dados.ultima.candidatura.estado)}
                            chamada={dados.ultima.desafio?.titulo ?? `Candidatura #${dados.ultima.candidatura.id}`}
                            contexto={linhaDoTempo(dados.ultima.candidatura, formatarData)}
                            explicacao="As sprints, as entregas e o feedback do mentor ficam em Minhas candidaturas."
                            acao="Abrir candidatura"
                            para={rotaDaCandidatura(dados.ultima.candidatura)}
                        />
                    ) : (
                        <Vazio titulo="A squad ainda não tem candidaturas">
                            <LinkDeTexto para="/squad/oportunidades">Ver os desafios abertos ›</LinkDeTexto>
                        </Vazio>
                    ))}
            </PaginaDeConta>
        </CascaDoApp>
    )
}

export default ContaSquad
