import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardDataForUser } from "@/server/actions/transaction.actions";
import { convertCurrency, type CurrencyCode } from "@/lib/currency";
import { startOfMonth, endOfMonth } from "date-fns";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  // Single validateRequest call — everything else uses the userId directly
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { baseCurrency: true, name: true, email: true },
  });

  if (!dbUser) redirect("/login");

  const baseCurrency = dbUser.baseCurrency as CurrencyCode;

  // Budget progress — inline here to avoid re-calling validateRequest
  const now = new Date();
  const from = startOfMonth(now);
  const to = endOfMonth(now);

  const [dashData, goals, spending] = await Promise.all([
    getDashboardDataForUser(user.id, dbUser.baseCurrency),
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

  const budgetProgress = await Promise.all(
    goals.map(async (g) => {
      const limitInBase =
        g.currency === baseCurrency
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

  const data = {
    user: dbUser,
    ...dashData,
  };

  return <DashboardClient data={data} budgetProgress={budgetProgress} />;
}
