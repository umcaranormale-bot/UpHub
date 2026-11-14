import { Route, Routes, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import LandingPage from './pages/Landing-Page'
import MainLayout from './layouts/MainLayout'
import HomeLayout from './layouts/HomeLayout'
import RegisterPage from './pages/RegisterPage'
import RecoveryPasswordPage from './pages/RecoverPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import CandidateHome from './pages/CandidateHome'
import InvitePage from './pages/InvitePage'

/**
 * Índice das telas do site.
 *
 * Para acrescentar uma tela nova, são duas linhas:
 *
 *   1) o import, aqui em cima, junto com o do Login:
 *        import Cadastro from './pages/Cadastro'
 *
 *   2) a rota, aqui embaixo, dentro do <Routes>:
 *        <Route path="/cadastro" element={<Cadastro />} />
 *
 * O arquivo da tela fica em src/pages, com o mesmo nome do componente.
 */
function App() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                {/* Quem abrir a raiz do site cai na landing-page. */}
                <Route path="/" element={<LandingPage />} />
                {/* Acrescentem as rotas de vocês aqui. */}
                <Route path="/cadastro" element={<RegisterPage />} />

                {/* Endereço que não existe: manda de volta para a landing-page. */}
                <Route path="*" element={<Navigate to="/" replace />} />

                {/* As telas que ficam dentro do HomeLayout são as que aparecem depois do login. */}
                <Route element={<HomeLayout />}>
                    <Route path="/candidato" element={<CandidateHome />} />
                </Route>
            </Route>

            <Route path="/entrar" element={<Login />} />
            <Route path="/convite" element={<InvitePage />} />
            <Route path="/recuperar-senha" element={<RecoveryPasswordPage />} />

            {/* A tela de redefinir senha é acessada a partir do link que o usuário recebe por e-mail.*/}
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
        </Routes>
    )
}

export default App
