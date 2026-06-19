import { api } from "@/lib/api";

export interface UserCredits {
  freeComplaintUsed: boolean;
  availableCredits: number;
}

export const creditsService = {
  getCredits: () => api.get<UserCredits>("/credits"),
};
