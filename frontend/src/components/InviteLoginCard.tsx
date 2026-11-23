
import { useState, type FormEvent } from "react";
import { CustomButton } from "./CustomButton";
import {aceitarConvite,type ConviteRecebido} from "../api/convites";

interface InviteLoginCardProps {
    convite: ConviteRecebido;
    codigo: string;
}

export default function InviteLoginCard({
    convite,
    codigo
}: InviteLoginCardProps) {
    const [nome, setNome] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setCarregando(true);
            setErro("");

            await aceitarConvite(
                codigo,
                senha,
                convite.contaExistente ? undefined : nome
            );

            // O token já foi salvo por aceitarConvite.
            window.location.href = "/";

        } catch (error) {
            console.error("Erro ao aceitar convite:", error);

            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível aceitar o convite."
            );
        } finally {
            setCarregando(false);
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
