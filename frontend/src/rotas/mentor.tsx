import { Route } from 'react-router-dom'

import AcompanhadoMentor from '../pages/AcompanhadoMentor'
import ContaMentor from '../pages/ContaMentor'
import ConvitesMentor from '../pages/ConvitesMentor'
import InicioMentor from '../pages/InicioMentor'
import MentorAcompanhados from '../pages/MentorAcompanhados'
import MentorDisponibilidade from '../pages/MentorDisponibilidade'
import MentorSprints from '../pages/MentorSprints'
import RegistrarSessao from '../pages/RegistrarSessao'

/** Rotas do mentor (prefixo /mentor). */
export function rotasMentor() {
    return (
        <>
            <Route path="/mentor" element={<InicioMentor />} />
            <Route path="/mentor/convites" element={<ConvitesMentor />} />
            <Route path="/mentor/acompanhados" element={<MentorAcompanhados />} />
            <Route path="/mentor/acompanhados/:id" element={<AcompanhadoMentor />} />
            <Route path="/mentor/acompanhados/:id/sprints" element={<MentorSprints />} />
            <Route path="/mentor/horas" element={<RegistrarSessao />} />
            <Route path="/mentor/disponibilidade" element={<MentorDisponibilidade />} />
            <Route path="/mentor/conta" element={<ContaMentor />} />
        </>
    )
}
