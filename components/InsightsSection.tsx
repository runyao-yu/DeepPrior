import { SectionHeader } from "@/components/SectionHeader";
import { assetPath } from "@/lib/asset-path";
import { siteContent } from "@/lib/source-content";
import Image from "next/image";

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
          <div className="grid h-full w-full place-items-center rounded-[10px] border border-dashed border-black/[0.12] bg-white text-center text-[12px] font-semibold text-black/32">
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

export function InsightsSection() {
  const posts = siteContent.analysis.posts;

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

        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => {
            const figures =
              post.figures.length > 0 ? post.figures : [{ title: "", image: "" }];

            return (
              <article
                key={`${post.date}-${post.country}-${post.feature}`}
                className="grid content-start gap-5 rounded-[18px] border border-black/[0.06] bg-[#fbfbfb] p-5 shadow-[0_18px_54px_rgba(31,41,55,0.08),inset_0_1px_0_rgba(255,255,255,0.92)] md:p-7"
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

                <h3 className="m-0 text-[clamp(1.45rem,2.8vw,2.35rem)] font-semibold leading-[1.04] text-black">
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
          })}
        </div>
      </div>
    </section>
  );
}
