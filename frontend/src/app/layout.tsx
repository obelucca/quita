import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
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
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 text-slate-100 font-sans flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
