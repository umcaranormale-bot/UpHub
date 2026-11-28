import { Route } from 'react-router-dom'

import AlocacaoMentores from '../pages/AlocacaoMentores'
import AprovacaoProvedores from '../pages/AprovacaoProvedores'
import ContaGestao from '../pages/ContaGestao'
import GestaoProvedor from '../pages/GestaoProvedor'
import GestaoResidencias from '../pages/GestaoResidencias'
import PainelEcossistema from '../pages/PainelEcossistema'

/** Rotas da gestão do Porto Digital (prefixo /gestao). */
export function rotasGestao() {
    return (
        <>
            <Route path="/gestao" element={<PainelEcossistema />} />
            <Route path="/gestao/provedores" element={<AprovacaoProvedores />} />
            <Route path="/gestao/provedores/:id" element={<GestaoProvedor />} />
            <Route path="/gestao/alocacao" element={<AlocacaoMentores />} />
            <Route path="/gestao/residencias" element={<GestaoResidencias />} />
            <Route path="/gestao/conta" element={<ContaGestao />} />
        </>
    )
}
