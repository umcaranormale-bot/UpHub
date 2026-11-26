import { Navigate, useLocation } from "react-router-dom";
import ConfirmEmailCard from "../components/ConfirmEmailCard";
import AuthLayout from "../layouts/AuthLayout";

function ConfirmEmailPage() {
    const location = useLocation();
    const email = location.state?.email;

    if (!email) {
        return <Navigate to="/cadastro" replace />;
    }

    return (
        <AuthLayout>
            <div className="flex min-h-screen items-center justify-center bg-page p-4">
                <ConfirmEmailCard email={email} />
            </div>
        </AuthLayout>
    );
}

export default ConfirmEmailPage;