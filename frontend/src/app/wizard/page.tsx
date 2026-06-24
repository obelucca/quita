"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentService } from "@/services/document.service";
import { debtService } from "@/services/debt.service";
import { complaintService } from "@/services/complaint.service";
import wizardStorage from "@/services/wizard.service";
import { WizardState, DebtAdjustment } from "@/types";
import {
  Shield,
  Upload,
  FileCheck,
  Edit2,
  Plus,
  Trash2,
  Lightbulb,
  Radio,
  DollarSign,
  Cpu,
  FileText,
  Copy,
  Download,
  CreditCard,
  CheckCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  LogOut,
  User,
  AlertTriangle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RecoveryProgress } from "@/components/ui/recovery-progress";
import { ClarityCard } from "@/components/ui/clarity-card";
import { RecoveryInsight } from "@/components/ui/recovery-insight";
import { CompletionMoment } from "@/components/ui/completion-moment";
import { CustomToastContainer, ToastMessage } from "@/components/ui/custom-toast";
import { CustomModal } from "@/components/ui/custom-modal";
import { ConsentCheckbox } from "@/components/legal/ConsentCheckbox";

const parseBrazilianCurrency = (value: string): number | undefined => {
  if (!value) return undefined;
  
  const lower = value.toLowerCase().trim();
  
  let multiplier = 1;
  if (lower.endsWith("mil") || lower.includes(" mil ") || lower.endsWith("k")) {
    multiplier = 1000;
  } else if (lower.includes("milhão") || lower.includes("milhoes") || lower.includes("milhões")) {
    multiplier = 1000000;
  }
  
  const cleaned = lower.replace(/[^\d.,]/g, "");
  if (!cleaned) return undefined;
  
  let numVal: number;
  if (cleaned.includes(",")) {
    const normalized = cleaned.replace(/\./g, "").replace(",", ".");
    numVal = parseFloat(normalized);
  } else {
    if (cleaned.includes(".")) {
      const parts = cleaned.split(".");
      const lastPart = parts[parts.length - 1];
      if (lastPart.length === 3) {
        const normalized = cleaned.replace(/\./g, "");
        numVal = parseFloat(normalized);
      } else {
        numVal = parseFloat(cleaned);
      }
    } else {
      numVal = parseFloat(cleaned);
    }
  }
  
  if (isNaN(numVal)) return undefined;
  return numVal * multiplier;
};

const formatBrlAsYouType = (value: string): string => {
  // Remove anything that is not a digit or comma
  let clean = value.replace(/[^\d,]/g, "");
  
  // Split into integer and decimal parts at the first comma
  const commaIndex = clean.indexOf(",");
  let integerPart = clean;
  let decimalPart = "";
  
  if (commaIndex !== -1) {
    integerPart = clean.substring(0, commaIndex);
    decimalPart = clean.substring(commaIndex + 1).replace(/,/g, "").substring(0, 2);
  }
  
  if (integerPart) {
    const parsedInt = parseInt(integerPart, 10);
    if (!isNaN(parsedInt)) {
      integerPart = parsedInt.toLocaleString("pt-BR");
    } else {
      integerPart = "";
    }
  }
  
  if (commaIndex !== -1) {
    return integerPart + "," + decimalPart;
  }
  return integerPart;
};

const INITIAL_STATE: WizardState = {
  step: 1,
  originalDebts: [],
  adjustedDebts: [],
  selectedInstitution: null,
  currentDebtValue: "",
  generatedComplaint: null,
};

const LOADING_MESSAGES = [
  "Recuperando credores cadastrados...",
  "Verificando valores e apontamentos no Registrato...",
  "Entendendo o seu contexto de endividamento...",
  "Identificando irregularidades cadastrais e de evolução...",
  "Analisando normativas do Banco Central do Brasil...",
  "Estruturando hipóteses e raciocínio regulatório...",
  "Determinando o melhor estilo e padrão editorial...",
  "Redigindo manifestação com base no blueprint de escrita humana...",
  "Aplicando auto-crítica contra clichês robóticos...",
  "Finalizando e revisando formatação para o Consumidor.gov.br..."
];

export default function WizardPage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Wizard state
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [dataConsent, setDataConsent] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  
  // Local edit debt state
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [editInstName, setEditInstName] = useState("");
  const [editInstValue, setEditInstValue] = useState("");
  const [newInstName, setNewInstName] = useState("");
  const [newInstValue, setNewInstValue] = useState("");
  
  // IA editable complaint text
  const [complaintText, setComplaintText] = useState("");
  const [copiedText, setCopiedText] = useState(false);
  const generationStartTimeRef = React.useRef<number>(0);

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Reset modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // PDF Export options state
  const [showCover, setShowCover] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [showDocId, setShowDocId] = useState(true);
  const [showEditorialSeal, setShowEditorialSeal] = useState(true);
  const [showHighlights, setShowHighlights] = useState(true);

  // Local state for Step 1 guided onboarding sub-steps
  const [subStep, setSubStep] = useState(1);
  const [govLevelConfirmed, setGovLevelConfirmed] = useState(false);
  const [loggedIntoRegistrato, setLoggedIntoRegistrato] = useState(false);
  const [scrReportGenerated, setScrReportGenerated] = useState(false);
  const [pdfSavedOnDevice, setPdfSavedOnDevice] = useState(false);

  // Local state for SDD-018
  const [step13Checked, setStep13Checked] = useState({ govbr: false, manifest: false, scr: false, dossier: false });
  const [step14Checked, setStep14Checked] = useState({
    access: false,
    login: false,
    choose: false,
    category: false,
    paste: false,
    attach: false,
    send: false,
  });
  const [protocolNumber, setProtocolNumber] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step19Checked, setStep19Checked] = useState({
    track: false,
    email: false,
    response: false,
    save: false,
    return: false,
  });

  // Local states for Step 3 smart upload (SDD-012)
  const [uploadStage, setUploadStage] = useState<"idle" | "pre-analyzing" | "result-success" | "result-failed">("idle");
  const [loadingStep, setLoadingStep] = useState(1);
  const [tempInsights, setTempInsights] = useState<any>(null);
  const [tempDebts, setTempDebts] = useState<DebtAdjustment[]>([]);
  const preAnalysisIntervalRef = useRef<any>(null);

  // Coordinate pre-analyzing state transition when animation reaches end AND insights are loaded
  useEffect(() => {
    if (uploadStage === "pre-analyzing" && loadingStep === 5) {
      if (tempInsights) {
        if (tempInsights.institutions && tempInsights.institutions.length > 0) {
          setUploadStage("result-success");
        } else {
          setUploadStage("result-failed");
        }
      }
    }
  }, [loadingStep, tempInsights, uploadStage]);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, authLoading, router]);

  // Load wizard state from localStorage on startup
  useEffect(() => {
    if (user) {
      const savedState = wizardStorage.load(user.id);
      
      // Check for LGPD consent
      const savedConsent = localStorage.getItem(`quita_consent_${user.id}`);
      let hasConsent = false;
      if (savedConsent) {
        try {
          const consentObj = JSON.parse(savedConsent);
          if (consentObj && consentObj.accepted) {
            setDataConsent(true);
            hasConsent = true;
          }
        } catch (e) {
          console.error("Error parsing consent storage:", e);
        }
      }

      if (savedState) {
        // If state saved is beyond step 2 but they don't have consent, force them to step 2
        if (savedState.step > 2 && !hasConsent) {
          savedState.step = 2;
        }
        setState(savedState);
        if (savedState.generatedComplaint) {
          setComplaintText(savedState.generatedComplaint.complaint);
        }
      }
    }
  }, [user]);

  // Loading messages rotation
  useEffect(() => {
    if (state.step === 9) {
      setLoadingMessageIdx(0);
      const interval = setInterval(() => {
        setLoadingMessageIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 900);
      return () => clearInterval(interval);
    }
  }, [state.step]);

  // Save wizard state helper
  const updateState = (updater: Partial<WizardState> | ((prev: WizardState) => WizardState)) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      if (user) {
        wizardStorage.save(user.id, next);
      }
      return next;
    });
  };

  const transitionToStepWithDelay = (nextStep: number, extraUpdates: Partial<WizardState> = {}, callback?: () => void) => {
    const elapsed = Date.now() - generationStartTimeRef.current;
    const remainingTime = Math.max(0, 5000 - elapsed);
    setTimeout(() => {
      updateState({
        ...extraUpdates,
        step: nextStep,
      });
      if (callback) callback();
    }, remainingTime);
  };

  // Reset wizard progress helper
  const resetWizard = () => {
    setIsResetModalOpen(true);
  };

  const executeResetWizard = async () => {
    try {
      await documentService.clear();
      queryClient.invalidateQueries({ queryKey: ["debtInsights"] });
      addToast("Fluxo reiniciado com sucesso.", "success");
    } catch (e) {
      console.error("Erro ao limpar dados do servidor:", e);
      addToast("Erro ao limpar dados do servidor.", "error");
    }
    if (user) {
      wizardStorage.clear(user.id);
    }
    setState(INITIAL_STATE);
    setDataConsent(false);
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadError(null);
    setSubStep(1);
    setGovLevelConfirmed(false);
    setLoggedIntoRegistrato(false);
    setScrReportGenerated(false);
    setPdfSavedOnDevice(false);
    setUploadStage("idle");
    setLoadingStep(1);
    setTempInsights(null);
    setTempDebts([]);
    setStep13Checked({ govbr: false, manifest: false, scr: false, dossier: false });
    setStep14Checked({
      access: false,
      login: false,
      choose: false,
      category: false,
      paste: false,
      attach: false,
      send: false,
    });
    setProtocolNumber("");
    setIsSubmitted(false);
    setStep19Checked({
      track: false,
      email: false,
      response: false,
      save: false,
      return: false,
    });
  };

  // Fetch insights
  const { data: insightsData, refetch: refetchInsights, isFetching: loadingInsights } = useQuery({
    queryKey: ["debtInsights"],
    queryFn: () => debtService.getInsights(),
    enabled: false,
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentService.upload(file),
    onSuccess: async () => {
      try {
        const result = await refetchInsights();
        if (result.data) {
          const mapped: DebtAdjustment[] = result.data.institutions.map((inst, idx) => ({
            id: `orig-${idx}-${inst.institution}`,
            institution: inst.institution,
            reportedValue: inst.amount,
            operationType: `${inst.operations} operação(ões)`,
            isEdited: false,
            isManual: false,
          }));

          setTempDebts(mapped);
          setTempInsights(result.data);
        } else {
          setUploadStage("result-failed");
        }
      } catch (err) {
        setUploadStage("result-failed");
        setUploadError("Não foi possível carregar os dados financeiros extraídos.");
      }
    },
    onError: (err: any) => {
      if (preAnalysisIntervalRef.current) {
        clearInterval(preAnalysisIntervalRef.current);
      }
      setUploadStage("result-failed");
      setUploadError(
        err.data?.message ||
          "Não foi possível concluir esta etapa. Vamos tentar novamente com um PDF válido."
      );
    },
  });

  // Generate Complaint Mutation
  const generateMutation = useMutation({
    mutationFn: (data: { institution: string; value?: number }) =>
      complaintService.generate(data.institution, data.value),
    onSuccess: (data) => {
      transitionToStepWithDelay(10, { generatedComplaint: data }, () => {
        setComplaintText(data.complaint);
        // Increment claims count locally to showcase progress on dashboard
        const currentClaims = parseInt(localStorage.getItem("quota_claims_count") || "0");
        localStorage.setItem("quota_claims_count", (currentClaims + 1).toString());
        queryClient.invalidateQueries({ queryKey: ["complaints"] });
      });
    },
    onError: (err: any) => {
      transitionToStepWithDelay(8, {}, () => {
        addToast(
          err.data?.message || "Erro ao estruturar reclamação com a IA. Tente novamente.",
          "error"
        );
      });
    },
  });

  // Regenerate Complaint Mutation
  const regenerateMutation = useMutation({
    mutationFn: (data: { id: string; value?: number }) =>
      complaintService.regenerate(data.id, data.value),
    onSuccess: (data) => {
      transitionToStepWithDelay(10, { generatedComplaint: data }, () => {
        setComplaintText(data.complaint);
      });
    },
    onError: (err: any) => {
      transitionToStepWithDelay(10, {}, () => {
        addToast(
          err.data?.message || "Erro ao regenerar texto. Tente novamente.",
          "error"
        );
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const startUpload = () => {
    if (!selectedFile) return;
    setUploadStage("pre-analyzing");
    setLoadingStep(1);
    setTempInsights(null);
    setTempDebts([]);
    setUploadError(null);

    let currentStep = 1;
    preAnalysisIntervalRef.current = setInterval(() => {
      currentStep += 1;
      setLoadingStep(currentStep);
      if (currentStep >= 5) {
        if (preAnalysisIntervalRef.current) {
          clearInterval(preAnalysisIntervalRef.current);
        }
      }
    }, 450);

    uploadMutation.mutate(selectedFile);
  };

  // Add Manual Debt
  const handleAddManualDebt = () => {
    if (!newInstName.trim() || !newInstValue.trim()) return;
    const cleanVal = newInstValue.replace(".", "").replace(",", ".");
    const valNum = parseFloat(cleanVal);
    if (isNaN(valNum) || valNum <= 0) {
      addToast("Insira um valor numérico válido.", "error");
      return;
    }

    const newDebt: DebtAdjustment = {
      id: `manual-${Date.now()}`,
      institution: newInstName.trim(),
      reportedValue: valNum,
      operationType: "Crédito (Manual)",
      isEdited: true,
      isManual: true,
    };

    updateState((prev) => ({
      ...prev,
      adjustedDebts: [...prev.adjustedDebts, newDebt],
    }));

    setNewInstName("");
    setNewInstValue("");
  };

  // Edit Debt Action
  const startEditDebt = (debt: DebtAdjustment) => {
    setEditingDebtId(debt.id);
    setEditInstName(debt.institution);
    setEditInstValue(debt.reportedValue.toString());
  };

  const saveEditDebt = () => {
    if (!editInstName.trim() || !editInstValue.trim()) return;
    const cleanVal = editInstValue.replace(".", "").replace(",", ".");
    const valNum = parseFloat(cleanVal);
    if (isNaN(valNum) || valNum <= 0) {
      addToast("Insira um valor numérico válido.", "error");
      return;
    }

    updateState((prev) => ({
      ...prev,
      adjustedDebts: prev.adjustedDebts.map((d) =>
        d.id === editingDebtId
          ? {
              ...d,
              institution: editInstName.trim(),
              reportedValue: valNum,
              isEdited: true,
            }
          : d
      ),
    }));

    setEditingDebtId(null);
  };

  const deleteDebt = (id: string) => {
    updateState((prev) => ({
      ...prev,
      adjustedDebts: prev.adjustedDebts.filter((d) => d.id !== id),
    }));
  };

  const handleGenerate = () => {
    if (!state.selectedInstitution) return;
    generationStartTimeRef.current = Date.now();
    updateState({ step: 9 });
    const currentVal = parseBrazilianCurrency(state.currentDebtValue);
    generateMutation.mutate({
      institution: state.selectedInstitution,
      value: currentVal,
    });
  };

  const handleRegenerate = () => {
    if (!state.generatedComplaint?.id) return;
    generationStartTimeRef.current = Date.now();
    updateState({ step: 9 });
    const currentVal = parseBrazilianCurrency(state.currentDebtValue);
    regenerateMutation.mutate({
      id: state.generatedComplaint.id,
      value: currentVal,
    });
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(complaintText);
    setCopiedText(true);
    addToast("Copiado para a área de transferência!", "success");
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!state.generatedComplaint?.id) return;
    try {
      await complaintService.downloadPdf(
        state.generatedComplaint.id,
        `Reclamacao_Quita_${state.selectedInstitution?.replace(/\s+/g, "_")}.pdf`,
        {
          showCover,
          showWatermark,
          showFooter,
          showDocId,
          showEditorialSeal,
          showHighlights,
        }
      );
      const currentDownloads = parseInt(localStorage.getItem("quota_pdf_downloads") || "0");
      localStorage.setItem("quota_pdf_downloads", (currentDownloads + 1).toString());
      addToast("Download concluído com sucesso!", "success");
    } catch (err) {
      addToast("Erro ao baixar PDF da reclamação.", "error");
    }
  };

  const handleViewPdf = async () => {
    if (!state.generatedComplaint?.id) return;
    try {
      await complaintService.openPdfInNewTab(
        state.generatedComplaint.id,
        {
          showCover,
          showWatermark,
          showFooter,
          showDocId,
          showEditorialSeal,
          showHighlights,
        }
      );
    } catch (err) {
      addToast("Erro ao carregar prévia do PDF.", "error");
    }
  };

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
            <div className="hidden sm:flex items-center gap-2 bg-brand-offwhite-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <User className="w-4 h-4 text-brand-emerald-600" />
              <span className="text-xs font-semibold text-slate-705">{user.name}</span>
            </div>
            <button
              onClick={resetWizard}
              className="text-xs bg-brand-offwhite-50 hover:bg-brand-offwhite-200 border border-slate-200 text-slate-550 hover:text-brand-petroleo px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer font-semibold shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reiniciar
            </button>
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

      {/* Main Wizard Area */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
        
        {/* RecoveryProgress Timeline */}
        <div className="mb-8">
          <RecoveryProgress currentStep={state.step} />
        </div>

        {/* Step Content */}
        <Card className="shadow-lg min-h-[420px] flex flex-col justify-between bg-white border-slate-200">
          
          {/* STEP 1: Tutorial Registrato */}
          {state.step === 1 && (
            <div className="space-y-6 flex flex-col justify-between h-full min-h-[380px]">
              {/* Indicador de Sub-etapas do Onboarding */}
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                {[1, 2, 3, 4].map((stepNum) => (
                  <div key={stepNum} className="flex-1 flex items-center gap-2">
                    <div className="flex-grow h-1.5 rounded-full relative bg-slate-100 overflow-hidden">
                      <div
                        className={`absolute inset-0 bg-brand-emerald-600 transition-all duration-300 ${
                          stepNum <= subStep ? "w-full" : "w-0"
                        }`}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${
                      stepNum === subStep ? "text-brand-emerald-650" : "text-slate-400"
                    }`}>
                      0{stepNum}
                    </span>
                  </div>
                ))}
              </div>

              {/* Etapa 1 */}
              {subStep === 1 && (
                <div className="space-y-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100 text-brand-emerald-600">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-brand-petroleo">Verificar Nível da Conta Gov.br</h2>
                        <p className="text-slate-550 text-xs font-semibold">Antes de acessar o Registrato, você precisa possuir uma conta Gov.br nível Prata ou Ouro.</p>
                      </div>
                    </div>

                    <div className="bg-brand-offwhite-100 border border-slate-200 p-5 rounded-2xl space-y-4 text-xs text-slate-700 leading-relaxed font-semibold">
                      <p className="text-slate-600">
                        O Banco Central exige autenticação de segurança forte para acessar seus dados financeiros do Registrato.
                      </p>
                      <div className="flex gap-4">
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px]">
                          <span>✅ Nível Prata</span>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px]">
                          <span>✅ Nível Ouro</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-rose-600">
                        ⚠️ Contas Gov.br de nível Bronze não possuem acesso ao Registrato.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div>
                          <h4 className="font-bold text-brand-petroleo text-xs mb-1">Como descobrir meu nível?</h4>
                          <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-500">
                            <li>Acesse o aplicativo ou site do Gov.br.</li>
                            <li>Faça login na sua conta.</li>
                            <li>Seu nível (Bronze, Prata ou Ouro) aparecerá em destaque na tela inicial.</li>
                          </ol>
                        </div>
                        <div>
                          <h4 className="font-bold text-brand-petroleo text-xs mb-1">Como aumentar meu nível?</h4>
                          <p className="text-[11px] text-slate-550 leading-normal">
                            <strong>Para Prata:</strong> Faça validação facial (CNH) ou acesse usando as credenciais do seu Internet Banking.<br/>
                            <strong>Para Ouro:</strong> Valide via biometria facial (TSE/Título de Eleitor) ou use um Certificado Digital.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 pt-4">
                      <a
                        href="https://www.gov.br/governodigital/pt-br/conta-gov-br"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-705 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        Ver Tutorial Gov.br <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={govLevelConfirmed}
                          onChange={(e) => setGovLevelConfirmed(e.target.checked)}
                          className="w-4.5 h-4.5 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                        />
                        <span className="text-xs text-slate-700 font-bold">
                          Confirmo que possuo uma conta Gov.br nível Prata ou Ouro.
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        variant="primary"
                        onClick={() => setSubStep(2)}
                        disabled={!govLevelConfirmed}
                        className="h-11 px-6 font-semibold"
                      >
                        Próximo Passo <ChevronRight className="w-4.5 h-4.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 2 */}
              {subStep === 2 && (
                <div className="space-y-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100 text-brand-emerald-600">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-brand-petroleo">Acessar o Registrato do Banco Central</h2>
                        <p className="text-slate-550 text-xs font-semibold">O Registrato reúne todas as informações financeiras e de dívidas vinculadas ao seu CPF.</p>
                      </div>
                    </div>

                    <div className="bg-brand-offwhite-100 border border-slate-200 p-5 rounded-2xl space-y-4 text-xs text-slate-750 font-semibold leading-relaxed">
                      <p>
                        A plataforma é totalmente segura e mantida de forma oficial pelo Banco Central do Brasil.
                      </p>
                      <div>
                        <h4 className="font-bold text-brand-petroleo text-xs mb-2">Instruções para acesso:</h4>
                        <ol className="list-decimal pl-4 space-y-2 text-slate-600">
                          <li>Clique no botão <strong>"Acessar Registrato"</strong> abaixo para abrir o site oficial em uma nova aba.</li>
                          <li>Na página do Banco Central, clique para fazer login com a sua conta <strong>Gov.br</strong>.</li>
                          <li>Preencha seu CPF e senha e autorize o acesso.</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 pt-4">
                      <a
                        href="https://registrato.bcb.gov.br"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 bg-brand-emerald-600 hover:bg-brand-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Acessar Registrato <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={loggedIntoRegistrato}
                          onChange={(e) => setLoggedIntoRegistrato(e.target.checked)}
                          className="w-4.5 h-4.5 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                        />
                        <span className="text-xs text-slate-700 font-bold">
                          Estou logado no Registrato.
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => setSubStep(1)}
                        className="text-xs text-slate-550 hover:text-brand-petroleo font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ChevronLeft className="w-4.5 h-4.5" /> Voltar
                      </button>
                      <Button
                        variant="primary"
                        onClick={() => setSubStep(3)}
                        disabled={!loggedIntoRegistrato}
                        className="h-11 px-6 font-semibold"
                      >
                        Próximo Passo <ChevronRight className="w-4.5 h-4.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 3 */}
              {subStep === 3 && (
                <div className="space-y-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100 text-brand-emerald-600">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-brand-petroleo">Gerar Relatório de Empréstimos (SCR)</h2>
                        <p className="text-slate-550 text-xs font-semibold">Gere o documento específico com o histórico detalhado dos seus créditos.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-3 text-xs text-slate-700 font-semibold leading-relaxed">
                        <p>No painel do Registrato do Banco Central:</p>
                        <ol className="list-decimal pl-4 space-y-2">
                          <li>Procure e clique no card de <strong>Empréstimos e Financiamentos</strong> (conhecido como SCR).</li>
                          <li>Defina o período desejado (sugerimos selecionar os últimos meses/anos para capturar a evolução da dívida).</li>
                          <li>Marque o checkbox de consentimento do BCB e clique no botão <strong>Gerar relatório</strong>.</li>
                          <li>Aguarde o processamento e clique para baixar o <strong>PDF</strong>.</li>
                        </ol>
                      </div>

                      {/* Mock Visual do SCR */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-inner flex flex-col h-[180px]">
                        {/* Browser header */}
                        <div className="bg-slate-200 px-3 py-1.5 flex items-center gap-1.5 border-b border-slate-300">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                          <div className="ml-2 bg-white px-2 py-0.5 rounded text-[9px] text-slate-400 font-mono truncate w-40">
                            registrato.bcb.gov.br
                          </div>
                        </div>
                        {/* Browser Content */}
                        <div className="p-3 flex-grow flex flex-col justify-between text-[10px] font-sans">
                          <div className="border border-slate-200 bg-white p-2.5 rounded-lg shadow-sm flex items-center justify-between">
                            <div className="space-y-1">
                              <span className="font-bold text-slate-800">Empréstimos e Financiamentos (SCR)</span>
                              <p className="text-[8px] text-slate-400">Consulte informações sobre seus empréstimos.</p>
                            </div>
                            <span className="bg-brand-emerald-50 border border-brand-emerald-100 text-brand-emerald-700 px-2 py-0.5 rounded-full font-bold text-[8px]">
                              Consultar ➔
                            </span>
                          </div>
                          
                          <div className="bg-white border border-slate-200 p-2 rounded-lg space-y-1">
                            <div className="flex items-center justify-between text-[8px] text-slate-400">
                              <span>Período: Últimos 24 meses</span>
                              <span className="font-bold text-brand-emerald-650">✓ Aceito Termos</span>
                            </div>
                            <div className="w-full bg-brand-emerald-600 hover:bg-brand-emerald-700 text-white font-bold text-[9px] py-1 rounded text-center cursor-default shadow-xs">
                              Gerar Relatório (PDF)
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex justify-end border-t border-slate-100 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={scrReportGenerated}
                          onChange={(e) => setScrReportGenerated(e.target.checked)}
                          className="w-4.5 h-4.5 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                        />
                        <span className="text-xs text-slate-700 font-bold">
                          Já gerei o relatório SCR.
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => setSubStep(2)}
                        className="text-xs text-slate-550 hover:text-brand-petroleo font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ChevronLeft className="w-4.5 h-4.5" /> Voltar
                      </button>
                      <Button
                        variant="primary"
                        onClick={() => setSubStep(4)}
                        disabled={!scrReportGenerated}
                        className="h-11 px-6 font-semibold"
                      >
                        Próximo Passo <ChevronRight className="w-4.5 h-4.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 4 */}
              {subStep === 4 && (
                <div className="space-y-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100 text-brand-emerald-600">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-brand-petroleo">Você já possui o arquivo PDF?</h2>
                        <p className="text-slate-550 text-xs font-semibold">Confirme se o arquivo foi baixado para o seu dispositivo antes de prosseguir.</p>
                      </div>
                    </div>

                    <div className="bg-brand-offwhite-100 border border-slate-200 p-6 rounded-2xl text-center space-y-3 max-w-lg mx-auto">
                      <div className="w-12 h-12 rounded-full bg-brand-emerald-50 border border-brand-emerald-100 flex items-center justify-center text-brand-emerald-650 mx-auto">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-brand-petroleo text-sm">Pronto para o Envio</h4>
                      <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                        Para iniciar a análise automatizada do Quita e obter seus relatórios de juros ou irregularidades, você precisará fazer o upload deste PDF na próxima seção.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex justify-end border-t border-slate-100 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={pdfSavedOnDevice}
                          onChange={(e) => setPdfSavedOnDevice(e.target.checked)}
                          className="w-4.5 h-4.5 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                        />
                        <span className="text-xs text-slate-700 font-bold">
                          O PDF do Registrato está salvo no meu dispositivo.
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => setSubStep(3)}
                        className="text-xs text-slate-550 hover:text-brand-petroleo font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ChevronLeft className="w-4.5 h-4.5" /> Voltar
                      </button>
                      <Button
                        variant="primary"
                        onClick={() => updateState({ step: 2 })}
                        disabled={!pdfSavedOnDevice}
                        className="h-11 px-6 font-semibold"
                      >
                        Continuar para Upload <ChevronRight className="w-4.5 h-4.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Explicação do Uso dos Dados */}
          {state.step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100">
                  <Shield className="w-6 h-6 text-brand-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Sua Privacidade em Primeiro Lugar</h2>
                  <p className="text-slate-500 text-sm">Privacidade e termos de uso dos dados.</p>
                </div>
              </div>

              <div className="space-y-4">
                <ClarityCard
                  variant="info"
                  title="Conformidade LGPD"
                  description="O processamento do seu PDF é realizado localmente e os dados são mantidos isolados em conformidade estrita com a Lei Geral de Proteção de Dados."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-brand-offwhite-100 p-4.5 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-brand-petroleo text-xs mb-1">Processamento Local</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Os dados extraídos destinam-se unicamente a preencher a contestação correspondente de forma automatizada.
                    </p>
                  </div>
                  <div className="bg-brand-offwhite-100 p-4.5 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-brand-petroleo text-xs mb-1">Sem Acesso Externo</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Não compartilhamos suas informações com birôs de crédito ou instituições credoras.
                    </p>
                  </div>
                </div>

                <ConsentCheckbox checked={dataConsent} onChange={setDataConsent} />
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => updateState({ step: 1 })}
                  className="text-slate-555 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (dataConsent && user) {
                      localStorage.setItem(
                        `quita_consent_${user.id}`,
                        JSON.stringify({
                          accepted: true,
                          acceptedAt: new Date().toISOString(),
                        })
                      );
                    }
                    updateState({ step: 3 });
                  }}
                  disabled={!dataConsent}
                >
                  Prosseguir <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Upload do PDF */}
          {state.step === 3 && (
            <div className="space-y-6">
              {uploadStage === "idle" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100">
                      <Upload className="w-6 h-6 text-brand-emerald-650" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-brand-petroleo">Faça Upload do PDF do Registrato</h2>
                      <p className="text-slate-550 text-sm">Selecione o arquivo baixado do site do Banco Central.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {uploadError && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-650" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {!selectedFile ? (
                      <div className="border-2 border-dashed border-slate-200 hover:border-brand-emerald-500/50 rounded-2xl bg-brand-offwhite-100 p-8 text-center transition-all flex flex-col items-center justify-center min-h-[220px]">
                        <Upload className="w-10 h-10 text-slate-400 mb-4 animate-bounce" />
                        <p className="text-sm text-brand-petroleo mb-2 font-semibold">
                          Arraste o arquivo Registrato PDF ou clique abaixo
                        </p>
                        <p className="text-[11px] text-slate-500 mb-4">Apenas arquivos PDF são aceitos (max. 20MB)</p>
                        
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-input"
                        />
                        <label
                          htmlFor="file-input"
                          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-705 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-sm"
                        >
                          Selecionar Arquivo
                        </label>
                      </div>
                    ) : (
                      /* Card de Validação Imediata */
                      <div className="border border-slate-200 bg-white rounded-2xl p-5 shadow-sm space-y-4 max-w-md mx-auto">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border ${
                            selectedFile.name.toLowerCase().endsWith(".pdf")
                              ? "bg-emerald-50 text-brand-emerald-700 border-brand-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-100"
                          }`}>
                            {selectedFile.name.toLowerCase().endsWith(".pdf") ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                Arquivo recebido
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-650" />
                                Arquivo inválido
                              </>
                            )}
                          </span>
                          <button
                            onClick={() => setSelectedFile(null)}
                            className="text-xs text-slate-500 hover:text-rose-650 transition-colors font-bold cursor-pointer"
                          >
                            Alterar arquivo
                          </button>
                        </div>

                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between border-b border-slate-100 pb-2 font-semibold">
                            <span className="text-slate-500">Nome:</span>
                            <span className="text-brand-petroleo truncate max-w-[200px]" title={selectedFile.name}>
                              {selectedFile.name}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-slate-100 pb-2 font-semibold">
                            <span className="text-slate-500">Tamanho:</span>
                            <span className="text-brand-petroleo">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span className="text-slate-500">Tipo:</span>
                            <span className={`font-bold ${
                              selectedFile.name.toLowerCase().endsWith(".pdf")
                                ? "text-brand-emerald-650"
                                : "text-rose-600"
                            }`}>
                              {selectedFile.name.toLowerCase().endsWith(".pdf")
                                ? "PDF válido"
                                : "Não suportado (apenas PDF)"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={() => updateState({ step: 2 })}
                      className="text-slate-555 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" /> Voltar
                    </button>
                    <Button
                      variant="primary"
                      onClick={startUpload}
                      disabled={!selectedFile || !selectedFile.name.toLowerCase().endsWith(".pdf") || uploadMutation.isPending}
                    >
                      Analisar Dívidas
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Estágio: Pre-Analyzing (Loading Profissional) */}
              {uploadStage === "pre-analyzing" && (
                <div className="space-y-6 max-w-md mx-auto py-6">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-4 border-brand-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <h3 className="text-lg font-bold text-brand-petroleo">Analisando documento...</h3>
                    <p className="text-xs text-slate-500">Estamos verificando a autenticidade e extraindo os dados.</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                    {/* Step 1: Arquivo recebido */}
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-650">
                      <div className="flex items-center gap-2">
                        <span className="text-brand-emerald-650">✓</span>
                        <span>Arquivo recebido</span>
                      </div>
                      <span className="text-brand-emerald-650 text-[10px] font-bold">Concluído</span>
                    </div>

                    {/* Step 2: PDF validado */}
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-655">
                      <div className="flex items-center gap-2">
                        <span className="text-brand-emerald-650">✓</span>
                        <span>PDF validado</span>
                      </div>
                      <span className="text-brand-emerald-650 text-[10px] font-bold">Concluído</span>
                    </div>

                    {/* Step 3: Extraindo instituições financeiras */}
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className={loadingStep >= 3 ? "text-brand-emerald-650" : "text-slate-350"}>
                          {loadingStep >= 3 ? "✓" : "⏳"}
                        </span>
                        <span className={loadingStep >= 3 ? "text-slate-800" : "text-slate-400"}>
                          Extraindo instituições financeiras
                        </span>
                      </div>
                      <span className={loadingStep >= 3 ? "text-brand-emerald-650 text-[10px] font-bold" : "text-slate-400 text-[10px]"}>
                        {loadingStep >= 3 ? "Concluído" : "Aguardando"}
                      </span>
                    </div>

                    {/* Step 4: Calculando indicadores */}
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className={loadingStep >= 4 ? "text-brand-emerald-650" : "text-slate-350"}>
                          {loadingStep >= 4 ? "✓" : "⏳"}
                        </span>
                        <span className={loadingStep >= 4 ? "text-slate-800" : "text-slate-400"}>
                          Calculando indicadores
                        </span>
                      </div>
                      <span className={loadingStep >= 4 ? "text-brand-emerald-650 text-[10px] font-bold" : "text-slate-400 text-[10px]"}>
                        {loadingStep >= 4 ? "Concluído" : "Aguardando"}
                      </span>
                    </div>

                    {/* Step 5: Gerando insights */}
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className={loadingStep >= 5 ? "text-brand-emerald-650" : "text-slate-355"}>
                          {loadingStep >= 5 ? "✓" : "⏳"}
                        </span>
                        <span className={loadingStep >= 5 ? "text-slate-800" : "text-slate-400"}>
                          Gerando insights
                        </span>
                      </div>
                      <span className={loadingStep >= 5 ? "text-brand-emerald-650 text-[10px] font-bold" : "text-slate-400 text-[10px]"}>
                        {loadingStep >= 5 ? "Concluído" : "Aguardando"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Estágio: Result Success (Resultado da Extração) */}
              {uploadStage === "result-success" && tempInsights && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100">
                      <CheckCircle className="w-6 h-6 text-brand-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-brand-petroleo">Análise Concluída</h2>
                      <span className="text-xs font-bold bg-emerald-50 text-brand-emerald-700 border border-brand-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-0.5">
                        ✓ Relatório Registrato identificado
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Instituições</span>
                      <span className="text-lg font-extrabold text-brand-petroleo">{tempInsights.institutionsCount}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operações</span>
                      <span className="text-lg font-extrabold text-brand-petroleo">
                        {tempInsights.institutions.reduce((acc: number, inst: any) => acc + (inst.operations || 1), 0)}
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total em dívidas</span>
                      <span className="text-sm font-extrabold text-brand-emerald-650 block mt-1">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(tempInsights.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Maiores apontamentos */}
                  <div className="bg-brand-offwhite-100 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-brand-petroleo uppercase tracking-wider">Maiores apontamentos</h4>
                    <div className="space-y-2">
                      {[...(tempInsights.institutions || [])]
                        .sort((a: any, b: any) => b.amount - a.amount)
                        .slice(0, 3)
                        .map((inst: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs font-semibold bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                            <span className="text-brand-petroleo font-bold">{inst.institution}</span>
                            <span className="text-slate-700 font-extrabold">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(inst.amount)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      variant="primary"
                      onClick={() => {
                        updateState({
                          originalDebts: tempDebts,
                          adjustedDebts: JSON.parse(JSON.stringify(tempDebts)),
                          step: 4,
                        });
                      }}
                    >
                      Ver meu painel
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Estágio: Result Failed (Caso Inválido) */}
              {uploadStage === "result-failed" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                      <AlertTriangle className="w-6 h-6 text-rose-650" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-brand-petroleo">Não identificamos um relatório Registrato válido.</h2>
                      <p className="text-xs text-rose-650 font-semibold">Infelizmente, o processamento automático não pôde ler as informações necessárias.</p>
                    </div>
                  </div>

                  {uploadError && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl text-xs font-semibold">
                      Detalhes do erro: {uploadError}
                    </div>
                  )}

                  <div className="bg-brand-offwhite-100 border border-slate-200 p-5 rounded-2xl space-y-3 text-xs font-semibold text-slate-700">
                    <h4 className="font-bold text-brand-petroleo uppercase tracking-wider text-[10px]">Motivos prováveis:</h4>
                    <ul className="space-y-2 list-inside list-disc text-slate-600">
                      <li>O documento enviado não contém a seção SCR (Empréstimos e Financiamentos) do Banco Central.</li>
                      <li>O PDF não possui texto selecionável/legível (por exemplo, uma foto convertida em PDF).</li>
                      <li>O arquivo enviado é um extrato de conta corrente comum, fatura de cartão ou outro tipo de documento.</li>
                    </ul>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={() => updateState({ step: 2 })}
                      className="text-slate-555 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" /> Voltar
                    </button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        setSelectedFile(null);
                        setTempInsights(null);
                        setTempDebts([]);
                        setUploadStage("idle");
                        setUploadError(null);
                      }}
                    >
                      Ver instruções novamente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Validação da Interpretação */}
          {state.step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100">
                  <FileCheck className="w-6 h-6 text-brand-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Confirmar Informações Extraídas</h2>
                  <p className="text-slate-500 text-sm">O sistema identificou as seguintes dívidas no documento:</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                {state.originalDebts.length === 0 ? (
                  <p className="text-sm text-slate-550 text-center py-6">Nenhuma dívida estruturada foi extraída do arquivo. Prossiga para adicioná-las manualmente.</p>
                ) : (
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                     <thead>
                       <tr className="text-slate-500 font-bold text-xs uppercase">
                         <th className="py-2 text-left">Instituição</th>
                         <th className="py-2 text-left">Modalidade</th>
                         <th className="py-2 text-right">Valor Reportado</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                       {state.originalDebts.map((d, i) => (
                         <tr key={i}>
                           <td className="py-2.5 text-brand-petroleo font-bold">{d.institution}</td>
                           <td className="py-2.5 text-slate-500">{d.operationType || "Crédito"}</td>
                           <td className="py-2.5 text-right font-mono text-brand-emerald-650 font-bold">
                             {d.reportedValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                  </table>
                )}
              </div>

              <ClarityCard
                title="Aviso de Conformidade"
                description="Os dados acima correspondem exatamente ao extrato capturado no SCR do Banco Central. Caso queira alterá-los ou complementar a lista, clique em 'Revisar Informações'."
              />

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => updateState({ step: 3 })}
                  className="text-slate-555 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => updateState({ step: 5 })} className="h-11">
                    <Edit2 className="w-4 h-4 mr-1.5" /> Revisar Informações
                  </Button>
                  <Button variant="primary" onClick={() => updateState({ step: 6 })} className="h-11">
                    Está Correto <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Conferência das Dívidas */}
          {state.step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100">
                  <Edit2 className="w-6 h-6 text-brand-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Ajustar e Adicionar Dívidas</h2>
                  <p className="text-slate-500 text-sm">Modifique as informações das dívidas localmente para sua reclamação.</p>
                </div>
              </div>

              {/* Edit form */}
              {editingDebtId && (
                <div className="bg-brand-offwhite-100 border border-slate-200 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-brand-petroleo uppercase tracking-wider">Ajustando Informações</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editInstName}
                      onChange={(e) => setEditInstName(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-brand-petroleo focus:outline-none focus:ring-1 focus:ring-brand-emerald-500"
                      placeholder="Instituição"
                    />
                    <input
                      type="text"
                      value={editInstValue}
                      onChange={(e) => setEditInstValue(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-brand-petroleo focus:outline-none focus:ring-1 focus:ring-brand-emerald-500"
                      placeholder="Valor (Ex: 1500.00)"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingDebtId(null)}
                      className="text-xs text-slate-500 hover:text-brand-petroleo px-3 py-1.5 font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveEditDebt}
                      className="bg-brand-emerald-600 hover:bg-brand-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}

              {/* Add form */}
              {!editingDebtId && (
                <div className="bg-brand-offwhite-100 border border-slate-200 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-brand-petroleo uppercase tracking-wider flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Adicionar Manualmente
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newInstName}
                      onChange={(e) => setNewInstName(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-brand-petroleo placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-emerald-500"
                      placeholder="Nome da Instituição (Ex: Banco Inter)"
                    />
                    <input
                      type="text"
                      value={newInstValue}
                      onChange={(e) => setNewInstValue(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-brand-petroleo placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-emerald-500"
                      placeholder="Valor do Saldo Devedor (Ex: 3500,00)"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddManualDebt}
                      className="bg-brand-emerald-600 hover:bg-brand-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Adicionar à Lista
                    </button>
                  </div>
                </div>
              )}

              {/* Adjusted Debts List */}
              <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                {state.adjustedDebts.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between bg-brand-offwhite-50 border border-slate-200 p-3.5 rounded-xl hover:border-brand-emerald-500/20 shadow-sm"
                  >
                    <div>
                      <div className="text-sm font-bold text-brand-petroleo flex items-center gap-2">
                        {d.institution}
                        {d.isEdited && (
                          <span className="text-[10px] bg-amber-50 border border-amber-200 text-brand-orange px-1.5 py-0.5 rounded font-bold">
                            {d.isManual ? "Manual" : "Ajustado"}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-550">{d.operationType}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm text-brand-emerald-650 font-bold">
                        {d.reportedValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startEditDebt(d)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-brand-petroleo"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteDebt(d.id)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-rose-600"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => updateState({ step: 4 })}
                  className="text-slate-555 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <Button variant="primary" onClick={() => updateState({ step: 6 })}>
                  Avançar para Insights <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: Insights Financeiros */}
          {state.step === 6 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100">
                  <Lightbulb className="w-6 h-6 text-brand-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Insights e Recomendações</h2>
                  <p className="text-slate-500 text-sm">Resumo da análise do seu perfil de endividamento.</p>
                </div>
              </div>

              {loadingInsights ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <div className="w-6 h-6 border-2 border-brand-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-500">Atualizando insights...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  <RecoveryInsight
                    totalAmount={insightsData?.totalAmount}
                    institutionsCount={insightsData?.institutionsCount}
                    largestInstitution={insightsData?.largestInstitution || undefined}
                  />

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-brand-petroleo uppercase tracking-wider">Diretrizes de Negociação</h3>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 text-xs text-slate-600 font-semibold">
                      {insightsData?.recommendations && insightsData.recommendations.length > 0 ? (
                        insightsData.recommendations.map((rec, idx) => (
                          <div key={idx} className="bg-brand-offwhite-100 border border-slate-150 p-2.5 rounded-lg flex items-start gap-2 shadow-sm leading-relaxed">
                            <span className="text-brand-emerald-650 font-extrabold">•</span>
                            <span>{rec}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500">Sem recomendações específicas para o perfil analisado.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => updateState({ step: state.originalDebts.length === state.adjustedDebts.length ? 4 : 5 })}
                  className="text-slate-555 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <Button variant="primary" onClick={() => updateState({ step: 7 })}>
                  Escolher Credor <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 7: Escolha da Instituição */}
          {state.step === 7 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100">
                  <Radio className="w-6 h-6 text-brand-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Escolha a Instituição para a Reclamação</h2>
                  <p className="text-slate-500 text-sm">Selecione exatamente uma credora para gerar a petição.</p>
                </div>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                {state.adjustedDebts.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">Adicione credores no passo de conferência para poder contestar.</p>
                ) : (
                  state.adjustedDebts.map((d) => (
                    <label
                      key={d.id}
                      className={`flex items-center justify-between border p-4 rounded-xl cursor-pointer transition-all ${
                        state.selectedInstitution === d.institution
                          ? "border-brand-emerald-500 bg-brand-emerald-50/50"
                          : "border-slate-200 bg-white hover:border-brand-emerald-500/20 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="selectedInst"
                          checked={state.selectedInstitution === d.institution}
                          onChange={() => updateState({ selectedInstitution: d.institution })}
                          className="w-4 h-4 text-brand-emerald-600 border-slate-305 bg-white focus:ring-brand-emerald-500 cursor-pointer"
                        />
                        <span className="text-sm font-bold text-brand-petroleo">{d.institution}</span>
                      </div>
                      <span className="font-mono text-sm font-semibold text-slate-500">
                        {d.reportedValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </label>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => updateState({ step: 6 })}
                  className="text-slate-550 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <Button variant="primary" onClick={() => updateState({ step: 8 })} disabled={!state.selectedInstitution}>
                  Avançar <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 8: Valor Atual da Dívida */}
          {state.step === 8 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100">
                  <DollarSign className="w-6 h-6 text-brand-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Valor Atual da Dívida</h2>
                  <p className="text-slate-505 text-sm">Se aplicável, informe o saldo devedor cobrado atualmente pela instituição.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-brand-offwhite-100 border border-slate-200 p-4 rounded-xl text-xs text-slate-700 leading-normal font-semibold">
                  A instituição selecionada foi <strong>{state.selectedInstitution}</strong>.
                  O valor extraído do relatório do Registrato foi{" "}
                  <span className="font-mono text-brand-emerald-650 font-bold">
                    {state.adjustedDebts
                      .find((d) => d.institution === state.selectedInstitution)
                      ?.reportedValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) || "—"}
                  </span>.
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider">
                    Saldo Cobrado Atualmente (Opcional)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm font-bold">
                      R$
                    </span>
                    <input
                      type="text"
                      value={state.currentDebtValue}
                      onChange={(e) => updateState({ currentDebtValue: formatBrlAsYouType(e.target.value) })}
                      placeholder="Ex: 1.200,00"
                      className="block w-full pl-10 pr-3 py-3.5 bg-white border border-slate-200 rounded-xl text-brand-petroleo placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-emerald-500 text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Se o banco estiver cobrando juros abusivos ou valores muito acima do relatório original, informe o saldo cobrado atual para fundamentar a contestação.
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => updateState({ step: 7 })}
                  className="text-slate-550 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <Button variant="primary" onClick={handleGenerate}>
                  <Cpu className="w-4.5 h-4.5 mr-1.5" /> Preparar Texto com IA
                </Button>
              </div>
            </div>
          )}

          {/* STEP 9: Geração da Reclamação (Loading) */}
          {state.step === 9 && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-brand-emerald-500/10"></div>
                <div className="absolute inset-0 rounded-full border-4 border-brand-emerald-600 border-t-transparent animate-spin"></div>
                <Cpu className="w-8 h-8 text-brand-emerald-650 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-brand-petroleo">Gerando reclamação...</h3>
                <p className="text-sm text-slate-500 max-w-md leading-relaxed font-semibold">
                  Nosso assistente está estruturando seu manifesto regulatório com base nas normativas do Banco Central.
                </p>
              </div>

              {/* Status do Agente com barra de progresso */}
              <div className="w-full max-w-md bg-brand-offwhite-100 p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Status do Agente</span>
                  <span className="text-brand-emerald-600 font-mono font-bold">
                    {Math.round(((loadingMessageIdx + 1) / LOADING_MESSAGES.length) * 100)}%
                  </span>
                </div>

                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-emerald-600 transition-all duration-500 ease-out"
                    style={{ width: `${((loadingMessageIdx + 1) / LOADING_MESSAGES.length) * 100}%` }}
                  ></div>
                </div>

                <div className="text-xs text-brand-emerald-650 font-bold h-6 flex items-center justify-center gap-2 transition-all">
                  <span className="w-2 h-2 rounded-full bg-brand-emerald-600 animate-ping"></span>
                  {LOADING_MESSAGES[loadingMessageIdx]}
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: Revisão da Reclamação */}
          {state.step === 10 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100">
                  <FileText className="w-6 h-6 text-brand-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Revisar Texto Gerado</h2>
                  <p className="text-slate-500 text-sm">Você pode revisar e editar o texto final da sua contestação abaixo.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                  <span>Rascunho de Contestação — {state.selectedInstitution}</span>
                  {regenerateMutation.isPending && (
                    <span className="text-brand-emerald-600 flex items-center gap-1 font-semibold">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Refinando texto com IA...
                    </span>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    disabled={regenerateMutation.isPending}
                    className="w-full h-[220px] bg-brand-offwhite-100 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-705 focus:outline-none focus:ring-1 focus:ring-brand-emerald-500 leading-relaxed resize-none shadow-inner"
                  />
                  {regenerateMutation.isPending && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 rounded-xl">
                      <div className="w-6 h-6 border-2 border-brand-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-bold text-brand-emerald-700">Refinando texto com IA...</span>
                    </div>
                  )}
                </div>

                {state.generatedComplaint?.disclaimer && (
                  <ClarityCard
                    variant="warning"
                    title="Atenção ao Rascunho"
                    description={state.generatedComplaint.disclaimer}
                  />
                )}
              </div>

              <div className="flex justify-between items-center pt-3">
                <button
                  onClick={() => updateState({ step: 8 })}
                  className="text-slate-550 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleRegenerate} disabled={regenerateMutation.isPending} className="py-2 px-4 text-xs h-10">
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${regenerateMutation.isPending ? "animate-spin" : ""}`} />
                    Regenerar Texto
                  </Button>
                  <Button variant="primary" onClick={() => updateState({ step: 11 })} className="py-2 px-5 text-xs h-10">
                    Avançar para Exportação <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 11: Exportação */}
          {state.step === 11 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100">
                  <Download className="w-6 h-6 text-brand-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Obter Texto e PDF</h2>
                  <p className="text-slate-500 text-sm">Copie ou baixe o material formatado pronto para o envio.</p>
                </div>
              </div>

              {/* Painel de Customização de Aparência do PDF */}
              <div className="bg-brand-offwhite-100 border border-slate-200 p-4.5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                  <FileText className="w-4.5 h-4.5 text-brand-emerald-600" />
                  <h3 className="text-xs font-bold text-brand-petroleo uppercase tracking-wider">
                    Personalização do Dossiê PDF (Aparência)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Option 1: Capa */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showCover}
                      onChange={(e) => setShowCover(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-petroleo block">Página de Capa</span>
                      <span className="text-[10px] text-slate-500 leading-normal block">
                        Gerar folha de rosto institucional
                      </span>
                    </div>
                  </label>

                  {/* Option 2: Marca d'água */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showWatermark}
                      onChange={(e) => setShowWatermark(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-petroleo block">Marca d'água</span>
                      <span className="text-[10px] text-slate-500 leading-normal block">
                        Adicionar padrão de segurança abstrato
                      </span>
                    </div>
                  </label>

                  {/* Option 3: Rodapé */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showFooter}
                      onChange={(e) => setShowFooter(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-petroleo block">Rodapé e Paginação</span>
                      <span className="text-[10px] text-slate-500 leading-normal block">
                        Exibir paginação oficial
                      </span>
                    </div>
                  </label>

                  {/* Option 4: Doc ID */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showDocId}
                      onChange={(e) => setShowDocId(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-petroleo block">ID no Cabeçalho</span>
                      <span className="text-[10px] text-slate-500 leading-normal block">
                        Exibir código verificador único
                      </span>
                    </div>
                  </label>

                  {/* Option 5: Destaques */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showHighlights}
                      onChange={(e) => setShowHighlights(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-petroleo block">Destaques Visuais</span>
                      <span className="text-[10px] text-slate-500 leading-normal block">
                        Termos em verde esmeralda no texto
                      </span>
                    </div>
                  </label>

                  {/* Option 6: Selo Editorial */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showEditorialSeal}
                      onChange={(e) => setShowEditorialSeal(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-petroleo block">Selo Editorial</span>
                      <span className="text-[10px] text-slate-500 leading-normal block">
                        Declaração de autenticidade no encerramento
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Copy Text Card */}
                <div className="bg-brand-offwhite-100 border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:border-brand-emerald-500/20 transition-all shadow-sm">
                  <div>
                    <h3 className="font-bold text-brand-petroleo mb-2">Copiar Texto</h3>
                    <p className="text-xs text-slate-505 mb-6 leading-relaxed font-semibold">
                      Copia a petição gerada para sua área de transferência para que você possa colar no portal oficial do Consumidor.gov.br.
                    </p>
                  </div>
                  <Button variant="secondary" onClick={handleCopyToClipboard} className="w-full">
                    {copiedText ? (
                      <>
                        <CheckCircle className="w-4.5 h-4.5 text-brand-emerald-600 mr-1.5" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4.5 h-4.5 text-brand-emerald-600 mr-1.5" />
                        Copiar Texto
                      </>
                    )}
                  </Button>
                </div>

                {/* PDF Card */}
                <div className="bg-brand-offwhite-100 border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:border-brand-emerald-500/20 transition-all shadow-sm">
                  <div>
                    <h3 className="font-bold text-brand-petroleo mb-2">Dossiê PDF Formatado</h3>
                    <p className="text-xs text-slate-505 mb-6 leading-relaxed font-semibold">
                      Gera um PDF contendo o detalhamento da dívida e a fundamentação jurídica de forma estruturada.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2.5 w-full">
                    <Button variant="primary" onClick={handleDownloadPdf} className="w-full">
                      <Download className="w-4.5 h-4.5 mr-1.5" />
                      Baixar PDF
                    </Button>
                    <Button variant="secondary" onClick={handleViewPdf} className="w-full bg-white border border-slate-200">
                      <ExternalLink className="w-4.5 h-4.5 text-brand-emerald-650 mr-1.5" />
                      Visualizar PDF
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => updateState({ step: 10 })}
                  className="text-slate-550 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <Button variant="primary" onClick={() => updateState({ step: 12 })}>
                  Continuar <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 12: Guia Assistido Consumidor.gov.br */}
          {state.step === 12 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100 text-brand-emerald-600">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Plataforma Consumidor.gov.br</h2>
                  <p className="text-slate-500 text-sm">O canal oficial para mediar sua reclamação diretamente com o banco.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2">
                  <h4 className="font-bold text-brand-petroleo text-xs uppercase tracking-wider">O que é?</h4>
                  <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                    Um serviço público gratuito do Ministério da Justiça que conecta consumidores diretamente às empresas para resolver conflitos financeiros.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2">
                  <h4 className="font-bold text-brand-petroleo text-xs uppercase tracking-wider">Como funciona?</h4>
                  <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                    Você protocola a petição fundamentada do Quita e os documentos. O banco tem a obrigação regulatória de analisar e responder formalmente.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2">
                  <h4 className="font-bold text-brand-petroleo text-xs uppercase tracking-wider">Prazos e Resolução</h4>
                  <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                    As instituições financeiras respondem em média em até 10 dias. Mais de 80% das reclamações são resolvidas com sucesso no portal.
                  </p>
                </div>
              </div>

              <div className="bg-brand-offwhite-100 border border-slate-200 p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-brand-petroleo uppercase tracking-wider">Etapas da Negociação</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-xs">
                    <span className="text-[10px] bg-brand-emerald-50 text-brand-emerald-700 px-2 py-0.5 rounded font-bold">1</span>
                    <p className="text-xs font-bold mt-2 text-brand-petroleo">Protocolo</p>
                    <p className="text-[10px] text-slate-500 mt-1">Envio da petição e documentos.</p>
                  </div>
                  <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-xs">
                    <span className="text-[10px] bg-brand-emerald-50 text-brand-emerald-700 px-2 py-0.5 rounded font-bold">2</span>
                    <p className="text-xs font-bold mt-2 text-brand-petroleo">Análise</p>
                    <p className="text-[10px] text-slate-500 mt-1">Análise jurídica do banco.</p>
                  </div>
                  <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-xs">
                    <span className="text-[10px] bg-brand-emerald-50 text-brand-emerald-700 px-2 py-0.5 rounded font-bold">3</span>
                    <p className="text-xs font-bold mt-2 text-brand-petroleo">Proposta</p>
                    <p className="text-[10px] text-slate-500 mt-1">Retorno formal com termos de ajuste.</p>
                  </div>
                  <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-xs">
                    <span className="text-[10px] bg-brand-emerald-50 text-brand-emerald-700 px-2 py-0.5 rounded font-bold">4</span>
                    <p className="text-xs font-bold mt-2 text-brand-petroleo">Avaliação</p>
                    <p className="text-[10px] text-slate-500 mt-1">Você avalia e encerra o caso.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => updateState({ step: 11 })}
                  className="text-slate-550 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <Button variant="primary" onClick={() => updateState({ step: 13 })}>
                  Continuar <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 13: Preparação da Reclamação */}
          {state.step === 13 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100 text-brand-emerald-600">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Preparação da Reclamação</h2>
                  <p className="text-slate-500 text-sm">Verifique os itens necessários antes de abrir a reclamação.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Empresa Alvo</span>
                  <p className="text-base font-bold text-brand-petroleo">{state.selectedInstitution}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categoria Sugerida</span>
                  <p className="text-base font-bold text-brand-petroleo">Renegociação de Dívidas / Cobrança Abusiva</p>
                </div>
              </div>

              {/* Checklist */}
              <div className="bg-brand-offwhite-100 border border-slate-200 p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-brand-petroleo uppercase tracking-wider">Checklist Obrigatório</h3>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={step13Checked.govbr}
                      onChange={(e) => setStep13Checked({ ...step13Checked, govbr: e.target.checked })}
                      className="mt-1 w-4.5 h-4.5 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-petroleo block">Conta Gov.br Ativa</span>
                      <span className="text-[10px] text-slate-500 leading-normal block">
                        Confirmo que possuo conta Gov.br nível Prata ou Ouro ativa para realizar o login no portal.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={step13Checked.manifest}
                      onChange={(e) => setStep13Checked({ ...step13Checked, manifest: e.target.checked })}
                      className="mt-1 w-4.5 h-4.5 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-petroleo block">Manifestação Reguladora Pronta</span>
                      <span className="text-[10px] text-slate-500 leading-normal block">
                        Já revisei e copiei o texto da petição elaborada pelo assistente Quita.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={step13Checked.scr}
                      onChange={(e) => setStep13Checked({ ...step13Checked, scr: e.target.checked })}
                      className="mt-1 w-4.5 h-4.5 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-petroleo block">Relatório do SCR/Registrato Salvo</span>
                      <span className="text-[10px] text-slate-500 leading-normal block">
                        Tenho o PDF do extrato original do Registrato salvo no meu dispositivo para servir como prova.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={step13Checked.dossier}
                      onChange={(e) => setStep13Checked({ ...step13Checked, dossier: e.target.checked })}
                      className="mt-1 w-4.5 h-4.5 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-petroleo block">Dossiê PDF Exportado</span>
                      <span className="text-[10px] text-slate-500 leading-normal block">
                        Realizei o download do Dossiê Financeiro Quita em PDF para anexar à reclamação.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => updateState({ step: 12 })}
                  className="text-slate-550 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <Button
                  variant="primary"
                  onClick={() => updateState({ step: 14 })}
                  disabled={!(step13Checked.govbr && step13Checked.manifest && step13Checked.scr && step13Checked.dossier)}
                >
                  Estou Pronto para Continuar <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 14: Protocolo Assistido */}
          {state.step === 14 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100 text-brand-emerald-600">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Protocolo Assistido</h2>
                  <p className="text-slate-500 text-sm">Siga os passos no painel direito enquanto copia os dados no esquerdo.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Panel: Resources */}
                <div className="space-y-4 bg-brand-offwhite-100 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-brand-petroleo uppercase tracking-wider">Seus Recursos</h3>
                    <div className="bg-white border border-slate-105 p-3 rounded-xl text-xs font-mono text-slate-600 max-h-[140px] overflow-y-auto shadow-inner leading-relaxed">
                      {complaintText}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button variant="secondary" onClick={handleCopyToClipboard} className="w-full h-10 text-xs">
                      {copiedText ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-brand-emerald-650 mr-1.5" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-brand-emerald-650 mr-1.5" />
                          Copiar Manifestação
                        </>
                      )}
                    </Button>
                    <Button variant="secondary" onClick={handleDownloadPdf} className="w-full h-10 text-xs bg-white border border-slate-200">
                      <Download className="w-4 h-4 text-brand-emerald-650 mr-1.5" />
                      Baixar Dossiê PDF
                    </Button>
                  </div>
                </div>

                {/* Right Panel: Step by step checklist */}
                <div className="space-y-3 bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                  <h3 className="text-xs font-bold text-brand-petroleo uppercase tracking-wider mb-2">Checklist de Protocolo</h3>
                  
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={step14Checked.access}
                        onChange={(e) => setStep14Checked({ ...step14Checked, access: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                      />
                      <span>1. Acessar o Consumidor.gov.br</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={step14Checked.login}
                        onChange={(e) => setStep14Checked({ ...step14Checked, login: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                      />
                      <span>2. Fazer login com a conta Gov.br</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={step14Checked.choose}
                        onChange={(e) => setStep14Checked({ ...step14Checked, choose: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                      />
                      <span>3. Escolher empresa: <strong>{state.selectedInstitution}</strong></span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={step14Checked.category}
                        onChange={(e) => setStep14Checked({ ...step14Checked, category: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                      />
                      <span>4. Selecionar categoria recomendada</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={step14Checked.paste}
                        onChange={(e) => setStep14Checked({ ...step14Checked, paste: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                      />
                      <span>5. Colar texto da manifestação regulatória</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={step14Checked.attach}
                        onChange={(e) => setStep14Checked({ ...step14Checked, attach: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                      />
                      <span>6. Anexar PDF do Dossiê Financeiro</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={step14Checked.send}
                        onChange={(e) => setStep14Checked({ ...step14Checked, send: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                      />
                      <span>7. Clicar em enviar e finalizar a reclamação</span>
                    </label>
                  </div>

                  <a
                    href="https://www.consumidor.gov.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 bg-brand-emerald-600 hover:bg-brand-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md cursor-pointer mt-3"
                  >
                    Abrir Consumidor.gov.br <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => updateState({ step: 13 })}
                  className="text-slate-550 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <Button variant="primary" onClick={() => updateState({ step: 15 })}>
                  Próximo Passo <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 15: Confirmação de Envio */}
          {state.step === 15 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100 text-brand-emerald-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Confirmação de Envio</h2>
                  <p className="text-slate-500 text-sm">Precisamos que você confirme o envio para encerrar a jornada.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider">
                      Número do Protocolo da Reclamação (Opcional)
                    </label>
                    <input
                      type="text"
                      value={protocolNumber}
                      onChange={(e) => setProtocolNumber(e.target.value)}
                      placeholder="Ex: 2026.06.000012345"
                      className="block w-full px-3.5 py-3.5 bg-white border border-slate-200 rounded-xl text-brand-petroleo placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-emerald-500 text-sm font-semibold"
                    />
                    <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                      Insira o número fornecido pelo Consumidor.gov.br para facilitar o acompanhamento no seu painel.
                    </p>
                  </div>
                </div>

                <div className="bg-brand-emerald-50/20 border border-brand-emerald-500/10 p-5 rounded-2xl">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSubmitted}
                      onChange={(e) => setIsSubmitted(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-emerald-800 block">
                        Confirmo que enviei a reclamação com sucesso
                      </span>
                      <span className="text-[10px] text-brand-emerald-700/80 leading-normal block mt-0.5">
                        O preenchimento e confirmação deste checklist encerra a edição da reclamação e gera seu plano estratégico.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => updateState({ step: 14 })}
                  className="text-slate-550 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <Button
                  variant="primary"
                  disabled={!isSubmitted}
                  onClick={() => {
                    // Save recovery journey to localStorage
                    const journeyObj = {
                      status: "RECLAMACAO_ENVIADA",
                      companyName: state.selectedInstitution || "Instituição Bancária",
                      complaintNumber: protocolNumber.trim() || "Sob Análise",
                      createdAt: new Date().toISOString(),
                    };
                    localStorage.setItem("quita_recovery_journey", JSON.stringify(journeyObj));
                    updateState({ step: 16 });
                  }}
                >
                  Concluir e Ver Resultados <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 16: Momento da Conquista */}
          {state.step === 16 && (
            <div className="space-y-6">
              <div className="text-center py-4 space-y-3">
                <div className="inline-flex bg-brand-emerald-50 p-4 rounded-full border border-brand-emerald-100 text-brand-emerald-600 animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-extrabold text-brand-petroleo tracking-tight max-w-lg mx-auto leading-tight">
                  Parabéns! Você deu um importante passo para recuperar o controle da sua vida financeira.
                </h2>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Ação concluída com sucesso</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-rose-50/50 border border-rose-100 p-5 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Antes desta jornada</span>
                  <ul className="text-xs text-rose-800 space-y-1.5 font-semibold">
                    <li className="flex items-center gap-1.5">✕ Dívidas sem análise detalhada</li>
                    <li className="flex items-center gap-1.5">✕ Falta de direcionamento regulatório</li>
                    <li className="flex items-center gap-1.5">✕ Ausência de estratégia de negociação</li>
                  </ul>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Agora você possui</span>
                  <ul className="text-xs text-emerald-800 space-y-1.5 font-semibold">
                    <li className="flex items-center gap-1.5">✓ Diagnóstico completo do SCR</li>
                    <li className="flex items-center gap-1.5">✓ Manifestação fundamentada</li>
                    <li className="flex items-center gap-1.5">✓ Reclamação oficial protocolada</li>
                    <li className="flex items-center gap-1.5">✓ Canal oficial de negociação aberto</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button variant="primary" onClick={() => updateState({ step: 17 })}>
                  Avançar <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 17: De onde você saiu */}
          {state.step === 17 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100 text-brand-emerald-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Sua Linha do Progresso</h2>
                  <p className="text-slate-550 text-sm font-semibold">Olhe para trás e veja a evolução que conquistou hoje.</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-6">
                {/* Horizontal Timeline */}
                <div className="relative flex justify-between items-center w-full">
                  <div className="absolute left-0 right-0 h-1 bg-slate-200 top-1/2 -translate-y-1/2 -z-0"></div>
                  <div className="absolute left-0 right-0 h-1 bg-brand-emerald-600 top-1/2 -translate-y-1/2 -z-0 w-[80%]"></div>
                  
                  {[
                    { label: "Incerteza", active: true },
                    { label: "Diagnóstico", active: true },
                    { label: "Planejamento", active: true },
                    { label: "Ação", active: true },
                    { label: "Resolução", active: false }
                  ].map((stepObj, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                        stepObj.active
                          ? "bg-brand-emerald-650 text-white border-brand-emerald-600"
                          : "bg-slate-100 text-slate-400 border-slate-300"
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] font-bold mt-2 ${stepObj.active ? "text-brand-emerald-700" : "text-slate-400"}`}>
                        {stepObj.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-center bg-white p-5 rounded-xl border border-slate-150 shadow-xs max-w-xl mx-auto">
                  <p className="text-sm font-semibold text-slate-705 italic leading-relaxed">
                    "O maior desafio para quem possui dívidas não é a dívida em si, mas a falta de informação e direcionamento. Hoje você já superou essa etapa."
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => updateState({ step: 16 })}
                  className="text-slate-550 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <Button variant="primary" onClick={() => updateState({ step: 18 })}>
                  Avançar <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 18: Os caminhos que se abrem agora */}
          {state.step === 18 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100 text-brand-emerald-600">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Cenários Futuros</h2>
                  <p className="text-slate-500 text-sm">O que esperar da instituição financeira a partir de agora?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-205 p-4 rounded-xl flex gap-3 shadow-xs">
                  <span className="text-emerald-500 text-sm mt-0.5">✓</span>
                  <div>
                    <h4 className="text-xs font-bold text-brand-petroleo">1. Proposta de Renegociação</h4>
                    <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">
                      O banco pode apresentar uma oferta de renegociação com descontos significativos sobre a dívida sob análise.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-205 p-4 rounded-xl flex gap-3 shadow-xs">
                  <span className="text-emerald-500 text-sm mt-0.5">✓</span>
                  <div>
                    <h4 className="text-xs font-bold text-brand-petroleo">2. Correção de Informações</h4>
                    <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">
                      Caso o Registrato possua erros de reporte, a instituição enviará a correção oficial ao Banco Central.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-205 p-4 rounded-xl flex gap-3 shadow-xs">
                  <span className="text-emerald-500 text-sm mt-0.5">✓</span>
                  <div>
                    <h4 className="text-xs font-bold text-brand-petroleo">3. Revisão de Cobranças</h4>
                    <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">
                      O banco analisará a ocorrência de cobranças indevidas ou juros em desacordo com as normativas.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-205 p-4 rounded-xl flex gap-3 shadow-xs">
                  <span className="text-emerald-500 text-sm mt-0.5">✓</span>
                  <div>
                    <h4 className="text-xs font-bold text-brand-petroleo">4. Esclarecimentos Oficiais</h4>
                    <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">
                      Mesmo em recusa, a instituição é obrigada a justificar por escrito as cobranças, gerando prova judicial valiosa.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-brand-emerald-50/30 border border-brand-emerald-500/10 p-4.5 rounded-2xl text-xs text-brand-emerald-800 text-center font-bold">
                "Independentemente da resposta recebida, você agora possui um registro formal e documentado da sua manifestação."
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => updateState({ step: 17 })}
                  className="text-slate-550 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <Button variant="primary" onClick={() => updateState({ step: 19 })}>
                  Avançar <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 19: Plano de Acompanhamento */}
          {state.step === 19 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100 text-brand-emerald-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Plano de Acompanhamento</h2>
                  <p className="text-slate-500 text-sm">Compromissos para os próximos dias de análise do caso.</p>
                </div>
              </div>

              <div className="bg-brand-offwhite-100 border border-slate-200 p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-brand-petroleo uppercase tracking-wider">Seu Plano Estratégico</h3>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={step19Checked.track}
                      onChange={(e) => setStep19Checked({ ...step19Checked, track: e.target.checked })}
                      className="mt-1 w-4.5 h-4.5 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-petroleo block">Acompanhar o Consumidor.gov.br</span>
                      <span className="text-[10px] text-slate-550 leading-normal block">
                        Acessar a plataforma pelo menos uma vez por semana para verificar o status do protocolo.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={step19Checked.email}
                      onChange={(e) => setStep19Checked({ ...step19Checked, email: e.target.checked })}
                      className="mt-1 w-4.5 h-4.5 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-petroleo block">Verificar E-mail Cadastrado</span>
                      <span className="text-[10px] text-slate-550 leading-normal block">
                        Ficar atento a notificações enviadas pelo portal Consumidor.gov.br com alertas de resposta.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={step19Checked.response}
                      onChange={(e) => setStep19Checked({ ...step19Checked, response: e.target.checked })}
                      className="mt-1 w-4.5 h-4.5 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-petroleo block">Acompanhar Novas Respostas</span>
                      <span className="text-[10px] text-slate-550 leading-normal block">
                        Responder a eventuais dúvidas ou solicitações de documentos complementares feitas pelo banco.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={step19Checked.save}
                      onChange={(e) => setStep19Checked({ ...step19Checked, save: e.target.checked })}
                      className="mt-1 w-4.5 h-4.5 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-petroleo block">Salvar Documentos Recebidos</span>
                      <span className="text-[10px] text-slate-550 leading-normal block">
                        Efetuar download de qualquer proposta de renegociação assinada ou documento emitido pelo banco.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={step19Checked.return}
                      onChange={(e) => setStep19Checked({ ...step19Checked, return: e.target.checked })}
                      className="mt-1 w-4.5 h-4.5 rounded text-brand-emerald-600 border-slate-300 focus:ring-brand-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-brand-petroleo block">Retornar ao Quita para Novas Ações</span>
                      <span className="text-[10px] text-slate-555 leading-normal block font-semibold">
                        Após receber a resposta, usar o Quita para auditar o novo SCR ou abrir outras reclamações se necessário.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="text-center font-bold text-xs text-brand-emerald-850 bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                "As melhores negociações normalmente acontecem quando o consumidor acompanha ativamente o processo."
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => updateState({ step: 18 })}
                  className="text-slate-550 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <Button
                  variant="primary"
                  disabled={!(step19Checked.track && step19Checked.email && step19Checked.response && step19Checked.save && step19Checked.return)}
                  onClick={() => {
                    // Update localStorage status to RECLAMACAO_ENVIADA to ensure it matches
                    const existing = localStorage.getItem("quita_recovery_journey");
                    if (existing) {
                      try {
                        const parsed = JSON.parse(existing);
                        parsed.status = "RECLAMACAO_ENVIADA";
                        localStorage.setItem("quita_recovery_journey", JSON.stringify(parsed));
                      } catch (e) {
                        console.error(e);
                      }
                    }
                    if (user) {
                      wizardStorage.clear(user.id);
                    }
                    router.push("/dashboard");
                  }}
                >
                  Finalizar e ir para o Dashboard <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-brand-offwhite-50/50 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Quita. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3 text-slate-400 font-semibold">
            <Link href="/terms" className="hover:text-brand-emerald-655 transition-colors">Termos de Uso</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-brand-emerald-655 transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </footer>

      <CustomModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={executeResetWizard}
        title="Reiniciar Fluxo"
        description="Tem certeza que deseja reiniciar todo o fluxo? Isso limpará os dados do assistente local e removerá os relatórios enviados."
        confirmText="Sim, reiniciar"
        cancelText="Cancelar"
        isDanger={true}
      />

      <CustomToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
