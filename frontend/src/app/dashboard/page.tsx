"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintService } from "@/services/complaint.service";
import { debtService } from "@/services/debt.service";
import { documentService } from "@/services/document.service";
import { creditsService } from "@/services/credits.service";
import { paymentService } from "@/services/payment.service";
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
  CreditCard,
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
  const [purchasePendingPackage, setPurchasePendingPackage] = useState<string | null>(null);

  const handleBuyCredits = async (packageId: string) => {
    setPurchasePendingPackage(packageId);
    try {
      const response = await paymentService.createCheckout(packageId);
      if (response && response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        addToast("Não foi possível gerar o link de pagamento.", "error");
      }
    } catch (err: any) {
      addToast(err.data?.message || "Erro ao iniciar compra de créditos.", "error");
    } finally {
      setPurchasePendingPackage(null);
    }
  };

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

  // Fetch credits status
  const { data: creditsData, isLoading: loadingCredits } = useQuery({
    queryKey: ["userCredits"],
    queryFn: () => creditsService.getCredits(),
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

  // Recovery Journey state (localStorage-based for SDD-018)
  const [recoveryJourney, setRecoveryJourney] = useState<{
    status: string;
    companyName: string;
    complaintNumber: string;
    createdAt: string;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("quita_recovery_journey");
    if (stored) {
      try {
        setRecoveryJourney(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing recovery journey:", e);
      }
    }
  }, []);

  const handleUpdateStatus = (newStatus: string) => {
    if (!recoveryJourney) return;
    const updated = { ...recoveryJourney, status: newStatus };
    setRecoveryJourney(updated);
    localStorage.setItem("quita_recovery_journey", JSON.stringify(updated));
    addToast(`Status da reclamação atualizado para: ${getStatusLabel(newStatus)}`, "success");
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "RECLAMACAO_ENVIADA": return "Reclamação Enviada";
      case "AGUARDANDO_RESPOSTA": return "Aguardando Resposta";
      case "RESPONDIDA": return "Respondida";
      case "NEGOCIACAO_EM_ANDAMENTO": return "Negociação em Andamento";
      case "ENCERRADA": return "Encerrada";
      default: return status;
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case "RECLAMACAO_ENVIADA": return 1;
      case "AGUARDANDO_RESPOSTA": return 2;
      case "RESPONDIDA": return 3;
      case "NEGOCIACAO_EM_ANDAMENTO": return 4;
      case "ENCERRADA": return 5;
      default: return 1;
    }
  };

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
            {creditsData && (
              <div className="flex items-center gap-1.5 bg-brand-emerald-50 border border-brand-emerald-100 text-brand-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                <CreditCard className="w-4 h-4 text-brand-emerald-650" />
                <span>Créditos disponíveis: {creditsData.availableCredits}</span>
              </div>
            )}
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
          <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-r from-white to-brand-emerald-50/10 border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm gap-6">
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

          {/* Card Seus Créditos */}
          <div className="lg:col-span-3 border border-slate-200 rounded-2xl bg-white p-6 flex flex-col justify-between shadow-sm gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-brand-petroleo flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-brand-emerald-600" />
                Seus Créditos
              </h3>
              <p className="text-xs text-slate-500 font-semibold">Gerencie seus créditos para contestações.</p>
            </div>
            
            {loadingCredits ? (
              <div className="flex-grow flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-brand-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : creditsData ? (
              <div className="flex-grow flex flex-col justify-center space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Créditos disponíveis</p>
                  <p className="text-3xl font-bold text-brand-petroleo">{creditsData.availableCredits}</p>
                </div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  {creditsData.freeComplaintUsed ? (
                    <span className="text-slate-500 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Primeira contestação utilizada
                    </span>
                  ) : (
                    <span className="text-brand-emerald-650 flex items-center gap-1 animate-pulse">
                      ✨ Primeira contestação gratuita disponível
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Não foi possível carregar os créditos.</div>
            )}
          </div>

          <div className="lg:col-span-4 border border-slate-200 rounded-2xl bg-white p-6 flex flex-col justify-between shadow-sm gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-brand-petroleo flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-brand-emerald-600" />
                Seu Mapa de Recuperação
              </h3>
              <p className="text-xs text-slate-500 font-semibold">Acompanhe seu avanço rumo à resolução das dívidas.</p>
            </div>
            <div className="flex-grow flex items-center justify-center overflow-visible">
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

        {/* Minha Jornada de Recuperação (SDD-018) */}
        {recoveryJourney && (
          <Card className="bg-white border-slate-200 p-6 shadow-sm space-y-6 rounded-2xl hover:border-brand-emerald-500/20 transition-all duration-350">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100 text-brand-emerald-600">
                  <Compass className="w-6 h-6 animate-spin-slow" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-brand-petroleo">Minha Jornada de Recuperação</h2>
                  <p className="text-slate-500 text-xs font-semibold">Acompanhe e atualize o andamento do seu protocolo oficial.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-550">Status Atual:</span>
                <select
                  value={recoveryJourney.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  className="bg-brand-offwhite-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-brand-petroleo focus:outline-none focus:ring-1 focus:ring-brand-emerald-500 cursor-pointer"
                >
                  <option value="RECLAMACAO_ENVIADA">Reclamação Enviada</option>
                  <option value="AGUARDANDO_RESPOSTA">Aguardando Resposta</option>
                  <option value="RESPONDIDA">Respondida pelo Banco</option>
                  <option value="NEGOCIACAO_EM_ANDAMENTO">Negociação em Andamento</option>
                  <option value="ENCERRADA">Encerrada</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Details */}
              <div className="lg:col-span-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Instituição</span>
                    <span className="text-xs font-bold text-brand-petroleo mt-1 block truncate" title={recoveryJourney.companyName}>
                      {recoveryJourney.companyName}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Nº Protocolo</span>
                    <span className="text-xs font-mono font-bold text-brand-petroleo mt-1 block truncate">
                      {recoveryJourney.complaintNumber}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ação Iniciada em</span>
                    <span className="text-xs font-bold text-brand-petroleo mt-1 block">
                      {new Date(recoveryJourney.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Deseja realmente remover esta jornada de recuperação do painel?")) {
                        localStorage.removeItem("quita_recovery_journey");
                        setRecoveryJourney(null);
                        addToast("Jornada de recuperação removida do painel.", "info");
                      }
                    }}
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-2 py-1 rounded transition-colors"
                  >
                    Excluir Caso
                  </button>
                </div>
              </div>

              {/* Right Column: Visual Progress Stepper */}
              <div className="lg:col-span-7 bg-brand-offwhite-50/50 p-5 rounded-2xl border border-slate-150 space-y-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fases da Resolução</span>
                <div className="relative flex justify-between items-center w-full px-2">
                  <div className="absolute left-0 right-0 h-1 bg-slate-200 top-1/2 -translate-y-1/2 -z-0"></div>
                  <div
                    className="absolute left-0 h-1 bg-brand-emerald-600 top-1/2 -translate-y-1/2 -z-0 transition-all duration-500"
                    style={{
                      width: `${((getStatusStep(recoveryJourney.status) - 1) / 4) * 100}%`,
                    }}
                  ></div>

                  {[
                    { label: "Enviada", step: 1 },
                    { label: "Em Análise", step: 2 },
                    { label: "Respondida", step: 3 },
                    { label: "Em Acordo", step: 4 },
                    { label: "Resolvida", step: 5 },
                  ].map((s) => {
                    const isActive = s.step <= getStatusStep(recoveryJourney.status);
                    const isCurrent = s.step === getStatusStep(recoveryJourney.status);
                    return (
                      <div key={s.step} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300 ${
                            isActive
                              ? "bg-brand-emerald-650 text-white border-brand-emerald-600"
                              : "bg-white text-slate-400 border-slate-200"
                          } ${isCurrent ? "shadow-md shadow-brand-emerald-600/35 ring-4 ring-brand-emerald-50" : ""}`}
                        >
                          {s.step}
                        </div>
                        <span
                          className={`text-[9px] font-bold mt-2 transition-colors duration-300 ${
                            isActive ? "text-brand-emerald-700" : "text-slate-400"
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Helpful tips based on status */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs font-semibold leading-relaxed text-slate-600">
                  {recoveryJourney.status === "RECLAMACAO_ENVIADA" && (
                    <p>💡 <strong>Dica Quita:</strong> Seu protocolo foi enviado. Agora o banco iniciará a análise. Aguarde a alteração de status.</p>
                  )}
                  {recoveryJourney.status === "AGUARDANDO_RESPOSTA" && (
                    <p>⏳ <strong>Dica Quita:</strong> A instituição financeira tem um prazo de até 10 dias para apresentar retorno oficial. Verifique seu e-mail cadastrado regularmente.</p>
                  )}
                  {recoveryJourney.status === "RESPONDIDA" && (
                    <p>🎉 <strong>Dica Quita:</strong> O banco respondeu! Acesse o portal Consumidor.gov.br para ler a proposta de negociação apresentada.</p>
                  )}
                  {recoveryJourney.status === "NEGOCIACAO_EM_ANDAMENTO" && (
                    <p>🤝 <strong>Dica Quita:</strong> Você está em fase de contraproposta. Avalie atentamente os descontos oferecidos e não feche acordos sem antes ler todos os termos.</p>
                  )}
                  {recoveryJourney.status === "ENCERRADA" && (
                    <p>✅ <strong>Dica Quita:</strong> Parabéns por encerrar o caso! Caso a pendência tenha sido quitada, lembre-se de consultar seu Registrato em 30 a 60 dias para auditar se o banco limpou o reporte.</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

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

        {/* Adquirir Créditos Section */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-brand-petroleo flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-emerald-600" />
                Adquirir Créditos
              </h2>
              <p className="text-xs text-slate-500 font-semibold">Selecione o melhor pacote para iniciar suas contestações regulatórias.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: "STARTER",
                name: "Pacote Inicial",
                credits: 3,
                price: "R$ 19,90",
                description: "Ideal para quem tem poucas dívidas para contestar.",
                details: ["3 créditos para contestações", "Suporte padrão", "Geração via IA"],
                badge: "Popular",
                badgeClass: "bg-brand-emerald-50 text-brand-emerald-700 border-brand-emerald-100",
              },
              {
                id: "INTERMEDIATE",
                name: "Pacote Recomendado",
                credits: 10,
                price: "R$ 49,90",
                description: "Excelente para limpar múltiplos apontamentos.",
                details: ["10 créditos para contestações", "Suporte prioritário", "Geração via IA otimizada"],
                badge: "Melhor Valor",
                badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
              },
              {
                id: "PREMIUM",
                name: "Pacote Premium",
                credits: 25,
                price: "R$ 99,90",
                description: "Perfeito para consultores ou grandes volumes.",
                details: ["25 créditos para contestações", "Suporte ultra-prioritário", "Análise avançada"],
                badge: "Profissional",
                badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
              },
            ].map((pkg) => (
              <Card key={pkg.id} className="bg-white border-slate-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-brand-emerald-500/20 hover:shadow-md transition-all duration-300 rounded-2xl">
                {pkg.badge && (
                  <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full border ${pkg.badgeClass}`}>
                    {pkg.badge}
                  </span>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-brand-petroleo">{pkg.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{pkg.credits} Créditos</p>
                  </div>

                  <div>
                    <span className="text-2xl font-black text-brand-petroleo">{pkg.price}</span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{pkg.description}</p>

                  <ul className="space-y-1.5 pt-2 text-[11px] text-slate-550 font-semibold border-t border-slate-100">
                    {pkg.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-brand-emerald-600 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={() => handleBuyCredits(pkg.id)}
                    disabled={purchasePendingPackage !== null}
                    className="w-full bg-brand-petroleo hover:bg-slate-800 text-white rounded-xl h-10 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {purchasePendingPackage === pkg.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Redirecionando...
                      </>
                    ) : (
                      <>
                        Comprar Agora
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
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
