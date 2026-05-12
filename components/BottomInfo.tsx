import { bottomTags, heroDescription, heroKicker } from "@/lib/content";

export function BottomInfo() {
  return (
    <div className="absolute inset-x-5 bottom-5 z-30 md:inset-x-10 md:bottom-9">
      <div className="relative grid items-end gap-5 md:grid-cols-[minmax(0,460px)_1fr_auto] md:gap-8">
        <div className="rise-in rise-delay-2 max-w-[460px]">
          <p className="m-0 mb-5 text-[12px] font-medium leading-none text-black/32 md:text-[13px]">
            {heroKicker}
          </p>
          <p className="m-0 text-[15px] font-bold leading-[1.5] text-black/88 md:text-[17px]">
            {heroDescription}
          </p>
        </div>

        <div
          className="divider-flash absolute bottom-0 left-1/2 hidden h-[35px] w-[2px] -translate-x-1/2 bg-black/[0.22] md:block"
          aria-hidden="true"
        />

        <div className="flex flex-wrap gap-2 md:col-start-3 md:justify-end">
          {bottomTags.map((tag, index) => (
            <span
              key={tag}
              className={`rise-in inline-flex min-h-9 items-center justify-center rounded-full border border-white/55 bg-white/28 px-4 text-[12px] font-medium leading-none text-black/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_12px_28px_rgba(17,24,39,0.06)] backdrop-blur-xl md:min-h-10 md:px-5 md:text-[13px] ${
                index === 0
                  ? "rise-delay-3"
                  : index === 1
                    ? "rise-delay-4"
                    : "rise-delay-5"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
