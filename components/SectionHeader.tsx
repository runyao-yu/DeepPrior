type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
  headingId?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  meta,
  headingId,
}: SectionHeaderProps) {
  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,440px)] md:items-end">
      <div>
        <p className="m-0 mb-5 text-[12px] font-semibold uppercase text-black/38">
          {eyebrow}
        </p>
        <h2
          id={headingId}
          className="section-title-rise m-0 max-w-4xl text-[clamp(2.25rem,5vw,4.75rem)] font-semibold leading-[0.96] text-black"
        >
          {title}
        </h2>
      </div>
      <div className="grid gap-4 md:justify-items-end md:text-right">
        {meta ? (
          <span className="inline-flex w-fit rounded-full border border-white/60 bg-white/35 px-4 py-2 text-[12px] font-semibold text-black/48 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-xl">
            {meta}
          </span>
        ) : null}
        <p className="m-0 max-w-[440px] text-[15px] font-medium leading-[1.6] text-black/60 md:text-[16px]">
          {description}
        </p>
      </div>
    </div>
  );
}
