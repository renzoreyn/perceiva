import { z } from "zod";

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name is too long"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  baseCurrency: z
    .enum(["USD", "EUR", "GBP", "CNY", "IDR", "AMD"])
    .default("USD"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const TransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(999_999_999, "Amount too large"),
  currency: z.enum(["USD", "EUR", "GBP", "CNY", "IDR", "AMD"]),
  category: z.enum([
    "food_drink",
    "transport",
    "shopping",
    "utilities",
    "housing",
    "health",
    "entertainment",
    "education",
    "travel",
    "income_salary",
    "income_freelance",
    "income_other",
    "other",
  ]),
  description: z.string().max(300).optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type TransactionInput = z.infer<typeof TransactionSchema>;
