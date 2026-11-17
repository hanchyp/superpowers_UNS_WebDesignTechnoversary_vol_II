import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ButtonRipple } from "@/components/ButtonRipple";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://wana-project.vercel.app"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "WANA",
    title: "WANA · Pantau hutan. Bagikan pengamatan.",
    description: "Peta bersama untuk melaporkan dan mengikuti indikasi kebakaran hutan dan lahan di Indonesia.",
  },
  twitter: { card: "summary_large_image" },
  title: {
    default: "WANA · Pantau hutan. Bagikan pengamatan.",
    template: "%s · WANA",
  },
  description:
    "Peta bersama untuk melaporkan dan mengikuti indikasi kebakaran hutan dan lahan di Indonesia. Prototipe dengan data simulasi.",
};

export const viewport: Viewport = {
  themeColor: "#0e4d2c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} ${jetbrains.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <ButtonRipple />
        {children}
      </body>
    </html>
  );
}
