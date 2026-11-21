import SelectLinkCard from "../components/SelectLinkCard";
import AuthLayout from "../layouts/AuthLayout";
import { useNavigate } from "react-router-dom";
import { routeByPaper } from "../utils/RoutesByLink";
import type { Vinculo } from "../api/vinculos";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

function LinkPage() {
    const { sessao } = useAuth();
    const navigate = useNavigate();

    function handleContinue(vinculo: Vinculo) {
        navigate(routeByPaper(vinculo.papel), { replace: true });
    }

    function handleOutraConta() {
        navigate("/entrar", { replace: true });
    }

    if (!sessao) {
        return null;
    }

    return (
        <AuthProvider>

            <AuthLayout>
                <SelectLinkCard
                    vinculos={sessao.vinculos}
                    onContinue={handleContinue}
                    onOutraConta={handleOutraConta}
                />
            </AuthLayout>
        </AuthProvider>
    );
}

export default LinkPage;