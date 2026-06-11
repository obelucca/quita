import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().trim().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const debtAdjustmentSchema = z.object({
  institution: z.string().trim().min(1, "Instituição é obrigatória"),
  reportedValue: z.coerce.number({ message: "Valor deve ser um número" }).min(0, "O valor não pode ser negativo"),
  operationType: z.string().trim().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type DebtAdjustmentInput = z.infer<typeof debtAdjustmentSchema>;
