
import { useState } from "react";
import { Link } from "react-router-dom";
import { CustomButton } from "./CustomButton";

export default function RecoverPasswordCard() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // Futuramente, aqui será feita a chamada para a API.
        console.log("Solicitação de recuperação para:", email);

        setSubmitted(true);
    }

    return (
        <section className="w-full max-w-md rounded-modal border border-sutil bg-card p-8 shadow-sm">

            {!submitted ? (
                <>
                    {/* Cabeçalho */}
                    <div className="mb-3">
                        <h1 className="text-h3 font-bold text-titulo">
                            Esqueci minha senha
                        </h1>

                        <p className="mt-3 text-corpo text-secundario">
                            Informe o e-mail da sua conta. Enviamos um link para você criar uma senha nova.
                        </p>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="mb-1 block text-sm font-medium text-secundario"
                            >
                                E-mail
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="seu@email.com"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                required
                            />
                        </div>

                        <CustomButton
                            type="submit"
                            variant="aprovar"
                            size="grande"
                            className="w-full"
                        >
                            Enviar instruções
                        </CustomButton>
                    </form>
                    <p className="mt-3 text-corpo text-secundario">
                        Por segurança, a resposta é a mesma exista ou não uma conta com esse e-mail. O link vale 1 hora e só pode ser usado uma vez.
                    </p>

                    {/* Voltar para login */}
                    <div className="mt-4">
                        <Link
                            to="/entrar"
                            className="text-corpo font-medium text-acento hover:underline"
                        >
                            Voltar para o login
                        </Link>
                    </div>
                </>
            ) : (
                <>
                    {/* Confirmação */}
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-acento-suave">
                            <span className="text-2xl text-acento">
                                ✓
                            </span>
                        </div>

                        <h1 className="text-h1 font-bold text-titulo">
                            Verifique seu e-mail
                        </h1>

                        <p className="mt-3 text-corpo text-secundario">
                            Se existir uma conta associada a este endereço,
                            você receberá as instruções para redefinir sua senha.
                        </p>

                        <p className="mt-3 break-all font-semibold text-titulo">
                            {email}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <CustomButton
                            type="button"
                            variant="aprovar"
                            size="grande"
                            className="w-full"
                            onClick={() => {
                                setSubmitted(false);
                                setEmail("");
                            }}
                        >
                            Tentar outro e-mail
                        </CustomButton>

                        <div className="text-center">
                            <Link
                                to="/entrar"
                                className="text-corpo font-medium text-acento hover:underline"
                            >
                                Voltar para o login
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}