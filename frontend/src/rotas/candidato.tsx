import { Route } from 'react-router-dom'

import CandidateHome from '../pages/CandidateHome'
import CandidatoAcompanhamento from '../pages/CandidatoAcompanhamento'
import CandidatoAjuste from '../pages/CandidatoAjuste'
import CandidatoCandidaturas from '../pages/CandidatoCandidaturas'
import CandidatoConta from '../pages/CandidatoConta'
import CandidatoMontarCandidatura from '../pages/CandidatoMontarCandidatura'
import CandidatoOportunidade from '../pages/CandidatoOportunidade'
import CandidatoOportunidades from '../pages/CandidatoOportunidades'
import CandidatoOrganizacao from '../pages/CandidatoOrganizacao'
import CandidatoPareceres from '../pages/CandidatoPareceres'
import CandidatoRecomendadas from '../pages/CandidatoRecomendadas'

/**
 * Rotas do candidato de empresa ou startup (prefixo /candidato).
 * Ficam dentro da <RotaProtegida area="candidato"> do App.tsx.
 */
export function rotasCandidato() {
    return (
        <>
            {/* 20 */}
            <Route path="/candidato" element={<CandidateHome />} />
            {/* 17 (com as abas Todas, Recomendadas e Favoritas) e 63 */}
            <Route path="/candidato/oportunidades" element={<CandidatoOportunidades />} />
            <Route path="/candidato/recomendadas" element={<CandidatoRecomendadas />} />
            {/* 05, 24, 25 e 26 */}
            <Route path="/candidato/oportunidades/:id" element={<CandidatoOportunidade />} />
            {/* 21 */}
            <Route path="/candidato/candidaturas" element={<CandidatoCandidaturas />} />
            {/* 06 e 64 */}
            <Route path="/candidato/candidaturas/:id/editar" element={<CandidatoMontarCandidatura />} />
            {/* 23, 23b, 08 e 42 */}
            <Route path="/candidato/candidaturas/:id" element={<CandidatoAcompanhamento />} />
            {/* 65 */}
            <Route path="/candidato/candidaturas/:id/pareceres" element={<CandidatoPareceres />} />
            {/* 46 */}
            <Route path="/candidato/candidaturas/:id/ajuste" element={<CandidatoAjuste />} />
            {/* 22 e 66 */}
            <Route path="/candidato/organizacao" element={<CandidatoOrganizacao />} />
            {/* 15 e 16 */}
            <Route path="/candidato/conta" element={<CandidatoConta />} />
        </>
    )
}
