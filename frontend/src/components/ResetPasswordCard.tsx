
import { useState } from "react";
import { Link } from "react-router-dom";
import { CustomButton } from "./CustomButton";

interface ResetPasswordCardProps {
    token: string;
}

export default function ResetPasswordCard({
    token,
}: ResetPasswordCardProps) {
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const inputClasses =
        "w-full rounded-card border border-sutil bg-card px-4 py-3 text-corpo text-titulo outline-none transition focus:border-acento focus:ring-1 focus:ring-acento";

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (senha.length < 8) {
            setError("A senha deve ter pelo menos 8 caracteres.");
            return;
        }

        if (senha !== confirmarSenha) {
            setError("As senhas não coincidem.");
            return;
        }

        const dados = {
            token,
            senha,
        };

        // Futuramente, enviar os dados para o backend.
        console.log("Dados para redefinição:", dados);

        // Simulação de sucesso.
        setSuccess(true);
        setSenha("");
        setConfirmarSenha("");
    }

    return (
        <section className="w-full max-w-md rounded-modal border border-sutil bg-card p-8 shadow-sm">

            {success ? (
                /* Confirmação de sucesso */
                <div className="flex flex-col items-center text-center">

                    <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-acento-suave">
                        <span className="text-3xl font-bold text-acento">
                            ✓
                        </span>
                    </div>

                    <h1 className="text-h1 font-bold text-titulo">
                        Senha alterada!
                    </h1>

                    <p className="mt-3 text-corpo text-secundario">
                        Sua senha foi redefinida com sucesso.
                        Agora você já pode acessar sua conta
                        utilizando a nova senha.
                    </p>

                    <CustomButton
                        type="button"
                        variant="aprovar"
                        size="grande"
                        className="mt-6 w-full"
                        onClick={() => {
                            window.location.href = "/entrar";
                        }}
                    >
                        Ir para o login
                    </CustomButton>

                </div>
            ) : (
                <>
                    {/* Cabeçalho */}
                    <div className="mb-6">
                        <h1 className="text-h3 font-bold text-titulo">
                            Criar nova senha
                        </h1>

                        <p className="mt-3 text-corpo text-secundario">
                            Escolha uma nova senha para acessar sua conta.
                        </p>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="space-y-2">
                            <label
                                htmlFor="senha"
                                className="text-corpo text-secundario"
                            >
                                Nova senha
                            </label>

                            <input
                                id="senha"
                                type="password"
                                value={senha}
                                onChange={(event) => {
                                    setSenha(event.target.value);
                                    setError("");
                                }}
                                placeholder="Digite sua nova senha"
                                className={inputClasses}
                                minLength={8}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="confirmarSenha"
                                className="text-corpo text-secundario"
                            >
                                Confirmar nova senha
                            </label>

                            <input
                                id="confirmarSenha"
                                type="password"
                                value={confirmarSenha}
                                onChange={(event) => {
                                    setConfirmarSenha(event.target.value);
                                    setError("");
                                }}
                                placeholder="Confirme sua nova senha"
                                className={inputClasses}
                                minLength={8}
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-sm font-medium text-red-600" role="alert">
                                {error}
                            </p>
                        )}

                        <CustomButton
                            type="submit"
                            variant="aprovar"
                            size="grande"
                            className="w-full"
                        >
                            Salvar nova senha
                        </CustomButton>
                    </form>

                    <p className="mt-4 text-legenda text-secundario">
                        Mínimo de 8 caracteres. Depois de salvar, o link deixa de
                        funcionar e você poderá entrar com a senha nova.
                    </p>

                    <div className="mt-4">
                        <Link
                            to="/entrar"
                            className="text-corpo font-medium text-acento hover:underline"
                        >
                            Voltar para o login
                        </Link>
                    </div>
                </>
            )}
        </section>
    );
}
