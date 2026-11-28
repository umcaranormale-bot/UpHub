import { useParams } from 'react-router-dom'

import CascaDoApp from '../components/CascaDoApp'
import SeloStatus from '../components/SeloStatus'
import { CustomButton } from '../components/CustomButton'
import { Carregando, ErroNaTela } from '../components/ui/Estados'
import { LinhaDoTempoDeSprints } from '../components/squad/Sprints'
import { carregarAcompanhado, formatarHoras, formatarMinutos, nomeDoAcompanhado, nomeDoMes } from '../components/mentor/dados'
import { useDados } from '../hooks/useDados'
import { MENU_MENTOR } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'
import { CARTAO, CARTAO_COM_RESPIRO } from '../estilos/classes'
import { formatarData, rotuloDoEstado, statusDoEstado } from '../estilos/formatos'

/**
 * 39 · Mentor — histórico do acompanhado · rota /mentor/acompanhados/:id
 *
 * A linha do tempo das sprints, a última entrega avaliada e as sessões que o
 * mentor registrou. O :id é a alocação (o convite aceito).
 */

function AcompanhadoMentor() {
    const { id } = useParams()
    const alocacaoId = Number(id)
    const { perfilAtivo } = useSessao()
    const vinculoId = perfilAtivo?.vinculo.id
    const { dados, carregando, erro, recarregar } = useDados(
        () => carregarAcompanhado(alocacaoId, vinculoId),
        [alocacaoId, vinculoId],
        !!vinculoId && Number.isFinite(alocacaoId),
    )

    if (!dados) {
        return (
            <CascaDoApp itens={MENU_MENTOR} voltarPara="/mentor/acompanhados">
                {carregando && <Carregando />}
                {erro && <ErroNaTela mensagem={erro} tentarDeNovo={recarregar} />}
            </CascaDoApp>
        )
    }

    const { item, sprints, sessoes, horas } = dados
    const { alocacao, candidatura, desafio, provedor } = item
    const ultimaAvaliada = [...sprints].reverse().find((s) => s.estado === 'AVALIADA') ?? null
    const rascunhos = sessoes.filter((s) => s.situacao === 'RASCUNHO')
    const aceita = alocacao.situacao === 'ACEITA'

    return (
        <CascaDoApp itens={MENU_MENTOR} voltarPara="/mentor/acompanhados">
            <div className="flex flex-wrap items-start gap-5">
                <div className="min-w-0 flex-1">
                    <h1 className="font-display text-tela text-titulo">{nomeDoAcompanhado(item)}</h1>
                    <p className="mt-2 text-apoio text-secundario">
                        {[provedor?.nome, desafio?.titulo, aceita ? `alocação aceita em ${formatarData(alocacao.respondidaEm)}` : null]
                            .filter(Boolean)
                            .join(' · ')}
                    </p>
                </div>
                {candidatura && (
                    <SeloStatus status={statusDoEstado(candidatura.estado)} rotulo={rotuloDoEstado(candidatura.estado)} comPonto />
                )}
            </div>

            <div className="mt-6">
                <LinhaDoTempoDeSprints sprints={sprints} titulo="Sprints do desafio" />
            </div>

            <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
                <section aria-labelledby="titulo-avaliada" className={CARTAO_COM_RESPIRO}>
                    <p className="text-apoio text-secundario">Última entrega avaliada</p>
                    {ultimaAvaliada ? (
                        <>
                            <h2 id="titulo-avaliada" className="mt-1 font-display text-bloco text-titulo">
                                Sprint {ultimaAvaliada.numero} · nota {ultimaAvaliada.notaEntrega ?? '—'} ·{' '}
                                {formatarData(ultimaAvaliada.avaliadaEm)}
                            </h2>
                            {ultimaAvaliada.entregaDescricao && (
                                <p className="mt-2 whitespace-pre-line text-apoio text-secundario">
                                    Entrega: {ultimaAvaliada.entregaDescricao}
                                </p>
                            )}
                            <p className="mt-2 whitespace-pre-line text-apoio text-titulo">{ultimaAvaliada.feedbackEntrega}</p>
                        </>
                    ) : (
                        <h2 id="titulo-avaliada" className="mt-1 font-display text-bloco text-titulo">
                            Nenhuma entrega avaliada ainda
                        </h2>
                    )}
                    <div className="mt-4">
                        <CustomButton variant="neutro" size="auto" to={`/mentor/acompanhados/${alocacao.id}/sprints`}>
                            Sprints e avaliação da entrega
                        </CustomButton>
                    </div>
                </section>

                <section aria-labelledby="titulo-horas" className={CARTAO_COM_RESPIRO}>
                    <p className="text-apoio text-secundario">Horas do mês</p>
                    <h2 id="titulo-horas" className="mt-1 font-display text-bloco text-titulo">
                        {horas
                            ? `${formatarMinutos(horas.minutosRealizados)} de ${formatarHoras(horas.horasPrevistasMes)} previstas em ${nomeDoMes(horas.mes)}`
                            : `${formatarHoras(alocacao.horasPrevistasMes)} previstas por mês`}
                    </h2>
                    <p className="mt-2 text-apoio text-secundario">
                        Contam só as sessões assinadas.
                        {rascunhos.length > 0 &&
                            ` ${rascunhos.length} ${rascunhos.length === 1 ? 'sessão está' : 'sessões estão'} em rascunho.`}
                    </p>
                    {aceita && candidatura?.estado === 'EM_ACOMPANHAMENTO' && (
                        <div className="mt-4">
                            <CustomButton variant="aprovar" size="auto" to={`/mentor/horas?alocacao=${alocacao.id}`}>
                                Registrar sessão
                            </CustomButton>
                        </div>
                    )}
                </section>
            </div>

            <section aria-labelledby="titulo-sessoes" className={`mt-5 ${CARTAO}`}>
                <header className="border-b border-sutil p-card">
                    <h2 id="titulo-sessoes" className="font-display text-bloco text-titulo">
                        Sessões registradas
                    </h2>
                </header>
                {sessoes.length === 0 ? (
                    <p className="p-card text-apoio text-secundario">Nenhuma sessão registrada ainda.</p>
                ) : (
                    <ul>
                        {sessoes.map((s) => (
                            <li key={s.id} className="flex items-start gap-4 border-b border-sutil px-card py-4 last:border-b-0">
                                <div className="min-w-0 flex-1">
                                    <p className="text-item text-titulo">
                                        {formatarData(s.dataSessao)} · {formatarMinutos(s.duracaoMinutos)}
                                        {s.sprintNumero ? ` · sprint ${s.sprintNumero}` : ''}
                                    </p>
                                    <p className="mt-1 whitespace-pre-line text-apoio text-secundario">
                                        {s.feedback ?? 'Sem feedback ainda'}
                                    </p>
                                </div>
                                <SeloStatus
                                    status={s.situacao === 'ASSINADO' ? 'aprovada' : 'rascunho'}
                                    rotulo={s.situacao === 'ASSINADO' ? 'Assinada' : 'Rascunho'}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </CascaDoApp>
    )
}

export default AcompanhadoMentor
