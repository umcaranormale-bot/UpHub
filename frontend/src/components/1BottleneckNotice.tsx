import BannerTag from "./1BannerTag";

export default function BottleneckNotice() {
  return (
    <aside className="mt-3 flex items-center gap-[9px] rounded-lg border border-[#e6e8ee] bg-white p-[8px_10px]">
      <BannerTag>GARGALO</BannerTag>
      <p className="m-0 text-[10px] leading-[1.4] text-[#656d7b]">
        <strong className="font-semibold text-[#4c566b]">Aceleração Seed Recife</strong> está sem avaliador designado: a fila trava e a oportunidade aparece no painel de gargalos da gestão do PD (H3).
      </p>
    </aside>
  );
}