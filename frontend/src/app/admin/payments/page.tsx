"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { adminService } from "@/services/admin.service";
import { AdminDashboardMetricsResponse, AdminPaymentDetailResponse } from "@/types";
import {
  ArrowLeft,
  DollarSign,
  CheckCircle,
  Clock,
  AlertOctagon,
  RefreshCw,
  Search,
  Eye,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function AdminPaymentsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [metrics, setMetrics] = useState<AdminDashboardMetricsResponse | null>(null);
  const [payments, setPayments] = useState<AdminPaymentDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [user, isAuthenticated, authLoading, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsRes, paymentsRes] = await Promise.all([
        adminService.getMetrics(),
        adminService.getAllPayments(),
      ]);
      setMetrics(metricsRes);
      setPayments(paymentsRes);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.mercadopagoPaymentId &&
        payment.mercadopagoPaymentId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (authLoading || loading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-slate-400 font-medium">Verificando credenciais e carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-grid-pattern text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-emerald-500 hover:text-emerald-400 transition-colors gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Conciliação & Auditoria Financeira
            </h1>
            <p className="text-slate-400 text-sm">
              Visão consolidada de todas as transações da plataforma Quita.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Atualizar Dados
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-slate-900 border-slate-800 p-6 flex items-center justify-between shadow-lg glow-emerald">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Receita Total (Aprovado)</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {metrics ? formatCurrency(metrics.totalRevenue) : "R$ 0,00"}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <DollarSign className="h-6 w-6" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-slate-900 border-slate-800 p-6 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pagamentos Aprovados</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {metrics ? metrics.approvedCount : 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle className="h-6 w-6" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-slate-900 border-slate-800 p-6 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Transações Pendentes</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {metrics ? metrics.pendingCount : 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Clock className="h-6 w-6" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-slate-900 border-slate-800 p-6 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Transações Sem Sucesso</p>
                <h3 className="text-2xl font-bold text-white mt-2">
                  {metrics ? metrics.failedCount : 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <AlertOctagon className="h-6 w-6" />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Filters and List Card */}
        <Card className="bg-slate-900 border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white">Transações Recentes</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 flex-grow md:max-w-2xl justify-end">
              {/* Search input */}
              <div className="relative flex-grow sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nome, e-mail ou ID MP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>

              {/* Status Select filter */}
              <div className="flex gap-2">
                {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      statusFilter === status
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-850"
                    }`}
                  >
                    {status === "ALL" ? "Todos" : status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-850">
            <table className="min-w-full divide-y divide-slate-850 text-sm text-left">
              <thead className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Pacote</th>
                  <th className="px-6 py-4">Créditos</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Data de Criação</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 bg-slate-900 text-slate-200">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{payment.userName}</div>
                        <div className="text-xs text-slate-400">{payment.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-300">{payment.packageName}</td>
                      <td className="px-6 py-4 text-slate-300">{payment.creditsQuantity}</td>
                      <td className="px-6 py-4 font-semibold text-white">{formatCurrency(payment.amount)}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                            payment.status === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : payment.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(payment.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/payments/${payment.id}`}>
                          <Button
                            variant="tertiary"
                            className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/5 py-1 px-3"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Auditar
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      Nenhum pagamento encontrado com os filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
