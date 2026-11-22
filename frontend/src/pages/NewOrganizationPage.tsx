import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AccountTypeSelector, {
  type AccountTypeOption,
} from "../components/AccountTypeSelector";

type OrganizationForm = {
  name: string;
  cnpj: string;
  sector: string;
  description: string;
};

const organizationOptions: AccountTypeOption[] = [
  {
    value: "empresa",
    label: "Empresa",
    description: "Empresa estabelecida que concorre a editais de fomento.",
    group: "candidate",
  },
  {
    value: "startup",
    label: "Startup",
    description: "Concorre a fomento e investimento. Tem descrição de deck.",
    group: "candidate",
  },
  {
    value: "squad",
    label: "Squad",
    description: "Time da residência que concorre aos desafios de formação.",
    group: "candidate",
  },
  {
    value: "orgao-fomento",
    label: "Órgão de fomento",
    description: "Publica editais com recurso público.",
    group: "provider",
    requiresApproval: true,
  },
  {
    value: "investidor",
    label: "Investidor",
    description: "Publica oportunidades com tese de investimento.",
    group: "provider",
    requiresApproval: true,
  },
  {
    value: "aceleradora",
    label: "Aceleradora",
    description: "Publica programas de aceleração.",
    group: "provider",
    requiresApproval: true,
  },
  {
    value: "empresa-parceira",
    label: "Empresa parceira",
    description: "Propõe desafios na residência.",
    group: "provider",
    requiresApproval: true,
  },
];

export default function NewOrganizationPage() {
  const navigate = useNavigate();

  const [organizationType, setOrganizationType] = useState("startup");

  const [form, setForm] = useState<OrganizationForm>({
    name: "",
    cnpj: "",
    sector: "",
    description: "",
  });

  const handleChange = (
    field: keyof OrganizationForm,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const organization = {
      type: organizationType,
      ...form,
    };

    console.log("Nova organização:", organization);
  };

  return (
    <main className="min-w-0 flex-1 bg-page p-5 lg:p-7">
      <form onSubmit={handleSubmit} className="mx-auto max-w-275">
        {/* Cabeçalho */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-titulo">
              Nova organização
            </h1>

            <p className="mt-1 text-xs text-secundario">
              O tipo decide o papel: quem se candidata ou quem oferece oportunidades.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-md border border-sutil bg-card px-4 py-2.5 text-xs hover:bg-page"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-md bg-acento px-4 py-2.5 text-xs font-medium text-white transition-colors hover:opacity-90"
            >
              Criar organização
            </button>
          </div>
        </div>

        {/* Tipo da organização */}
        <AccountTypeSelector
          options={organizationOptions}
          value={organizationType}
          onChange={setOrganizationType}
        />

        {/* Dados da organização */}
        <section className="mt-4 rounded-card border border-sutil bg-card p-4">
          <h2 className="mb-4 text-sm font-semibold text-titulo">
            Dados
          </h2>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {/* Nome */}
            <div>
              <label
                htmlFor="organization-name"
                className="mb-1.5 block text-xs font-medium text-titulo"
              >
                Nome
              </label>

              <input
                id="organization-name"
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nome da organização"
                required
                className="h-10 w-full rounded-md border border-sutil bg-card px-3 text-xs outline-none transition focus:border-acento focus:ring-1 focus:ring-acento"
              />
            </div>

            {/* CNPJ */}
            <div>
              <label
                htmlFor="organization-cnpj"
                className="mb-1.5 block text-xs font-medium text-titulo"
              >
                CNPJ
              </label>

              <input
                id="organization-cnpj"
                type="text"
                value={form.cnpj}
                onChange={(e) => handleChange("cnpj", e.target.value)}
                placeholder="00.000.000/0000-00"
                className="h-10 w-full rounded-md border border-sutil bg-card px-3 text-xs outline-none transition focus:border-acento focus:ring-1 focus:ring-acento"
              />
            </div>

            {/* Setor */}
            <div>
              <label
                htmlFor="organization-sector"
                className="mb-1.5 block text-xs font-medium text-titulo"
              >
                Setor
              </label>

              <input
                id="organization-sector"
                type="text"
                value={form.sector}
                onChange={(e) => handleChange("sector", e.target.value)}
                placeholder="Tecnologia da informação"
                className="h-10 w-full rounded-md border border-sutil bg-card px-3 text-xs outline-none transition focus:border-acento focus:ring-1 focus:ring-acento"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="mt-4">
            <label
              htmlFor="organization-description"
              className="mb-1.5 block text-xs font-medium text-titulo"
            >
              Descrição
            </label>

            <textarea
              id="organization-description"
              value={form.description}
              onChange={(e) =>
                handleChange("description", e.target.value)
              }
              placeholder="Conte o que a organização faz, para quem e em que área."
              rows={4}
              className="w-full resize-y rounded-md border border-sutil bg-card px-3 py-2 text-xs leading-relaxed outline-none transition focus:border-acento focus:ring-1 focus:ring-acento"
            />
          </div>
        </section>

        {/* Informação da API */}
        <p className="mt-4 wrap-break-words text-[10px] leading-relaxed text-secundario">
          API: POST /api/organizacoes (tipo, nome, razaoSocial, cnpj,
          porte, setor, estagio, anoFundacao, sedeCidade, sedeUf,
          descricao, papel). POST /api/solicitacoes-provedor
          (tipo do lado provedor).
        </p>
      </form>
    </main>
  );
}