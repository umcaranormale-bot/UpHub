import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { aceitarConvite, recusarConvite, type ConviteRecebido } from '../api/convites'
import { mensagemDeErro } from '../api/erros'
import { formatarData } from '../estilos/formatos'
import { ROTULO_DA_AREA } from '../navegacao/areas'
import { useEntrarNoPerfilNovo } from './acesso/useEntrarNoPerfilNovo'
import { CustomButton } from './CustomButton'
import { Campo } from './ui/Campo'
import { Aviso } from './ui/Estados'
import Modal from './ui/Modal'

/**
 * 45 e 62 · O convite encontrado: quem convidou, para qual papel e em qual
 * organização. Sem conta, a pessoa cria o acesso com nome e senha (tela 62);
 * com conta, confirma com a senha que já tem. O aceite já confirma o e-mail e
 * entra logado: a tela leva direto para o início do papel novo.
 */
interface InviteLoginCardProps {
    codigo: string
    convite: ConviteRecebido
    /** O convite foi recusado. */
    aoRecusar: () => void
}

export default function InviteLoginCard({ codigo, convite, aoRecusar }: InviteLoginCardProps) {
    const navigate = useNavigate()
    const [nome, setNome] = useState('')
    const [senha, setSenha] = useState('')
    const [confirmar, setConfirmar] = useState('')
    const [erro, setErro] = useState<string | null>(null)
    const [enviando, setEnviando] = useState(false)
    const [recusando, setRecusando] = useState(false)
    const [erroRecusa, setErroRecusa] = useState<string | null>(null)
    const [confirmarRecusa, setConfirmarRecusa] = useState(false)

    const novo = !convite.contaExistente
    const papel = ROTULO_DA_AREA[convite.papel === 'AVALIADOR' ? 'avaliador' : 'mentor']

    // se a sessão não abrir o perfil novo, o convite já foi aceito: basta entrar
    const entrarNoPerfilNovo = useEntrarNoPerfilNovo(() =>
        navigate('/entrar', {
            replace: true,
            state: { email: convite.email, aviso: 'Convite aceito. Entre com a sua senha para começar.' },
        }),
    )

    async function aceitar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setErro(null)
        if (novo && senha !== confirmar) {
            setErro('As senhas não coincidem.')
            return
        }
        setEnviando(true)
        try {
            const resposta = await aceitarConvite(codigo, senha, novo ? nome.trim() : undefined)
            // o vínculo novo é o mais recente com o papel e a organização do convite
            const doConvite = resposta.vinculos
                .filter((v) => v.papel === convite.papel && v.organizacaoNome === convite.organizacaoNome)
                .sort((a, b) => b.id - a.id)[0]
            await entrarNoPerfilNovo((p) =>
                doConvite
                    ? p.vinculo.id === doConvite.id
                    : p.vinculo.papel === convite.papel && p.vinculo.organizacaoNome === convite.organizacaoNome,
            )
        } catch (e) {
            setErro(mensagemDeErro(e))
            setEnviando(false)
        }
    }

    async function recusar() {
        setErroRecusa(null)
        setRecusando(true)
        try {
            await recusarConvite(codigo)
            setConfirmarRecusa(false)
            aoRecusar()
        } catch (e) {
            setErroRecusa(mensagemDeErro(e))
        } finally {
            setRecusando(false)
        }
    }

    return (
        <section className="w-full max-w-md rounded-modal border border-sutil bg-card p-8 shadow-card">
            <h1 className="text-h3 font-bold text-titulo">{novo ? 'Criar seu acesso' : 'Aceitar convite'}</h1>
            <p className="mt-2 text-apoio text-secundario">
                {novo
                    ? 'Defina seu nome e uma senha para entrar no Up Hub com o papel abaixo. Seu e-mail já fica confirmado.'
                    : 'Este e-mail já tem conta no Up Hub. Confirme com a sua senha para ganhar o papel abaixo.'}
            </p>

            <div className="my-4 flex items-center justify-between gap-3 rounded-card border-2 border-acento bg-acento-suave px-4 py-3">
                <div className="min-w-0">
                    <p className="text-item text-titulo">{convite.organizacaoNome}</p>
                    <p className="truncate text-legenda text-secundario">{convite.email}</p>
                </div>
                <span className="shrink-0 text-selo text-acento">{papel}</span>
            </div>
            <p className="mb-4 text-legenda text-secundario">
                {convite.convidadoPor ? `Convite de ${convite.convidadoPor}. ` : ''}Vale até{' '}
                {formatarData(convite.expiraEm)}.
            </p>

            <form onSubmit={(e) => void aceitar(e)} className="flex flex-col gap-4">
                {novo && (
                    <Campo
                        rotulo="Nome completo"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Digite seu nome"
                        autoComplete="name"
                        maxLength={160}
                        required
                    />
                )}
                <Campo
                    rotulo={novo ? 'Senha' : 'Senha da sua conta'}
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    autoComplete={novo ? 'new-password' : 'current-password'}
                    minLength={novo ? 8 : undefined}
                    maxLength={72}
                    required
                />
                {novo && (
                    <Campo
                        rotulo="Confirme a senha"
                        type="password"
                        value={confirmar}
                        onChange={(e) => setConfirmar(e.target.value)}
                        autoComplete="new-password"
                        maxLength={72}
                        required
                        ajuda="A senha precisa ter pelo menos 8 caracteres."
                    />
                )}

                {erro && <Aviso tipo="erro">{erro}</Aviso>}

                <CustomButton type="submit" variant="aprovar" size="grande" disabled={enviando}>
                    {enviando ? 'Entrando…' : novo ? 'Criar acesso e entrar' : 'Aceitar e entrar'}
                </CustomButton>
            </form>

            <button
                type="button"
                onClick={() => setConfirmarRecusa(true)}
                className="mt-4 block w-full text-center text-corpo font-medium text-status-reprovada-texto hover:underline"
            >
                Recusar convite
            </button>

            <Modal
                aberto={confirmarRecusa}
                titulo="Recusar convite"
                descricao={`Você não vai ser ${papel.toLowerCase()} da ${convite.organizacaoNome}. Para mudar de ideia depois, é preciso pedir um convite novo.`}
                aoFechar={() => setConfirmarRecusa(false)}
                acoes={
                    <>
                        <CustomButton type="button" variant="neutro" size="medio" onClick={() => setConfirmarRecusa(false)}>
                            Voltar
                        </CustomButton>
                        <CustomButton
                            type="button"
                            variant="reprovar"
                            size="medio"
                            disabled={recusando}
                            onClick={() => void recusar()}
                        >
                            {recusando ? 'Recusando…' : 'Recusar'}
                        </CustomButton>
                    </>
                }
            >
                {erroRecusa && <Aviso tipo="erro">{erroRecusa}</Aviso>}
            </Modal>
        </section>
    )
}
