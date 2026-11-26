import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CustomButton } from "./CustomButton";
import { confirmarEmail, reenviarCodigo } from "../api/confirmacaoEmail";
import { mensagemDeErro } from "../api/erros";

type ConfirmEmailCardProps = {
    email: string;
};

export default function ConfirmEmailCard({ email }: ConfirmEmailCardProps) {
    const [codigo, setCodigo] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reenviando, setReenviando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        try {
            setLoading(true);

            await confirmarEmail(email, codigo);

            setSubmitted(true);
        } catch (e) {
            setError(mensagemDeErro(e));
        } finally {
            setLoading(false);
        }
    }

    async function handleResendCode() {
        setError(null);
        setSuccess(null);

        try {
            setReenviando(true);

            await reenviarCodigo(email);

            setSuccess("Um novo código foi enviado para seu e-mail.");
        } catch (e) {
            setError(mensagemDeErro(e));
        } finally {
            setReenviando(false);
        }
    }

    return (
        <section className="w-full max-w-md rounded-modal border border-sutil bg-card p-6 shadow-sm">

            {!submitted ? (
                <>
                    {/* Cabeçalho */}
                    <div className="mb-4">
                        <h1 className="text-h3 font-bold text-titulo">
                            Confirme seu e-mail
                        </h1>

                        <p className="mt-3 text-corpo text-secundario">
                            Enviamos um código de 6 dígitos para{" "}
                            <span className="font-medium text-titulo break-all">
                                {email}
                            </span>.
                            Sem confirmar o e-mail, não é possível entrar no UpHub.
                        </p>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-1">
                            <label
                                htmlFor="codigo"
                                className="block text-sm font-medium text-secundario"
                            >
                                Código de confirmação
                            </label>

                            <input
                                id="codigo"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={codigo}
                                onChange={(event) =>
                                    setCodigo(event.target.value.replace(/\D/g, ""))
                                }
                                placeholder="Digite o código"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                required
                            />
                        </div>

                        {error && (
                            <p role="alert" className="text-sm text-red-600">
                                {error}
                            </p>
                        )}

                        {success && (
                            <p role="status" className="text-sm text-green-600">
                                {success}
                            </p>
                        )}

                        <CustomButton
                            type="submit"
                            variant="aprovar"
                            size="grande"
                            className="w-full"
                            disabled={loading || codigo.length !== 6}
                        >
                            {loading ? "Confirmando..." : "Confirmar e entrar"}
                        </CustomButton>
                    </form>

                    {/* Informações do código */}
                    <p className="mt-3 text-xs text-secundario">
                        O código vale 24 horas e aceita até 5 tentativas.
                    </p>

                    {/* Reenvio do código */}
                    <p className="mt-1 text-xs text-secundario">
                        Ao reenviar, o código anterior deixa de valer.{" "}
                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={reenviando || loading}
                            className="font-medium text-acento hover:underline disabled:opacity-50"
                        >
                            {reenviando ? "Reenviando..." : "Reenviar código"}
                        </button>
                    </p>

                    {/* Voltar para login */}
                    <div className="mt-4">
                        <Link
                            to="/entrar"
                            className="text-xs font-medium text-acento hover:underline"
                        >
                            Voltar para login
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

                        <h1 className="text-h3 font-bold text-titulo">
                            E-mail confirmado!
                        </h1>

                        <p className="mt-3 text-corpo text-secundario">
                            Seu e-mail foi confirmado com sucesso. Agora você já pode acessar sua conta.
                        </p>

                        <p className="mt-3 break-all font-semibold text-titulo">
                            {email}
                        </p>
                    </div>

                    {/* Acessar conta */}
                    <div className="space-y-4">
                        <Link to="/entrar" className="block">
                            <CustomButton
                                type="button"
                                variant="aprovar"
                                size="grande"
                                className="w-full"
                            >
                                Ir para o login
                            </CustomButton>
                        </Link>
                    </div>
                </>
            )}
        </section>
    );
}
