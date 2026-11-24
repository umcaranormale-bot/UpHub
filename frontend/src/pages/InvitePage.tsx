import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { validarConvite } from '../api/convites'
import InviteCard from '../components/InviteCard'
import InviteLoginCard from '../components/InviteLoginCard'
import { CustomButton } from '../components/CustomButton'
import { Carregando } from '../components/ui/Estados'
import { useDados } from '../hooks/useDados'
import AuthLayout from '../layouts/AuthLayout'

/**
 * 45 e 62 · Aceitar convite e criar acesso · rota /convite
 *
 * O e-mail do back-end manda /convite?codigo=... (não renomear a rota). Com o
 * código na URL, a tela confere o convite na hora (validarConvite); sem ele,
 * pede o código. Convite expirado (410), já usado (409) ou que não existe
 * (404): mostra a mensagem e esconde o formulário.
 */
function InvitePage() {
    const [parametros, setParametros] = useSearchParams()
    const codigo = parametros.get('codigo')?.trim() ?? ''
    const [recusado, setRecusado] = useState(false)

    const { dados: convite, carregando, erro } = useDados(() => validarConvite(codigo), [codigo], codigo !== '')

    function usarCodigo(novo: string) {
        setRecusado(false)
        setParametros(novo ? { codigo: novo } : {})
    }

    let conteudo
    if (recusado) {
        conteudo = (
            <Mensagem titulo="Convite recusado">
                O link deixou de valer. Se mudar de ideia, peça um convite novo a quem convidou você.
            </Mensagem>
        )
    } else if (!codigo) {
        conteudo = <InviteCard aoValidar={usarCodigo} />
    } else if (carregando || (!erro && !convite)) {
        conteudo = <Carregando texto="Conferindo o convite…" />
    } else if (erro || !convite) {
        conteudo = (
            <Mensagem titulo="Não deu para usar este convite" erro>
                {erro ?? 'Convite não encontrado'}
                <button
                    type="button"
                    onClick={() => usarCodigo('')}
                    className="mt-4 block text-corpo font-medium text-acento hover:underline"
                >
                    Digitar outro código
                </button>
            </Mensagem>
        )
    } else {
        conteudo = <InviteLoginCard codigo={codigo} convite={convite} aoRecusar={() => setRecusado(true)} />
    }

    return (
        <AuthLayout>
            <div className="flex w-full flex-col items-center gap-6">{conteudo}</div>
        </AuthLayout>
    )
}

function Mensagem({ titulo, erro = false, children }: { titulo: string; erro?: boolean; children: ReactNode }) {
    return (
        <section
            role={erro ? 'alert' : 'status'}
            className="w-full max-w-md rounded-modal border border-sutil bg-card p-8 shadow-card"
        >
            <h1 className={`text-h3 font-bold ${erro ? 'text-status-reprovada-texto' : 'text-titulo'}`}>{titulo}</h1>
            <div className="mt-3 text-corpo text-secundario">{children}</div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
                <CustomButton to="/entrar" variant="aprovar" size="medio">
                    Ir para entrar
                </CustomButton>
                <Link to="/" className="text-corpo font-medium text-acento hover:underline">
                    Voltar ao início
                </Link>
            </div>
        </section>
    )
}

export default InvitePage
