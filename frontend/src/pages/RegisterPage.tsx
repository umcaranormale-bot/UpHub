
import { useState } from "react";
import RegisterCard from "../components/RegisterCard";
import AccountTypeSelector from "../components/AccountTypeSelector";
import { CustomButton } from "../components/CustomButton";

const accountTypes = [
    {
        value: "candidato",
        label: "Candidato",
        description:
            "Pessoa que busca vagas, residências e oportunidades em nome próprio",
    },
    {
        value: "empresa",
        label: "Empresa",
        description:
            "Empresa ou startup que busca editais e investimento",
    },
    {
        value: "estudante",
        label: "Estudante de Squad",
        description:
            "Time de estudantes que concorre a desafios de formação",
    },
    {
        value: "provedor",
        label: "Provedor",
        description:
            "Publica editais, programas e desafios",
        requiresApproval: true,
    },
];

function RegisterPage() {
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
    });

    const [accountType, setAccountType] = useState("");
    const [error, setError] = useState("");

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (formData.senha !== formData.confirmarSenha) {
            setError("As senhas não coincidem.");
            return;
        }

        if (!accountType) {
            setError("Selecione o seu perfil.");
            return;
        }

        const cadastro = {
            nome: formData.nome,
            email: formData.email,
            senha: formData.senha,
            tipoConta: accountType,
        };

        console.log(cadastro);
    }

    function handleCancel() {
        setFormData({
            nome: "",
            email: "",
            senha: "",
            confirmarSenha: "",
        });
        setAccountType("");
        setError("");
    }

    return (
        <main className="min-h-screen bg-page p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-5">
                    <h1 className="text-h1 font-bold text-titulo">
                        Criar conta
                    </h1>

                    <p className="mt-2 max-w-xl text-corpo text-secundario">
                        A conta é pessoal. O papel vem da organização em que você atua,
                        e dá para ter mais de um vínculo depois.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,2.8fr)_minmax(220px,1fr)]">

                        {/* Coluna principal */}
                        <div className="space-y-4">
                            <RegisterCard
                                formData={formData}
                                onChange={setFormData}
                            />

                            <AccountTypeSelector
                                options={accountTypes}
                                value={accountType}
                                onChange={setAccountType}
                            />
                        </div>

                        {/* Barra lateral */}
                        <aside className="space-y-3">
                            <div className="rounded-card border border-pervinca/20 bg-acento-suave p-4">
                                <h3 className="mb-2 text-rotulo font-semibold text-acento">
                                    Mentor, avaliador e gestão não se cadastram
                                </h3>

                                <p className="mb-3 text-legenda text-secundario">
                                    Mentor e avaliador entram pelo convite de quem
                                    publicou a oportunidade. A gestão do Porto Digital
                                    é conta interna. Os três acessam só pela tela de entrar.
                                </p>

                                
                                {/*Definir rota para a tela de convite*/}
                                <CustomButton variant="aprovar" size="grande" to="/">
                                    Recebi um convite
                                </CustomButton>
                            </div>

                            <div className="rounded-card border border-orange-200 bg-orange-50 p-4">
                                <h3 className="mb-2 text-rotulo font-semibold text-orange-900">
                                    Provedor passa por aprovação
                                </h3>

                                <p className="text-legenda text-orange-900/80">
                                    Você cria a conta e cadastra a organização na hora,
                                    mas a permissão de publicar só é liberada depois
                                    que a gestão do Porto Digital conferir os dados.
                                    Enquanto isso, a conta fica em análise.
                                </p>
                            </div>
                        </aside>
                    </div>

                    {/* Ações */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <CustomButton
                            type="submit"
                            variant="aprovar"
                            size="medio"
                        >
                            Cadastrar
                        </CustomButton>

                        <CustomButton

                            to="/"
                            type="button"
                            variant="neutro"
                            size="medio"
                            onClick={handleCancel}
                        >
                            Cancelar
                        </CustomButton>
                    </div>

                    {error && (
                        <p className="mt-3 text-sm font-medium text-red-600" role="alert">
                            {error}
                        </p>
                    )}
                </form>
            </div>
        </main>
    );
}

export default RegisterPage;