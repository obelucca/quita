"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { complaintService } from "@/services/complaint.service";
import {
  Plus,
  FileText,
  Download,
  Calendar,
  DollarSign,
  ArrowRight,
  LogOut,
  User,
  History,
  CheckCircle,
  Building,
  Compass,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RecoveryMap } from "@/components/ui/recovery-map";
import { CustomToastContainer, ToastMessage } from "@/components/ui/custom-toast";

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [pdfDownloads, setPdfDownloads] = useState(0);

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch complaints history
  const { data: complaints, isLoading, error } = useQuery({
    queryKey: ["complaintsHistory"],
    queryFn: () => complaintService.list(),
    enabled: isAuthenticated,
  });

  // Initialize pdf downloads from localStorage or fallback to history length
  useEffect(() => {
    if (complaints) {
      const stored = localStorage.getItem("quota_pdf_downloads");
      if (stored !== null) {
        setPdfDownloads(parseInt(stored));
      } else {
        setPdfDownloads(complaints.length);
        localStorage.setItem("quota_pdf_downloads", complaints.length.toString());
      }
    }
  }, [complaints]);

  const handleDownloadPdf = async (id: string, institution: string) => {
    try {
      await complaintService.downloadPdf(id, `Reclamacao_Quita_${institution.replace(/\s+/g, "_")}.pdf`);
      const updated = pdfDownloads + 1;
      setPdfDownloads(updated);
      localStorage.setItem("quota_pdf_downloads", updated.toString());
      addToast("Download concluído com sucesso!", "success");
    } catch (err) {
      addToast("Erro ao baixar PDF da reclamação.", "error");
    }
  };

  const complaintsCount = complaints?.length || 0;
  const uniqueInstitutionsCount = complaints
    ? new Set(complaints.map((c) => c.institution.toLowerCase().trim())).size
    : 0;

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-brand-offwhite-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-offwhite-100 text-brand-petroleo font-sans antialiased">
      {/* Header */}
      <header className="border-b border-slate-200 bg-brand-offwhite-50/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-brand-emerald-600 w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
              Q
            </div>
            <span className="text-xl font-bold tracking-tight text-brand-petroleo">
              Quita<span className="text-brand-emerald-500">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-brand-offwhite-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <User className="w-4 h-4 text-brand-emerald-600" />
              <span className="text-xs font-semibold text-slate-705">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="text-slate-500 hover:text-rose-650 transition-colors cursor-pointer"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Section & Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between bg-gradient-to-r from-white to-brand-emerald-50/10 border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-petroleo tracking-tight">
                Olá, {user.name.split(" ")[0]}!
              </h1>
              <p className="text-slate-605 text-xs sm:text-sm leading-relaxed font-semibold">
                Aqui está o histórico das suas contestações regulatórias. Use o assistente para iniciar uma nova reclamação com base no seu Registrato.
              </p>
            </div>
            <div>
              <Link href="/wizard">
                <Button variant="primary" className="w-full sm:w-auto shadow-lg shadow-brand-emerald-600/10">
                  <Plus className="w-5 h-5 mr-1" /> Nova Reclamação
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 border border-slate-200 rounded-2xl bg-white p-6 flex flex-col justify-between shadow-sm gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-brand-petroleo flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-brand-emerald-600" />
                Seu Mapa de Recuperação
              </h3>
              <p className="text-xs text-slate-500 font-semibold">Acompanhe seu avanço rumo à resolução das dívidas.</p>
            </div>
             <div className="flex-grow flex items-center justify-center overflow-hidden">
              <div className="w-full max-w-[320px] opacity-90">
                <RecoveryMap state={complaintsCount > 0 ? 5 : 2} showYouAreHere={true} noCardStyle={true} />
              </div>
            </div>
          </div>
        </div>

        {/* Resumo do Usuário */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <Card className="bg-white border-slate-200 p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-emerald-50 border border-brand-emerald-100 flex items-center justify-center text-brand-emerald-600 flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reclamações Geradas</p>
              <p className="text-2xl font-bold text-brand-petroleo mt-0.5">{complaintsCount}</p>
            </div>
          </Card>

          <Card className="bg-white border-slate-200 p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-emerald-50 border border-brand-emerald-100 flex items-center justify-center text-brand-emerald-600 flex-shrink-0">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instituições Analisadas</p>
              <p className="text-2xl font-bold text-brand-petroleo mt-0.5">{uniqueInstitutionsCount}</p>
            </div>
          </Card>

          <Card className="bg-white border-slate-200 p-6 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-emerald-50 border border-brand-emerald-100 flex items-center justify-center text-brand-emerald-600 flex-shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">PDFs Exportados</p>
              <p className="text-2xl font-bold text-brand-petroleo mt-0.5">{pdfDownloads}</p>
            </div>
          </Card>

        </div>

        {/* Complaints History List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-brand-petroleo flex items-center gap-2">
            <History className="w-5 h-5 text-brand-emerald-600" />
            Histórico de Negociações e Reclamações
          </h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-2">
              <div className="w-6 h-6 border-2 border-brand-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-slate-500">Carregando histórico...</span>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-sm text-center">
              Falha ao carregar histórico de reclamações do servidor. Verifique a conexão com a API.
            </div>
          ) : !complaints || complaints.length === 0 ? (
            <Card className="text-center p-12 space-y-4 bg-white border-slate-200 shadow-sm">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-brand-petroleo text-base">Nenhuma reclamação gerada</h3>
                <p className="text-xs text-slate-505 max-w-md mx-auto leading-normal font-semibold">
                  Você ainda não iniciou o fluxo assistido do Quita. Envie seu PDF Registrato para analisar suas pendências e estruturar suas petições.
                </p>
              </div>
              <Link href="/wizard">
                <Button variant="secondary" className="text-xs py-2.5 px-5">
                  Iniciar Assistente Quita <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {complaints.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-brand-emerald-500/20 transition-all group shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-brand-emerald-50 p-2.5 rounded-xl border border-brand-emerald-100 text-brand-emerald-600 flex-shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-brand-petroleo text-base flex items-center gap-2">
                        {item.institution}
                        <span className="text-[10px] bg-brand-emerald-50 text-brand-emerald-700 border border-brand-emerald-100 px-2 py-0.5 rounded-full font-bold">
                          Versão {item.version}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium line-clamp-1">{item.title}</p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-550 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {item.currentDebtValue > 0 && (
                          <span className="flex items-center gap-0.5">
                            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                            Contestação:{" "}
                            <span className="text-brand-petroleo font-bold font-mono">
                              {item.currentDebtValue.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center justify-end gap-2 border-t border-slate-105 sm:border-0 pt-3 sm:pt-0">
                    <Button
                      variant="secondary"
                      onClick={() => handleDownloadPdf(item.id, item.institution)}
                      className="w-full sm:w-auto text-xs py-2 px-4 h-10"
                    >
                      <Download className="w-4 h-4 text-brand-emerald-600 mr-1.5" />
                      Baixar PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-brand-offwhite-50 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Quita. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3 text-slate-400 font-semibold">
            <Link href="/terms" className="hover:text-brand-emerald-650 transition-colors">Termos de Uso</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-brand-emerald-650 transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </footer>

      <CustomToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
