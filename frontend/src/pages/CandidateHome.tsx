import ApplicationsPanel from "../components/ApplicationPanel";
import CandidateAlerts from "../components/CandidateAlerts";
import CandidateHeader from "../components/CandidateHeader";
import MatchNotes from "../components/MatchNotes";
import OpportunityList from "../components/OpportunityList";

export default function CandidateHome() {
  return (
    <main className="min-h-screen bg-page">
      <div className="mx-auto max-w-7xl">
        <CandidateHeader />

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className="space-y-4 lg:col-span-2">
            <CandidateAlerts />
            <OpportunityList />
          </section>

          <aside className="space-y-4">
            <ApplicationsPanel />
            <MatchNotes />
          </aside>
        </div>
      </div>
    </main>
  );
}