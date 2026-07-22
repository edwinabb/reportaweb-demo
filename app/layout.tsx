import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "REPORTAR.APP - Planifica, reporta y valoriza en minutos",
  description: "Sistema de Gestión de Maquinaria Pesada.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://reportar.app"),
  openGraph: {
    title: "REPORTAR.APP - Planifica, reporta y valoriza en minutos",
    description: "Sistema de Gestión de Maquinaria Pesada.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://reportar.app",
    siteName: "REPORTAR.APP",
    images: [
      {
        url: "/og-image.jpg",
        width: 510,
        height: 571,
        alt: "REPORTAR.APP - Sistema de Gestión de Maquinaria Pesada",
      },
    ],
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "REPORTAR.APP - Planifica, reporta y valoriza en minutos",
    description: "Sistema de Gestión de Maquinaria Pesada.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
