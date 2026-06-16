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
  downloadPdf: async (id: string, filename: string, options?: {
    showCover?: boolean;
    showWatermark?: boolean;
    showFooter?: boolean;
    showDocId?: boolean;
    showEditorialSeal?: boolean;
    showHighlights?: boolean;
  }) => {
    let urlPath = `/complaints/${id}/pdf`;
    if (options) {
      const params = new URLSearchParams();
      if (options.showCover !== undefined) params.append("showCover", String(options.showCover));
      if (options.showWatermark !== undefined) params.append("showWatermark", String(options.showWatermark));
      if (options.showFooter !== undefined) params.append("showFooter", String(options.showFooter));
      if (options.showDocId !== undefined) params.append("showDocId", String(options.showDocId));
      if (options.showEditorialSeal !== undefined) params.append("showEditorialSeal", String(options.showEditorialSeal));
      if (options.showHighlights !== undefined) params.append("showHighlights", String(options.showHighlights));
      const queryString = params.toString();
      if (queryString) {
        urlPath += `?${queryString}`;
      }
    }
    const blob = await api.get<Blob>(urlPath, {
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
  openPdfInNewTab: async (id: string, options?: {
    showCover?: boolean;
    showWatermark?: boolean;
    showFooter?: boolean;
    showDocId?: boolean;
    showEditorialSeal?: boolean;
    showHighlights?: boolean;
  }) => {
    let urlPath = `/complaints/${id}/pdf`;
    if (options) {
      const params = new URLSearchParams();
      if (options.showCover !== undefined) params.append("showCover", String(options.showCover));
      if (options.showWatermark !== undefined) params.append("showWatermark", String(options.showWatermark));
      if (options.showFooter !== undefined) params.append("showFooter", String(options.showFooter));
      if (options.showDocId !== undefined) params.append("showDocId", String(options.showDocId));
      if (options.showEditorialSeal !== undefined) params.append("showEditorialSeal", String(options.showEditorialSeal));
      if (options.showHighlights !== undefined) params.append("showHighlights", String(options.showHighlights));
      const queryString = params.toString();
      if (queryString) {
        urlPath += `?${queryString}`;
      }
    }
    const blob = await api.get<Blob>(urlPath, {
      headers: {
        Accept: "application/pdf",
      },
    });
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
  },
};
