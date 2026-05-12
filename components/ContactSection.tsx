import { siteContent } from "@/lib/source-content";
import type { ReactNode } from "react";

function ContactColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-4">
      <h3 className="m-0 text-[13px] font-semibold uppercase text-black/38">
        {title}
      </h3>
      <div className="grid gap-2 text-[18px] font-semibold leading-[1.35] text-black/78">
        {children}
      </div>
    </section>
  );
}

function ContactMarquee() {
  const phrases = Array.from({ length: 4 }, (_, index) => index);

  return (
    <div className="contact-marquee" aria-hidden="true">
      <div className="contact-marquee-track">
        {phrases.map((index) => (
          <span className="contact-marquee-phrase" key={index}>
            <span>DeepLearning</span>
            <span>MeetsDomainPrior</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ContactSection() {
  const { footer } = siteContent;

  return (
    <section
      id="contact"
      className="scroll-mt-6 bg-[#d7dcdf] px-[2vw] pb-[2svh] pt-16 md:pt-24"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto grid w-[96vw] gap-8">
        <ContactMarquee />

        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,440px)] md:items-end">
          <div>
            <p className="m-0 mb-5 text-[12px] font-semibold uppercase text-black/38">
              Contact
            </p>
            <h2
              id="contact-heading"
              className="section-title-rise m-0 max-w-4xl text-[clamp(2.25rem,5vw,4.75rem)] font-semibold leading-[0.96] text-black"
            >
              Signals for energy intelligence.
            </h2>
          </div>
          <p className="m-0 max-w-[440px] text-[15px] font-medium leading-[1.6] text-black/60 md:text-right md:text-[16px]">
            Reach DeepPrior for research collaborations, forecasting work, and
            energy-system AI inquiries.
          </p>
        </div>

        <div className="grid gap-10 rounded-[24px] border border-black/[0.06] bg-[#fbfbfb] p-7 shadow-hero md:grid-cols-3 md:p-10">
          <ContactColumn title={footer.locationTitle}>
            {footer.locationLines.map((line) => (
              <p key={line} className="m-0">
                {line}
              </p>
            ))}
          </ContactColumn>

          <ContactColumn title={footer.contactTitle}>
            {footer.contactLines.map((line) => {
              const isEmail = line.includes("@");

              return isEmail ? (
                <a
                  key={line}
                  href={`mailto:${line}`}
                  className="transition hover:text-black"
                >
                  {line}
                </a>
              ) : (
                <p key={line} className="m-0">
                  {line}
                </p>
              );
            })}
          </ContactColumn>

          <ContactColumn title={footer.socialTitle}>
            {footer.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-black"
              >
                {social.label}
              </a>
            ))}
          </ContactColumn>
        </div>
      </div>
    </section>
  );
}
