import { useState, type FormEvent } from "react";
import { CustomButton } from "./CustomButton";

interface InviteCardProps {
    onValidate: () => void;
}

export default function InviteCard({ onValidate }: InviteCardProps) {
    const [codigo, setCodigo] = useState("");

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        console.log({ codigo });

        // Aqui deve ficar a validação com o backend, mas por enquanto só chamamos a função de callback
        onValidate();
    }

    return (
        <div className="w-full max-w-md rounded-xl border border-sutil bg-white p-8">
            <h2 className="mb-2 text-2xl font-bold">
                Aceitar convite
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                <div>
                    <label
                        htmlFor="codigo"
                        className="mb-1 block text-sm font-medium text-secundario"
                    >
                        Código do convite
                    </label>

                    <input
                        id="codigo"
                        type="text"
                        placeholder="Digite seu código de convite"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    />
                </div>

                <CustomButton
                    type="submit"
                    variant="aprovar"
                    size="grande"
                >
                    Validar código
                </CustomButton>

                <span
                    className="font-medium text-acento"
                >
                    Veio pelo link do e-mail? O código já vem preenchido.
                </span>

            </form>
        </div>
    );
}