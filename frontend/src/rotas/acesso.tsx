import { Route } from 'react-router-dom'

import AcessoNovaOrganizacao from '../pages/AcessoNovaOrganizacao'
import EscolherVinculoPage from '../pages/EscolherVinculoPage'

/**
 * Telas de quem está logado mas ainda não escolheu (ou não tem) um perfil:
 * escolher o vínculo e criar uma organização. Ficam dentro da <RotaProtegida>
 * sem área.
 */
export function rotasAcesso() {
    return (
        <>
            <Route path="/entrar/vinculo" element={<EscolherVinculoPage />} />
            <Route path="/conta/nova-organizacao" element={<AcessoNovaOrganizacao />} />
        </>
    )
}
