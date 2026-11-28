interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <main className="flex min-h-screen flex-col lg:flex-row">

            {/* Lado esquerdo */}
            <section className="flex flex-col justify-between bg-profundo px-6 py-5 text-page lg:flex-3 lg:p-16">

                {/* Logo no topo */}
                <div className="flex items-center gap-3">
                    <img
                        src="/logoUpHub.svg"
                        alt="Logo do site"
                        className="h-8 w-auto object-contain"
                    />
                </div>

                {/* Conteúdo central */}
                <div className="my-12 hidden max-w-lg lg:block">
                    <h1 className="mb-6 text-4xl font-bold">
                        A plataforma única do ecossistema
                    </h1>

                    <p className="mb-8 text-md text-secundario">
                        Uma conta, um papel por organização. Toda oportunidade publicada,
                        encontrada e acompanhada até o fim.
                    </p>

                    <div className="space-y-5">
                        <p className="text-white/60">
                            <strong className="text-white font-semibold pe-2">
                                Fomento
                            </strong>
                            · editais com regras de elegibilidade
                        </p>

                        <p className="text-white/60">
                            <strong className="text-white font-semibold pe-2">
                                Investimento
                            </strong>
                            · programas e teses por estágio
                        </p>

                        <p className="text-white/60">
                            <strong className="text-white font-semibold pe-2">
                                Formação
                            </strong>
                            · desafios reais e squads mentoradas
                        </p>
                    </div>
                </div>

                {/* Espaço inferior */}
                <div className="hidden lg:block" />

            </section>

            {/* Lado direito */}
            <section className="flex flex-1 items-start justify-center bg-gray-50 px-4 py-8 md:p-10 lg:flex-7 lg:items-center">
                {children}
            </section>

        </main>
    );
}