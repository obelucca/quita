import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { SITE_URL } from "@/lib/site-url";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Quita — Resolva Suas Dívidas Sem Burocracia",
    template: "%s | Quita"
  },

  description:
    "Entenda seu Registrato, gere manifestações para bancos e recupere seu controle financeiro.",

  keywords: [
    "registrato",
    "consumidor gov",
    "renegociação de dívidas",
    "SCR",
    "Banco Central",
    "nome negativado"
  ],

  openGraph: {
    title: "Quita — Resolva Suas Dívidas Sem Burocracia",
    description:
      "Entenda seu Registrato, gere manifestações para bancos e recupere seu controle financeiro.",
    url: SITE_URL,
    siteName: "Quita",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Quita - Resolução de Dívidas",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Quita — Resolva Suas Dívidas Sem Burocracia",
    description:
      "Entenda seu Registrato, gere manifestações para bancos e recupere seu controle financeiro.",
    images: [`${SITE_URL}/og-image.png`],
  },

  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Quita",
    "url": SITE_URL,
    "logo": `${SITE_URL}/icon.png`,
    "sameAs": [
      "https://www.instagram.com/quita.ia"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Quita",
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/blog?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html
      lang="pt-BR"
      className={`${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#021d17] text-white font-sans flex flex-col">
        <Providers>{children}</Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema)
          }}
        />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
