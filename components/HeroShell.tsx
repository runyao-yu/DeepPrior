import type { ReactNode } from "react";
import { HeroBackgroundVideo } from "@/components/HeroBackgroundVideo";

type HeroShellProps = {
  children: ReactNode;
};

export function HeroShell({ children }: HeroShellProps) {
  return (
    <section className="flex min-h-svh items-center justify-center bg-[#d7dcdf] px-[2vw] py-[2svh]">
      <div className="relative h-[90svh] min-h-[640px] w-[96vw] overflow-hidden rounded-[24px] border border-black/[0.06] bg-[#fbfbfb] shadow-hero max-md:min-h-[calc(100svh-20px)] max-md:rounded-[20px]">
        <HeroBackgroundVideo />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.78),rgba(255,255,255,0)_34%),linear-gradient(rgba(251,251,251,0.46),rgba(251,251,251,0.46))]"
        />
        {children}
      </div>
    </section>
  );
}
