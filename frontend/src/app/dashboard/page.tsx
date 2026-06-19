"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintService } from "@/services/complaint.service";
import { debtService } from "@/services/debt.service";
import { documentService } from "@/services/document.service";
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
  Trash2,
  AlertTriangle,
  X,
  RefreshCw,
  Copy,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RecoveryMap } from "@/components/ui/recovery-map";
import { CustomToastContainer, ToastMessage } from "@/components/ui/custom-toast";
import { CustomModal } from "@/components/ui/custom-modal";
import { motion, AnimatePresence } from "framer-motion";

function StatCardSkeleton() {
  return (
    <Card className="bg-white border-slate-200 p-6 flex items-center gap-4 shadow-sm animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0"></div>
      <div className="space-y-2 flex-grow">
        <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        <div className="h-6 bg-slate-200 rounded w-1/2"></div>
      </div>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-pulse p-4 space-y-3">
      <div className="h-8 bg-slate-100 rounded w-full"></div>
      <div className="h-6 bg-slate-100 rounded w-full"></div>
      <div className="h-6 bg-slate-100 rounded w-full"></div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-4 flex-grow">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0"></div>
            <div className="space-y-2 flex-grow">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          </div>
          <div className="w-24 h-10 bg-slate-100 rounded-xl"></div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pdfDownloads, setPdfDownloads] = useState(0);

  // Modal and dialog states
  const [isClearDocsModalOpen, setIsClearDocsModalOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [detailComplaintText, setDetailComplaintText] = useState("");

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
  const { data: complaints, isLoading: loadingComplaints, error: errorComplaints } = useQuery({
    queryKey: ["complaintsHistory"],
    queryFn: () => complaintService.list(),
    enabled: isAuthenticated,
  });

  // Fetch debt insights
  const { data: insightsData, isLoading: loadingInsights } = useQuery({
    queryKey: ["debtInsights"],
    queryFn: () => debtService.getInsights(),
    enabled: isAuthenticated,
  });

  // Fetch documents list
  const { data: documentsData, isLoading: loadingDocuments } = useQuery({
    queryKey: ["userDocuments"],
    queryFn: () => documentService.list(),
    enabled: isAuthenticated,
  });

  // Fetch selected complaint details
  const { data: selectedComplaint, isLoading: loadingComplaintDetail, error: errorComplaintDetail } = useQuery({
    queryKey: ["complaintDetail", selectedComplaintId],
    queryFn: () => complaintService.getById(selectedComplaintId!),
    enabled: !!selectedComplaintId,
  });

  // Sync details text when fetched
  useEffect(() => {
    if (selectedComplaint) {
      setDetailComplaintText(selectedComplaint.complaint);
    }
  }, [selectedComplaint]);

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

  // Clear documents mutation
  const clearDocsMutation = useMutation({
    mutationFn: () => documentService.clear(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userDocuments"] });
      queryClient.invalidateQueries({ queryKey: ["debtInsights"] });
      addToast("Todos os documentos foram removidos com sucesso.", "success");
    },
    onError: (err: any) => {
      addToast(err.data?.message || "Erro ao remover documentos.", "error");
    },
  });

  // Regenerate complaint mutation
  const regenerateMutation = useMutation({
    mutationFn: (data: { id: string; value?: number }) =>
      complaintService.regenerate(data.id, data.value),
    onSuccess: (data) => {
      setDetailComplaintText(data.complaint);
      queryClient.invalidateQueries({ queryKey: ["complaintsHistory"] });
      addToast("Reclamação regenerada com sucesso!", "success");
    },
    onError: () => {
      addToast("Erro ao regenerar a contestação.", "error");
    },
  });

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

  const handleModalRegenerate = () => {
    if (!selectedComplaintId) return;
    const historyItem = complaints?.find((c) => c.id === selectedComplaintId);
    regenerateMutation.mutate({
      id: selectedComplaintId,
      value: historyItem?.currentDebtValue,
    });
  };

  const complaintsCount = complaints?.length || 0;
  const uniqueInstitutionsCount = complaints
    ? new Set(complaints.map((c) => c.institution.toLowerCase().trim())).size
    : 0;

  const totalDebtsAmount = insightsData?.totalAmount ?? 0;
  const largestDebtAmount = insightsData?.largestInstitutionAmount ?? 0;
  const largestDebtInstitution = insightsData?.largestInstitution ?? "";
  const institutionsCount = insightsData?.institutionsCount ?? uniqueInstitutionsCount;

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
        {loadingInsights ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Credores Analisados</p>
                <p className="text-2xl font-bold text-brand-petroleo mt-0.5">
                  {institutionsCount}
                </p>
              </div>
            </Card>

            <Card className="bg-white border-slate-200 p-6 flex items-center gap-4 shadow-sm relative overflow-hidden">
              {totalDebtsAmount > 10000 && (
                <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase">
                  Volume Alto
                </div>
              )}
              <div className="w-12 h-12 rounded-xl bg-brand-emerald-50 border border-brand-emerald-100 flex items-center justify-center text-brand-emerald-650 flex-shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Dívidas</p>
                <p className="text-xl font-bold text-brand-petroleo mt-0.5 font-mono">
                  {totalDebtsAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            </Card>

            <Card className="bg-white border-slate-200 p-6 flex items-center gap-4 shadow-sm relative overflow-hidden">
              {largestDebtAmount > 5000 && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase">
                  Foco Crítico
                </div>
              )}
              <div className="w-12 h-12 rounded-xl bg-brand-emerald-50 border border-brand-emerald-100 flex items-center justify-center text-brand-emerald-600 flex-shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Maior Apontamento</p>
                <p className="text-lg font-bold text-brand-petroleo mt-0.5 font-mono leading-tight">
                  {largestDebtAmount > 0
                    ? largestDebtAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : "Nenhum"}
                </p>
                {largestDebtInstitution && (
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block truncate max-w-[150px]" title={largestDebtInstitution}>
                    {largestDebtInstitution}
                  </span>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Alertas e Recomendações */}
        {!loadingInsights && insightsData?.recommendations && insightsData.recommendations.length > 0 ? (
          <Card className="bg-white border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-brand-petroleo flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <Lightbulb className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              Diretrizes de Negociação e Alertas Financeiros
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-semibold leading-relaxed text-slate-700">
              {insightsData.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-amber-50/40 border border-amber-100/70 p-3 rounded-xl flex items-start gap-2 shadow-inner">
                  <span className="text-amber-605 font-bold">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </Card>
        ) : !loadingInsights && (!insightsData || totalDebtsAmount === 0) ? (
          <Card className="bg-white border-slate-200 p-6 shadow-sm flex items-start gap-3.5">
            <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600 border border-amber-100 flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-brand-petroleo">Nenhum dado financeiro ou insights disponíveis</h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Envie um documento Registrato no assistente para gerar diretrizes de negociação e alertas de riscos financeiros de forma automatizada.
              </p>
            </div>
          </Card>
        ) : null}

        {/* Seus Documentos SCR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-petroleo flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-emerald-600" />
              Seus Documentos SCR
            </h2>
            {documentsData && documentsData.length > 0 && (
              <button
                onClick={() => setIsClearDocsModalOpen(true)}
                className="text-xs bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-800 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-semibold shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar Documentos
              </button>
            )}
          </div>

          {loadingDocuments ? (
            <TableSkeleton />
          ) : !documentsData || documentsData.length === 0 ? (
            <Card className="text-center p-8 bg-white border-slate-200 shadow-sm text-slate-550 text-xs font-semibold flex flex-col items-center justify-center gap-2 py-10">
              <FileText className="w-8 h-8 text-slate-300" />
              <div>
                <p className="font-bold text-brand-petroleo text-sm">Nenhum Registrato enviado ainda.</p>
                <p className="text-slate-400 font-semibold mt-0.5">Faça upload do seu primeiro documento para iniciar a análise.</p>
              </div>
            </Card>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50">
                    <tr className="text-slate-500 font-bold uppercase tracking-wider text-left">
                      <th className="px-6 py-3">Nome do Arquivo</th>
                      <th className="px-6 py-3">Data de Envio</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700 font-semibold">
                    {documentsData.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 flex items-center gap-2 font-bold text-brand-petroleo">
                          <FileText className="w-4 h-4 text-brand-emerald-650" />
                          {doc.originalFilename}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(doc.uploadDate).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            doc.status === "PROCESSED" || doc.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Complaints History List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-brand-petroleo flex items-center gap-2">
            <History className="w-5 h-5 text-brand-emerald-600" />
            Histórico de Negociações e Reclamações
          </h2>

          {loadingComplaints ? (
            <HistorySkeleton />
          ) : errorComplaints ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-sm text-center font-semibold">
              Falha ao carregar histórico de reclamações do servidor. Verifique a conexão com a API.
            </div>
          ) : !complaints || complaints.length === 0 ? (
            <Card className="text-center p-12 space-y-4 bg-white border-slate-200 shadow-sm">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-brand-petroleo text-base">Nenhuma reclamação gerada</h3>
                <p className="text-xs text-slate-505 max-w-md mx-auto leading-normal font-semibold">
                  Após analisar suas dívidas você poderá criar reclamações regulatórias. Envie seu Registrato no assistente.
                </p>
              </div>
              <Link href="/wizard">
                <Button variant="secondary" className="text-xs py-2.5 px-5 font-semibold">
                  Iniciar Assistente Quita <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {complaints.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-brand-emerald-500/20 transition-all group shadow-sm cursor-pointer"
                  onClick={() => setSelectedComplaintId(item.id)}
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

                  <div className="w-full sm:w-auto flex items-center justify-end gap-2 border-t border-slate-100 sm:border-0 pt-3 sm:pt-0">
                    <Button
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPdf(item.id, item.institution);
                      }}
                      className="w-full sm:w-auto text-xs py-2 px-4 h-10 cursor-pointer font-semibold"
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

      {/* Modal de Detalhes da Reclamação */}
      <AnimatePresence>
        {selectedComplaintId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!regenerateMutation.isPending) {
                  setSelectedComplaintId(null);
                  setDetailComplaintText("");
                }
              }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl p-6 mx-4 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
                <div className="flex items-center gap-2">
                  <div className="bg-brand-emerald-50 p-2 rounded-xl text-brand-emerald-600 flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {selectedComplaint?.institution || "Carregando..."}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Visualização do Texto da Reclamação
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!regenerateMutation.isPending) {
                      setSelectedComplaintId(null);
                      setDetailComplaintText("");
                    }
                  }}
                  className="text-slate-400 hover:text-slate-650 transition-colors p-1"
                  disabled={regenerateMutation.isPending}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {loadingComplaintDetail ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-2">
                    <div className="w-6 h-6 border-2 border-brand-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-500 font-semibold">Carregando detalhes...</span>
                  </div>
                ) : errorComplaintDetail ? (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs text-center font-semibold">
                    Erro ao buscar detalhes da reclamação no servidor.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={detailComplaintText}
                        onChange={(e) => setDetailComplaintText(e.target.value)}
                        disabled={regenerateMutation.isPending}
                        className="w-full h-[300px] bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-705 focus:outline-none focus:ring-1 focus:ring-brand-emerald-500 leading-relaxed resize-none shadow-inner"
                      />
                      {regenerateMutation.isPending && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 rounded-xl">
                          <div className="w-6 h-6 border-2 border-brand-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs font-bold text-brand-emerald-700">Regenerando texto...</span>
                        </div>
                      )}
                    </div>

                    {selectedComplaint?.disclaimer && (
                      <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-amber-705 leading-relaxed font-semibold">
                        <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 text-amber-600 mt-0.5" />
                        <span>{selectedComplaint.disclaimer}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-slate-200 pt-4 gap-3">
                <div className="text-[11px] text-slate-400 font-bold">
                  {selectedComplaint?.attachments && (
                    <span>Anexos sugeridos: {selectedComplaint.attachments.join(", ")}</span>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleModalRegenerate}
                    disabled={regenerateMutation.isPending || loadingComplaintDetail}
                    className="text-xs h-9 font-semibold"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${regenerateMutation.isPending ? "animate-spin" : ""}`} />
                    Regenerar Texto
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      navigator.clipboard.writeText(detailComplaintText);
                      addToast("Texto copiado!", "success");
                    }}
                    disabled={regenerateMutation.isPending || loadingComplaintDetail}
                    className="text-xs h-9 font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Copiar Texto
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CustomModal
        isOpen={isClearDocsModalOpen}
        onClose={() => setIsClearDocsModalOpen(false)}
        onConfirm={() => clearDocsMutation.mutate()}
        title="Limpar Documentos"
        description="Tem certeza que deseja remover todos os documentos SCR enviados? Isso apagará seus dados no servidor e atualizará seus insights de dívidas."
        confirmText="Sim, remover"
        cancelText="Cancelar"
        isDanger={true}
      />

      <CustomToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
