import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

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
    url: siteUrl,
    siteName: "Quita",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
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
    images: [`${siteUrl}/og-image.png`],
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Quita",
    "url": siteUrl,
    "logo": `${siteUrl}/icon.png`,
    "sameAs": [
      "https://www.instagram.com/quita.ia"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Quita",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/blog?search={search_term_string}`
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
      </body>
    </html>
  );
}
