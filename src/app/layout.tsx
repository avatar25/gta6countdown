import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://countdown.shiben.dev";

const description =
  "An automatically updated countdown and release-signal monitor for Grand Theft Auto VI. " +
  "Storefront listings and first-party channels are polled every 15 minutes; every published " +
  "entry is reviewed by a human and tagged official or unverified. No leaked media is hosted here.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Release Signal Monitor",
    template: "%s · Release Signal Monitor",
  },
  description,
  applicationName: "Release Signal Monitor",
  keywords: [
    "release date countdown",
    "storefront monitor",
    "release signals",
    "Grand Theft Auto VI",
  ],
  alternates: {
    canonical: "/",
    types: {
      "application/json": "/api/events.json",
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Release Signal Monitor",
    title: "Release Signal Monitor",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Release Signal Monitor",
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
