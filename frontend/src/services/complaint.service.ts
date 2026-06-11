import { api } from "@/lib/api";
import { ComplaintResponse, ComplaintHistoryResponse } from "@/types";

export const complaintService = {
  generate: (institution: string, currentDebtValue?: number) => {
    return api.post<ComplaintResponse>("/complaints/generate", {
      institution,
      currentDebtValue,
    });
  },
  list: () => api.get<ComplaintHistoryResponse[]>("/complaints"),
  getById: (id: string) => api.get<ComplaintResponse>(`/complaints/${id}`),
  regenerate: (id: string, currentDebtValue?: number) => {
    return api.post<ComplaintResponse>(`/complaints/${id}/regenerate`, {
      currentDebtValue,
    });
  },
  downloadPdf: async (id: string, filename: string) => {
    const blob = await api.get<Blob>(`/complaints/${id}/pdf`, {
      headers: {
        Accept: "application/pdf",
      },
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
