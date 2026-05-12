export const navItems = [
  { label: "Committee", href: "#committee", active: false },
  { label: "Research", href: "#research", active: true },
  { label: "Insights", href: "#insights", active: false },
] as const;

export const heroVideo = {
  // Put the file in public/media, then reference it with a browser path.
  // Example: public/media/main_page.mp4 -> /media/main_page.mp4
  src: "/media/main_page.mp4",
  poster: "",
  type: "video/mp4",
  opacity: 0.28,
  fit: "cover",
  position: "center",
} as const;

export const heroKicker = "Forecasting Enginee";

export const heroDescription =
  "We are a quantitative research organization developing advanced AI models for energy markets and power systems.";

export const bottomTags = ["Frontier", "Selective", "Arcane"] as const;
