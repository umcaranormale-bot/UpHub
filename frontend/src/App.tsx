import { Route, Routes, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import LandingPage from './pages/Landing-Page'
import MainLayout from './layouts/MainLayout'
import HomeLayout from './layouts/HomeLayout'
import RegisterPage from './pages/RegisterPage'
import RecoveryPasswordPage from './pages/RecoverPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import CandidateHome from './pages/CandidateHome'
import PrivacidadePage from './pages/PrivacidadePage'
import InvitePage from './pages/InvitePage'
import ProviderHome from './pages/ProviderHome'
import FilaAvaliacao from './pages/FilaAvaliacao'
import InicioSquad from './pages/InicioSquad'
import InicioMentor from './pages/InicioMentor'
import PainelEcossistema from './pages/PainelEcossistema'
import OportunidadesSquad from './pages/OportunidadesSquad'
import CandidaturasSquad from './pages/CandidaturasSquad'
import PerfilDaSquad from './pages/PerfilDaSquad'
import ConvitesMentor from './pages/ConvitesMentor'
import AcompanhadoMentor from './pages/AcompanhadoMentor'
import RegistrarSessao from './pages/RegistrarSessao'
import AprovacaoProvedores from './pages/AprovacaoProvedores'
import AlocacaoMentores from './pages/AlocacaoMentores'
import ContaSquad from './pages/ContaSquad'
import ContaMentor from './pages/ContaMentor'
import ContaAvaliador from './pages/ContaAvaliador'
import ContaGestao from './pages/ContaGestao'
import ConfirmEmailPage from './pages/ConfirmEmailPage'
import { AuthProvider } from './contexts/AuthContext'
import LinkPage from './pages/LinkPage'

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
        <AuthProvider>

            <Routes>
                <Route element={<MainLayout />}>
                    {/* Quem abrir a raiz do site cai na landing-page. */}
                    <Route path="/" element={<LandingPage />} />
                    {/* Acrescentem as rotas de vocês aqui. */}
                    <Route path="/cadastro" element={<RegisterPage />} />
                    <Route path="/privacidade" element={<PrivacidadePage />} /> { }

                    {/* Endereço que não existe: manda de volta para a landing-page. */}
                    <Route path="*" element={<Navigate to="/" replace />} />

                    {/* As telas que ficam dentro do HomeLayout são as que aparecem depois do login. */}
                    <Route element={<HomeLayout />}>
                        <Route path="/inicio" element={<CandidateHome />} />
                        <Route path="/provedor" element={<ProviderHome />} />
                    </Route>
                </Route>

                {/* Telas com casca propria por papel: trazem o proprio topo e menu,
                por isso ficam fora do HomeLayout. */}
                <Route path="/squad" element={<InicioSquad />} />
                <Route path="/avaliador" element={<FilaAvaliacao />} />
                <Route path="/mentor" element={<InicioMentor />} />
                <Route path="/gestao" element={<PainelEcossistema />} />

                {/* Destinos dos menus laterais de cada papel. */}
                <Route path="/squad/oportunidades" element={<OportunidadesSquad />} />
                <Route path="/squad/candidaturas" element={<CandidaturasSquad />} />
                <Route path="/squad/perfil" element={<PerfilDaSquad />} />
                <Route path="/mentor/convites" element={<ConvitesMentor />} />
                <Route path="/mentor/acompanhados" element={<AcompanhadoMentor />} />
                <Route path="/mentor/horas" element={<RegistrarSessao />} />
                <Route path="/gestao/provedores" element={<AprovacaoProvedores />} />
                <Route path="/gestao/alocacao" element={<AlocacaoMentores />} />

                {/* Conta tem uma tela por papel (57, 59, 60 e 61 no Figma). */}
                <Route path="/squad/conta" element={<ContaSquad />} />
                <Route path="/mentor/conta" element={<ContaMentor />} />
                <Route path="/avaliador/conta" element={<ContaAvaliador />} />
                <Route path="/gestao/conta" element={<ContaGestao />} />

                <Route path="/entrar" element={<Login />} />
                <Route path="/convite" element={<InvitePage />} />
                <Route path="/selecionar-vinculo" element={<LinkPage />} />
                <Route path="/recuperar-senha" element={<RecoveryPasswordPage />} />
                <Route path="/confirmar-email" element={<ConfirmEmailPage />} />

                {/* A tela de redefinir senha é acessada a partir do link que o usuário recebe por e-mail.*/}
                <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
            </Routes>
        </AuthProvider>
    )
}

export default App
