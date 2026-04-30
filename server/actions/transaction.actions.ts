"use server";

import { revalidatePath } from "next/cache";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { convertCurrency, type CurrencyCode } from "@/lib/currency";

const TransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive().max(999_999_999),
  currency: z.enum(["USD","EUR","GBP","CNY","IDR","AMD"]),
  category: z.enum([
    "food_drink","transport","shopping","utilities","housing","health",
    "entertainment","education","travel","income_salary","income_freelance",
    "income_other","other",
  ]),
  description: z.string().max(300).optional(),
  isRecurring: z.boolean().optional(),
  recurringFreq: z.enum(["daily","weekly","monthly"]).optional(),
  tripId: z.string().optional(),
});

export type TransactionInput = z.infer<typeof TransactionSchema>;

export async function createTransaction(
  input: TransactionInput
): Promise<{ success: boolean; error?: string }> {
  const { user } = await validateRequest();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = TransactionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { type, amount, currency, category, description, isRecurring, recurringFreq, tripId } = parsed.data;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { baseCurrency: true },
  });
  if (!dbUser) return { success: false, error: "User not found" };

  const baseCurrency = dbUser.baseCurrency as CurrencyCode;
  const { convertedAmount, exchangeRateUsed } = await convertCurrency(amount, currency as CurrencyCode, baseCurrency);

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
      isRecurring: isRecurring ?? false,
      recurringFreq: recurringFreq as any ?? null,
      tripId: tripId || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  if (tripId) revalidatePath("/trips");
  return { success: true };
}

export async function deleteTransaction(id: string): Promise<{ success: boolean; error?: string }> {
  const { user } = await validateRequest();
  if (!user) return { success: false, error: "Not authenticated" };

  const tx = await prisma.transaction.findFirst({ where: { id, userId: user.id } });
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
  category?: string;
  currency?: string;
  search?: string;
  tripId?: string;
}) {
  const { user } = await validateRequest();
  if (!user) throw new Error("Not authenticated");

  const { limit = 100, offset = 0, type, category, currency, search, tripId } = options ?? {};

  const where: any = { userId: user.id };
  if (type) where.type = type;
  if (category) where.category = category;
  if (currency) where.currency = currency;
  if (tripId) where.tripId = tripId;
  if (search) where.description = { contains: search, mode: "insensitive" };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: { trip: { select: { id: true, name: true } } },
    }),
    prisma.transaction.count({ where }),
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

  // Previous 30-day window for velocity
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const [recentTransactions, incomeAgg, expenseAgg, prevExpenseAgg, categoryBreakdown, currencyBreakdown] =
    await Promise.all([
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
      prisma.transaction.aggregate({
        where: { userId: user.id, type: "expense", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
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
  const prevExpense = Number(prevExpenseAgg._sum.convertedAmount ?? 0);
  const netBalance = totalIncome - totalExpense;

  // Spending velocity: how much faster/slower vs previous period at same day-of-month
  const dayOfMonth = new Date().getDate();
  const daysInPeriod = 30;
  const currentDailyRate = totalExpense / dayOfMonth;
  const prevDailyRate = prevExpense / daysInPeriod;
  const velocityPct = prevDailyRate > 0
    ? ((currentDailyRate - prevDailyRate) / prevDailyRate) * 100
    : 0;

  return {
    user: dbUser,
    summary: {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate: totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : "0.0",
    },
    velocity: {
      pct: velocityPct,
      faster: velocityPct > 5,
      slower: velocityPct < -5,
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

export async function exportTransactionsCSV(): Promise<string> {
  const { user } = await validateRequest();
  if (!user) throw new Error("Not authenticated");

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { trip: { select: { name: true } } },
  });

  const header = [
    "Date", "Type", "Amount", "Currency", "Converted Amount",
    "Base Currency", "Exchange Rate", "Category", "Description",
    "Recurring", "Trip",
  ].join(",");

  const rows = transactions.map((tx) => {
    return [
      new Date(tx.createdAt).toISOString().split("T")[0],
      tx.type,
      tx.amount.toString(),
      tx.currency,
      tx.convertedAmount.toString(),
      tx.baseCurrency,
      tx.exchangeRateUsed.toString(),
      tx.category,
      `"${(tx.description ?? "").replace(/"/g, '""')}"`,
      tx.isRecurring ? "yes" : "no",
      `"${(tx.trip?.name ?? "").replace(/"/g, '""')}"`,
    ].join(",");
  });

  return [header, ...rows].join("\n");
}
