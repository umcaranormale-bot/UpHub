export interface Opportunity {
    category: string;
    organization: string;
    title: string;
    description: string;
    match: number;
    color: string;
}

interface OpportunityCardProps {
    item: Opportunity;
}

export default function OpportunityCard({
    item,
}: OpportunityCardProps) {
    return (
        <article className="rounded-md border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-center gap-2 mb-2">
                <div className="flex items-center gap-2">
                    <span className={`rounded px-2 py-1 text-[9px] font-semibold ${item.color}`}>
                        {item.category}
                    </span>

                    <span className="text-[9px] text-slate-500">
                        {item.organization}
                    </span>
                </div>

                <span className="text-[10px] font-semibold text-indigo-600">
                    {item.match}% de match
                </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mb-1">
                {item.title}
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-[10px] text-slate-500 max-w-lg">
                    {item.description}
                </p>

                <button className="shrink-0 rounded-md border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-800 hover:bg-slate-50">
                    Ver detalhes
                </button>
            </div>
        </article>
    );
}
