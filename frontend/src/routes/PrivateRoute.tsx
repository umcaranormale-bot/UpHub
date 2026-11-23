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
        if (!sessao) {
            verificarSessao();
        }
    }, [sessao, verificarSessao]);

    if (carregando) {
        return null;
    }

    if (!sessao) {
        return <Navigate to="/entrar" replace />;
    }

    return <Outlet />;
}