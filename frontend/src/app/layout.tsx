import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "VideoOptima | Fast & Secure Video Optimization",
    template: "%s | VideoOptima",
  },
  description:
    "Compress, convert, trim, or generate thumbnails instantly directly from your browser. No watermarks, completely secure.",
  keywords: [
    "video compressor",
    "video converter",
    "trim video",
    "ffmpeg web",
    "video optimizer",
  ],
  authors: [{ name: "Jean Paul Flores", url: "https://jeanpaulflores.com" }],
  creator: "Jean Paul Flores",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    title: "VideoOptima | Fast & Secure Video Optimization",
    description:
      "Compress, convert, trim, or generate thumbnails instantly. Completely secure.",
    siteName: "VideoOptima",
    // images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'VideoOptima Preview' }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VideoOptima | Fast & Secure Video Optimization",
    description: "Compress, convert, trim, or generate thumbnails instantly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased flex flex-col justify-between">
        <Header />

        <main className="max-w-3xl mx-auto px-4 py-12 flex-1 w-full flex items-center justify-center">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
