type AccountTypeGroup = "candidate" | "provider";

export interface AccountTypeOption {
  value: string;
  label: string;
  description: string;
  group: "candidate" | "provider";
  requiresApproval?: boolean;
}

interface AccountTypeSelectorProps {
  options: AccountTypeOption[];
  value: string;
  onChange: (value: string) => void;
}

const groupLabels: Record<AccountTypeGroup, string> = {
  candidate: "Para se candidatar · papel Candidato",
  provider:
    "Para oferecer oportunidades · papel Provedor · a permissão de publicar depende da aprovação da gestão",
};

export default function AccountTypeSelector({
  options,
  value,
  onChange,
}: AccountTypeSelectorProps) {
  const groups: AccountTypeGroup[] = ["candidate", "provider"];

  return (
    <section className="w-full rounded-card border border-sutil bg-card p-4">
      <h2 className="mb-1 font-semibold text-titulo">
        Qual é o seu perfil?
      </h2>

      <p className="mb-4 text-rotulo text-secundario">
        O tipo da organização define o papel: quem se candidata ou quem oferece
        oportunidades. Na etapa seguinte, pedimos os dados da organização.
      </p>

      <div className="space-y-3">
        {groups.map((group) => {
          const groupOptions = options.filter(
            (option) => option.group === group,
          );

          if (groupOptions.length === 0) return null;

          return (
            <div key={group}>
              <h3 className="mb-2 text-xs font-medium text-secundario">
                {groupLabels[group]}
              </h3>

              <div
                className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${group === "candidate" ? "lg:grid-cols-3" : "lg:grid-cols-4"
                  }`}
              >
                {groupOptions.map((option) => {
                  const selected = value === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onChange(option.value)}
                      aria-pressed={selected}
                      className={`min-h-19 rounded-card border p-3 text-left transition-colors ${selected
                          ? "border-acento bg-acento-suave ring-1 ring-acento"
                          : "border-sutil bg-card hover:border-acento"
                        }`}
                    >
                      <span className="mb-2 flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={`flex size-3.5 shrink-0 items-center justify-center rounded-full border ${selected
                              ? "border-acento bg-acento"
                              : "border-secundario bg-card"
                            }`}
                        >
                          {selected && (
                            <span className="size-1.5 rounded-full bg-white" />
                          )}
                        </span>

                        <span className="text-rotulo font-semibold text-titulo">
                          {option.label}
                        </span>
                      </span>

                      <span className="block pl-5.5 text-xs leading-relaxed text-secundario">
                        {option.description}
                      </span>

                      {option.requiresApproval && (
                        <span className="mt-2 ml-5.5 inline-block rounded-badge bg-orange-100 px-2 py-0.5 text-[10px] text-orange-800">
                          aprovação da gestão
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}