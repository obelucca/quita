import { api } from "@/lib/api";
import { LoginInput, RegisterInput } from "@/schemas";
import { LoginResponse } from "@/types";

export const authService = {
  login: (data: LoginInput) => api.post<LoginResponse>("/auth/login", data),
  register: (data: RegisterInput) => api.post<{ id: string; name: string; email: string }>("/auth/register", data),
};
