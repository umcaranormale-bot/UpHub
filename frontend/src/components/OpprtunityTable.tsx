import StatusBadge, { type OpportunityTone } from './StatusBadge';

export type Opportunity = {
    id: number;
    title: string;
    track: string;
    deadline: string;
    applications: number | null;
    evaluator: string;
    status: string;
    tone: OpportunityTone;
};

export type OpportunityFilter = 'draft' | 'published' | 'review' | 'closed';

type OpportunityTableProps = {
    opportunities: Opportunity[];
};


export default function OpportunityTable({ opportunities }: OpportunityTableProps) {
    if (!opportunities.length) {
        return (
            <div className="grid min-h-47.5 place-content-center justify-items-center rounded-[10px] border-2 border-sutil bg-white p-6 text-center sm:border">
                <span className="mb-2 grid size-10 place-items-center rounded-[10px] border border-sutil text-secundario" aria-hidden="true">—</span>
                <p className="mb-1 text-lead font-semibold text-titulo">
                    Nenhuma oportunidade neste status.
                </p>
                <span className="text-rotulo text-secundario">
                    As oportunidades desse grupo podem aparecer aqui quando estiverem disponíveis.
                </span>
            </div>
        );
    }

    return (
        <div className="table-scroll overflow-x-auto">
            <table className="opportunity-table w-full min-w-190 table-fixed border-collapse text-left">
                <thead>
                    <tr className="h-6 border-b border-[#e4e7ed] bg-[#f8f9fc] text-[10px] font-bold uppercase tracking-[.075em] text-[#59647a]">
                        <th className="w-[35%] px-3.5" scope="col">Oportunidade</th>
                        <th className="w-[13%] px-3.5" scope="col">Trilha</th>
                        <th className="w-[12%] px-3.5" scope="col">Prazo</th>
                        <th className="w-[12%] px-3.5" scope="col">Candidaturas</th>
                        <th className="w-[15%] px-3.5" scope="col">Avaliador</th>
                        <th className="w-[13%] px-3.5" scope="col">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {opportunities.map((item) => (
                        <tr key={item.id} className="h-7.5 border-b border-[#edf0f4] transition last:border-b-0 hover:bg-gray-100">
                            <td data-label="Oportunidade" className="px-3.5 py-3 text-legenda font-semibold tracking-[-.012em] text-titulo">{item.title}</td>
                            <td data-label="Trilha" className="px-3.5 py-3 text-legenda text-[#737d8e]">{item.track}</td>
                            <td data-label="Prazo" className="whitespace-nowrap px-3.5 py-3 text-legenda text-[#737d8e]">{item.deadline}</td>
                            <td data-label="Candidaturas" className="px-3.5 py-3 text-legenda text-[#737d8e]">{item.applications ?? <span className="text-[#a1a7b2]">—</span>}</td>
                            <td data-label="Avaliador" className={`px-3.5 py-3 text-legenda ${item.evaluator.startsWith('—') ? 'text-[#a87939]' : 'text-[#737d8e]'}`}>
                                {item.evaluator}
                            </td>
                            <td data-label="Status" className="px-3.5 py-1"><StatusBadge status={item.status} tone={item.tone} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
