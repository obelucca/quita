import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Quita — Resolva Suas Dívidas Sem Burocracia",
  description: "Entenda o relatório Registrato do Banco Central, identifique juros abusivos e gere sua petição ou reclamação para o Consumidor.gov.br em minutos.",
  openGraph: {
    title: "Quita — Resolva Suas Dívidas Sem Burocracia",
    description: "Entenda o relatório Registrato do Banco Central, identifique juros abusivos e gere sua petição ou reclamação para o Consumidor.gov.br em minutos.",
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
    description: "Entenda o relatório Registrato do Banco Central, identifique juros abusivos e gere sua petição ou reclamação para o Consumidor.gov.br em minutos.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.svg",
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
      </body>
    </html>
  );
}
