import { Link } from 'react-router-dom'

import Logo from './Logo'
import { CustomButton } from './CustomButton'
import { ANEL_FOCO, TRANSICAO_COR } from '../estilos/classes'

/**
 * Navbar — topo das telas públicas (landing, privacidade, cadastro).
 *
 * Segue a mesma moldura do topo do AppLayout (fundo de card, borda sutil,
 * logo pervinca), para o site e a área logada parecerem o mesmo produto.
 *
 * Duas variantes, como no protótipo:
 *   - "site":     links das seções da landing + "Entrar" e "Criar conta"
 *   - "cadastro": "‹ Voltar" + "Já tem conta?" e "Entrar"
 */

export type VarianteDaNavbar = 'site' | 'cadastro'

const LINK_DE_SECAO = `rounded-card text-apoio text-secundario ${TRANSICAO_COR} hover:text-titulo ${ANEL_FOCO}`

/**
 * Seções da landing. O "/" antes do "#" faz o link funcionar também a partir
 * de outras páginas públicas (ex.: /privacidade): volta para a landing e rola
 * até a seção. Cada âncora precisa de um id igual na seção da LandingPage.
 */
const SECOES_DO_SITE = [
    { rotulo: 'Como funciona', href: '/#como-funciona' },
    { rotulo: 'Trilhas', href: '/#trilhas' },
    { rotulo: 'Para quem publica', href: '/#para-quem-publica' },
]

interface NavbarProps {
    variante?: VarianteDaNavbar
}

export function Navbar({ variante = 'site' }: NavbarProps) {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-6 border-b border-sutil bg-card px-10 shadow-card">
            <Link to="/" aria-label="UpHub, página inicial" className={`rounded-card ${ANEL_FOCO}`}>
                <Logo variante="pervinca" altura={28} />
            </Link>

            {variante === 'site' ? (
                <>
                    <nav aria-label="Seções do site" className="hidden items-center gap-6 md:flex">
                        {SECOES_DO_SITE.map((secao) => (
                            <a key={secao.href} href={secao.href} className={LINK_DE_SECAO}>
                                {secao.rotulo}
                            </a>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-3">
                        <CustomButton to="/entrar" variant="neutro" size="auto" className="px-4">
                            Entrar
                        </CustomButton>
                        <CustomButton to="/cadastro" variant="aprovar" size="auto" className="px-4">
                            Criar conta
                        </CustomButton>
                    </div>
                </>
            ) : (
                <>
                    <CustomButton to="/" variant="neutro" size="auto" className="px-4">
                        ‹ Voltar
                    </CustomButton>

                    <div className="ml-auto flex items-center gap-3">
                        <span className="text-apoio text-secundario">Já tem conta?</span>
                        <CustomButton to="/entrar" variant="neutro" size="auto" className="px-4">
                            Entrar
                        </CustomButton>
                    </div>
                </>
            )}
        </header>
    )
}

export default Navbar