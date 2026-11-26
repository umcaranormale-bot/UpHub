import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { initialRoute } from "../utils/InitialRoute";

export default function PublicOnlyRoute() {
    const { sessao, carregando, sessaoVerificada, verificarSessao } = useAuth();

    useEffect(() => {
        if (!sessao && !sessaoVerificada) {
            verificarSessao();
        }
    }, [sessao, sessaoVerificada, verificarSessao]);

    if (carregando || !sessaoVerificada) {
        return null;
    }

    if (sessao) {
        return <Navigate to={initialRoute(sessao)} replace />;
    }

    return <Outlet />;
}