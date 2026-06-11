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
