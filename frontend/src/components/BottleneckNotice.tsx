import BannerTag from "./BannerTag";

export default function BottleneckNotice() {
  return (
    <aside className="mt-3 flex items-center gap-2.25 rounded-lg border border-indigo-100 bg-white p-2">
      <BannerTag>GARGALO</BannerTag>
      <p className="m-0 text-legenda leading-[1.4] text-secundario">
        <strong className="font-semibold text-secundario">Aceleração Seed Recife</strong> está sem avaliador designado: a fila trava e a oportunidade aparece no painel de gargalos da gestão do PD (H3).
      </p>
    </aside>
  );
}