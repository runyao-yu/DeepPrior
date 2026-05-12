import { LogoPlaceholder } from "@/components/LogoPlaceholder";
import { PillButton } from "@/components/PillButton";
import { navItems } from "@/lib/content";

export function Navbar() {
  return (
    <nav
      aria-label="Primary navigation"
      className="absolute left-5 right-5 top-5 z-30 flex flex-col gap-4 md:left-9 md:right-9 md:top-8 md:flex-row md:items-center md:justify-between"
    >
      <LogoPlaceholder />

      <div className="flex flex-wrap items-center gap-2 md:absolute md:left-1/2 md:-translate-x-1/2 md:justify-center">
        {navItems.map((item) => (
          <PillButton
            key={item.label}
            href={item.href}
            variant={item.active ? "solid" : "soft"}
          >
            {item.label}
          </PillButton>
        ))}
      </div>

      <div className="absolute right-0 top-0 md:static">
        <PillButton href="#contact" variant="solid" className="min-h-9 px-5">
          Contact
        </PillButton>
      </div>
    </nav>
  );
}
