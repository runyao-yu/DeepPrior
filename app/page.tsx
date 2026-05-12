import { BottomInfo } from "@/components/BottomInfo";
import { CommitteeSection } from "@/components/CommitteeSection";
import { ContactSection } from "@/components/ContactSection";
import { GradientAura } from "@/components/GradientAura";
import { HeroShell } from "@/components/HeroShell";
import { HeroTitle } from "@/components/HeroTitle";
import { InsightsSection } from "@/components/InsightsSection";
import { Navbar } from "@/components/Navbar";
import { ResearchSection } from "@/components/ResearchSection";

export default function Home() {
  return (
    <main>
      <HeroShell>
        <Navbar />
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center px-5">
          <GradientAura />
          <HeroTitle />
        </div>
        <BottomInfo />
      </HeroShell>
      <CommitteeSection />
      <ResearchSection />
      <InsightsSection />
      <ContactSection />
    </main>
  );
}
