import { api } from "@/lib/api";
import { DocumentResponse } from "@/types";

export const documentService = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<DocumentResponse>("/documents/upload", formData);
  },
  list: () => api.get<DocumentResponse[]>("/documents"),
  clear: () => api.delete<void>("/documents/clear"),
};
