"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { adminService } from "@/services/admin.service";
import { AdminPaymentDetailResponse } from "@/types";
import {
  ArrowLeft,
  Calendar,
  User,
  CreditCard,
  History,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  Shield,
  Layers,
  Info,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function AdminPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [payment, setPayment] = useState<AdminPaymentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [user, isAuthenticated, authLoading, router]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPaymentDetail(id);
      setPayment(response);
    } catch (error) {
      console.error("Error fetching payment detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      fetchDetail();
    }
  }, [isAuthenticated, user, id]);

  const handleForceReconciliation = async () => {
    if (!payment) return;
    try {
      setReconciling(true);
      setToastMessage(null);
      const response = await adminService.forceReconciliation(payment.id);
      setPayment(response);
      setToastType("success");
      setToastMessage("Reconciliação executada com sucesso!");
    } catch (error: any) {
      console.error("Error reconciling payment:", error);
      setToastType("error");
      setToastMessage(
        error?.response?.data?.message || "Falha ao executar reconciliação manual."
      );
    } finally {
      setReconciling(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "WEBHOOK":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "RECONCILIATION_JOB":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "ADMIN":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getEventTypeColor = (type: string) => {
    if (type.includes("APPROVED") || type.includes("GRANTED")) {
      return "text-emerald-400";
    }
    if (type.includes("REJECTED") || type.includes("CANCELLED")) {
      return "text-rose-400";
    }
    return "text-amber-400";
  };

  if (authLoading || loading || !user || user.role !== "ADMIN" || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Clock className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-slate-400 font-medium">Carregando detalhes do pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-grid-pattern text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back navigation & Header */}
        <div className="space-y-2">
          <Link href="/admin/payments" className="inline-flex items-center text-sm text-emerald-500 hover:text-emerald-400 transition-colors gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar para Painel
          </Link>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Auditoria de Transação
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">{payment.id}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border ${
                  payment.status === "APPROVED"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/35"
                    : payment.status === "PENDING"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/35"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/35"
                }`}
              >
                {payment.status}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback toast message */}
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
              toastType === "success"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            <Info className="h-5 w-5 flex-shrink-0" />
            {toastMessage}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metadata Card */}
          <Card className="bg-slate-900 border-slate-800 p-6 shadow-xl col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-500" /> Detalhes Gerais
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Cliente</p>
                <p className="text-sm font-medium text-white mt-1">{payment.userName}</p>
                <p className="text-xs text-slate-400">{payment.userEmail}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Pacote de Crédito</p>
                <p className="text-sm font-medium text-white mt-1">{payment.packageName}</p>
                <p className="text-xs text-slate-400">{payment.creditsQuantity} créditos</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Valor Total</p>
                <p className="text-sm font-bold text-emerald-400 mt-1">{formatCurrency(payment.amount)}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Identificador Externo (MP)</p>
                <p className="text-sm font-mono text-slate-300 mt-1">{payment.mercadopagoPaymentId || "Não associado"}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Data de Solicitação</p>
                <p className="text-sm text-slate-300 mt-1">{formatDate(payment.createdAt)}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Data de Liberação</p>
                <p className="text-sm text-slate-300 mt-1">{formatDate(payment.approvedAt)}</p>
              </div>
            </div>
          </Card>

          {/* Action Trigger Card */}
          <Card className="bg-slate-900 border-slate-800 p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" /> Ações Operacionais
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Se o webhook do Mercado Pago falhou ou atrasou, você pode acionar a reconciliação manual. O sistema consultará a API do Mercado Pago e atualizará o status respeitando as regras de idempotência.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
              {payment.status === "PENDING" ? (
                <Button
                  variant="primary"
                  onClick={handleForceReconciliation}
                  disabled={reconciling}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 py-2"
                >
                  <Play className={`h-4 w-4 ${reconciling ? "animate-spin" : ""}`} />
                  Forçar Reconciliação
                </Button>
              ) : (
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-center">
                  <p className="text-xs text-emerald-400 font-semibold">
                    Créditos Concedidos com Sucesso
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Operações adicionais bloqueadas por segurança financeira.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Audit Trail Timeline */}
        <Card className="bg-slate-900 border-slate-800 p-6 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-500" /> Trilha de Auditoria (Payment Events)
          </h2>
          
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {payment.events && payment.events.length > 0 ? (
                payment.events.map((event, eventIdx) => (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== payment.events!.length - 1 ? (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-800" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center text-emerald-500">
                            <Layers className="h-4 w-4" />
                          </span>
                        </div>
                        <div className="flex-grow pt-1.5 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-white">
                                Evento:{" "}
                                <span className={getEventTypeColor(event.eventType)}>
                                  {event.eventType}
                                </span>
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Transição: <span className="font-mono">{event.oldStatus}</span> &rarr;{" "}
                                <span className="font-mono">{event.newStatus}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getSourceColor(event.processingSource)}`}>
                                {event.processingSource}
                              </span>
                              <span className="text-xs text-slate-400 whitespace-nowrap">
                                {formatDate(event.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Metadata display */}
                          {event.metadata && Object.keys(event.metadata).length > 0 && (
                            <div className="mt-2 text-xs bg-slate-950/80 p-3 rounded-lg border border-slate-900 font-mono text-slate-400 overflow-x-auto max-w-full">
                              <pre className="whitespace-pre-wrap">{JSON.stringify(event.metadata, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">
                  Nenhum evento de auditoria registrado para esta transação.
                </p>
              )}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
