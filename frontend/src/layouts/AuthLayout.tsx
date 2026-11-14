interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <main className="min-h-screen flex flex-row">

            {/* Lado esquerdo */}
            <section className="flex flex-3 flex-col justify-between bg-profundo p-16 text-page">

                {/* Logo no topo */}
                <div className="flex items-center gap-3">
                    <img
                        src="/logoUpHub.svg"
                        alt="Logo do site"
                        className="h-8 w-auto object-contain"
                    />
                </div>

                {/* Conteúdo central */}
                <div className="my-12 max-w-lg">
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
                <div />

            </section>

            {/* Lado direito */}
            <section className="flex flex-7 items-center justify-center bg-gray-50 p-6 md:p-10">
                {children}
            </section>

        </main>
    );
}