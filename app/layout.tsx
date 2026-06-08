import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { UpdateBanner } from "@/components/UpdateBanner";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "Oshi-Choki | 推し貯金アプリ",
  description: "推しの行動をトリガーに、一緒に夢を叶える推し貯金アプリ",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "推しチョキ",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  themeColor: "#FF6B9D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
          <UpdateBanner />
          {children}
        </body>
    </html>
  );
}
