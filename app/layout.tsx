import type { Metadata } from "next";
import { DM_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const dmMono = DM_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://amy-projects-2026.amysterling.chatgpt.site"),
  title: "Amy Sterling — 2026 Project Index",
  description: "53 public repositories active in 2026: brains, games, tools, experiments, and beautifully weird ideas.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "53 Projects. Seven Rooms. One Very Curious Year.",
    description: "Explore Amy Sterling's 2026 project exhibition: brains, games, tools, AI collaborations, data stories, and ridiculous internet experiments.",
    images: [{ url: "/og.png", width: 1792, height: 935, alt: "Amy Sterling's 2026 Project Index" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${manrope.variable} ${dmMono.variable}`}>{children}</body></html>;
}
