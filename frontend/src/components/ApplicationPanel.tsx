
const applications = [
    { title: "Programa Acelera PE 2026", status: "Ajuste pedido", color: "bg-orange-100 text-orange-700", date: "revisar até 21/10" },
    { title: "Inova PE 2026", status: "Não elegível", color: "bg-red-100 text-red-600", date: "não elegível em 28/08" },
    { title: "Recife Mais Digital 2026", status: "Em análise", color: "bg-indigo-100 text-indigo-600", date: "com avaliação desde 15/09" },
    { title: "Rodada Anjo Porto Digital 2026", status: "Rascunho", color: "bg-slate-100 text-slate-600", date: "salvo hoje às 14:32" },
];

export default function ApplicationsPanel() {
    return (
        <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex justify-between mb-3">
                <h2 className="text-xs font-bold text-slate-900">
                    Minhas candidaturas
                </h2>
                <button className="text-[10px] font-semibold text-indigo-600">
                    Ver todas
                </button>
            </div>

            <div className="divide-y divide-slate-100">
                {applications.map((app) => (
                    <div key={app.title} className="flex items-center justify-between gap-2 py-2">
                        <div>
                            <p className="text-[10px] font-semibold text-slate-800">
                                {app.title}
                            </p>
                            <p className="text-[9px] text-slate-400">{app.date}</p>
                        </div>

                        <span className={`rounded-full px-2 py-1 text-[8px] font-semibold ${app.color}`}>
                            {app.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}