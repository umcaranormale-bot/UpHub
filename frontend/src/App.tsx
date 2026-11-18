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
            <Route path="/inicio/squad" element={<InicioSquad />} />
            <Route path="/avaliacao" element={<FilaAvaliacao />} />
            <Route path="/mentor" element={<InicioMentor />} />
            <Route path="/painel" element={<PainelEcossistema />} />

            {/* Destinos dos menus laterais de cada papel. */}
            <Route path="/oportunidades" element={<OportunidadesSquad />} />
            <Route path="/candidaturas" element={<CandidaturasSquad />} />
            <Route path="/organizacao" element={<PerfilDaSquad />} />
            <Route path="/convites" element={<ConvitesMentor />} />
            <Route path="/acompanhados" element={<AcompanhadoMentor />} />
            <Route path="/horas" element={<RegistrarSessao />} />
            <Route path="/provedores" element={<AprovacaoProvedores />} />
            <Route path="/alocacao" element={<AlocacaoMentores />} />

            {/* Conta tem uma tela por papel (57, 59, 60 e 61 no Figma). */}
            <Route path="/conta/squad" element={<ContaSquad />} />
            <Route path="/conta/mentor" element={<ContaMentor />} />
            <Route path="/conta/avaliador" element={<ContaAvaliador />} />
            <Route path="/conta/gestao" element={<ContaGestao />} />

            <Route path="/entrar" element={<Login />} />
            <Route path="/convite" element={<InvitePage />} />
            <Route path="/recuperar-senha" element={<RecoveryPasswordPage />} />

            {/* A tela de redefinir senha é acessada a partir do link que o usuário recebe por e-mail.*/}
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
        </Routes>
    )
}

export default App
