import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  title: {
    default: "Octo Search",
    template: "%s · Octo Search",
  },
  description: "Search GitHub users, organizations, and repositories.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Octo Search",
    description: "Search GitHub users, organizations, and repositories.",
    url: siteUrl,
    siteName: "Octo Search",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Octo Search",
    description: "Search GitHub users, organizations, and repositories.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
