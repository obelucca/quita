import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://quita.com.br"),

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
    url: "https://quita.com.br",
    siteName: "Quita",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
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
    images: ["/og-image.png"],
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
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Quita",
              "url": "https://quita.com.br",
              "logo": "https://quita.com.br/icon.png",
              "sameAs": []
            })
          }}
        />
      </body>
    </html>
  );
}
