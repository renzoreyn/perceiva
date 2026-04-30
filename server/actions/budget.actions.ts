"use server";

import { revalidatePath } from "next/cache";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { convertCurrency, type CurrencyCode } from "@/lib/currency";
import { startOfMonth, endOfMonth } from "date-fns";

const BudgetGoalSchema = z.object({
  category: z.enum([
    "food_drink","transport","shopping","utilities","housing",
    "health","entertainment","education","travel","other",
  ]),
  limitAmount: z.number().positive(),
  currency: z.enum(["USD","EUR","GBP","CNY","IDR","AMD"]),
});

export async function upsertBudgetGoal(
  input: z.infer<typeof BudgetGoalSchema>
): Promise<{ success: boolean; error?: string }> {
  const { user } = await validateRequest();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = BudgetGoalSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { baseCurrency: true },
  });
  if (!dbUser) return { success: false, error: "User not found" };

  await prisma.budgetGoal.upsert({
    where: { userId_category: { userId: user.id, category: parsed.data.category as any } },
    create: {
      userId: user.id,
      category: parsed.data.category as any,
      limitAmount: parsed.data.limitAmount,
      currency: parsed.data.currency as any,
    },
    update: {
      limitAmount: parsed.data.limitAmount,
      currency: parsed.data.currency as any,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteBudgetGoal(
  category: string
): Promise<{ success: boolean; error?: string }> {
  const { user } = await validateRequest();
  if (!user) return { success: false, error: "Not authenticated" };

  await prisma.budgetGoal.deleteMany({
    where: { userId: user.id, category: category as any },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function getBudgetProgress() {
  const { user } = await validateRequest();
  if (!user) throw new Error("Not authenticated");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { baseCurrency: true },
  });
  if (!dbUser) throw new Error("User not found");

  const baseCurrency = dbUser.baseCurrency as CurrencyCode;
  const now = new Date();
  const from = startOfMonth(now);
  const to = endOfMonth(now);

  const [goals, spending] = await Promise.all([
    prisma.budgetGoal.findMany({ where: { userId: user.id } }),
    prisma.transaction.groupBy({
      by: ["category"],
      where: { userId: user.id, type: "expense", createdAt: { gte: from, lte: to } },
      _sum: { convertedAmount: true },
    }),
  ]);

  const spendMap = Object.fromEntries(
    spending.map((s) => [s.category, Number(s._sum.convertedAmount ?? 0)])
  );

  return Promise.all(
    goals.map(async (g) => {
      const limitInBase = g.currency === baseCurrency
        ? Number(g.limitAmount)
        : (await convertCurrency(Number(g.limitAmount), g.currency as CurrencyCode, baseCurrency)).convertedAmount;

      const spent = spendMap[g.category] ?? 0;
      const pct = limitInBase > 0 ? Math.min((spent / limitInBase) * 100, 100) : 0;

      return {
        category: g.category as string,
        limitAmount: Number(g.limitAmount),
        limitInBase,
        currency: g.currency as string,
        baseCurrency,
        spent,
        percentage: Math.round(pct),
        isOver: spent > limitInBase,
      };
    })
  );
}
