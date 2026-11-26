
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CustomButton } from "./CustomButton";
import { useAuth } from "../contexts/AuthContext";
import { ErroApi } from "../api/cliente";
import { mensagemDeErro } from "../api/erros";
import { initialRoute } from "../utils/InitialRoute";

export default function LoginCard() {
    const location = useLocation();
    const aviso = (location.state as { aviso?: string } | null)?.aviso;

    const navigate = useNavigate();
    const { login } = useAuth();

    const [erro, setErro] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErro(null);
        setEnviando(true);

        try {
            // Realiza login e atualiza o AuthContext
            const resposta = await login(email, senha);

            // 0 vínculos: cria a organização; 1: área do papel; mais de 1: escolhe o vínculo
            navigate(initialRoute(resposta), { replace: true });

        } catch (e) {
            if (e instanceof ErroApi && e.status === 403) {
                navigate("/confirmar-email", {
                    state: { email }
                });
                return;
            }

            setErro(mensagemDeErro(e));

        } finally {
            setEnviando(false);
        }
    }

    return (
        <div className="w-full max-w-md rounded-xl border border-sutil bg-white p-8">
            <h2 className="mb-2 text-2xl font-bold">
                Entrar
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label
                        htmlFor="email"
                        className="mb-1 block text-sm font-medium text-secundario"
                    >
                        E-mail
                    </label>

                    <input
                        id="email"
                        type="email"
                        placeholder="Digite seu e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                </div>

                <div>
                    <label
                        htmlFor="senha"
                        className="mb-1 block text-sm font-medium text-secundario"
                    >
                        Senha
                    </label>

                    <input
                        id="senha"
                        type="password"
                        placeholder="Digite sua senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                </div>

                {erro ? (
                    <p role="alert" className="text-sm text-red-600">
                        {erro}
                    </p>
                ) : aviso && (
                    <p role="status" className="text-sm text-green-700">
                        {aviso}
                    </p>
                )}

                <CustomButton
                    type="submit"
                    variant="aprovar"
                    size="grande"
                    className="mt-2 w-full"
                    disabled={enviando}
                >
                    {enviando ? "Entrando..." : "Entrar"}
                </CustomButton>

                <div className="mt-4 flex items-center gap-2 text-sm">
                    <a
                        href="/recuperar-senha"
                        className="text-acento hover:text-indigo-600 transition-colors"
                    >
                        Esqueceu sua senha?
                    </a>

                    <span className="text-acento">⋅</span>

                    <a
                        href="/cadastro"
                        className="font-medium text-acento hover:text-indigo-700 transition-colors"
                    >
                        Criar conta
                    </a>
                </div>
            </form>
        </div>
    );
}