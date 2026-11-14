type BannerTagProps = {
  children: string;
};

export default function BannerTag({ children }: BannerTagProps) {
  return (
    <span className="inline-flex min-h-[18px] shrink-0 items-center rounded-[4px] border border-[#f0e0cc] bg-[#fbf0e2] px-[7px] text-[8px] font-bold tracking-[.055em] text-[#9a7341]">
      {children}
    </span>
  );
}