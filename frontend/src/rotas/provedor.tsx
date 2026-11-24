import { Route } from 'react-router-dom'

import ProviderHome from '../pages/ProviderHome'
import ProvedorAuditoria from '../pages/ProvedorAuditoria'
import ProvedorAvaliadores from '../pages/ProvedorAvaliadores'
import ProvedorCandidatura from '../pages/ProvedorCandidatura'
import ProvedorCandidaturas from '../pages/ProvedorCandidaturas'
import ProvedorConta from '../pages/ProvedorConta'
import ProvedorConvidarMentor from '../pages/ProvedorConvidarMentor'
import ProvedorFunil from '../pages/ProvedorFunil'
import ProvedorMatching from '../pages/ProvedorMatching'
import ProvedorNotificacoes from '../pages/ProvedorNotificacoes'
import ProvedorNovaOportunidade from '../pages/ProvedorNovaOportunidade'
import ProvedorOportunidade from '../pages/ProvedorOportunidade'
import ProvedorPedido from '../pages/ProvedorPedido'
import ProvedorVagas from '../pages/ProvedorVagas'

/** Rotas do provedor (prefixo /provedor). */
export function rotasProvedor() {
    return (
        <>
            <Route path="/provedor" element={<ProviderHome />} />
            <Route path="/provedor/pedido" element={<ProvedorPedido />} />
            <Route path="/provedor/oportunidades/nova" element={<ProvedorNovaOportunidade />} />
            <Route path="/provedor/oportunidades/:id" element={<ProvedorOportunidade />} />
            <Route path="/provedor/oportunidades/:id/editar" element={<ProvedorNovaOportunidade />} />
            <Route path="/provedor/oportunidades/:id/matching" element={<ProvedorMatching />} />
            <Route path="/provedor/oportunidades/:id/funil" element={<ProvedorFunil />} />
            <Route path="/provedor/oportunidades/:id/vagas" element={<ProvedorVagas />} />
            <Route path="/provedor/candidaturas" element={<ProvedorCandidaturas />} />
            <Route path="/provedor/candidaturas/:id" element={<ProvedorCandidatura />} />
            <Route path="/provedor/candidaturas/:id/mentor" element={<ProvedorConvidarMentor />} />
            <Route path="/provedor/avaliadores" element={<ProvedorAvaliadores />} />
            <Route path="/provedor/notificacoes" element={<ProvedorNotificacoes />} />
            <Route path="/provedor/auditoria" element={<ProvedorAuditoria />} />
            <Route path="/provedor/conta" element={<ProvedorConta />} />
        </>
    )
}
