import { CustomButton } from "./CustomButton";

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
        <article className="rounded-md border border-slate-200 bg-white p-3">
            <div className="flex justify-between items-center gap-2 mb-2">
                <div className="flex items-center gap-2">
                    <span className={`rounded px-2 py-1 text-legenda font-semibold ${item.color}`}>
                        {item.category}
                    </span>

                    <span className="text-rotulo text-slate-500">
                        {item.organization}
                    </span>
                </div>

                <span className="text-rotulo font-semibold text-indigo-600">
                    {item.match}% de match
                </span>
            </div>

            <h3 className="text-lead font-bold mb-1">
                {item.title}
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-rotulo text-slate-500 max-w-lg">
                    {item.description}
                </p>

                <CustomButton variant="neutro" size="cartao">
                    Ver detalhes
                </CustomButton>
            </div>
        </article>
    );
}
