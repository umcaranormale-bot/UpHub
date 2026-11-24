import ConfirmEmailCard from "../components/ConfirmEmailCard";
import AuthLayout from "../layouts/AuthLayout";

/** Confirmar e-mail — rota /confirmar-email (tela 51 do Figma). */
function ConfirmEmailPage() {
    return (
        <AuthLayout>
            <ConfirmEmailCard />
        </AuthLayout>
    );
}

export default ConfirmEmailPage;
