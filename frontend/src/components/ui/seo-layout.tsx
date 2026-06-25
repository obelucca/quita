"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Mail, FileText, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface SeoLayoutProps {
  children: React.ReactNode;
}

export const SeoLayout: React.FC<SeoLayoutProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Reusable Header */}
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-emerald-600 w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
              Q
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Quita<span className="text-emerald-500">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/blog" className="text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors">
              Blog Educativo
            </Link>
            <Link href="/como-obter-registrato" className="text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors">
              Como Tirar Registrato
            </Link>
            <Link href="/o-que-e-scr" className="text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors">
              O que é SCR
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-xs font-bold text-slate-650 hover:text-slate-900 transition-colors">
                  Dashboard
                </Link>
                <Link href="/wizard">
                  <Button variant="primary" className="py-2 px-4 text-xs h-9">
                    Iniciar Assistente
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth" className="text-xs font-bold text-slate-650 hover:text-slate-900 transition-colors">
                  Entrar
                </Link>
                <Link href="/auth?tab=register">
                  <Button variant="primary" className="py-2 px-4 text-xs h-9">
                    Começar Grátis
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">{children}</main>

      {/* Reusable Premium Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-md shadow-sm">
                  Q
                </div>
                <span className="text-lg font-bold text-white tracking-tight">
                  Quita<span className="text-emerald-500">.</span>
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Transformando relatórios complexos do Banco Central em soluções financeiras simples e acessíveis para todos os brasileiros.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-450">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Em conformidade estrita com a LGPD</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Páginas de Ajuda</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/como-obter-registrato" className="hover:text-white transition-colors">
                    Como Obter o Registrato
                  </Link>
                </li>
                <li>
                  <Link href="/como-usar-consumidor-gov" className="hover:text-white transition-colors">
                    Como Usar o Consumidor.gov.br
                  </Link>
                </li>
                <li>
                  <Link href="/como-negociar-dividas" className="hover:text-white transition-colors">
                    Como Negociar Dívidas Bancárias
                  </Link>
                </li>
                <li>
                  <Link href="/o-que-e-scr" className="hover:text-white transition-colors">
                    O que é SCR Banco Central
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Plataforma</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/registrato" className="hover:text-white transition-colors">
                    O Registrato
                  </Link>
                </li>
                <li>
                  <Link href="/consumidor-gov" className="hover:text-white transition-colors">
                    Consumidor.gov
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Blog Educativo
                  </Link>
                </li>
                <li>
                  <Link href="/wizard" className="hover:text-white transition-colors">
                    Iniciar Assistente de Dívidas
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Legal</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Políticas de Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} Quita. Todos os direitos reservados.</span>
            <span>Feito de forma transparente para empoderar o consumidor financeiro.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
