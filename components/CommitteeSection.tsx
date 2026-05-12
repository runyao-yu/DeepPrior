"use client";

import { SectionHeader } from "@/components/SectionHeader";
import { siteContent } from "@/lib/source-content";
import { useState } from "react";

type Member = (typeof siteContent.committee.members)[number];

const membersPerRow = 4;

const linkLabels: Record<string, string> = {
  website: "Website",
  linkedin: "LinkedIn",
  github: "GitHub",
  email: "Email",
};

function normalizeHref(kind: string, href: string) {
  if (kind === "email" && !href.startsWith("mailto:")) {
    return `mailto:${href}`;
  }

  return href;
}

function getRoleGroup(role: string) {
  const normalizedRole = role.toLowerCase().replace(/\s+/g, "");

  if (normalizedRole === "founder" || normalizedRole === "co-founder") {
    return "founders";
  }

  if (normalizedRole === "cofounder") {
    return "founders";
  }

  if (normalizedRole === "chair") {
    return "chairs";
  }

  return "members";
}

function MemberCard({ member, revealIndex }: { member: Member; revealIndex: number }) {
  const links = Object.entries(member.links ?? {}).filter(([, value]) =>
    Boolean(value),
  );

  return (
    <article
      className="committee-card-reveal grid h-[392px] content-start gap-4 overflow-hidden rounded-[18px] border border-black/[0.06] bg-[#fbfbfb] p-5 shadow-[0_18px_54px_rgba(31,41,55,0.08),inset_0_1px_0_rgba(255,255,255,0.92)]"
      style={{ animationDelay: `${Math.min(revealIndex % membersPerRow, 3) * 95}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-black/[0.08] bg-white px-3 text-[11px] font-semibold text-black/42">
          {member.initials}
        </span>
        <span className="rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase text-black/40">
          {member.role}
        </span>
      </div>

      <div>
        <h3 className="m-0 text-[22px] font-semibold leading-tight text-black">
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

      <div className="thin-scrollbar h-[104px] overflow-y-auto pr-2 text-[13px] leading-[1.6] text-black/64">
        <p className="m-0">{member.bio}</p>
      </div>

      {member.bio.length > 230 ? (
        <span className="-mt-2 text-[11px] font-semibold uppercase text-black/32">
          Scroll for more
        </span>
      ) : null}

      {links.length ? (
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {links.map(([kind, href]) => (
            <a
              key={`${member.name}-${kind}`}
              href={normalizeHref(kind, String(href))}
              target={kind === "email" ? undefined : "_blank"}
              rel={kind === "email" ? undefined : "noreferrer"}
              className="rounded-full border border-black/[0.1] bg-white px-3.5 py-2 text-[12px] font-semibold text-black/56 transition hover:border-black/20 hover:text-black"
            >
              {linkLabels[kind] ?? kind}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function MemberGroup({
  title,
  members,
}: {
  title: string;
  members: Member[];
}) {
  const [visibleRows, setVisibleRows] = useState(1);
  const visibleCount = visibleRows * membersPerRow;
  const visibleMembers = members.slice(0, visibleCount);
  const hasMore = visibleCount < members.length;

  if (!members.length) {
    return null;
  }

  return (
    <div className="grid gap-4">
      <h3 className="m-0 text-[13px] font-semibold uppercase text-black/38">
        {title}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visibleMembers.map((member, index) => (
          <MemberCard
            key={`${member.name}-${member.role}`}
            member={member}
            revealIndex={index}
          />
        ))}
      </div>
      {hasMore ? (
        <button
          type="button"
          onClick={() => setVisibleRows((currentRows) => currentRows + 1)}
          className="mt-1 w-fit rounded-full border border-black/[0.1] bg-white/55 px-4 py-2 text-[12px] font-semibold text-black/56 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl transition hover:border-black/20 hover:bg-white/72 hover:text-black"
        >
          See more
        </button>
      ) : null}
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

        <div className="grid gap-10">
          <MemberGroup title="Founders" members={founders} />
          <MemberGroup title="Chairs" members={chairs} />
          <MemberGroup title="Members" members={regularMembers} />
        </div>
      </div>
    </section>
  );
}
