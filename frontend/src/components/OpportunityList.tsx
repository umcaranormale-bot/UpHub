import OpportunityCard, { type Opportunity } from "./OpportunityCard";

const opportunities: Opportunity[] = [
    {
        category: "Fomento",
        organization: "Órgão de Fomento PE",
        title: "Inova PE 2026 - edital de inovação",
        description: "Sua empresa é MEI e atua em TIC, atendendo aos requisitos principais.",
        match: 86,
        color: "bg-indigo-100 text-indigo-600",
    },
    {
        category: "Investimento",
        organization: "Porto Digital + CESAR",
        title: "Rodada Anjo Porto Digital 2026",
        description: "Bate com o setor; o programa pede tração comprovada.",
        match: 61,
        color: "bg-teal-100 text-teal-700",
    },
    {
        category: "Fomento",
        organization: "Sebrae PE",
        title: "Programa Conecta Indústria",
        description: "Setor próximo, mas o edital pede médio porte.",
        match: 44,
        color: "bg-indigo-100 text-indigo-600",
    },
];

export default function OpportunityList() {
    return (
        <div>
            <h2 className="mb-3 text-base font-bold text-[#111b46]">
                Para você · ordenado por compatibilidade
            </h2>

            <div className="space-y-3">
                {opportunities.map((item) => (
                    <OpportunityCard key={item.title} item={item} />
                ))}
            </div>
        </div>
    );
}
