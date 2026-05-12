import { assetPath } from "@/lib/asset-path";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeepPrior",
  description:
    "DeepPrior is a quantitative AI research organization for energy markets and power systems.",
  icons: {
    icon: [{ url: assetPath("/Figure/D.png?v=2"), type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
