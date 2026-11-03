
import { useState, type FormEvent } from "react";
import { CustomButton } from "./Botao";

export default function LoginCard() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        console.log({ email, senha });
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
                <CustomButton
                    type="submit"
                    variant="aprovar"
                    size="grande"
                    className="w-full mt-2"
                >
                    Entrar
                </CustomButton>
                {/* Espaço para links de recuperação de senha e criação de conta*/}
                <div className="mt-4 flex items-center gap-2 text-sm">
                    <a
                        href="/recuperar-senha"
                        className="text-acento hover:text-indigo-600 transition-colors"
                    >
                        Esqueceu sua senha?
                    </a>
                    <a className="text-acento">⋅</a>

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