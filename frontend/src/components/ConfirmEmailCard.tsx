import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CustomButton } from "./CustomButton";
import { confirmarEmail, reenviarCodigo } from "../api/confirmacaoEmail";
import { mensagemDeErro } from "../api/erros";

/**
 * Confirmar e-mail (tela 51 do Figma). Chega aqui quem acabou de criar a conta
 * ou tentou entrar sem confirmar: o e-mail vem no state da navegação ou em ?email=.
 */
export default function ConfirmEmailCard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [parametros] = useSearchParams();
    const emailRecebido =
        (location.state as { email?: string } | null)?.email ?? parametros.get("email") ?? "";

    const [email, setEmail] = useState(emailRecebido);
    const [codigo, setCodigo] = useState("");
    const [erro, setErro] = useState<string | null>(null);
    const [aviso, setAviso] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro(null);
        setAviso(null);
        setEnviando(true);
        try {
            await confirmarEmail(email.trim(), codigo.trim());
            navigate("/entrar", {
                state: { email: email.trim(), aviso: "E-mail confirmado. Entre com a sua senha." },
            });
        } catch (e) {
            setErro(mensagemDeErro(e));
        } finally {
            setEnviando(false);
        }
    }

    async function handleReenviar() {
        setErro(null);
        setAviso(null);
        if (!email.trim()) {
            setErro("Informe o e-mail da conta para reenviar o código.");
            return;
        }
        try {
            await reenviarCodigo(email.trim());
            setAviso("Enviamos um código novo. O anterior deixou de valer.");
        } catch (e) {
            setErro(mensagemDeErro(e));
        }
    }

    return (
        <section className="w-full max-w-md rounded-modal border border-sutil bg-card p-8 shadow-sm">
            <h1 className="text-h3 font-bold text-titulo">Confirme seu e-mail</h1>

            <p className="mt-3 text-corpo text-secundario">
                {emailRecebido ? (
                    <>Enviamos um código de 6 dígitos para <strong className="break-all">{emailRecebido}</strong>. </>
                ) : (
                    <>Informe o e-mail da conta e o código de 6 dígitos que enviamos. </>
                )}
                Sem confirmar o e-mail, não é possível entrar no Up Hub.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                {!emailRecebido && (
                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-medium text-secundario">
                            E-mail
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        />
                    </div>
                )}

                <div>
                    <label htmlFor="codigo" className="mb-1 block text-sm font-medium text-secundario">
                        Código de confirmação
                    </label>
                    <input
                        id="codigo"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 tracking-[0.3em] outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                </div>

                {erro && (
                    <p role="alert" className="text-sm text-red-600">
                        {erro}
                    </p>
                )}
                {aviso && (
                    <p role="status" className="text-sm text-acento">
                        {aviso}
                    </p>
                )}

                <CustomButton type="submit" variant="aprovar" size="grande" className="w-full" disabled={enviando}>
                    {enviando ? "Confirmando..." : "Confirmar e-mail"}
                </CustomButton>
            </form>

            <p className="mt-3 text-sm text-secundario">
                O código vale 24 horas e aceita até 5 tentativas. Ao reenviar, o código anterior deixa de valer.
            </p>

            <div className="mt-4 flex items-center gap-2 text-corpo">
                <Link to="/entrar" className="font-medium text-acento hover:underline">
                    Voltar para o login
                </Link>
                <span className="text-acento">·</span>
                <button type="button" onClick={handleReenviar} className="font-medium text-acento hover:underline">
                    Reenviar código
                </button>
            </div>
        </section>
    );
}
