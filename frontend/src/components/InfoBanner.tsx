import BannerTag from './BannerTag';

export default function InfoBanner() {
    return (
        <section className="mb-3 flex flex-col items-start gap-2 rounded-lg border border-sutil bg-orange-50 p-2 sm:flex-row sm:gap-2.25 sm:p-[6px_10px]">
            <BannerTag>DIFERENCIAL 03</BannerTag>
            <p className="m-0 text-legenda leading-[1.35] text-secundario">
                Nenhuma candidatura pode ficar sem resposta. Enquanto houver candidatura vencida sem decisão numa oportunidade sua,
                a publicação de uma nova fica bloqueada — a etapa de resposta aparece no perfil público da organização.
            </p>
        </section>
    );
}
