import { $cn } from "@/utils";
import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "../styles/globals.scss";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "Awais Alwaisy | Frontend Developer",
  description: "",
  openGraph: {
    title: "Awais Alwaisy | Frontend Developer",
    description: "",
    url: "https://alwaisy.dev",
    siteName: "Awais Alwaisy",
    images: "https://alwaisy.dev/og.png",
    locale: "en-US",
    type: "website",
  },
  twitter: {
    title: "Awais Alwaisy | Frontend Developer",
    description: "",
    card: "summary_large_image",
    images: "https://alwaisy.dev/og.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={$cn([inter.variable, sora.variable])}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
