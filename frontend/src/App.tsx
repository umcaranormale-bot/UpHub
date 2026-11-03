import { Route, Routes } from 'react-router-dom'

import Login from './pages/Login'
import LandingPage from './pages/Landing-Page'
import MainLayout from './layouts/MainLayout'
import RegisterPage from './pages/RegisterPage'

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
                <Route path="/cadastro" element={<RegisterPage/>}/>
            </Route>
                <Route path="/entrar" element={<Login />} />


            {/* Endereço que não existe: manda de volta para a landing-page. */}
            <Route path="*" element={<LandingPage />} />
        </Routes>
    )
}

export default App
