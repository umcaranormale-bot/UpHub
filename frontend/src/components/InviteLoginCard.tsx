import { useState, type FormEvent } from "react";
import { CustomButton } from "./CustomButton";

export default function InviteLoginCard() {
    const [nome, setNome] = useState("");
    const [senha, setSenha] = useState("");

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        console.log({ nome, senha });
    }

    return (
        <div className="w-full max-w-md rounded-xl border border-sutil bg-white p-8">
            <h2 className="mb-2 text-2xl font-bold">
                Convite encontrado
            </h2>
            <span
                className="mt-3 text-corpo text-secundario"
            >
                Crie sua senha para entrar no UpHub com o papel abaixo.
            </span>
            <div className="flex w-full my-3 p-5 bg-violet-100 border-2 border-acento rounded-lg items-center justify-between">
                <div className="gap-2">
                    <h2 className="text-rotulo font-base">Órgão de Fomento PE</h2>
                    <p className="block text-legenda font-medium text-secundario">
                        claudia.rangel@consultoria.com.br
                    </p>
                </div>
                <span
                    className="font-bold text-legenda text-acento"
                >
                    Avaliador
                </span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label
                        htmlFor="email"
                        className="mb-1 block text-sm font-medium text-secundario"
                    >
                        Nome completo
                    </label>

                    <input
                        id="nome"
                        type="nome"
                        placeholder="Digite seu nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                </div>

                <div>
                    <label
                        htmlFor="senha"
                        className="mb-1 block text-sm font-medium text-secundario"
                    >
                        Crie uma senha
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
                    Criar senha e entrar
                </CustomButton>
            </form>
        </div>
    );
}