import { Navigate, Route, Routes } from 'react-router-dom'

import RotaProtegida from './components/RotaProtegida'
import MainLayout from './layouts/MainLayout'
import ConfirmEmailPage from './pages/ConfirmEmailPage'
import InvitePage from './pages/InvitePage'
import LandingPage from './pages/Landing-Page'
import Login from './pages/Login'
import PrivacidadePage from './pages/PrivacidadePage'
import RecoveryPasswordPage from './pages/RecoverPasswordPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { rotasAcesso } from './rotas/acesso'
import { rotasAvaliador } from './rotas/avaliador'
import { rotasCandidato } from './rotas/candidato'
import { rotasGestao } from './rotas/gestao'
import { rotasMentor } from './rotas/mentor'
import { rotasProvedor } from './rotas/provedor'
import { rotasSquad } from './rotas/squad'

/**
 * Índice das telas do site.
 *
 * As rotas logadas começam pelo papel (/candidato, /provedor, /squad, /mentor,
 * /avaliador, /gestao) e ficam cada uma no seu arquivo em src/rotas. Para
 * acrescentar uma tela, abra o arquivo da área e acrescente a <Route>.
 *
 * Não renomear /convite e /redefinir-senha: os e-mails do back-end apontam para elas.
 */
function App() {
    return (
        <Routes>
            {/* Telas públicas com a Navbar do site */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/cadastro" element={<RegisterPage />} />
                <Route path="/privacidade" element={<PrivacidadePage />} />
            </Route>

            {/* Acesso */}
            <Route path="/entrar" element={<Login />} />
            <Route path="/confirmar-email" element={<ConfirmEmailPage />} />
            <Route path="/convite" element={<InvitePage />} />
            <Route path="/recuperar-senha" element={<RecoveryPasswordPage />} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

            {/* Logado, sem área: escolher o vínculo e criar organização */}
            <Route element={<RotaProtegida />}>{rotasAcesso()}</Route>

            {/* Cada área confere o papel do vínculo ativo */}
            <Route element={<RotaProtegida area="candidato" />}>{rotasCandidato()}</Route>
            <Route element={<RotaProtegida area="squad" />}>{rotasSquad()}</Route>
            <Route element={<RotaProtegida area="provedor" />}>{rotasProvedor()}</Route>
            <Route element={<RotaProtegida area="avaliador" />}>{rotasAvaliador()}</Route>
            <Route element={<RotaProtegida area="mentor" />}>{rotasMentor()}</Route>
            <Route element={<RotaProtegida area="gestao" />}>{rotasGestao()}</Route>

            {/* /inicio era o início do candidato: passou a ser /candidato */}
            <Route path="/inicio" element={<Navigate to="/candidato" replace />} />

            {/* Endereço que não existe: volta para a landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App
