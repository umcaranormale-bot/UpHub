import StatusBadge, { type OpportunityTone} from './1StatusBadge';
//import type { NewOpportunity } from './1CreateOpportunityDialog';

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
    draftConfirmation: string | null;
};


export default function OpportunityTable({ opportunities, draftConfirmation }: OpportunityTableProps) {
    if (!opportunities.length) {
        return (
            <div className="grid min-h-[190px] place-content-center justify-items-center rounded-[10px] border border-[#e2e6ed] bg-white p-6 text-center sm:rounded-none sm:border-0">
                <span className="mb-2 grid size-[34px] place-items-center rounded-[10px] border border-[#e5e8ef] text-[#778196]" aria-hidden="true">—</span>
                <p className="mb-1 text-[13px] font-semibold text-[#37425a]">
                    {draftConfirmation ? 'Rascunho criado.' : 'Nenhuma oportunidade neste status.'}
                </p>
                <span className="text-[11px] text-[#8a92a0]">
                    {draftConfirmation
                        ? `“${draftConfirmation}” foi salvo. Os rascunhos não aparecem nesta lista.`
                        : 'As oportunidades desse grupo podem aparecer aqui quando estiverem disponíveis.'}
                </span>
            </div>
        );
    }

    return (
        <div className="table-scroll overflow-x-auto">
            <table className="opportunity-table w-full min-w-[760px] table-fixed border-collapse text-left">
                <thead>
                    <tr className="h-6 border-b border-[#e4e7ed] bg-[#f8f9fc] text-[8px] font-bold uppercase tracking-[.075em] text-[#59647a]">
                        <th className="w-[35%] px-[14px]" scope="col">Oportunidade</th>
                        <th className="w-[13%] px-[14px]" scope="col">Trilha</th>
                        <th className="w-[12%] px-[14px]" scope="col">Prazo</th>
                        <th className="w-[12%] px-[14px]" scope="col">Candidaturas</th>
                        <th className="w-[15%] px-[14px]" scope="col">Avaliador</th>
                        <th className="w-[13%] px-[14px]" scope="col">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {opportunities.map((item) => (
                        <tr key={item.id} className="h-[30px] border-b border-[#edf0f4] transition last:border-b-0 hover:bg-[#fafbfe]">
                            <td data-label="Oportunidade" className="px-[14px] py-1 text-[10px] font-semibold tracking-[-.012em] text-[#1f2942]">{item.title}</td>
                            <td data-label="Trilha" className="px-[14px] py-1 text-[10px] text-[#737d8e]">{item.track}</td>
                            <td data-label="Prazo" className="whitespace-nowrap px-[14px] py-1 text-[10px] text-[#737d8e]">{item.deadline}</td>
                            <td data-label="Candidaturas" className="px-[14px] py-1 text-[10px] text-[#737d8e]">{item.applications ?? <span className="text-[#a1a7b2]">—</span>}</td>
                            <td data-label="Avaliador" className={`px-[14px] py-1 text-[10px] ${item.evaluator.startsWith('—') ? 'text-[#a87939]' : 'text-[#737d8e]'}`}>
                                {item.evaluator}
                            </td>
                            <td data-label="Status" className="px-[14px] py-1"><StatusBadge status={item.status} tone={item.tone} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
