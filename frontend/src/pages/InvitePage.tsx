import { useState } from "react";
import InviteCard from "../components/InviteCard";
import InviteLoginCard from "../components/InviteLoginCard";
import AuthLayout from "../layouts/AuthLayout";

function InvitePage() {
    const [inviteValidated, setInviteValidated] = useState(false);

    return (
        <AuthLayout>
            <div className="flex w-full flex-col items-center gap-6">
                <InviteCard onValidate={() => setInviteValidated(true)} />

                {inviteValidated && <InviteLoginCard />}
            </div>
        </AuthLayout>
    )
}

export default InvitePage;