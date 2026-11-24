import CascaDoApp from '../components/CascaDoApp'
import SeloStatus from '../components/SeloStatus'
import SeloDeTrilha from '../components/SeloDeTrilha'
import { CustomButton } from '../components/CustomButton'
import { Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { LinkDeTexto } from '../components/squad/AvisoComLink'
import {
    alocacoesDetalhadas,
    formatarHoras,
    formatarMinutos,
    horasDasAceitas,
    nomeDoAcompanhado,
    nomeDoMes,
} from '../components/mentor/dados'
import { useDados } from '../hooks/useDados'
import { MENU_MENTOR } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'
import { CARTAO_INTERATIVO } from '../estilos/classes'
import { formatarData, rotuloDoEstado, statusDoEstado, trilhaDoSelo } from '../estilos/formatos'

/**
 * 39 · Mentor — acompanhados (lista) · rota /mentor/acompanhados
 *
 * As candidaturas que o mentor aceitou acompanhar, com as horas do mês. Cada
 * uma abre o histórico (/mentor/acompanhados/:id).
 */

async function carregar(vinculoId: number) {
    const itens = (await alocacoesDetalhadas(vinculoId)).filter((i) => i.alocacao.situacao === 'ACEITA')
    const horas = await horasDasAceitas(itens.map((i) => i.alocacao))
    return { itens, horas }
}

function MentorAcompanhados() {
    const { perfilAtivo } = useSessao()
    const vinculoId = perfilAtivo?.vinculo.id
    const { dados, carregando, erro, recarregar } = useDados(() => carregar(vinculoId!), [vinculoId], !!vinculoId)

    return (
        <CascaDoApp itens={MENU_MENTOR} voltarPara="/mentor">
            <h1 className="font-display text-tela text-titulo">Acompanhados</h1>
            <p className="mt-2 text-apoio text-secundario">
                As candidaturas que você aceitou acompanhar. Abra uma para ver as sprints, avaliar entregas e registrar sessões.
            </p>

            {carregando && !dados && <Carregando />}
            {erro && (
                <div className="mt-6">
                    <ErroNaTela mensagem={erro} tentarDeNovo={recarregar} />
                </div>
            )}

            {dados &&
                (dados.itens.length === 0 ? (
                    <div className="mt-6">
                        <Vazio titulo="Você ainda não acompanha ninguém">
                            <LinkDeTexto para="/mentor/convites">Ver os convites ›</LinkDeTexto>
                        </Vazio>
                    </div>
                ) : (
                    <ul className="mt-6 flex flex-col gap-4">
                        {dados.itens.map((item) => {
                            const { alocacao, candidatura, desafio, provedor } = item
                            const horas = dados.horas.porAlocacao.get(alocacao.id)
                            return (
                                <li key={alocacao.id}>
                                    <article className={CARTAO_INTERATIVO}>
                                        <div className="flex items-center gap-3">
                                            {desafio && <SeloDeTrilha trilha={trilhaDoSelo(desafio.trilhaCodigo)} />}
                                            <span className="text-apoio text-secundario">{provedor?.nome}</span>
                                            {candidatura && (
                                                <span className="ml-auto">
                                                    <SeloStatus
                                                        status={statusDoEstado(candidatura.estado)}
                                                        rotulo={rotuloDoEstado(candidatura.estado)}
                                                        comPonto
                                                    />
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="mt-3 font-display text-bloco text-titulo">{nomeDoAcompanhado(item)}</h2>
                                        <div className="mt-2 flex items-end gap-5">
                                            <p className="min-w-0 flex-1 text-apoio text-secundario">
                                                {desafio?.titulo} · aceita em {formatarData(alocacao.respondidaEm)} ·{' '}
                                                {formatarMinutos(horas?.minutosRealizados ?? 0)} de{' '}
                                                {formatarHoras(alocacao.horasPrevistasMes)} previstas em {nomeDoMes(dados.horas.mes)}
                                            </p>
                                            <CustomButton variant="neutro" size="auto" to={`/mentor/acompanhados/${alocacao.id}/sprints`}>
                                                Sprints
                                            </CustomButton>
                                            <CustomButton variant="aprovar" size="auto" to={`/mentor/acompanhados/${alocacao.id}`}>
                                                Abrir histórico
                                            </CustomButton>
                                        </div>
                                    </article>
                                </li>
                            )
                        })}
                    </ul>
                ))}
        </CascaDoApp>
    )
}

export default MentorAcompanhados
