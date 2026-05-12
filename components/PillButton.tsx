import type { ReactNode } from "react";

type PillButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "soft" | "solid" | "outline";
  className?: string;
};

const variants = {
  soft: "border-transparent bg-[#eceef1]/85 text-black/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:bg-[#e6e8eb]",
  solid: "border-black bg-black text-white shadow-[0_12px_28px_rgba(0,0,0,0.16)] hover:bg-black/88",
  outline:
    "border-black/[0.15] bg-white/55 text-black/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] hover:border-black/[0.24] hover:text-black/78",
};

export function PillButton({
  children,
  href,
  variant = "soft",
  className = "",
}: PillButtonProps) {
  const classes = [
    "inline-flex min-h-10 items-center justify-center rounded-full border px-5 text-[13px] font-medium leading-none transition duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40 md:px-6",
    variants[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <a className={classes} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} type="button">
      {children}
    </button>
  );
}
