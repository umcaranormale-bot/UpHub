type PageHeaderProps = {
    onCreate: () => void;
};

export default function PageHeader({ onCreate }: PageHeaderProps) {
    return (
        <header className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <h1 className="font-display m-0 text-[17px] font-extrabold leading-tight tracking-[-.035em] text-ink sm:text-[17px]">
                    Minhas oportunidades
                </h1>
                <p className="mb-0 mt-0.5 text-[9px] leading-relaxed text-[#7c8493]">
                    Ana Freire <span className="px-0.5 text-[#a2a9b5]" aria-hidden="true">·</span> passo 2 do fluxo do provedor
                </p>
            </div>
            <button
                className="inline-flex min-h-[29px] items-center justify-center rounded-md border border-[#c8ccd5] bg-[#c8ccd5] px-3 text-[10px] font-semibold text-white shadow-sm transition hover:-translate-y-px hover:border-[#aeb4c0] hover:bg-[#aeb4c0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aab9e8] max-sm:self-start"
                onClick={onCreate}
            >
                Criar oportunidade
            </button>
        </header>
    );
}