import { api } from "@/lib/api";
import { AdminDashboardMetricsResponse, AdminPaymentDetailResponse } from "@/types";

export const adminService = {
  getMetrics: () =>
    api.get<AdminDashboardMetricsResponse>("/admin/payments/metrics"),

  getAllPayments: () =>
    api.get<AdminPaymentDetailResponse[]>("/admin/payments"),

  getPaymentDetail: (id: string) =>
    api.get<AdminPaymentDetailResponse>(`/admin/payments/${id}`),

  forceReconciliation: (id: string) =>
    api.post<AdminPaymentDetailResponse>(`/admin/payments/${id}/reconcile`),
};
