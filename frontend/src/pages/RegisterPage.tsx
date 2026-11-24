
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import RegisterCard from "../components/RegisterCard";
import { CustomButton } from "../components/CustomButton";
import { cadastrarPessoa } from "../api/pessoas";
import { ErroApi } from "../api/cliente";

function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = new FormData(event.currentTarget);

        const nome = String(form.get("nome") ?? "");
        const email = String(form.get("email") ?? "");
        const senha = String(form.get("senha") ?? "");
        const confirmarSenha = String(form.get("confirmarSenha") ?? "");

        setError(null);

        if (senha !== confirmarSenha) {
            setError("As senhas não coincidem.");
            return;
        }

        setLoading(true);

        try {
            const pessoa = await cadastrarPessoa({
                nome,
                email,
                senha,
            });

            navigate("/confirmar-email", {
                state: { email: pessoa.email },
            });

        } catch (e) {
            if (e instanceof ErroApi) {
                setError(e.message);
            } else {
                setError("Não foi possível falar com o servidor. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        setFormData({
            nome: "",
            email: "",
            senha: "",
            confirmarSenha: "",
        });

        setError(null);
    }

    return (
        <main className="min-h-screen bg-page p-4 md:p-8">
            <div className="mx-auto max-w-7xl">

                {/* Cabeçalho */}
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

                            {/* Mensagem de erro */}
                            {error && (
                                <p
                                    className="mt-3 text-sm font-medium text-red-600"
                                    role="alert"
                                >
                                    {error}
                                </p>
                            )}

                            {/* Ações */}
                            <div className="mt-0 flex flex-wrap items-center gap-3">
                                <CustomButton
                                    type="submit"
                                    variant="aprovar"
                                    size="medio"
                                    disabled={loading}
                                >
                                    {loading ? "Enviando..." : "Cadastrar"}
                                </CustomButton>

                                <CustomButton
                                    to="/"
                                    type="button"
                                    variant="neutro"
                                    size="medio"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancelar
                                </CustomButton>
                            </div>

                        </div>

                        {/* Barra lateral */}
                        <aside className="space-y-3">
                            <div className="rounded-card border border-pervinca/20 bg-acento-suave p-4">
                                <h3 className="mb-2 text-corpo font-semibold text-acento">
                                    Mentor, avaliador e gestão não se cadastram
                                </h3>

                                <p className="mb-3 text-rotulo text-secundario">
                                    Mentor e avaliador entram pelo convite de quem
                                    publicou a oportunidade. A gestão do Porto Digital
                                    é conta interna. Os três acessam só pela tela de entrar.
                                </p>

                                <CustomButton
                                    variant="aprovar"
                                    size="grande"
                                    to="/convite"
                                >
                                    Recebi um convite
                                </CustomButton>
                            </div>

                            <div className="rounded-card border border-orange-200 bg-orange-50 p-4">
                                <h3 className="mb-2 text-corpo font-semibold text-orange-900">
                                    Provedor passa por aprovação
                                </h3>

                                <p className="text-rotulo text-orange-900/80">
                                    Você cria a conta e cadastra a organização na hora,
                                    mas a permissão de publicar só é liberada depois
                                    que a gestão do Porto Digital conferir os dados.
                                    Enquanto isso, a conta fica em análise.
                                </p>
                            </div>
                        </aside>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default RegisterPage;
