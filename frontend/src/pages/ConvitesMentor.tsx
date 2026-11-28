import { useCallback, useState } from 'react'

import CascaDoApp from '../components/CascaDoApp'
import SeloStatus, { type Status } from '../components/SeloStatus'
import SeloDeTrilha from '../components/SeloDeTrilha'
import AbasDeFiltro, { type Aba } from '../components/AbasDeFiltro'
import { CustomButton } from '../components/CustomButton'
import Modal from '../components/ui/Modal'
import { Aviso, Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { alocacoesDetalhadas, formatarHoras, nomeDoAcompanhado, type AlocacaoDetalhada } from '../components/mentor/dados'
import { mensagemDeErro } from '../api/erros'
import { aceitarAlocacao, recusarAlocacao, type Alocacao } from '../api/mentoria'
import { useDados } from '../hooks/useDados'
import { MENU_MENTOR } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'
import { CARTAO_INTERATIVO } from '../estilos/classes'
import { diasAte, formatarData, hoje, trilhaDoSelo } from '../estilos/formatos'

/**
 * 38 · Mentor — convites de alocação · rota /mentor/convites
 *
 * Cada convite traz quem se candidatou, o desafio, as horas previstas por mês
 * e o prazo de resposta. Sem resposta até o prazo, o convite expira sozinho.
 */

type AbaId = 'todas' | 'pendentes' | 'aceitas' | 'encerradas'

const SELO: Record<Alocacao['situacao'], { status: Status; rotulo: string }> = {
    PENDENTE: { status: 'pendente', rotulo: 'Pendente' },
    ACEITA: { status: 'aprovada', rotulo: 'Aceita' },
    RECUSADA: { status: 'reprovada', rotulo: 'Recusada' },
    EXPIRADA: { status: 'rascunho', rotulo: 'Expirada' },
}

function condicoes(a: Alocacao): string {
    const horas = `${formatarHoras(a.horasPrevistasMes)}/mês previstas`
    switch (a.situacao) {
        case 'PENDENTE': {
            const dias = diasAte(a.prazoResposta)
            const falta = dias < 0 ? 'prazo vencido' : dias === 0 ? 'vence hoje' : `faltam ${dias} dias`
            return `${horas} · responder até ${formatarData(a.prazoResposta)} · ${falta}`
        }
        case 'ACEITA':
            return `${horas} · aceita em ${formatarData(a.respondidaEm)}`
        case 'RECUSADA':
            return `${horas} · recusada em ${formatarData(a.respondidaEm)}`
        default:
            return `${horas} · expirou em ${formatarData(a.prazoResposta)}`
    }
}

function ConvitesMentor() {
    const { perfilAtivo } = useSessao()
    const vinculoId = perfilAtivo?.vinculo.id
    const { dados, carregando, erro, recarregar } = useDados(() => alocacoesDetalhadas(vinculoId), [vinculoId], !!vinculoId)
    const [aba, setAba] = useState<AbaId>('todas')
    const [recusando, setRecusando] = useState<AlocacaoDetalhada | null>(null)
    const [ocupado, setOcupado] = useState(false)
    const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)
    // estável: o Modal refaz o foco quando o aoFechar muda
    const fecharRecusa = useCallback(() => setRecusando(null), [])

    const todas = dados ?? []
    const pendentes = todas.filter((i) => i.alocacao.situacao === 'PENDENTE')
    const aceitas = todas.filter((i) => i.alocacao.situacao === 'ACEITA')
    const encerradas = todas.filter((i) => i.alocacao.situacao === 'RECUSADA' || i.alocacao.situacao === 'EXPIRADA')
    const lista = aba === 'pendentes' ? pendentes : aba === 'aceitas' ? aceitas : aba === 'encerradas' ? encerradas : todas

    const abas: Aba<AbaId>[] = [
        { id: 'todas', rotulo: 'Todas', quantidade: todas.length },
        { id: 'pendentes', rotulo: 'Pendentes', quantidade: pendentes.length },
        { id: 'aceitas', rotulo: 'Aceitas', quantidade: aceitas.length },
        { id: 'encerradas', rotulo: 'Recusadas e expiradas', quantidade: encerradas.length },
    ]

    async function responder(item: AlocacaoDetalhada, aceita: boolean) {
        setOcupado(true)
        setAviso(null)
        try {
            await (aceita ? aceitarAlocacao(item.alocacao.id) : recusarAlocacao(item.alocacao.id))
            setRecusando(null)
            await recarregar()
            setAviso({
                tipo: 'sucesso',
                texto: aceita
                    ? `Convite aceito: você passa a acompanhar ${nomeDoAcompanhado(item)}.`
                    : 'Convite recusado. As horas previstas voltam para a sua disponibilidade.',
            })
        } catch (e) {
            setRecusando(null)
            setAviso({ tipo: 'erro', texto: mensagemDeErro(e) })
        } finally {
            setOcupado(false)
        }
    }

    return (
        <CascaDoApp itens={MENU_MENTOR} voltarPara="/mentor">
            <h1 className="font-display text-tela text-titulo">Convites de alocação</h1>
            <p className="mt-2 text-apoio text-secundario">
                Cada convite traz quem se candidatou, o desafio, as horas previstas e o prazo de resposta. Sem resposta até o
                prazo, o convite expira sozinho.
            </p>

            {aviso && (
                <div className="mt-4">
                    <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
                </div>
            )}

            {carregando && !dados && <Carregando />}
            {erro && (
                <div className="mt-6">
                    <ErroNaTela mensagem={erro} tentarDeNovo={recarregar} />
                </div>
            )}

            {dados && (
                <>
                    <div className="mt-6">
                        <AbasDeFiltro abas={abas} ativa={aba} aoEscolher={setAba} rotulo="Filtrar convites" variante="pilula" />
                    </div>

                    {lista.length === 0 ? (
                        <div className="mt-6">
                            <Vazio titulo={todas.length === 0 ? 'Você ainda não recebeu convites' : 'Nenhum convite nesta aba'}>
                                O provedor convida o mentor depois que a candidatura é homologada.
                            </Vazio>
                        </div>
                    ) : (
                        <ul className="mt-6 flex flex-col gap-4">
                            {lista.map((item) => {
                                const { alocacao, desafio, provedor } = item
                                const pendente = alocacao.situacao === 'PENDENTE'
                                const vencido = pendente && alocacao.prazoResposta < hoje()
                                return (
                                    <li key={alocacao.id}>
                                        <article className={CARTAO_INTERATIVO}>
                                            <div className="flex items-center gap-3">
                                                {desafio && <SeloDeTrilha trilha={trilhaDoSelo(desafio.trilhaCodigo)} />}
                                                <span className="text-apoio text-secundario">{provedor?.nome}</span>
                                                <span className="ml-auto flex items-center gap-3">
                                                    <SeloStatus
                                                        status={SELO[alocacao.situacao].status}
                                                        rotulo={SELO[alocacao.situacao].rotulo}
                                                        comPonto
                                                    />
                                                    {pendente && !vencido && (
                                                        <>
                                                            <CustomButton
                                                                type="button"
                                                                variant="neutro"
                                                                size="auto"
                                                                disabled={ocupado}
                                                                onClick={() => setRecusando(item)}
                                                            >
                                                                Recusar
                                                            </CustomButton>
                                                            <CustomButton
                                                                type="button"
                                                                variant="aprovar"
                                                                size="auto"
                                                                disabled={ocupado}
                                                                onClick={() => responder(item, true)}
                                                            >
                                                                Aceitar
                                                            </CustomButton>
                                                        </>
                                                    )}
                                                    {alocacao.situacao === 'ACEITA' && (
                                                        <CustomButton variant="aprovar" size="auto" to={`/mentor/acompanhados/${alocacao.id}`}>
                                                            Abrir histórico
                                                        </CustomButton>
                                                    )}
                                                </span>
                                            </div>

                                            <h2 className="mt-3 font-display text-bloco text-titulo">
                                                {desafio ? `${desafio.titulo} · ` : ''}
                                                {nomeDoAcompanhado(item)}
                                            </h2>
                                            <p className="mt-1 text-apoio text-secundario">{condicoes(alocacao)}</p>
                                            {alocacao.tituloProposta && (
                                                <p className="mt-1 text-apoio text-secundario">Proposta: {alocacao.tituloProposta}</p>
                                            )}
                                            {vencido && (
                                                <p className="mt-2 text-apoio text-ocre">
                                                    O prazo de resposta passou: o convite vai expirar.
                                                </p>
                                            )}
                                        </article>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </>
            )}

            <Modal
                aberto={!!recusando}
                titulo="Recusar este convite?"
                descricao={
                    recusando &&
                    `Você deixa de acompanhar ${nomeDoAcompanhado(recusando)}${
                        recusando.desafio ? ` no ${recusando.desafio.titulo}` : ''
                    }. O provedor pode convidar outro mentor.`
                }
                aoFechar={fecharRecusa}
                acoes={
                    <>
                        <CustomButton type="button" variant="neutro" size="auto" onClick={fecharRecusa}>
                            Não
                        </CustomButton>
                        <CustomButton
                            type="button"
                            variant="reprovar"
                            size="auto"
                            disabled={ocupado}
                            onClick={() => recusando && responder(recusando, false)}
                        >
                            Sim, recusar
                        </CustomButton>
                    </>
                }
            />
        </CascaDoApp>
    )
}

export default ConvitesMentor
