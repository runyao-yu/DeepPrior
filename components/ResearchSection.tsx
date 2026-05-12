import { CopyCitationButton } from "@/components/CopyCitationButton";
import { SectionHeader } from "@/components/SectionHeader";
import { assetPath } from "@/lib/asset-path";
import { siteContent } from "@/lib/source-content";
import Image from "next/image";

type Paper = (typeof siteContent.research.papers)[number];
type Figure = Paper["figures"][number];

const researchLinks = [
  ["paperUrl", "Paper"],
  ["dataUrl", "Data"],
  ["codeUrl", "Code"],
] as const;

function FigurePanel({
  figure,
  fallbackLabel,
}: {
  figure?: Figure;
  fallbackLabel: string;
}) {
  const image = figure?.image?.trim();
  const label = figure?.title || fallbackLabel;

  return (
    <figure className="m-0 grid gap-3">
      <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-[16px] border border-black/[0.06] bg-[#fbfbfb] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
        {image ? (
          <Image
            src={assetPath(image)}
            alt={label}
            width={900}
            height={675}
            unoptimized
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full w-full place-items-center rounded-[12px] border border-dashed border-black/[0.12] bg-white text-center text-[12px] font-semibold text-black/32">
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

export function ResearchSection() {
  const papers = siteContent.research.papers;

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

        <div className="grid gap-4">
          {papers.map((paper, index) => {
            const figures =
              paper.figures.length > 0 ? paper.figures : [{ title: "", image: "" }];

            return (
              <article
                key={`${paper.title}-${index}`}
                className="grid gap-7 rounded-[18px] border border-black/[0.06] bg-[#fbfbfb] p-5 shadow-[0_18px_54px_rgba(31,41,55,0.08),inset_0_1px_0_rgba(255,255,255,0.92)] md:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] md:p-7"
              >
                <div className="grid content-start gap-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[12px] font-semibold text-black/48">
                      {paper.year}
                    </span>
                    <span className="rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[12px] font-semibold text-black/48">
                      {paper.journal}
                    </span>
                  </div>
                  <h3 className="m-0 max-w-4xl text-[clamp(1.5rem,2.7vw,2.5rem)] font-semibold leading-[1.02] text-black">
                    {paper.title}
                  </h3>
                  <p className="m-0 text-[14px] font-medium leading-[1.6] text-black/50">
                    {paper.authors}
                  </p>
                  <p className="m-0 max-w-4xl text-[15px] leading-[1.7] text-black/70">
                    {paper.abstract}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {researchLinks.map(([key, label]) => {
                      const href = paper[key];

                      return href ? (
                        <a
                          key={key}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-black/[0.1] bg-white px-3.5 py-2 text-[12px] font-semibold text-black/56 transition hover:border-black/20 hover:text-black"
                        >
                          {label}
                        </a>
                      ) : null;
                    })}
                    <CopyCitationButton text={paper.bibtex} />
                  </div>
                </div>

                <div className="grid content-start gap-4">
                  {figures.map((figure, figureIndex) => (
                    <FigurePanel
                      key={`${paper.title}-${figure.title || figureIndex}`}
                      figure={figure}
                      fallbackLabel={`Figure ${figureIndex + 1}`}
                    />
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
