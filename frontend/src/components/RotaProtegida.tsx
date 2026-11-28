import { useEffect } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'

import { INICIO_DA_AREA, type Area } from '../navegacao/areas'
import { useSessao } from '../sessao/contexto'
import { Carregando } from './ui/Estados'

/**
 * Rota protegida: sem login, vai para /entrar (e volta depois do login).
 *
 * Com `area`, confere também o papel: quem tem um vínculo daquela área passa a
 * navegar com ele. Quem não tem continua logado e vê a tela com um aviso: quem
 * decide é o servidor, e cada chamada da página volta 403 (o RBAC da
 * apresentação mostra isso na aba Network). Sem perfil nenhum, vai criar a organização.
 */
export function RotaProtegida({ area }: { area?: Area }) {
    const { carregando, pessoa, perfis, perfilAtivo, escolherPerfil } = useSessao()
    const local = useLocation()

    const perfilDaArea = area ? perfis.find((p) => p.area === area) : undefined
    const precisaTrocar = !!area && perfilAtivo?.area !== area && !!perfilDaArea

    useEffect(() => {
        if (precisaTrocar && perfilDaArea) void escolherPerfil(perfilDaArea.vinculo.id)
    }, [precisaTrocar, perfilDaArea, escolherPerfil])

    if (carregando) return <Carregando tela />
    if (!pessoa) return <Navigate to="/entrar" replace state={{ de: local.pathname + local.search }} />
    if (!area) return <Outlet />
    if (precisaTrocar) return <Carregando tela />
    if (!perfilAtivo) return <Navigate to="/conta/nova-organizacao" replace />
    if (perfilAtivo.area !== area) {
        return (
            <>
                <div role="alert" className="bg-status-reprovada-fundo px-6 py-3 text-center text-apoio text-status-reprovada-texto">
                    O seu perfil ({perfilAtivo.vinculo.organizacaoNome}) não tem permissão para esta área. O servidor recusa os
                    dados (403).{' '}
                    <Link to={INICIO_DA_AREA[perfilAtivo.area]} className="font-semibold underline">
                        Voltar ao seu início
                    </Link>
                </div>
                <Outlet />
            </>
        )
    }
    return <Outlet />
}

export default RotaProtegida
