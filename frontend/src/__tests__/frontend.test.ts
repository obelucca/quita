import { describe, it, expect, beforeEach, vi } from "vitest";
import { loginSchema, registerSchema, debtAdjustmentSchema } from "../schemas";
import { LocalStorageWizardStorage } from "../services/wizard.service";
import { WizardState } from "../types";

// Mock localStorage for node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

if (typeof window === "undefined") {
  global.window = {} as any;
  global.localStorage = localStorageMock as any;
}

describe("Zod Validation Schemas", () => {
  describe("Login Schema", () => {
    it("should accept a valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "securepassword123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject an invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "securepassword123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("E-mail inválido");
      }
    });

    it("should reject a password that is too short", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("A senha deve ter no mínimo 6 caracteres");
      }
    });
  });

  describe("Register Schema", () => {
    it("should reject a name that is too short", () => {
      const result = registerSchema.safeParse({
        name: "a",
        email: "user@example.com",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Nome deve ter no mínimo 2 caracteres");
      }
    });
  });

  describe("Debt Adjustment Schema", () => {
    it("should reject negative values", () => {
      const result = debtAdjustmentSchema.safeParse({
        institution: "Bank Inter",
        reportedValue: -150,
      });
      expect(result.success).toBe(false);
    });

    it("should coerce string numbers correctly", () => {
      const result = debtAdjustmentSchema.safeParse({
        institution: "Nubank",
        reportedValue: "1500.50",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reportedValue).toBe(1500.5);
      }
    });
  });
});

describe("LocalStorageWizardStorage", () => {
  let storage: LocalStorageWizardStorage;
  const testUserId = "user-123-abc";
  const dummyState: WizardState = {
    step: 5,
    originalDebts: [],
    adjustedDebts: [
      {
        id: "d1",
        institution: "Nubank",
        reportedValue: 1200,
      },
    ],
    selectedInstitution: "Nubank",
    currentDebtValue: "1000",
    generatedComplaint: null,
  };

  beforeEach(() => {
    localStorage.clear();
    storage = new LocalStorageWizardStorage();
  });

  it("should return null if no state exists", () => {
    const loaded = storage.load(testUserId);
    expect(loaded).toBeNull();
  });

  it("should successfully save and load a wizard state", () => {
    storage.save(testUserId, dummyState);
    const loaded = storage.load(testUserId);
    expect(loaded).toEqual(dummyState);
  });

  it("should clear the saved state", () => {
    storage.save(testUserId, dummyState);
    storage.clear(testUserId);
    const loaded = storage.load(testUserId);
    expect(loaded).toBeNull();
  });
});
