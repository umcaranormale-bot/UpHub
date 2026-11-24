import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute() {
    const {
        sessao,
        carregando,
        sessaoVerificada,
        verificarSessao,
    } = useAuth();

    useEffect(() => {
        if (!sessao && !sessaoVerificada) {
            verificarSessao();
        }
    }, [sessao, sessaoVerificada, verificarSessao]);

    if (carregando || !sessaoVerificada) {
        return null;
    }

    if (!sessao) {
        return <Navigate to="/entrar" replace />;
    }

    return <Outlet />;
}