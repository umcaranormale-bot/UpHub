export type OpportunityTone = 'review' | 'published' | 'closed';


type StatusBadgeProps = {
  status: string;
  tone: OpportunityTone;
};

const toneClasses: Record<OpportunityTone, string> = {
  review: 'border-[#d9e1fb] bg-[#edf1ff] text-[#4357a3]',
  published: 'border-[#eee0c8] bg-[#fbf4e7] text-[#95703a]',
  closed: 'border-[#dde2ec] bg-[#f0f2f7] text-[#656f83]',
};

export default function StatusBadge({ status, tone }: StatusBadgeProps) {
  return (
    <span className={`inline-flex min-h-4.5 items-center whitespace-nowrap rounded-[5px] border px-2 text-[11px] font-semibold ${toneClasses[tone]}`}>
      {status}
    </span>
  );
}
