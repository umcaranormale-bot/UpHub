import { NavLink } from 'react-router-dom'

const itensMenu = [
    { rotulo: 'Painel', para: '/home' },
    { rotulo: 'Oportunidades', para: '/oportunidades' },
    { rotulo: 'Candidaturas', para: '/candidaturas' },
    { rotulo: 'Avaliadores', para: '/avaliadores' },
    { rotulo: 'Notificações e prazos', para: '/notificacoes' },
    { rotulo: 'Histórico de auditoria', para: '/auditoria' },
    { rotulo: 'Conta', para: '/conta' },
]

function Sidemenu() {
    return (
        <aside className="w-[220px] shrink-0 border-r border-sutil bg-card p-3">
            <nav aria-label="Menu principal">
                <ul className="flex flex-col gap-1">
                    {itensMenu.map((item) => (
                        <li key={item.para}>
                            <NavLink
                                to={item.para}
                                end
                                className={({ isActive }) =>
                                    [
                                        'block rounded-card px-3 py-2 text-corpo transition-colors',
                                        isActive
                                            ? 'bg-acento-suave font-medium text-titulo'
                                            : 'text-secundario hover:bg-page hover:text-titulo',
                                    ].join(' ')
                                }
                            >
                                {item.rotulo}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    )
}

export default Sidemenu