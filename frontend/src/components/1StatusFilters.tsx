import type { Opportunity , OpportunityFilter} from './1OpprtunityTable';

export type OpportunityFilterOption = {
    id: OpportunityFilter;
    label: string;
    count: number;
};
export const initialOpportunities: Opportunity[] = [
    {
        id: 1,
        title: 'Inova PE 2026 · edital de inovação',
        track: 'Fomento',
        deadline: '30/09/2026',
        applications: 18,
        evaluator: 'Cláudia Rangel',
        status: 'Em avaliação',
        tone: 'review',
    },
    {
        id: 2,
        title: 'Aceleração Seed Recife',
        track: 'Investimento',
        deadline: '12/10/2026',
        applications: 7,
        evaluator: '— não designado',
        status: 'Publicada',
        tone: 'published',
    },
    {
        id: 3,
        title: 'Desafio Logística Urbana',
        track: 'Formação',
        deadline: '20/10/2026',
        applications: 3,
        evaluator: 'Camila Souza',
        status: 'Publicada',
        tone: 'published',
    },
    {
        id: 4,
        title: 'Inova PE 2025 · edital de inovação',
        track: 'Fomento',
        deadline: 'encerrado em 14:42',
        applications: null,
        evaluator: 'Cláudia Rangel',
        status: 'Encerrada',
        tone: 'closed',
    },
];

export const opportunityFilters: OpportunityFilterOption[] = [
    { id: 'draft', label: 'Rascunho', count: 2 },
    { id: 'published', label: 'Publicada', count: 2 },
    { id: 'review', label: 'Em avaliação', count: 1 },
    { id: 'closed', label: 'Encerrada', count: 1 },
];


type StatusFiltersProps = {
    activeFilter: OpportunityFilter;
    draftCount: number;
    onSelect: (filter: OpportunityFilter) => void;
};

export default function StatusFilters({ activeFilter, draftCount, onSelect }: StatusFiltersProps) {
    return (
        <nav className="mb-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Filtrar oportunidades por status">
            {opportunityFilters.map((filter) => (
                <button
                    key={filter.id}
                    className={`inline-flex min-h-6 shrink-0 items-center gap-[5px] rounded-full border px-[10px] text-[9px] font-medium transition hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aab9e8] ${activeFilter === filter.id
                        ? 'border-ink bg-ink text-white shadow-sm'
                        : 'border-[#e0e4ec] bg-white text-[#455066] hover:border-[#aeb8cb]'
                        }`}
                    onClick={() => onSelect(filter.id)}
                    aria-pressed={activeFilter === filter.id}
                >
                    <span>{filter.label}</span>
                    <span className="opacity-80 tabular-nums">{filter.id === 'draft' ? draftCount : filter.count}</span>
                </button>
            ))}
        </nav>
    );
}
