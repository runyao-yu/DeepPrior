import { assetPath } from "@/lib/asset-path";
import Image from "next/image";

export function LogoPlaceholder() {
  return (
    <div className="grid h-[56px] w-[56px] shrink-0 place-items-center overflow-hidden rounded-[10px] border border-black/[0.08] bg-[#eceef1]/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <Image
        src={assetPath("/Figure/D.png")}
        alt="DeepPrior logo"
        width={56}
        height={56}
        unoptimized
        className="h-full w-full object-cover"
      />
    </div>
  );
}
