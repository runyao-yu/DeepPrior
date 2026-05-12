import { assetPath } from "@/lib/asset-path";
import Image from "next/image";

export function LogoPlaceholder() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Image
        src={assetPath("/Figure/D.png")}
        alt="DeepPrior logo"
        width={32}
        height={32}
        unoptimized
        className="h-8 w-8 shrink-0 object-contain"
      />
      <span className="truncate text-[15px] font-semibold leading-none text-black/85 md:text-base">
        DeepPrior
      </span>
    </div>
  );
}
