import { WizardState } from "@/types";

export interface WizardStorage {
  save(userId: string, state: WizardState): void;
  load(userId: string): WizardState | null;
  clear(userId: string): void;
}

export class LocalStorageWizardStorage implements WizardStorage {
  private getPrefix(userId: string): string {
    return `quita_wizard_${userId}`;
  }

  save(userId: string, state: WizardState): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.getPrefix(userId), JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save wizard state", e);
    }
  }

  load(userId: string): WizardState | null {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(this.getPrefix(userId));
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to load wizard state", e);
      return null;
    }
  }

  clear(userId: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(this.getPrefix(userId));
    } catch (e) {
      console.error("Failed to clear wizard state", e);
    }
  }
}

export const wizardStorage: WizardStorage = new LocalStorageWizardStorage();
export default wizardStorage;
