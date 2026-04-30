"use server";

import { revalidatePath } from "next/cache";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionSchema, type TransactionInput } from "@/lib/validations";
import { convertCurrency, type CurrencyCode } from "@/lib/currency";

export async function createTransaction(
  input: TransactionInput
): Promise<{ success: boolean; error?: string }> {
  const { user } = await validateRequest();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = TransactionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
    };
  }

  const { type, amount, currency, category, description } = parsed.data;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { baseCurrency: true },
  });
  if (!dbUser) return { success: false, error: "User not found" };

  const baseCurrency = dbUser.baseCurrency as CurrencyCode;
  const { convertedAmount, exchangeRateUsed } = await convertCurrency(
    amount,
    currency as CurrencyCode,
    baseCurrency
  );

  await prisma.transaction.create({
    data: {
      userId: user.id,
      type,
      amount,
      currency: currency as any,
      convertedAmount,
      exchangeRateUsed,
      baseCurrency: baseCurrency as any,
      category: category as any,
      description: description || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return { success: true };
}

export async function deleteTransaction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { user } = await validateRequest();
  if (!user) return { success: false, error: "Not authenticated" };

  const tx = await prisma.transaction.findFirst({
    where: { id, userId: user.id },
  });
  if (!tx) return { success: false, error: "Transaction not found" };

  await prisma.transaction.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return { success: true };
}

export async function getTransactions(options?: {
  limit?: number;
  offset?: number;
  type?: "income" | "expense";
}) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Not authenticated");

  const { limit = 50, offset = 0, type } = options ?? {};

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: user.id, ...(type ? { type } : {}) },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.transaction.count({
      where: { userId: user.id, ...(type ? { type } : {}) },
    }),
  ]);

  return { transactions, total };
}

export async function getDashboardData() {
  const { user } = await validateRequest();
  if (!user) throw new Error("Not authenticated");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { baseCurrency: true, name: true, email: true },
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    recentTransactions,
    incomeAgg,
    expenseAgg,
    categoryBreakdown,
    currencyBreakdown,
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: user.id, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.transaction.aggregate({
      where: { userId: user.id, type: "income", createdAt: { gte: thirtyDaysAgo } },
      _sum: { convertedAmount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: user.id, type: "expense", createdAt: { gte: thirtyDaysAgo } },
      _sum: { convertedAmount: true },
    }),
    prisma.transaction.groupBy({
      by: ["category"],
      where: { userId: user.id, type: "expense", createdAt: { gte: thirtyDaysAgo } },
      _sum: { convertedAmount: true },
      orderBy: { _sum: { convertedAmount: "desc" } },
    }),
    prisma.transaction.groupBy({
      by: ["currency"],
      where: { userId: user.id, type: "expense", createdAt: { gte: thirtyDaysAgo } },
      _sum: { convertedAmount: true, amount: true },
      orderBy: { _sum: { convertedAmount: "desc" } },
    }),
  ]);

  const totalIncome = Number(incomeAgg._sum.convertedAmount ?? 0);
  const totalExpense = Number(expenseAgg._sum.convertedAmount ?? 0);
  const netBalance = totalIncome - totalExpense;

  return {
    user: dbUser,
    summary: {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate:
        totalIncome > 0
          ? ((netBalance / totalIncome) * 100).toFixed(1)
          : "0.0",
    },
    recentTransactions,
    categoryBreakdown: categoryBreakdown.map((c) => ({
      category: c.category,
      total: Number(c._sum.convertedAmount ?? 0),
    })),
    currencyBreakdown: currencyBreakdown.map((c) => ({
      currency: c.currency,
      totalConverted: Number(c._sum.convertedAmount ?? 0),
      totalOriginal: Number(c._sum.amount ?? 0),
    })),
  };
}
