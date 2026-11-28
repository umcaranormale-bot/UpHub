import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ErroApi } from '../api/cliente'
import { mensagemDeErro } from '../api/erros'
import { cadastrarPessoa } from '../api/pessoas'
import { CustomButton } from '../components/CustomButton'
import RegisterCard from '../components/RegisterCard'
import { Aviso } from '../components/ui/Estados'
import { ANEL_FOCO } from '../estilos/classes'

/**
 * 14 · Criar conta (só a pessoa) · rota /cadastro
 *
 * Mudou em 21/11: só nome, e-mail e senha. A conta é da pessoa; o tipo é da
 * organização e é escolhido na tela 68 (/conta/nova-organizacao), onde a
 * organização nasce, depois de confirmar o e-mail (tela 51) e entrar.
 */

const VAZIO = { nome: '', email: '', senha: '', confirmarSenha: '' }

function RegisterPage() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState(VAZIO)
    const [erro, setErro] = useState('')
    const [emailRepetido, setEmailRepetido] = useState(false)
    const [enviando, setEnviando] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setErro('')
        setEmailRepetido(false)

        if (formData.senha !== formData.confirmarSenha) {
            setErro('As senhas não coincidem.')
            return
        }

        setEnviando(true)
        try {
            await cadastrarPessoa({
                nome: formData.nome.trim(),
                email: formData.email.trim(),
                senha: formData.senha,
            })
            navigate('/confirmar-email', { state: { email: formData.email.trim() } })
        } catch (e) {
            setEmailRepetido(e instanceof ErroApi && e.status === 409)
            setErro(mensagemDeErro(e))
            setEnviando(false)
        }
    }

    return (
        <div className="min-h-screen bg-page px-4 py-8 md:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-h1 text-titulo">Criar conta</h1>
                        <p className="mt-2 max-w-xl text-corpo text-secundario">
                            A conta é pessoal. O papel vem da organização em que você atua, e dá para ter mais de
                            um vínculo depois.
                        </p>
                    </div>
                    <p className="text-apoio text-secundario">
                        Já tem conta?{' '}
                        <Link to="/entrar" className={`font-semibold text-acento hover:underline ${ANEL_FOCO}`}>
                            Entrar
                        </Link>
                    </p>
                </div>

                <form onSubmit={(e) => void handleSubmit(e)}>
                    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,2.8fr)_minmax(220px,1fr)]">
                        <div className="space-y-4">
                            <RegisterCard formData={formData} onChange={setFormData} />
                            <p className="text-apoio text-secundario">
                                Depois de confirmar o e-mail e entrar, você cadastra a organização e escolhe o tipo dela:
                                empresa, startup e squad se candidatam; órgão de fomento, investidor, aceleradora e
                                empresa parceira publicam.
                            </p>
                        </div>

                        <aside className="space-y-3">
                            <div className="rounded-card border border-pervinca/20 bg-acento-suave p-4">
                                <h2 className="mb-2 text-corpo font-semibold text-acento">
                                    Mentor, avaliador e gestão não se cadastram
                                </h2>
                                <p className="mb-3 text-rotulo text-secundario">
                                    Mentor e avaliador entram pelo convite de quem publicou a oportunidade. A gestão
                                    do Porto Digital é conta interna. Os três acessam só pela tela de entrar.
                                </p>
                                <CustomButton variant="neutro" size="grande" to="/convite">
                                    Recebi um convite
                                </CustomButton>
                            </div>

                            <div className="rounded-card border border-aviso-borda bg-aviso-fundo p-4">
                                <h2 className="mb-2 text-corpo font-semibold text-alerta">Provedor passa por aprovação</h2>
                                <p className="text-rotulo text-alerta">
                                    Você cria a conta e cadastra a organização na hora, mas a permissão de publicar só
                                    é liberada depois que a gestão do Porto Digital conferir os dados. Enquanto isso,
                                    o pedido fica em análise.
                                </p>
                            </div>
                        </aside>
                    </div>

                    {erro && (
                        <div className="mt-4 max-w-2xl">
                            <Aviso tipo="erro">
                                {erro}
                                {emailRepetido && (
                                    <>
                                        {' '}
                                        <Link
                                            to="/entrar"
                                            state={{ email: formData.email.trim() }}
                                            className={`font-semibold underline ${ANEL_FOCO}`}
                                        >
                                            Entrar com este e-mail
                                        </Link>
                                    </>
                                )}
                            </Aviso>
                        </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <CustomButton type="submit" variant="aprovar" size="medio" disabled={enviando}>
                            {enviando ? 'Cadastrando…' : 'Cadastrar'}
                        </CustomButton>
                        <CustomButton to="/" variant="neutro" size="medio">
                            Cancelar
                        </CustomButton>
                    </div>

                    <p className="mt-3 text-legenda text-secundario">
                        Ao criar a conta, você concorda com a{' '}
                        <Link to="/privacidade" className={`font-semibold text-acento hover:underline ${ANEL_FOCO}`}>
                            Política de privacidade
                        </Link>
                        .
                    </p>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage
