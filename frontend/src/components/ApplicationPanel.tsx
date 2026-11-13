
const applications = [
    { title: "Programa Acelera PE 2026", status: "Ajuste pedido", color: "bg-orange-100 text-orange-700", date: "revisar até 21/10" },
    { title: "Inova PE 2026", status: "Não elegível", color: "bg-red-100 text-red-600", date: "não elegível em 28/08" },
    { title: "Recife Mais Digital 2026", status: "Em análise", color: "bg-indigo-100 text-indigo-600", date: "com avaliação desde 15/09" },
    { title: "Rodada Anjo Porto Digital 2026", status: "Rascunho", color: "bg-slate-100 text-slate-600", date: "salvo hoje às 14:32" },
];

export default function ApplicationsPanel() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                    Minhas candidaturas
                </h2>


                <a
                    href="/cadastro"
                    className="font-semibold text-acento hover:text-indigo-700 transition-colors"
                >
                    Ver todas
                </a>
            </div>

            <div className="divide-y divide-slate-100">
                {applications.map((app) => (
                    <div key={app.title} className="flex items-center justify-between gap-2 py-3">
                        <div>
                            <p className="text-sm font-semibold text-titulo">
                                {app.title}
                            </p>

                            <p className="text-xs text-secundario">
                                {app.date}
                            </p>
                        </div>

                        <span className={`inline-flex items-center justify-center gap-1.5 w-fit h-7 px-2.5 py-1.25 rounded-full text-xs font-semibold ${app.color}`}>
                            ● {app.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}