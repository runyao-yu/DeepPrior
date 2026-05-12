"use client";

import { SectionHeader } from "@/components/SectionHeader";
import { assetPath } from "@/lib/asset-path";
import { siteContent } from "@/lib/source-content";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Post = (typeof siteContent.analysis.posts)[number];
type InsightFigure = Post["figures"][number];

function InsightFigurePanel({
  figure,
  fallbackLabel,
}: {
  figure?: InsightFigure;
  fallbackLabel: string;
}) {
  const image = figure?.image?.trim();
  const label = figure?.title || fallbackLabel;

  return (
    <figure className="m-0 grid gap-2">
      <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-[14px] border border-black/[0.06] bg-[#fbfbfb] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
        {image ? (
          <Image
            src={assetPath(image)}
            alt={label}
            width={640}
            height={480}
            unoptimized
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full w-full place-items-center rounded-[10px] border border-dashed border-black/[0.12] bg-white p-3 text-center text-[12px] font-semibold text-black/32">
            Figure placeholder
          </div>
        )}
      </div>
      <figcaption className="text-[12px] font-medium text-black/44">
        {label}
      </figcaption>
    </figure>
  );
}

function InsightCard({
  post,
  onPause,
  onResume,
}: {
  post: Post;
  onPause: () => void;
  onResume: () => void;
}) {
  const figures =
    post.figures.length > 0 ? post.figures : [{ title: "", image: "" }];

  return (
    <article
      className="insight-card grid shrink-0 content-start gap-5 rounded-[18px] border border-black/[0.06] bg-[#fbfbfb] p-5 shadow-[0_18px_54px_rgba(31,41,55,0.08),inset_0_1px_0_rgba(255,255,255,0.92)] md:p-7"
      onMouseEnter={onPause}
      onMouseLeave={onResume}
    >
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[12px] font-semibold text-black/48">
          {post.date}
        </span>
        <span className="rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[12px] font-semibold text-black/48">
          {post.country}
        </span>
        <span className="rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[12px] font-semibold text-black/48">
          {post.feature}
        </span>
      </div>

      <h3 className="m-0 text-[clamp(1.35rem,2.2vw,2rem)] font-semibold leading-[1.06] text-black">
        {post.summary}
      </h3>
      <p className="m-0 text-[15px] leading-[1.72] text-black/68">
        {post.details}
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {figures.map((figure, index) => (
          <InsightFigurePanel
            key={`${post.date}-${figure.title || index}`}
            figure={figure}
            fallbackLabel={`Figure ${index + 1}`}
          />
        ))}
      </div>
    </article>
  );
}

export function InsightsSection() {
  const posts = siteContent.analysis.posts;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  function clearResumeTimer() {
    if (resumeTimerRef.current !== null) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }

  function pauseAutoMove() {
    clearResumeTimer();
    setIsPaused(true);
  }

  function resumeAutoMove() {
    clearResumeTimer();
    setIsPaused(false);
  }

  function moveManually(direction: -1 | 1) {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    pauseAutoMove();
    scroller.scrollBy({
      left: direction * Math.min(scroller.clientWidth * 0.75, 460),
      behavior: "smooth",
    });
    resumeTimerRef.current = window.setTimeout(() => {
      setIsPaused(false);
      resumeTimerRef.current = null;
    }, 1300);
  }

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller || posts.length === 0) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return undefined;
    }

    let frameId = 0;
    let lastFrameAt = window.performance.now();

    function tick(now: number) {
      const elapsed = now - lastFrameAt;
      lastFrameAt = now;

      if (!isPaused && scroller) {
        scroller.scrollLeft += elapsed * 0.04;

        const loopPoint = scroller.scrollWidth / 2;

        if (loopPoint > 0 && scroller.scrollLeft >= loopPoint) {
          scroller.scrollLeft -= loopPoint;
        }

        if (scroller.scrollLeft <= 0) {
          scroller.scrollLeft += loopPoint;
        }
      }

      frameId = window.requestAnimationFrame(tick);
    }

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isPaused, posts.length]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current !== null) {
        window.clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  const repeatedPosts = [...posts, ...posts];

  return (
    <section
      id="insights"
      className="scroll-mt-6 bg-[#d7dcdf] px-[2vw] py-16 md:py-24"
      aria-labelledby="insights-heading"
    >
      <div className="mx-auto grid w-[96vw] gap-12">
        <SectionHeader
          headingId="insights-heading"
          eyebrow={siteContent.analysis.eyebrow}
          title={siteContent.analysis.title}
          description={siteContent.analysis.description}
          meta={`${posts.length} notes`}
        />

        <div className="grid gap-5">
          <div
            ref={scrollerRef}
            className="insights-scroller overflow-x-hidden pb-3"
            aria-live="off"
          >
            <div className="flex w-max gap-4">
              {repeatedPosts.map((post, index) => (
                <InsightCard
                  key={`${post.date}-${post.country}-${post.feature}-${index}`}
                  post={post}
                  onPause={pauseAutoMove}
                  onResume={resumeAutoMove}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-white/55 bg-white/30 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-xl">
            <button
              type="button"
              onClick={() => moveManually(-1)}
              className="grid h-10 w-10 place-items-center rounded-full border border-black/[0.1] bg-white text-[18px] font-semibold leading-none text-black/56 transition hover:border-black/20 hover:text-black"
              aria-label="Move insights left"
            >
              &lt;
            </button>
            <div className="h-px flex-1 bg-black/12" aria-hidden="true" />
            <button
              type="button"
              onClick={() => moveManually(1)}
              className="grid h-10 w-10 place-items-center rounded-full border border-black/[0.1] bg-white text-[18px] font-semibold leading-none text-black/56 transition hover:border-black/20 hover:text-black"
              aria-label="Move insights right"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
