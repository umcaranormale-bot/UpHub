import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AccountTypeSelector, {
  type AccountTypeOption,
} from "../components/AccountTypeSelector";
import { cadastrarOrganizacao, type TipoOrganizacao } from "../api/organizacoes";
import { mensagemDeErro } from "../api/erros";

const TIPOS_PROVEDOR: TipoOrganizacao[] = ["ORGAO_FOMENTO", "INVESTIDOR", "ACELERADORA", "EMPRESA_PARCEIRA"];

type OrganizationForm = {
  name: string;
  cnpj: string;
  sector: string;
  description: string;
};

const organizationOptions: AccountTypeOption[] = [
  {
    value: "EMPRESA",
    label: "Empresa",
    description: "Empresa estabelecida que concorre a editais de fomento.",
    group: "candidate",
  },
  {
    value: "STARTUP",
    label: "Startup",
    description: "Concorre a fomento e investimento. Tem descrição de deck.",
    group: "candidate",
  },
  {
    value: "SQUAD",
    label: "Squad",
    description: "Time da residência que concorre aos desafios de formação.",
    group: "candidate",
  },
  {
    value: "ORGAO_FOMENTO",
    label: "Órgão de fomento",
    description: "Publica editais com recurso público.",
    group: "provider",
    requiresApproval: true,
  },
  {
    value: "INVESTIDOR",
    label: "Investidor",
    description: "Publica oportunidades com tese de investimento.",
    group: "provider",
    requiresApproval: true,
  },
  {
    value: "ACELERADORA",
    label: "Aceleradora",
    description: "Publica programas de aceleração.",
    group: "provider",
    requiresApproval: true,
  },
  {
    value: "EMPRESA_PARCEIRA",
    label: "Empresa parceira",
    description: "Propõe desafios na residência.",
    group: "provider",
    requiresApproval: true,
  },
];

export default function NewOrganizationPage() {
  const navigate = useNavigate();

  const [organizationType, setOrganizationType] = useState("STARTUP");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);
    setEnviando(true);

    const tipo = organizationType as TipoOrganizacao;

    try {
      await cadastrarOrganizacao({
        tipo,
        nome: form.name.trim(),
        cnpj: form.cnpj.trim() || undefined,
        setor: form.sector.trim() || undefined,
        descricao: form.description.trim() || undefined,
      });

      // o vínculo novo só aparece na sessão depois de recarregar, por isso a página é recarregada
      const destino = TIPOS_PROVEDOR.includes(tipo)
        ? "/provedor"
        : tipo === "SQUAD" ? "/squad" : "/inicio";
      window.location.assign(destino);
    } catch (e) {
      setErro(mensagemDeErro(e));
      setEnviando(false);
    }
  };

  return (
    <main className="min-w-0 flex-1 bg-page lg:p-7">
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
              disabled={enviando}
              className="rounded-md bg-acento px-4 py-2.5 text-xs font-medium text-white transition-colors hover:opacity-90 disabled:opacity-60"
            >
              {enviando ? "Criando..." : "Criar organização"}
            </button>
          </div>
        </div>

        {erro && (
          <p role="alert" className="mb-4 text-sm font-medium text-red-600">
            {erro}
          </p>
        )}

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