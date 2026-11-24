import { Route, Routes, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import LandingPage from './pages/Landing-Page'
import MainLayout from './layouts/MainLayout'
import HomeLayout from './layouts/HomeLayout'
import AppLayout from './layouts/AppLayout'
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
import PrivateRoute from './routes/PrivateRoute'
import NewOrganizationPage from './pages/NewOrganizationPage'
import PublicOnlyRoute from './routes/PublicOnlyRoute'

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
 * Telas de um papel (squad, mentor, avaliador, gestão, provedor) entram
 * dentro do <Route> do AppLayout daquele papel, com caminho relativo:
 *        <Route path="nova-tela" element={<NovaTela />} />   →  /mentor/nova-tela
 * O topo e o menu lateral vêm do AppLayout; a tela só traz o próprio conteúdo.
 *
 * O arquivo da tela fica em src/pages, com o mesmo nome do componente.
 */
function App() {
    return (
        <AuthProvider>
            <Routes>

                {/* ROTAS PÚBLICAS */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/privacidade" element={<PrivacidadePage />} />
                </Route>

                <Route path="/convite" element={<InvitePage />} />
                <Route path="/confirmar-email" element={<ConfirmEmailPage />} />
                <Route path="/redefinir-senha" element={<ResetPasswordPage />} />

                {/* SÓ PARA QUEM NÃO ESTÁ LOGADO */}
                <Route element={<PublicOnlyRoute />}>
                    <Route element={<MainLayout variante="cadastro" />}>
                        <Route path="/cadastro" element={<RegisterPage />} />
                    </Route>
                    <Route path="/entrar" element={<Login />} />
                    <Route path="/recuperar-senha" element={<RecoveryPasswordPage />} />
                </Route>

                {/* ROTAS PRIVADAS */}
                <Route element={<PrivateRoute />}>

                    {/* Telas sem papel definido: a pessoa pode ainda não ter vínculo. */}
                    <Route path="/entrar-vinculo" element={<LinkPage />} />
                    <Route path="/organizacoes/nova" element={<NewOrganizationPage />} />

                    <Route element={<HomeLayout />}>
                        <Route path="/inicio" element={<CandidateHome />} />
                    </Route>

                    {/* ÁREAS POR PAPEL */}
                    <Route path="/squad" element={<AppLayout papel="CANDIDATO" />}>
                        <Route index element={<InicioSquad />} />
                        <Route path="oportunidades" element={<OportunidadesSquad />} />
                        <Route path="candidaturas" element={<CandidaturasSquad />} />
                        <Route path="perfil" element={<PerfilDaSquad />} />
                        <Route path="conta" element={<ContaSquad />} />
                    </Route>

                    <Route path="/mentor" element={<AppLayout papel="MENTOR" />}>
                        <Route index element={<InicioMentor />} />
                        <Route path="convites" element={<ConvitesMentor />} />
                        <Route path="acompanhados" element={<AcompanhadoMentor />} />
                        <Route path="horas" element={<RegistrarSessao />} />
                        <Route path="conta" element={<ContaMentor />} />
                    </Route>

                    <Route path="/avaliador" element={<AppLayout papel="AVALIADOR" />}>
                        <Route index element={<FilaAvaliacao />} />
                        <Route path="conta" element={<ContaAvaliador />} />
                    </Route>

                    <Route path="/gestao" element={<AppLayout papel="GESTAO" />}>
                        <Route index element={<PainelEcossistema />} />
                        <Route path="provedores" element={<AprovacaoProvedores />} />
                        <Route path="alocacao" element={<AlocacaoMentores />} />
                        <Route path="conta" element={<ContaGestao />} />
                    </Route>

                    <Route path="/provedor" element={<AppLayout papel="PROVEDOR" />}>
                        <Route index element={<ProviderHome />} />
                    </Route>
                </Route>

                {/* ROTA INEXISTENTE */}
                <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
        </AuthProvider>
    )
}

export default App