import { api } from "@/lib/api";
import { DebtInsightResponse } from "@/types";

export const debtService = {
  getInsights: () => api.get<DebtInsightResponse>("/debts/insights"),
};
