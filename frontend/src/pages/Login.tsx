import { CustomButton } from '../components/Botao';
import { Navbar } from '../components/Navbar';
/**
 * Entrar — rota /entrar
 *
 * Esta é a casca da tela. Monte o layout dentro do <main>.
 *
 * Nesta semana:
 *   - sem fetch e sem VITE_API_URL: nada de chamar o backend ainda
 *   - os dados que aparecerem na tela ficam escritos aqui mesmo
 *   - use os tokens do index.css: bg-page, text-titulo, text-acento,
 *     text-h1, p-secao, rounded-card, e os demais que já estão lá
 *   - o Figma é referência de hierarquia e de componente; não precisa
 *     ficar igual pixel por pixel
 *
 * Para ver na tela: npm run dev e abra http://localhost:5173/entrar
 */
function Login() {
    return (
        <div>
            <Navbar />
        <main className="min-h-screen bg-page p-secao flex flex-col items-center justify-center gap-6">
            <h1 className="text-h1 text-titulo">Entrar</h1>

            {/* Container ou formulário para os botões */}
            <div className="flex flex-col gap-4 items-center bg-white p-6 rounded-card shadow-md">
                {/* Exemplo do botão grande */}
                <CustomButton variant="aprovar" size="grande">
                    Entrar
                </CustomButton>

                {/* Exemplo do botão médio */}
                <CustomButton variant="neutro" size="medio">
                    Voltar
                </CustomButton>
                 <CustomButton variant="reprovar" size="pequeno">
                    Teste
                </CustomButton>
            </div>
        </main>
    )</div>
    )
}

export default Login