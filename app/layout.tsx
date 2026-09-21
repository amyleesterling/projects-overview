import type { Metadata } from "next";
import { DM_Mono, Manrope } from "next/font/google";
import "./globals.css";
import catalog from "./data/catalog.json";
import { publicPath, siteUrl } from "./site";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const dmMono = DM_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Amy Sterling — 2026 Project Index",
  description: `${catalog.repositories.length} projects across the collection: brains, games, tools, experiments, and beautifully weird ideas.`,
  icons: { icon: publicPath("/favicon.svg"), shortcut: publicPath("/favicon.svg") },
  openGraph: {
    title: `${catalog.repositories.length} Projects. Seven Rooms. One Curious Collection.`,
    description: "Explore Amy Sterling's 2026 project exhibition: brains, games, tools, AI collaborations, data stories, and ridiculous internet experiments.",
    images: [{ url: `${siteUrl}/readme/neuron-hero.png`, width: 1440, height: 1000, alt: "Amy Sterling's project exhibition, September 2026" }],
  },
  twitter: { card: "summary_large_image", images: [`${siteUrl}/readme/neuron-hero.png`] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${manrope.variable} ${dmMono.variable}`}>{children}</body></html>;
}
