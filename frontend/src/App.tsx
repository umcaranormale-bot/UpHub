import { Navigate, Route, Routes } from 'react-router-dom'

import Login from './pages/Login'

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
            {/* Quem abrir a raiz do site cai no login. */}
            <Route path="/" element={<Navigate to="/entrar" replace />} />

            <Route path="/entrar" element={<Login />} />

            {/* Acrescentem as rotas de vocês aqui. */}

            {/* Endereço que não existe: manda de volta para o login. */}
            <Route path="*" element={<Navigate to="/entrar" replace />} />
        </Routes>
    )
}

export default App
