import { useState, type FormEvent } from "react";
import { CustomButton } from "./CustomButton";
import { validarConvite, type ConviteRecebido } from "../api/convites";

interface InviteCardProps {
    onValidate: (convite: ConviteRecebido, codigo: string) => void;
}

export default function InviteCard({ onValidate }: InviteCardProps) {
    const [codigo, setCodigo] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        try {
            setCarregando(true);
            setErro("");

            const resposta = await validarConvite(codigo.trim());

            onValidate(resposta, codigo.trim());

        } catch (error) {
            console.error(error);

            setErro(
                error instanceof Error
                    ? error.message
                    : "Código de convite inválido ou expirado."
            );
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="w-full max-w-md rounded-xl border border-sutil bg-white p-8">
            <h2 className="mb-2 text-2xl font-bold">
                Aceitar convite
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                <div>
                    <label htmlFor="codigo" className="mb-1 block text-sm font-medium text-secundario">
                        Código do convite
                    </label>

                    <input
                        id="codigo"
                        type="text"
                        placeholder="Digite seu código de convite"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
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
                >
                    {carregando ? "Validando..." : "Validar código"}
                </CustomButton>

                <span className="font-medium text-acento">
                    Veio pelo link do e-mail? O código já vem preenchido.
                </span>
            </form>
        </div>
    );
}