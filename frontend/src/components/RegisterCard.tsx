interface RegisterCardProps {
  formData: {
    nome: string;
    email: string;
    senha: string;
    confirmarSenha: string;
  };
  onChange: (data: RegisterCardProps["formData"]) => void;
}

export default function RegisterCard({
  formData,
  onChange,
}: RegisterCardProps) {
  const inputClasses =
    "w-full rounded-md border border-sutil bg-card px-3 py-2 text-corpo text-titulo outline-none transition focus:border-acento focus:ring-1 focus:ring-acento";

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    onChange({
      ...formData,
      [name]: value,
    });
  }

  return (
    <section className="rounded-card border border-sutil bg-card p-card">
      <h2 className="mb-4 font-semibold text-titulo">
        Seus dados
      </h2>

      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="nome" className="text-rotulo text-secundario">
            Nome completo
          </label>
          <input
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Digite seu nome"
            className={inputClasses}
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-rotulo text-secundario">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            className={inputClasses}
            required
          />
          <p className="text-legenda text-secundario">
            Depois de criar a conta, confirme o e-mail em Minha conta.
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="senha" className="text-rotulo text-secundario">
            Senha
          </label>
          <input
            id="senha"
            name="senha"
            type="password"
            value={formData.senha}
            onChange={handleChange}
            placeholder="Digite sua senha"
            className={inputClasses}
            minLength={8}
            required
          />
          <p className="text-legenda text-secundario">
            Mínimo de 8 caracteres, com letra e número.
          </p>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="confirmarSenha"
            className="text-rotulo text-secundario"
          >
            Confirmar senha
          </label>
          <input
            id="confirmarSenha"
            name="confirmarSenha"
            type="password"
            value={formData.confirmarSenha}
            onChange={handleChange}
            placeholder="Confirme sua senha"
            className={inputClasses}
            required
          />
        </div>
      </div>
    </section>
  );
}