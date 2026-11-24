import { CustomButton } from "./CustomButton";

export default function PageHeader() {
    return (
        <header className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <h1 className="text-tela font-bold text-titulo sm:text-h1">
                    Minhas oportunidades
                </h1>
                <p className="max-w-xl mt-1 text-corpo text-secundario">
                    Ana Freire <span className="px-0.5 text-[#a2a9b5]" aria-hidden="true">·</span> passo 2 do fluxo do provedor
                </p>
            </div>
            <CustomButton size="auto" variant="neutro">Criar oportunidade</CustomButton>
        </header>
    );
}