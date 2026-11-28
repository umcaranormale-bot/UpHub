import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { ANEL_FOCO, TRANSICAO_COR } from '../estilos/classes'
import { INICIO_DA_AREA } from '../navegacao/areas'
import { useSessao } from '../sessao/contexto'
import { CustomButton } from './CustomButton'
import Logo from './Logo'

/**
 * Navbar pública (landing, cadastro e privacidade), como no topo da tela 13:
 * a logo, as âncoras da landing, Entrar e Criar conta. Quem já está logado vê
 * o atalho para o próprio início no lugar dos dois botões.
 */

const ANCORAS = [
    { rotulo: 'Como funciona', para: '/#como-funciona' },
    { rotulo: 'Trilhas', para: '/#trilhas' },
    { rotulo: 'Para quem publica', para: '/#para-quem-publica' },
]

const LINK = `rounded-card px-2 py-1 text-apoio text-secundario hover:text-acento ${TRANSICAO_COR} ${ANEL_FOCO}`

export function Navbar() {
    // o menu do celular fica aberto só no endereço em que foi aberto: navegou, fecha
    const local = useLocation()
    const aqui = local.pathname + local.hash
    const [abertoEm, setAbertoEm] = useState<string | null>(null)
    const aberto = abertoEm === aqui
    const { pessoa, perfilAtivo } = useSessao()
    const inicio = pessoa ? (perfilAtivo ? INICIO_DA_AREA[perfilAtivo.area] : '/conta/nova-organizacao') : null
    const fechar = () => setAbertoEm(null)

    return (
        <header className="sticky top-0 z-50 border-b border-sutil bg-card shadow-card">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-8">
                <Link to="/" className={`shrink-0 rounded-card ${ANEL_FOCO}`} onClick={fechar}>
                    <Logo altura={28} />
                </Link>

                <nav aria-label="Navegação do site" className="hidden items-center gap-4 md:flex">
                    {ANCORAS.map((a) => (
                        <Link key={a.para} to={a.para} className={LINK}>
                            {a.rotulo}
                        </Link>
                    ))}
                </nav>

                <div className="ml-auto hidden items-center gap-3 md:flex">
                    {inicio ? (
                        <CustomButton to={inicio} variant="aprovar" size="auto">
                            Ir para o meu início
                        </CustomButton>
                    ) : (
                        <>
                            <CustomButton to="/entrar" variant="neutro" size="auto" className="px-5">
                                Entrar
                            </CustomButton>
                            <CustomButton to="/cadastro" variant="aprovar" size="auto" className="px-5">
                                Criar conta
                            </CustomButton>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setAbertoEm(aberto ? null : aqui)}
                    aria-expanded={aberto}
                    aria-controls="menu-publico"
                    aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
                    className={`ml-auto rounded-card p-2 text-titulo hover:bg-page md:hidden ${ANEL_FOCO}`}
                >
                    <svg className="size-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        {aberto ? (
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M18.364 18.364a1 1 0 000-1.414L13.414 12l4.95-4.95a1 1 0 00-1.414-1.414L12 10.586l-4.95-4.95a1 1 0 00-1.414 1.414L10.586 12l-4.95 4.95a1 1 0 001.414 1.414L12 13.414l4.95 4.95a1 1 0 001.414 0z"
                            />
                        ) : (
                            <path
                                fillRule="evenodd"
                                d="M4 5h16a1 1 0 010 2H4a1 1 0 110-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z"
                            />
                        )}
                    </svg>
                </button>
            </div>

            {aberto && (
                <nav id="menu-publico" aria-label="Navegação do site" className="border-t border-sutil px-4 pb-4 pt-2 md:hidden">
                    <ul className="flex flex-col gap-1">
                        {ANCORAS.map((a) => (
                            <li key={a.para}>
                                <Link to={a.para} onClick={fechar} className={`block ${LINK} py-2`}>
                                    {a.rotulo}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-3 flex flex-col gap-2">
                        {inicio ? (
                            <CustomButton to={inicio} variant="aprovar" size="grande">
                                Ir para o meu início
                            </CustomButton>
                        ) : (
                            <>
                                <CustomButton to="/entrar" variant="neutro" size="grande">
                                    Entrar
                                </CustomButton>
                                <CustomButton to="/cadastro" variant="aprovar" size="grande">
                                    Criar conta
                                </CustomButton>
                            </>
                        )}
                    </div>
                </nav>
            )}
        </header>
    )
}

export default Navbar
