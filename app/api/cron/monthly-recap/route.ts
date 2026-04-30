import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
} from "date-fns";
import { convertCurrency, type CurrencyCode } from "@/lib/currency";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const targetDate = subMonths(now, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const from = startOfMonth(targetDate);
  const to = endOfMonth(targetDate);

  const users = await prisma.user.findMany({
    select: { id: true, baseCurrency: true },
  });

  let generated = 0;
  let skipped = 0;

  await Promise.allSettled(
    users.map(async (user) => {
      // Skip if already generated for this month
      const existing = await prisma.monthlyRecap.findUnique({
        where: { userId_year_month: { userId: user.id, year, month } },
      });
      if (existing) {
        skipped++;
        return;
      }

      const baseCurrency = user.baseCurrency as CurrencyCode;

      const [incomeAgg, expenseAgg] = await Promise.all([
        prisma.transaction.aggregate({
          where: { userId: user.id, type: "income", createdAt: { gte: from, lte: to } },
          _sum: { convertedAmount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId: user.id, type: "expense", createdAt: { gte: from, lte: to } },
          _sum: { convertedAmount: true },
        }),
      ]);

      const totalIncome = Number(incomeAgg._sum.convertedAmount ?? 0);
      const totalExpense = Number(expenseAgg._sum.convertedAmount ?? 0);
      const netBalance = totalIncome - totalExpense;
      const savingsRate =
        totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

      await prisma.monthlyRecap.create({
        data: {
          userId: user.id,
          year,
          month,
          totalIncome,
          totalExpense,
          netBalance,
          savingsRate,
          baseCurrency: baseCurrency as any,
          insightsJson: { topCategories: [], distortionInsights: [], behavioralInsights: [] },
        },
      });

      generated++;
    })
  );

  return NextResponse.json({
    ok: true,
    period: `${year}-${String(month).padStart(2, "0")}`,
    users: users.length,
    generated,
    skipped,
  });
}
