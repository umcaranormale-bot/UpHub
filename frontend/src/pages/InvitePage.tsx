import { useState } from "react";
import InviteCard from "../components/InviteCard";
import InviteLoginCard from "../components/InviteLoginCard";
import AuthLayout from "../layouts/AuthLayout";
import type { ConviteRecebido } from "../api/convites";

function InvitePage() {
    const [convite, setConvite] = useState<ConviteRecebido | null>(null);
    const [codigo, setCodigo] = useState("");

    function handleValidate(
        dados: ConviteRecebido,
        codigoValidado: string
    ) {
        setConvite(dados);
        setCodigo(codigoValidado);
    }

    return (
        <AuthLayout>
            <div className="flex w-full flex-col items-center gap-6">

                {!convite ? (
                    <InviteCard onValidate={handleValidate} />
                ) : (
                    <InviteLoginCard
                        convite={convite}
                        codigo={codigo}
                    />
                )}

            </div>
        </AuthLayout>
    );
}

export default InvitePage;
