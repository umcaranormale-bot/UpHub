import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { CustomButton } from '../components/CustomButton'
import AuthLayout from '../layouts/AuthLayout'
import { ROTULO_TIPO_ORGANIZACAO } from '../estilos/formatos'
import { ANEL_FOCO, TRANSICAO_COR } from '../estilos/classes'
import { ROTULO_DA_AREA } from '../navegacao/areas'
import { useSessao } from '../sessao/contexto'

/**
 * 01c · Seu vínculo — rota /entrar/vinculo
 *
 * Quem tem mais de um vínculo escolhe com qual entra. Depois, o "Trocar de
 * perfil" do cabeçalho troca sem novo login.
 */
function EscolherVinculoPage() {
    const { perfis, perfilAtivo, escolherPerfil, sair } = useSessao()
    const navigate = useNavigate()
    const [escolhido, setEscolhido] = useState<number | null>(perfilAtivo?.vinculo.id ?? perfis[0]?.vinculo.id ?? null)
    const [indo, setIndo] = useState(false)

    if (perfis.length === 0) return <Navigate to="/conta/nova-organizacao" replace />

    async function continuar() {
        if (escolhido === null) return
        setIndo(true)
        navigate(await escolherPerfil(escolhido))
    }

    return (
        <AuthLayout>
            <section className="w-full max-w-md rounded-modal border border-sutil bg-card p-8 shadow-sm">
                <h1 className="text-h3 font-bold text-titulo">Seu vínculo</h1>
                <p className="mt-3 text-corpo text-secundario">
                    Você participa de mais de uma organização. Escolha com qual quer entrar. Depois dá para trocar
                    pelo “Trocar de perfil”, no cabeçalho, sem entrar de novo.
                </p>

                <fieldset className="mt-4 flex flex-col gap-3">
                    <legend className="sr-only">Vínculos</legend>
                    {perfis.map((p) => {
                        const marcado = escolhido === p.vinculo.id
                        const tipo = p.organizacao ? ROTULO_TIPO_ORGANIZACAO[p.organizacao.tipo] : null
                        return (
                            <label
                                key={p.vinculo.id}
                                className={`flex cursor-pointer items-center gap-3 rounded-card border px-4 py-3 ${TRANSICAO_COR} ${
                                    marcado ? 'border-acento bg-acento-suave' : 'border-sutil hover:bg-page'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="vinculo"
                                    checked={marcado}
                                    onChange={() => setEscolhido(p.vinculo.id)}
                                    className={`size-4 accent-acento ${ANEL_FOCO}`}
                                />
                                <span className="flex flex-1 flex-col">
                                    <span className="text-item text-titulo">{p.vinculo.organizacaoNome}</span>
                                    <span className="text-legenda text-secundario">
                                        vínculo ativo desde {new Date(p.vinculo.ativoDesde).getFullYear()}
                                    </span>
                                </span>
                                <span className="rounded-badge bg-acento-suave px-2 py-1 text-selo text-acento">
                                    {ROTULO_DA_AREA[p.area]}
                                    {p.area === 'candidato' && tipo ? ` · ${tipo.toLowerCase()}` : ''}
                                </span>
                            </label>
                        )
                    })}
                </fieldset>

                <CustomButton
                    type="button"
                    variant="aprovar"
                    size="grande"
                    className="mt-4 w-full"
                    disabled={escolhido === null || indo}
                    onClick={() => void continuar()}
                >
                    {indo ? 'Entrando…' : 'Continuar'}
                </CustomButton>

                <button
                    type="button"
                    onClick={() => {
                        sair()
                        navigate('/entrar')
                    }}
                    className="mt-4 block w-full text-center text-corpo font-medium text-acento hover:underline"
                >
                    Entrar com outra conta
                </button>
            </section>
        </AuthLayout>
    )
}

export default EscolherVinculoPage
