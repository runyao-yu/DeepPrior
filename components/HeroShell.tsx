"use client";

import { HeroBackgroundVideo } from "@/components/HeroBackgroundVideo";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type HeroShellProps = {
  children: ReactNode;
};

export function HeroShell({ children }: HeroShellProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(4);
  const displayedProgress = Math.min(
    100,
    Math.max(0, Math.round(loadingProgress)),
  );

  useEffect(() => {
    const duration = 2400;
    const startedAt = window.performance.now();
    const intervalId = window.setInterval(() => {
      const elapsed = window.performance.now() - startedAt;
      const progress = Math.min(99, 4 + (elapsed / duration) * 95);

      setLoadingProgress(progress);
    }, 50);

    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId);
      setLoadingProgress(100);
      setIsLoading(false);
    }, duration);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section className="flex min-h-svh items-center justify-center bg-[#d7dcdf] px-[2vw] py-[2svh]">
      <div className="relative h-[90svh] min-h-[640px] w-[96vw] overflow-hidden rounded-[24px] border border-black/[0.06] bg-[#fbfbfb] shadow-hero max-md:min-h-[calc(100svh-20px)] max-md:rounded-[20px]">
        {!isLoading ? <HeroBackgroundVideo /> : null}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.78),rgba(255,255,255,0)_34%),linear-gradient(rgba(251,251,251,0.46),rgba(251,251,251,0.46))]"
        />
        {!isLoading ? children : null}
        {isLoading ? (
          <div className="absolute inset-0 z-40 grid place-items-center bg-[#d7dcdf] px-6">
            <div className="grid w-full max-w-[420px] gap-5 text-center">
              <p className="m-0 text-[12px] font-semibold uppercase text-black/42">
                Loading
              </p>
              <div
                className="h-2 overflow-hidden rounded-full border border-black/[0.08] bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                role="progressbar"
                aria-label="Loading hero video"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={displayedProgress}
              >
                <div
                  className="h-full rounded-full bg-black transition-[width] duration-300 ease-out"
                  style={{ width: `${displayedProgress}%` }}
                />
              </div>
              <p className="m-0 text-[12px] font-semibold tabular-nums text-black/38">
                {displayedProgress}%
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
