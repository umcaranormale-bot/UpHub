
import { useState, type FormEvent } from "react";
import { CustomButton } from "./CustomButton";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ErroApi } from "../api/cliente";
import { mensagemDeErro } from "../api/erros";
import { useSessao } from "../sessao/contexto";


export default function LoginCard() {
    const navigate = useNavigate();
    // Quem vem da confirmação de e-mail chega com o e-mail preenchido e um aviso
    const recebido = useLocation().state as { email?: string; aviso?: string; de?: string } | null;
    const { entrar } = useSessao();
    const [erro, setErro] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

    const [email, setEmail] = useState(recebido?.email ?? "");
    const [senha, setSenha] = useState("");


    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro(null);
        setEnviando(true);
        try {
            const rota = await entrar(email, senha);
            // quem tentou abrir uma tela logada volta para ela (se tiver um perfil só)
            navigate(recebido?.de && rota !== '/entrar/vinculo' && rota !== '/conta/nova-organizacao' ? recebido.de : rota);
        } catch (e) {
            if (e instanceof ErroApi && e.status === 403) {
                navigate('/confirmar-email', { state: { email } });
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
                {recebido?.aviso && !erro && (
                    <p role="status" className="text-sm text-acento">
                        {recebido.aviso}
                    </p>
                )}
                {erro && (
                    <p role="alert" className="text-sm text-red-600">
                        {erro}
                    </p>
                )}
                <CustomButton
                    type="submit"
                    variant="aprovar"
                    size="grande"
                    className="w-full mt-2"
                    disabled={enviando}
                >
                    {enviando ? 'Entrando...' : 'Entrar'}
                </CustomButton>
                {/* Espaço para links de recuperação de senha e criação de conta*/}
                <div className="mt-4 flex items-center gap-2 text-sm">
                    <Link
                        to="/recuperar-senha"
                        className="text-acento hover:text-indigo-600 transition-colors"
                    >
                        Esqueceu sua senha?
                    </Link>
                    <span className="text-acento" aria-hidden="true">⋅</span>

                    <Link
                        to="/cadastro"
                        className="font-medium text-acento hover:text-indigo-700 transition-colors"
                    >
                        Criar conta
                    </Link>
                </div>
            </form>
        </div>
    );
}