import { useState } from 'react';
import type { OpportunityFilter } from '../components/1OpprtunityTable';
import StatusFilters, { initialOpportunities } from '../components/1StatusFilters';
import type { NewOpportunity } from '../components/1CreateOpportunityDialog';
import PageHeader from '../components/1PageHeader';
import InfoBanner from '../components/1InfoBanner';
import OpportunityTable from '../components/1OpprtunityTable';
import BottleneckNotice from '../components/1BottleneckNotice';
import CreateOpportunityDialog from '../components/1CreateOpportunityDialog';


function ProviderHome() {
    const [activeFilter, setActiveFilter] = useState<OpportunityFilter>('review');
    const [hasFiltered, setHasFiltered] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [draftCount, setDraftCount] = useState(2);
    const [draftConfirmation, setDraftConfirmation] = useState<string | null>(null);

    const visibleOpportunities = hasFiltered
        ? initialOpportunities.filter((item) => item.tone === activeFilter)
        : initialOpportunities;

    function handleSelectFilter(filter: OpportunityFilter) {
        setActiveFilter(filter);
        setHasFiltered(true);
        setDraftConfirmation(null);
    }

    function handleCreateOpportunity({ title }: NewOpportunity) {
        setDraftCount((count) => count + 1);
        setIsDialogOpen(false);
        setActiveFilter('draft');
        setHasFiltered(true);
        setDraftConfirmation(title);
    }
    return (
        <main className="min-h-screen bg-shell px-4 py-4 text-ink sm:px-6 sm:py-5 lg:px-[34px]">
            <div className="mx-auto w-full max-w-[1160px]">
                <PageHeader onCreate={() => setIsDialogOpen(true)} />
                <InfoBanner />
                <StatusFilters activeFilter={activeFilter} draftCount={draftCount} onSelect={handleSelectFilter} />
                <section className="overflow-hidden rounded-[11px] border border-[#e0e4eb] bg-white shadow-[0_2px_8px_rgba(24,33,59,0.02)] max-sm:border-0 max-sm:bg-transparent max-sm:shadow-none" aria-label="Lista de oportunidades">
                    <OpportunityTable opportunities={visibleOpportunities} draftConfirmation={draftConfirmation} />
                </section>
                <BottleneckNotice />
                <footer className="mt-[9px] flex items-start gap-2 text-[#7e8796]">
                    <span className="mt-[6px] size-[6px] shrink-0 rounded-full bg-[#aab2c0]" aria-hidden="true" />
                    <p className="mb-0 text-[9px] leading-relaxed sm:text-[10px]">
                        Os <strong className="font-semibold text-[#606b7f]">{draftCount} rascunhos</strong> não aparecem nesta lista. As <strong className="font-semibold text-[#606b7f]">4 oportunidades publicadas</strong> do Órgão de Fomento PE estão todas acima.
                    </p>
                </footer>
            </div>
            {isDialogOpen && (
                <CreateOpportunityDialog
                    onClose={() => setIsDialogOpen(false)}
                    onCreate={handleCreateOpportunity}
                />
            )}
        </main>
    );
}
export default ProviderHome;