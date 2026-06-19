import { api } from "@/lib/api";

export interface CheckoutResponse {
  checkoutUrl: string;
}

export interface PaymentResponse {
  id: string;
  mercadopagoPaymentId: string | null;
  mercadopagoPreferenceId: string | null;
  packageName: string;
  creditsQuantity: number;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  approvedAt: string | null;
}

export const paymentService = {
  createCheckout: (packageId: string) => 
    api.post<CheckoutResponse>("/payments/create-checkout", { packageId }),
  
  getPayment: (id: string) => 
    api.get<PaymentResponse>(`/payments/${id}`),
  
  getHistory: () => 
    api.get<PaymentResponse[]>("/payments"),
};
