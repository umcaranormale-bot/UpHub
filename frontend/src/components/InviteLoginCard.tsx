
import { useState, type FormEvent } from "react";
import { CustomButton } from "./CustomButton";
import { aceitarConvite, type ConviteRecebido } from "../api/convites";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { routeByPaper } from "../utils/RoutesByLink";
import { mensagemDeErro } from "../api/erros";
import { ErroApi } from "../api/cliente";

interface InviteLoginCardProps {
    convite: ConviteRecebido;
    codigo: string;
}

export default function InviteLoginCard({
    convite,
    codigo
}: InviteLoginCardProps) {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [nome, setNome] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setCarregando(true);
        setErro("");

        try {
            await aceitarConvite(
                codigo,
                senha,
                convite.contaExistente ? undefined : nome
            );
        } catch (error) {
            console.error("Erro ao aceitar convite:", error);
            setErro(mensagemDeErro(error));
            setCarregando(false);
            return;
        }

        // 2. Logar: o convite já foi aceito, então nunca prende a pessoa aqui
        try {
            await login(convite.email, senha);
            navigate(routeByPaper(convite.papel), { replace: true });
        } catch (error) {
            console.error("Convite aceito, mas o login falhou:", error);

            if (error instanceof ErroApi && error.status === 403) {
                navigate("/confirmar-email", {
                    replace: true,
                    state: { email: convite.email },
                });
                return;
            }

            navigate("/entrar", {
                replace: true,
                state: {
                    aviso: "Seu convite foi aceito! Entre com seu e-mail e senha para continuar.",
                },
            });
        }
    }

    return (
        <div className="w-full max-w-md rounded-xl border border-sutil bg-white p-8">
            <h2 className="mb-2 text-2xl font-bold">
                Convite encontrado
            </h2>

            <span className="mt-3 text-corpo text-secundario">
                {convite.contaExistente
                    ? "Entre com sua senha para aceitar o convite."
                    : "Crie sua senha para entrar no UpHub com o papel abaixo."
                }
            </span>

            <div className="my-3 flex w-full items-center justify-between rounded-lg border-2 border-acento bg-violet-100 p-5">
                <div className="gap-2">
                    <h2 className="text-rotulo font-base">
                        {convite.organizacaoNome}
                    </h2>

                    <p className="block text-legenda font-medium text-secundario">
                        {convite.email}
                    </p>
                </div>

                <span className="font-bold text-legenda text-acento">
                    {convite.papel === "AVALIADOR"
                        ? "Avaliador"
                        : "Mentor"}
                </span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {!convite.contaExistente && (
                    <div>
                        <label
                            htmlFor="nome"
                            className="mb-1 block text-sm font-medium text-secundario"
                        >
                            Nome completo
                        </label>

                        <input
                            id="nome"
                            type="text"
                            placeholder="Digite seu nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                            disabled={carregando}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        />
                    </div>
                )}

                <div>
                    <label
                        htmlFor="senha"
                        className="mb-1 block text-sm font-medium text-secundario"
                    >
                        {convite.contaExistente
                            ? "Sua senha"
                            : "Crie uma senha"}
                    </label>

                    <input
                        id="senha"
                        type="password"
                        placeholder="Digite sua senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        disabled={carregando}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                </div>

                {erro && (
                    <p className="text-sm text-red-600">
                        {erro}
                    </p>
                )}

                <CustomButton
                    type="submit"
                    variant="aprovar"
                    size="grande"
                    disabled={carregando}
                    className="mt-2 w-full"
                >
                    {carregando
                        ? "Processando..."
                        : convite.contaExistente
                            ? "Entrar e aceitar convite"
                            : "Criar senha e entrar"}
                </CustomButton>

            </form>
        </div>
    );
}