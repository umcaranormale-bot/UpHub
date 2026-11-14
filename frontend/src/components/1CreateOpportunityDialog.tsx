import { useState, type FormEvent, type MouseEvent } from 'react';

export type NewOpportunity = {
  title: string;
  track: string;
};

type CreateOpportunityDialogProps = {
    onClose: () => void;
    onCreate: (opportunity: NewOpportunity) => void;
};

export default function CreateOpportunityDialog({ onClose, onCreate }: CreateOpportunityDialogProps) {
    const [title, setTitle] = useState('');
    const [track, setTrack] = useState('Fomento');

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!title.trim()) return;
        onCreate({ title: title.trim(), track });
    }

    function handleBackdrop(event: MouseEvent<HTMLDivElement>) {
        if (event.target === event.currentTarget) onClose();
    }

    return (
        <div className="fixed inset-0 z-10 grid place-items-center bg-[#131b2f]/40 p-5 backdrop-blur-[3px]" onMouseDown={handleBackdrop}>
            <section className="w-full max-w-[450px] rounded-2xl border border-[#eaecf1] bg-white p-5 shadow-2xl sm:p-[25px]" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <span className="text-[9px] font-bold tracking-[.1em] text-[#818b9d]">NOVA OPORTUNIDADE</span>
                        <h2 id="dialog-title" className="font-display mb-0 mt-[7px] text-[21px] font-bold tracking-[-.04em] text-ink">Comece pelo essencial</h2>
                    </div>
                    <button className="grid size-[31px] place-items-center rounded-lg border border-[#e8ebf1] bg-white text-[21px] leading-none text-[#6c7586] hover:bg-[#f5f6f9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aab9e8]" aria-label="Fechar" onClick={onClose}>×</button>
                </div>
                <p className="mb-[21px] mt-[10px] text-xs leading-relaxed text-[#7e8797]">Crie um rascunho e complete os detalhes antes de publicar.</p>
                <form onSubmit={handleSubmit}>
                    <label className="mb-[7px] mt-[15px] block text-[11px] font-semibold text-[#424d64]" htmlFor="opportunity-title">Nome da oportunidade</label>
                    <input
                        autoFocus
                        id="opportunity-title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Ex.: Programa de inovação aberta"
                        required
                        className="h-[42px] w-full rounded-lg border border-[#dfe3eb] bg-white px-3 text-xs text-[#26324b] outline-none placeholder:text-[#a3aab6] focus:border-[#8496d0] focus:ring-4 focus:ring-[#7084c2]/15"
                    />
                    <label className="mb-[7px] mt-[15px] block text-[11px] font-semibold text-[#424d64]" htmlFor="opportunity-track">Trilha</label>
                    <select
                        id="opportunity-track"
                        value={track}
                        onChange={(event) => setTrack(event.target.value)}
                        className="h-[42px] w-full rounded-lg border border-[#dfe3eb] bg-white px-3 text-xs text-[#26324b] outline-none focus:border-[#8496d0] focus:ring-4 focus:ring-[#7084c2]/15"
                    >
                        <option>Fomento</option>
                        <option>Investimento</option>
                        <option>Formação</option>
                    </select>
                    <div className="mt-6 flex justify-end gap-[9px]">
                        <button className="min-h-[39px] rounded-lg border border-[#e0e4ec] bg-white px-[14px] text-[11px] font-semibold text-[#59647a] hover:bg-[#f7f8fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aab9e8]" type="button" onClick={onClose}>Cancelar</button>
                        <button className="min-h-[39px] rounded-lg border border-ink bg-ink px-[14px] text-[11px] font-semibold text-white hover:bg-[#263457] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aab9e8]" type="submit">Criar rascunho <span className="ml-1 text-sm" aria-hidden="true">→</span></button>
                    </div>
                </form>
            </section>
        </div>
    );
}
