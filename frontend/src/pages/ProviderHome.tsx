
import { useState } from 'react';
import type { OpportunityFilter } from '../components/OpprtunityTable';
import StatusFilters, { initialOpportunities } from '../components/StatusFilters';
import PageHeader from '../components/PageHeader';
import InfoBanner from '../components/InfoBanner';
import OpportunityTable from '../components/OpprtunityTable';
import BottleneckNotice from '../components/BottleneckNotice';

function ProviderHome() {
    const [activeFilter, setActiveFilter] = useState<OpportunityFilter>('review');
    const [hasFiltered, setHasFiltered] = useState(false);
    

    const visibleOpportunities = hasFiltered
        ? initialOpportunities.filter((item) => item.tone === activeFilter)
        : initialOpportunities;

    function handleSelectFilter(filter: OpportunityFilter) {
        setActiveFilter(filter);
        setHasFiltered(true);
    }

    return (
        <main className="min-h-screen bg-shell text-ink sm:px-6 sm:py-5 lg:px-8.5">
            <div className="mx-auto w-full max-w-290">
                <PageHeader />
                <InfoBanner />
                <StatusFilters
                    activeFilter={activeFilter}
                    onSelect={handleSelectFilter}
                />
                <section
                    className="overflow-hidden rounded-[11px] border border-page bg-white max-sm:border-0 max-sm:bg-transparent"
                    aria-label="Lista de oportunidades"
                >
                    <OpportunityTable opportunities={visibleOpportunities} />
                </section>
                <BottleneckNotice />
                <footer className="mt-2.5 flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-secundario" aria-hidden="true" />
                    <p className="mb-0 text-legenda leading-relaxed sm:text-rotulo">
                        Os <strong className="font-semibold text-[#606b7f]"> rascunhos</strong> não aparecem nesta lista. As <strong className="font-semibold text-[#606b7f]">4 oportunidades publicadas</strong> do Órgão de Fomento PE estão todas acima.
                    </p>
                </footer>
            </div>
        </main>
    );
}

export default ProviderHome;
