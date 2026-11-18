interface AccountTypeOption {
  value: string;
  label: string;
  description: string;
  requiresApproval?: boolean;
}

interface AccountTypeSelectorProps {
  options: AccountTypeOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function AccountTypeSelector({
  options,
  value,
  onChange,
}: AccountTypeSelectorProps) {
  return (
    <section className="w-full rounded-card border border-sutil bg-card p-card">
      <h2 className="mb-1 font-semibold text-titulo">
        Qual é o seu perfil?
      </h2>

      <p className="mb-4 text-rotulo text-secundario">
        A escolha define quais dados pedimos na etapa seguinte.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={`rounded-card border p-3 text-left transition-all ${
                selected
                  ? "border-acento bg-acento-suave ring-1 ring-acento"
                  : "border-sutil bg-card hover:border-acento"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`flex size-3 items-center justify-center rounded-full border ${
                    selected
                      ? "border-acento bg-acento"
                      : "border-secundario bg-card"
                  }`}
                >
                  {selected && (
                    <span className="size-1.5 rounded-full bg-acento" />
                  )}
                </span>

                <span className="text-rotulo font-semibold text-titulo">
                  {option.label}
                </span>

                {option.requiresApproval && (
                  <span className="rounded-badge bg-orange-100 px-2 py-0.5 text-[10px] text-orange-800">
                    aprovação da gestão
                  </span>
                )}
              </div>

              <p className="pl-5 text-rotulo text-secundario">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}