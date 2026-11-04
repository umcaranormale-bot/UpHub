import { Link, useSearchParams } from "react-router-dom";
import ResetPasswordCard from "../components/ResetPasswordCard";
import AuthLayout from "../layouts/AuthLayout";

function ResetPasswordPage() {
    //Token apenas para teste, depois será pego da URL.
    const token = "token-teste-123";
    
    //const [searchParams] = useSearchParams();
    //const token = searchParams.get("token");

    if (!token) {
        return (
            <AuthLayout>
                <div className="rounded-card border border-sutil bg-card p-8">
                    <h1 className="text-h3 font-semibold text-titulo">
                        Link inválido
                    </h1>

                    <p className="mt-2 text-corpo text-secundario">
                        Não encontramos um token de recuperação na URL.
                        Solicite um novo link.
                    </p>
                    <Link
                        to="/recuperar-senha"
                        className="mt-4 inline-block text-corpo font-medium text-acento hover:underline"
                    >
                        Solicitar novo link
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <ResetPasswordCard token={token} />
        </AuthLayout>
    );
}
export default ResetPasswordPage;