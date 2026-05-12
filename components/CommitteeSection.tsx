import { SectionHeader } from "@/components/SectionHeader";
import { assetPath } from "@/lib/asset-path";
import { siteContent } from "@/lib/source-content";
import Image from "next/image";
import { readdirSync } from "node:fs";
import path from "node:path";

type Member = (typeof siteContent.committee.members)[number];

const linkLabels: Record<string, string> = {
  website: "Website",
  linkedin: "LinkedIn",
  github: "GitHub",
  email: "Email",
};

const logoExtensions = new Set([".jpg", ".jpeg", ".png", ".svg", ".webp"]);

function titleFromFilename(filename: string) {
  return path
    .parse(filename)
    .name
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getUniversityLogos() {
  const logoDirectory = path.join(
    process.cwd(),
    "public",
    "Figure",
    "University",
  );

  try {
    return readdirSync(logoDirectory)
      .filter((filename) => logoExtensions.has(path.extname(filename).toLowerCase()))
      .sort((first, second) => first.localeCompare(second))
      .map((filename) => ({
        name: titleFromFilename(filename),
        image: `Figure/University/${filename}`,
      }));
  } catch {
    return [];
  }
}

const universityLogos = getUniversityLogos();

function normalizeHref(kind: string, href: string) {
  if (kind === "email" && !href.startsWith("mailto:")) {
    return `mailto:${href}`;
  }

  return href;
}

function getRoleGroup(role: string) {
  const normalizedRole = role.toLowerCase().replace(/\s+/g, "");

  if (
    normalizedRole === "founder" ||
    normalizedRole === "co-founder" ||
    normalizedRole === "cofounder"
  ) {
    return "founders";
  }

  if (normalizedRole === "chair") {
    return "chairs";
  }

  return "members";
}

function MemberCard({ member }: { member: Member }) {
  const links = Object.entries(member.links ?? {}).filter(([, value]) =>
    Boolean(value),
  );

  return (
    <article className="committee-member-card grid content-start gap-4 overflow-hidden rounded-[18px] border border-black/[0.06] bg-[#fbfbfb] p-5 shadow-[0_18px_54px_rgba(31,41,55,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-black/[0.08] bg-white px-3 text-[11px] font-semibold text-black/42">
          {member.initials}
        </span>
        <span className="rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase text-black/40">
          {member.role}
        </span>
      </div>

      <div>
        <h3 className="m-0 text-[21px] font-semibold leading-tight text-black">
          {member.name}
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {member.universities.map((university) => (
            <span
              key={university}
              className="rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[11px] font-medium leading-snug text-black/56"
            >
              {university}
            </span>
          ))}
        </div>
      </div>

      <div className="thin-scrollbar h-[92px] overflow-y-auto pr-2 text-[13px] leading-[1.58] text-black/64">
        <p className="m-0">{member.bio}</p>
      </div>

      {links.length ? (
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {links.map(([kind, href]) => (
            <a
              key={`${member.name}-${kind}`}
              href={normalizeHref(kind, String(href))}
              target={kind === "email" ? undefined : "_blank"}
              rel={kind === "email" ? undefined : "noreferrer"}
              className="rounded-full border border-black/[0.1] bg-white px-3 py-2 text-[12px] font-semibold text-black/56 transition hover:border-black/20 hover:text-black"
            >
              {linkLabels[kind] ?? kind}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function CommitteeColumn({
  title,
  members,
  direction,
}: {
  title: string;
  members: Member[];
  direction: "down" | "up";
}) {
  if (!members.length) {
    return null;
  }

  return (
    <div className="grid gap-4">
      <h3 className="m-0 text-[13px] font-semibold uppercase text-black/38">
        {title} ({members.length})
      </h3>
      <div className="committee-column-window">
        <div
          className="committee-column-track"
          data-direction={direction}
          aria-live="off"
        >
          {[0, 1].map((setIndex) => (
            <div
              key={`${title}-${setIndex}`}
              className="committee-column-stack"
            >
              {members.map((member) => (
                <MemberCard
                  key={`${title}-${setIndex}-${member.name}-${member.role}`}
                  member={member}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogoColumn() {
  return (
    <div className="grid gap-4">
      <h3 className="m-0 text-center text-[13px] font-semibold uppercase text-black/38">
        Institutes ({universityLogos.length})
      </h3>
      <div className="committee-column-window">
        <div
          className="committee-column-track committee-logo-track"
          data-direction="up"
          aria-live="off"
        >
          {[0, 1].map((setIndex) => (
            <div
              key={`logos-${setIndex}`}
              className="committee-logo-stack"
              aria-hidden={setIndex === 1}
            >
              {universityLogos.map((logo) => (
                <div
                  key={`${setIndex}-${logo.name}`}
                  className="committee-logo-item grid place-items-center"
                >
                  <Image
                    src={assetPath(logo.image)}
                    alt={logo.name}
                    width={360}
                    height={180}
                    unoptimized
                    className="committee-logo-image object-contain"
                    loading="eager"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CommitteeSection() {
  const members = siteContent.committee.members;
  const founders = members.filter(
    (member) => getRoleGroup(member.role) === "founders",
  );
  const chairs = members.filter((member) => getRoleGroup(member.role) === "chairs");
  const regularMembers = members.filter(
    (member) => getRoleGroup(member.role) === "members",
  );

  return (
    <section
      id="committee"
      className="scroll-mt-6 bg-[#d7dcdf] px-[2vw] py-16 md:py-24"
      aria-labelledby="committee-heading"
    >
      <div className="mx-auto grid w-[96vw] gap-12">
        <SectionHeader
          headingId="committee-heading"
          eyebrow={siteContent.committee.eyebrow}
          title="Committee"
          description={siteContent.committee.description}
          meta={`${members.length} researchers`}
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(170px,0.68fr)]">
          <CommitteeColumn title="Founders" members={founders} direction="down" />
          <CommitteeColumn title="Chairs" members={chairs} direction="up" />
          <CommitteeColumn
            title="Members"
            members={regularMembers}
            direction="down"
          />
          <LogoColumn />
        </div>
      </div>
    </section>
  );
}
