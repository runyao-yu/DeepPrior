import { heroVideo } from "@/lib/content";

function inferredVideoType(src: string) {
  if (src.endsWith(".webm")) {
    return "video/webm";
  }

  if (src.endsWith(".ogg") || src.endsWith(".ogv")) {
    return "video/ogg";
  }

  return heroVideo.type;
}

export function HeroBackgroundVideo() {
  if (!heroVideo.src) {
    return null;
  }

  return (
    <video
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={heroVideo.poster || undefined}
      aria-hidden="true"
      style={{
        objectFit: heroVideo.fit,
        objectPosition: heroVideo.position,
        opacity: heroVideo.opacity,
        filter: "grayscale(1) contrast(0.92) brightness(1.08)",
      }}
    >
      <source src={heroVideo.src} type={inferredVideoType(heroVideo.src)} />
    </video>
  );
}
