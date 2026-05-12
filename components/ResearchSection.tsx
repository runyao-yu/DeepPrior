"use client";

import { CopyCitationButton } from "@/components/CopyCitationButton";
import { SectionHeader } from "@/components/SectionHeader";
import { assetPath } from "@/lib/asset-path";
import { siteContent } from "@/lib/source-content";
import Image from "next/image";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { useRef, useState } from "react";

type Paper = (typeof siteContent.research.papers)[number];
type Figure = Paper["figures"][number];
type ResearchCardStyle = CSSProperties & {
  "--offset-x": string;
  "--rotate-y": string;
  "--scale": number;
  "--translate-z": string;
};

const renderOffsets = [-4, -3, -2, -1, 0, 1, 2, 3, 4] as const;

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function PaperScreenshot({
  figure,
  title,
  paperUrl,
}: {
  figure?: Figure;
  title: string;
  paperUrl: string;
}) {
  const image = figure?.image?.trim();
  const label = figure?.title || title;
  const content = (
    <div className="research-paper-shot grid place-items-center overflow-hidden rounded-[16px] border border-black/[0.06] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
      {image ? (
        <Image
          src={assetPath(image)}
          alt={label}
          width={900}
          height={1200}
          unoptimized
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
      ) : (
        <div className="grid h-full w-full place-items-center rounded-[12px] border border-dashed border-black/[0.14] bg-[#fbfbfb] p-5 text-center text-[12px] font-semibold text-black/34">
          Figure placeholder
        </div>
      )}
    </div>
  );

  if (!paperUrl) {
    return content;
  }

  return (
    <a
      href={paperUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open paper: ${title}`}
      className="block rounded-[16px] outline-none transition focus-visible:ring-2 focus-visible:ring-black/30"
    >
      {content}
    </a>
  );
}

function ResearchCard({
  paper,
  offset,
}: {
  paper: Paper;
  offset: (typeof renderOffsets)[number];
}) {
  const distance = Math.abs(offset);
  const figure = paper.figures[0];
  const style: ResearchCardStyle = {
    "--offset-x": `${offset * 12.5}vw`,
    "--rotate-y": `${offset * -14}deg`,
    "--scale": 1 - distance * 0.085,
    "--translate-z": `${distance * -90}px`,
    opacity: distance > 3 ? 0 : 1 - distance * 0.11,
    pointerEvents: distance > 3 ? "none" : "auto",
    zIndex: renderOffsets.length - distance,
  };

  return (
    <article
      className="research-carousel-card grid content-start gap-4 rounded-[18px] border border-black/[0.06] bg-[#fbfbfb] p-4 shadow-[0_24px_70px_rgba(31,41,55,0.12),inset_0_1px_0_rgba(255,255,255,0.92)] transition-[opacity,filter,transform] duration-500 ease-out"
      style={style}
    >
      <PaperScreenshot
        figure={figure}
        title={paper.title}
        paperUrl={paper.paperUrl}
      />

      <div className="grid gap-3">
        <div className="grid gap-2">
          <h3 className="research-paper-title m-0 text-[17px] font-semibold leading-[1.18] text-black">
            {paper.title}
          </h3>
          <p className="research-paper-authors m-0 text-[13px] font-medium leading-[1.5] text-black/50">
            {paper.authors}
          </p>
          <p className="research-paper-venue m-0 text-[13px] font-medium leading-[1.5] text-black">
            {paper.journal}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {paper.dataUrl ? (
            <a
              href={paper.dataUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-black/[0.1] bg-white px-3.5 py-2 text-[12px] font-semibold text-black/56 transition hover:border-black/20 hover:text-black"
            >
              Data
            </a>
          ) : null}
          {paper.codeUrl ? (
            <a
              href={paper.codeUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-black/[0.1] bg-white px-3.5 py-2 text-[12px] font-semibold text-black/56 transition hover:border-black/20 hover:text-black"
            >
              Code
            </a>
          ) : null}
          <CopyCitationButton text={paper.bibtex} />
        </div>
      </div>
    </article>
  );
}

export function ResearchSection() {
  const papers = siteContent.research.papers;
  const [activePosition, setActivePosition] = useState(0);
  const lastRotateAt = useRef(0);

  function handleMouseMove(event: ReactMouseEvent<HTMLDivElement>) {
    if (papers.length <= 1) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const pointerX = (event.clientX - rect.left) / rect.width;
    const direction = pointerX < 0.42 ? -1 : pointerX > 0.58 ? 1 : 0;

    if (direction === 0) {
      return;
    }

    const now = window.performance.now();

    if (now - lastRotateAt.current < 720) {
      return;
    }

    lastRotateAt.current = now;
    setActivePosition((currentPosition) => currentPosition + direction);
  }

  return (
    <section
      id="research"
      className="scroll-mt-6 bg-[#d7dcdf] px-[2vw] py-16 md:py-24"
      aria-labelledby="research-heading"
    >
      <div className="mx-auto grid w-[96vw] gap-12">
        <SectionHeader
          headingId="research-heading"
          eyebrow={siteContent.research.eyebrow}
          title={siteContent.research.title}
          description={siteContent.research.description}
          meta={`${papers.length} papers`}
        />

        {papers.length ? (
          <div
            className="research-carousel-stage relative overflow-hidden"
            onMouseMove={handleMouseMove}
          >
            {renderOffsets.map((offset) => {
              const itemPosition = activePosition + offset;
              const paperIndex = wrapIndex(itemPosition, papers.length);
              const paper = papers[paperIndex];

              return (
                <ResearchCard
                  key={itemPosition}
                  paper={paper}
                  offset={offset}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-[18px] border border-black/[0.06] bg-[#fbfbfb] p-8 text-[14px] font-semibold text-black/42">
            No papers yet.
          </div>
        )}
      </div>
    </section>
  );
}
