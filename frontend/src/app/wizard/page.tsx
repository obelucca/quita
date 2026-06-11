"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RecoveryProgress } from "@/components/ui/recovery-progress";
import { ClarityCard } from "@/components/ui/clarity-card";
import { RecoveryInsight } from "@/components/ui/recovery-insight";
import { CompletionMoment } from "@/components/ui/completion-moment";

const INITIAL_STATE: WizardState = {
  step: 1,
  originalDebts: [],
  adjustedDebts: [],
  selectedInstitution: null,
  currentDebtValue: "",
  generatedComplaint: null,
};

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
  
  // Local edit debt state
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [editInstName, setEditInstName] = useState("");
  const [editInstValue, setEditInstValue] = useState("");
  const [newInstName, setNewInstName] = useState("");
  const [newInstValue, setNewInstValue] = useState("");
  
  // IA editable complaint text
  const [complaintText, setComplaintText] = useState("");
  const [copiedText, setCopiedText] = useState(false);

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
      if (savedState) {
        setState(savedState);
        if (savedState.generatedComplaint) {
          setComplaintText(savedState.generatedComplaint.complaint);
        }
      }
    }
  }, [user]);

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

  // Reset wizard progress helper
  const resetWizard = () => {
    if (confirm("Tem certeza que deseja reiniciar todo o fluxo? Isso limpará os dados do assistente local.")) {
      if (user) {
        wizardStorage.clear(user.id);
      }
      setState(INITIAL_STATE);
      setDataConsent(false);
      setSelectedFile(null);
      setUploadProgress(0);
      setUploadError(null);
    }
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
      setUploadProgress(100);
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
        updateState({
          originalDebts: mapped,
          adjustedDebts: JSON.parse(JSON.stringify(mapped)),
          step: 4,
        });
      }
    },
    onError: (err: any) => {
      setUploadProgress(0);
      setUploadError(err.data?.message || "Não foi possível concluir esta etapa. Vamos tentar novamente com um PDF válido.");
    },
  });

  // Generate Complaint Mutation
  const generateMutation = useMutation({
    mutationFn: (data: { institution: string; value?: number }) =>
      complaintService.generate(data.institution, data.value),
    onSuccess: (data) => {
      updateState({
        generatedComplaint: data,
        step: 10,
      });
      setComplaintText(data.complaint);
      // Increment claims count locally to showcase progress on dashboard
      const currentClaims = parseInt(localStorage.getItem("quota_claims_count") || "0");
      localStorage.setItem("quota_claims_count", (currentClaims + 1).toString());
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
    onError: () => {
      alert("Erro ao estruturar reclamação com a IA. Tente novamente.");
      updateState({ step: 8 });
    },
  });

  // Regenerate Complaint Mutation
  const regenerateMutation = useMutation({
    mutationFn: (data: { id: string; value?: number }) =>
      complaintService.regenerate(data.id, data.value),
    onSuccess: (data) => {
      updateState({
        generatedComplaint: data,
      });
      setComplaintText(data.complaint);
    },
    onError: () => {
      alert("Erro ao regenerar texto. Tente novamente.");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setUploadError("Por favor, selecione apenas arquivos do tipo PDF.");
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const startUpload = () => {
    if (!selectedFile) return;
    setUploadError(null);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + 15;
      });
    }, 150);

    uploadMutation.mutate(selectedFile, {
      onSettled: () => {
        clearInterval(interval);
      },
    });
  };

  // Add Manual Debt
  const handleAddManualDebt = () => {
    if (!newInstName.trim() || !newInstValue.trim()) return;
    const cleanVal = newInstValue.replace(".", "").replace(",", ".");
    const valNum = parseFloat(cleanVal);
    if (isNaN(valNum) || valNum <= 0) {
      alert("Insira um valor numérico válido.");
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
      alert("Insira um valor numérico válido.");
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
    updateState({ step: 9 });
    const currentVal = state.currentDebtValue ? parseFloat(state.currentDebtValue.replace(",", ".")) : undefined;
    generateMutation.mutate({
      institution: state.selectedInstitution,
      value: isNaN(currentVal as number) ? undefined : currentVal,
    });
  };

  const handleRegenerate = () => {
    if (!state.generatedComplaint?.id) return;
    const currentVal = state.currentDebtValue ? parseFloat(state.currentDebtValue.replace(",", ".")) : undefined;
    regenerateMutation.mutate({
      id: state.generatedComplaint.id,
      value: isNaN(currentVal as number) ? undefined : currentVal,
    });
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(complaintText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!state.generatedComplaint?.id) return;
    try {
      await complaintService.downloadPdf(
        state.generatedComplaint.id,
        `Reclamacao_Quita_${state.selectedInstitution?.replace(/\s+/g, "_")}.pdf`
      );
      const currentDownloads = parseInt(localStorage.getItem("quota_pdf_downloads") || "0");
      localStorage.setItem("quota_pdf_downloads", (currentDownloads + 1).toString());
    } catch (err) {
      alert("Erro ao baixar PDF da reclamação.");
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
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100">
                  <Shield className="w-6 h-6 text-brand-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Obtenha seu Relatório Registrato</h2>
                  <p className="text-slate-500 text-sm">O primeiro passo é obter o PDF oficial do Banco Central.</p>
                </div>
              </div>

              <div className="space-y-4">
                <ClarityCard
                  title="O que é o Relatório SCR?"
                  description="É um documento oficial do Banco Central que lista todas as suas operações de crédito ativas (empréstimos, financiamentos e cartões) acima de R$ 200,00."
                />

                <div className="bg-brand-offwhite-100 border border-slate-200 p-5 rounded-xl space-y-3 text-xs leading-relaxed text-slate-700">
                  <h3 className="font-bold text-brand-petroleo text-xs uppercase tracking-wider">Como obter o PDF no site do BC:</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      Acesse o site oficial:{" "}
                      <a
                        href="https://registrato.bcb.gov.br/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-emerald-600 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        Registrato BCB <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </li>
                    <li>Faça login usando sua credencial <strong>Gov.br</strong> (nível Prata ou Ouro).</li>
                    <li>Selecione a opção <strong>Empréstimos e Financiamentos</strong>.</li>
                    <li>Escolha o período desejado e clique em <strong>Gerar relatório</strong>.</li>
                    <li>Salve o PDF gerado em seu dispositivo para o próximo passo.</li>
                  </ol>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="primary" onClick={() => updateState({ step: 2 })}>
                  Entendi, ir para o próximo passo <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
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

                <div className="flex items-start gap-3 mt-6 bg-brand-emerald-50/50 border border-brand-emerald-500/10 p-4 rounded-xl">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={dataConsent}
                    onChange={(e) => setDataConsent(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-brand-emerald-600 bg-white focus:ring-brand-emerald-500 mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="consent" className="text-xs text-slate-655 cursor-pointer leading-normal">
                    Eu compreendo que o Quita utilizará os dados extraídos do meu relatório do Registrato unicamente para gerar as minhas reclamações e insights. Declaro que li e concordo com estes termos.
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => updateState({ step: 1 })}
                  className="text-slate-550 hover:text-brand-petroleo font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <Button variant="primary" onClick={() => updateState({ step: 3 })} disabled={!dataConsent}>
                  Prosseguir <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Upload do PDF */}
          {state.step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100">
                  <Upload className="w-6 h-6 text-brand-emerald-650" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Faça Upload do PDF do Registrato</h2>
                  <p className="text-slate-500 text-sm">Selecione o arquivo baixado do site do Banco Central.</p>
                </div>
              </div>

              <div className="space-y-4">
                {uploadError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="border-2 border-dashed border-slate-200 hover:border-brand-emerald-500/50 rounded-2xl bg-brand-offwhite-100 p-8 text-center transition-all flex flex-col items-center justify-center min-h-[200px]">
                  <Upload className="w-10 h-10 text-slate-400 mb-4" />
                  <p className="text-sm text-brand-petroleo mb-2 font-semibold">
                    Arraste o arquivo Registrato PDF ou clique abaixo
                  </p>
                  <p className="text-[11px] text-slate-500 mb-4">Apenas arquivos PDF são aceitos (max. 10MB)</p>
                  
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

                  {selectedFile && (
                    <div className="mt-4 text-sm text-brand-emerald-650 font-bold flex items-center gap-1.5">
                      <FileCheck className="w-4.5 h-4.5" />
                      {selectedFile.name}
                    </div>
                  )}
                </div>

                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Analisando relatório Registrato...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-emerald-600 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
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
                <Button variant="primary" onClick={startUpload} disabled={!selectedFile || uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Processando..." : "Analisar Dívidas"}
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
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
                      onChange={(e) => updateState({ currentDebtValue: e.target.value })}
                      placeholder="Ex: 1200,00"
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
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-brand-emerald-600 border-t-transparent animate-spin"></div>
                <Cpu className="w-6 h-6 text-brand-emerald-650 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-brand-petroleo animate-pulse">Estruturando Reclamação com Inteligência Artificial</h3>
                <p className="text-sm text-slate-500 max-w-md leading-relaxed font-medium">
                  Aguarde. Nosso modelo está analisando seu histórico, localizando inconsistências regulatórias e redigindo a contestação para o Consumidor.gov.br.
                </p>
              </div>
              <div className="text-xs text-brand-emerald-600 font-mono font-bold">
                Analisando normativas do Banco Central do Brasil...
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
                  {generateMutation.isPending && <span className="text-brand-emerald-600">Regenerando...</span>}
                </div>

                <textarea
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  className="w-full h-[220px] bg-brand-offwhite-100 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-emerald-500 leading-relaxed resize-none shadow-inner"
                />

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
                    <h3 className="font-bold text-brand-petroleo mb-2">Baixar PDF Formatado</h3>
                    <p className="text-xs text-slate-505 mb-6 leading-relaxed font-semibold">
                      Gera um PDF contendo o detalhamento da dívida e a fundamentação jurídica de forma estruturada.
                    </p>
                  </div>
                  <Button variant="primary" onClick={handleDownloadPdf} className="w-full">
                    <Download className="w-4.5 h-4.5 mr-1.5" />
                    Baixar PDF
                  </Button>
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

          {/* STEP 12: Monetização (Simulação) */}
          {state.step === 12 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-brand-emerald-50 p-3 rounded-xl border border-brand-emerald-100">
                  <CreditCard className="w-6 h-6 text-brand-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-brand-petroleo">Quita Premium (Simulado)</h2>
                  <p className="text-slate-500 text-sm">Geração de reclamações ilimitadas.</p>
                </div>
              </div>

              <div className="bg-brand-offwhite-100 border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="font-bold text-brand-petroleo">Geração Gratuita</h3>
                    <p className="text-xs text-slate-500">Você já utilizou sua 1ª reclamação gratuita.</p>
                  </div>
                  <span className="text-xs bg-brand-emerald-50 border border-brand-emerald-150 text-brand-emerald-700 font-bold px-2 py-1 rounded">
                    Utilizada
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h3 className="font-bold text-brand-petroleo">Pacote 3 Novas Reclamações</h3>
                    <p className="text-xs text-slate-500">Para contestar outras instituições do seu Registrato.</p>
                  </div>
                  <span className="font-mono font-bold text-brand-emerald-600 text-lg">
                    R$ 15,00
                  </span>
                </div>

                <div className="bg-brand-emerald-50/50 border border-brand-emerald-500/10 p-3.5 rounded-xl text-xs text-brand-emerald-750 leading-relaxed font-semibold">
                  Nota: Esta etapa é uma simulação do modelo de cobrança do MVP. Não serão solicitados dados reais de cobrança. Prossiga sem custos.
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
                  Avançar Gratuitamente <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 13: Checklist & Completion Moment */}
          {state.step === 13 && (
            <CompletionMoment
              institution={state.selectedInstitution || "Instituição Financeira"}
              onFinish={() => {
                if (user) {
                  wizardStorage.clear(user.id);
                }
                router.push("/dashboard");
              }}
            />
          )}

        </Card>
      </main>
    </div>
  );
}
