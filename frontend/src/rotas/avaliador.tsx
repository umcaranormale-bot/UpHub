import { Route } from 'react-router-dom'

import AvaliadorAvaliacao from '../pages/AvaliadorAvaliacao'
import ContaAvaliador from '../pages/ContaAvaliador'
import FilaAvaliacao from '../pages/FilaAvaliacao'

/** Rotas do avaliador (prefixo /avaliador). */
export function rotasAvaliador() {
    return (
        <>
            <Route path="/avaliador" element={<FilaAvaliacao />} />
            <Route path="/avaliador/avaliacoes/:id" element={<AvaliadorAvaliacao />} />
            <Route path="/avaliador/conta" element={<ContaAvaliador />} />
        </>
    )
}
