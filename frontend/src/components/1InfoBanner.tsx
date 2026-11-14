import BannerTag from './1BannerTag';

export default function InfoBanner() {
    return (
        <section className="mb-3 flex flex-col items-start gap-2 rounded-lg border border-[#ebddce] bg-[#fff8f1] p-2 sm:flex-row sm:gap-[9px] sm:p-[6px_10px]" aria-label="Informação importante">
            <BannerTag>DIFERENCIAL 03</BannerTag>
            <p className="m-0 text-[10px] leading-[1.35] text-[#656d7b]">
                Nenhuma candidatura pode ficar sem resposta. Enquanto houver candidatura vencida sem decisão numa oportunidade sua,
                a publicação de uma nova fica bloqueada — a etapa de resposta aparece no perfil público da organização.
            </p>
        </section>
    );
}
