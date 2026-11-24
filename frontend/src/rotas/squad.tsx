import { Route } from 'react-router-dom'

import CandidaturasSquad from '../pages/CandidaturasSquad'
import ContaSquad from '../pages/ContaSquad'
import InicioSquad from '../pages/InicioSquad'
import OportunidadesSquad from '../pages/OportunidadesSquad'
import PerfilDaSquad from '../pages/PerfilDaSquad'
import SquadDetalheDoDesafio from '../pages/SquadDetalheDoDesafio'
import SquadMontarCandidatura from '../pages/SquadMontarCandidatura'
import SquadResidencia from '../pages/SquadResidencia'
import SquadSprints from '../pages/SquadSprints'

/** Rotas do candidato de squad (prefixo /squad). */
export function rotasSquad() {
    return (
        <>
            <Route path="/squad" element={<InicioSquad />} />
            <Route path="/squad/oportunidades" element={<OportunidadesSquad />} />
            <Route path="/squad/oportunidades/:id" element={<SquadDetalheDoDesafio />} />
            <Route path="/squad/candidaturas" element={<CandidaturasSquad />} />
            <Route path="/squad/candidaturas/:id/editar" element={<SquadMontarCandidatura />} />
            <Route path="/squad/candidaturas/:id/sprints" element={<SquadSprints />} />
            <Route path="/squad/perfil" element={<PerfilDaSquad />} />
            <Route path="/squad/residencia" element={<SquadResidencia />} />
            <Route path="/squad/conta" element={<ContaSquad />} />
        </>
    )
}
