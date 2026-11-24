import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import CascaDoApp from '../components/CascaDoApp'
import PaginaDeConta, { BlocoDoPapel } from '../components/PaginaDeConta'
import SeloStatus from '../components/SeloStatus'
import { CustomButton } from '../components/CustomButton'
import Modal from '../components/ui/Modal'
import { Aviso, Carregando, ErroNaTela, Vazio } from '../components/ui/Estados'
import { Campo } from '../components/ui/Campo'
import { LinkDeTexto } from '../components/squad/AvisoComLink'
import { alocacoesDetalhadas, formatarMinutos, horasDasAceitas, nomeDoAcompanhado, nomeDoMes } from '../components/mentor/dados'
import { aceitarConvite, recusarConvite, validarConvite, type ConviteRecebido } from '../api/convites'
import { mensagemDeErro } from '../api/erros'
import { useDados } from '../hooks/useDados'
import { MENU_MENTOR } from '../navegacao/menus'
import { useSessao } from '../sessao/contexto'
import { CARTAO_COM_RESPIRO } from '../estilos/classes'
import { formatarData, formatarDataHora } from '../estilos/formatos'

/**
 * 59, 59b e 59c · Mentor — conta · rota /mentor/conta (?codigo= do e-mail de convite)
 *
 * A conta do mentor: horas doadas, alocação atual e o convite pendente de
 * outra organização (aceitar ou recusar). Aceito, o vínculo novo entra na
 * conta e o "Trocar perfil" aparece no cabeçalho.
 */

async function carregar(vinculoId: number) {
    const itens = await alocacoesDetalhadas(vinculoId)
    const horas = await horasDasAceitas(itens.map((i) => i.alocacao))
    return { atual: itens.find((i) => i.alocacao.situacao === 'ACEITA') ?? null, horas }
}

const ROTULO_PAPEL: Record<ConviteRecebido['papel'], string> = { AVALIADOR: 'Avaliador', MENTOR: 'Mentor' }

function ConvitePendente() {
    const { pessoa, recarregar: recarregarSessao } = useSessao()
    const [parametros, setParametros] = useSearchParams()
    const [codigo, setCodigo] = useState(parametros.get('codigo')?.trim() ?? '')
    const [digitado, setDigitado] = useState('')
    const convite = useDados(() => validarConvite(codigo), [codigo], !!codigo)
    const [modal, setModal] = useState<'aceitar' | 'recusar' | null>(null)
    const [senha, setSenha] = useState('')
    const [ocupado, setOcupado] = useState(false)
    const [erroModal, setErroModal] = useState<string | null>(null)
    const [sucesso, setSucesso] = useState<string | null>(null)
    const fechar = useCallback(() => setModal(null), [])

    function esquecerCodigo() {
        setCodigo('')
        if (parametros.has('codigo')) setParametros({}, { replace: true })
    }

    async function responder(aceita: boolean) {
        const recebido = codigo ? convite.dados : null
        if (!recebido) return
        setOcupado(true)
        setErroModal(null)
        try {
            if (aceita) {
                await aceitarConvite(codigo, senha)
                await recarregarSessao()
                setSucesso(
                    `Convite aceito: o vínculo de ${ROTULO_PAPEL[recebido.papel].toLowerCase()} em ${recebido.organizacaoNome} entrou na sua conta. Use “Trocar perfil” no cabeçalho para navegar com ele.`,
                )
            } else {
                await recusarConvite(codigo)
                setSucesso(`Convite de ${recebido.organizacaoNome} recusado. Ele deixa de valer.`)
            }
            setModal(null)
            setSenha('')
            esquecerCodigo()
        } catch (e) {
            setErroModal(mensagemDeErro(e))
        } finally {
            setOcupado(false)
        }
    }

    // sem código (ou conferindo outro), o convite anterior não vale mais na tela
    const recebido = !!codigo && !convite.carregando && !convite.erro ? convite.dados : null
    const outroEmail = !!recebido && !!pessoa && recebido.email.toLowerCase() !== pessoa.email.toLowerCase()

    return (
        <section aria-labelledby="titulo-convite" className={CARTAO_COM_RESPIRO}>
            <div className="flex items-center gap-3">
                <h2 id="titulo-convite" className="font-display text-bloco text-titulo">
                    {recebido ? 'Convite pendente' : 'Convite de outra organização'}
                </h2>
                {recebido && (
                    <span className="ml-auto">
                        <SeloStatus status="pendente" rotulo="Aguardando resposta" comPonto />
                    </span>
                )}
            </div>

            {sucesso && (
                <div className="mt-4">
                    <Aviso tipo="sucesso">{sucesso}</Aviso>
                </div>
            )}

            {!codigo && (
                <form
                    className="mt-4 flex items-end gap-3"
                    onSubmit={(e) => {
                        e.preventDefault()
                        setSucesso(null)
                        setCodigo(digitado.trim())
                        setDigitado('')
                    }}
                >
                    <div className="min-w-0 flex-1">
                        <Campo
                            rotulo="Código do convite"
                            value={digitado}
                            onChange={(e) => setDigitado(e.target.value)}
                            autoComplete="off"
                            ajuda="Recebeu um convite por e-mail? O link já abre aqui; se preferir, cole o código."
                        />
                    </div>
                    <CustomButton type="submit" variant="neutro" size="auto" disabled={!digitado.trim()}>
                        Conferir convite
                    </CustomButton>
                </form>
            )}

            {codigo && convite.carregando && <Carregando texto="Conferindo o convite…" />}
            {codigo && convite.erro && (
                <div className="mt-4 flex flex-col items-start gap-3">
                    <Aviso tipo="erro">{convite.erro}</Aviso>
                    <CustomButton type="button" variant="neutro" size="auto" onClick={esquecerCodigo}>
                        Usar outro código
                    </CustomButton>
                </div>
            )}

            {codigo && recebido && (
                <div className="mt-4 flex items-center gap-5 rounded-card bg-page p-5">
                    <div className="min-w-0 flex-1">
                        <p className="font-display text-bloco text-titulo">
                            {recebido.organizacaoNome} · {ROTULO_PAPEL[recebido.papel]}
                        </p>
                        <p className="mt-1 text-apoio text-secundario">
                            {recebido.convidadoPor ? `Enviado por ${recebido.convidadoPor} · ` : ''}vale até{' '}
                            {formatarDataHora(recebido.expiraEm)}
                        </p>
                        <p className="mt-2 text-apoio text-secundario">
                            {outroEmail
                                ? `Este convite é para ${recebido.email}, não para a conta logada. Saia da conta e abra o link do e-mail.`
                                : `Ao aceitar, o vínculo de ${ROTULO_PAPEL[recebido.papel].toLowerCase()} entra na sua conta e o “Trocar perfil” aparece no cabeçalho.`}
                        </p>
                    </div>
                    {!outroEmail && (
                        <div className="flex shrink-0 gap-3">
                            <CustomButton
                                type="button"
                                variant="aprovar"
                                size="auto"
                                onClick={() => {
                                    setErroModal(null)
                                    setModal('aceitar')
                                }}
                            >
                                Aceitar convite
                            </CustomButton>
                            <CustomButton
                                type="button"
                                variant="neutro"
                                size="auto"
                                onClick={() => {
                                    setErroModal(null)
                                    setModal('recusar')
                                }}
                            >
                                Recusar
                            </CustomButton>
                        </div>
                    )}
                </div>
            )}

            <Modal
                aberto={modal === 'aceitar' && !!recebido}
                titulo={`Aceitar o convite de ${recebido?.organizacaoNome ?? ''}?`}
                descricao="Para confirmar, digite a senha da sua conta."
                aoFechar={fechar}
                acoes={
                    <>
                        <CustomButton type="button" variant="neutro" size="auto" onClick={fechar}>
                            Cancelar
                        </CustomButton>
                        <CustomButton
                            type="button"
                            variant="aprovar"
                            size="auto"
                            disabled={!senha || ocupado}
                            onClick={() => responder(true)}
                        >
                            {ocupado ? 'Aceitando…' : 'Aceitar convite'}
                        </CustomButton>
                    </>
                }
            >
                <Campo
                    rotulo="Senha"
                    type="password"
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                />
                {erroModal && <Aviso tipo="erro">{erroModal}</Aviso>}
            </Modal>

            <Modal
                aberto={modal === 'recusar' && !!recebido}
                titulo={`Recusar o convite de ${recebido?.organizacaoNome ?? ''}?`}
                descricao="O convite deixa de valer: se mudar de ideia, é só pedir um novo convite."
                aoFechar={fechar}
                acoes={
                    <>
                        <CustomButton type="button" variant="reprovar" size="auto" disabled={ocupado} onClick={() => responder(false)}>
                            Sim, recusar
                        </CustomButton>
                        <CustomButton type="button" variant="neutro" size="auto" onClick={fechar}>
                            Não
                        </CustomButton>
                    </>
                }
            >
                {erroModal && <Aviso tipo="erro">{erroModal}</Aviso>}
            </Modal>
        </section>
    )
}

function ContaMentor() {
    const { perfilAtivo } = useSessao()
    const vinculoId = perfilAtivo?.vinculo.id
    const { dados, carregando, erro, recarregar } = useDados(() => carregar(vinculoId!), [vinculoId], !!vinculoId)

    return (
        <CascaDoApp itens={MENU_MENTOR} voltarPara="/mentor">
            <PaginaDeConta
                destaqueTitulo="Horas doadas"
                destaque={
                    dados ? (
                        <>
                            <div className="mt-3 rounded-card bg-status-aprovada-fundo px-4 py-3">
                                <p className="text-bloco text-status-aprovada-texto">
                                    {formatarMinutos(dados.horas.minutos)} em {nomeDoMes(dados.horas.mes)}
                                </p>
                                <p className="mt-1 text-apoio text-status-aprovada-texto">
                                    {dados.horas.sessoes} {dados.horas.sessoes === 1 ? 'sessão assinada' : 'sessões assinadas'}
                                </p>
                            </div>
                            <p className="mt-3 text-apoio text-secundario">
                                As horas aparecem no histórico do acompanhado. Contam só as sessões assinadas.
                            </p>
                        </>
                    ) : (
                        <p className="mt-3 text-apoio text-secundario">—</p>
                    )
                }
            >
                <ConvitePendente />

                {carregando && !dados && <Carregando />}
                {erro && <ErroNaTela mensagem={erro} tentarDeNovo={recarregar} />}
                {dados &&
                    (dados.atual ? (
                        <BlocoDoPapel
                            titulo="Alocação atual"
                            status="aprovada"
                            rotuloDoStatus="Em acompanhamento"
                            chamada={nomeDoAcompanhado(dados.atual)}
                            contexto={`${dados.atual.desafio?.titulo ?? 'Desafio'} · alocação aceita em ${formatarData(dados.atual.alocacao.respondidaEm)}`}
                            explicacao="Os feedbacks, as sprints e as horas ficam no histórico do acompanhado."
                            acao="Abrir histórico"
                            para={`/mentor/acompanhados/${dados.atual.alocacao.id}`}
                        />
                    ) : (
                        <Vazio titulo="Nenhuma alocação em andamento">
                            <LinkDeTexto para="/mentor/convites">Ver os convites de alocação ›</LinkDeTexto>
                        </Vazio>
                    ))}

                <section aria-labelledby="titulo-disponibilidade" className={`flex items-center gap-5 ${CARTAO_COM_RESPIRO}`}>
                    <div className="min-w-0 flex-1">
                        <h2 id="titulo-disponibilidade" className="font-display text-bloco text-titulo">
                            Área de atuação e disponibilidade
                        </h2>
                        <p className="mt-1 text-apoio text-secundario">
                            Os provedores encontram você pela área e pelas horas livres por mês.
                        </p>
                    </div>
                    <CustomButton variant="neutro" size="auto" to="/mentor/disponibilidade">
                        Editar mentoria
                    </CustomButton>
                </section>
            </PaginaDeConta>
        </CascaDoApp>
    )
}

export default ContaMentor
