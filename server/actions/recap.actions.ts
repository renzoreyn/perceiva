"use server";

import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
} from "date-fns";

export interface CategoryInsight {
  category: string;
  total: number;
  percentage: number;
}

export interface DistortionInsight {
  currency: string;
  totalOriginal: number;
  totalConverted: number;
  note: string;
}

export interface BehavioralInsight {
  type: "timing" | "pattern" | "trend";
  message: string;
}

export interface MonthlyRecapData {
  year: number;
  month: number;
  monthLabel: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  baseCurrency: string;
  topCategories: CategoryInsight[];
  distortionInsights: DistortionInsight[];
  behavioralInsights: BehavioralInsight[];
  vsLastMonth?: {
    incomeChange: number;
    expenseChange: number;
    netChange: number;
  };
}

const DISTORTION_NOTES: Record<string, string> = {
  IDR: "Large nominal numbers can mask real cost. 160,000 IDR feels different to $10 USD — but it is $10.",
  AMD: "AMD values appear small relative to USD, making purchases feel cheaper than they are.",
  CNY: "CNY is roughly 7:1 against USD — easy to underestimate real spending.",
  EUR: "EUR closely tracks USD with minimal perception distortion.",
  GBP: "GBP is stronger than USD — spending in GBP may feel lower than it is.",
};

export async function generateMonthlyRecap(
  year?: number,
  month?: number
): Promise<{ success: boolean; data?: MonthlyRecapData; error?: string }> {
  const { user } = await validateRequest();
  if (!user) return { success: false, error: "Not authenticated" };

  const now = new Date();
  const targetDate =
    year && month ? new Date(year, month - 1, 1) : subMonths(now, 1);

  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth() + 1;
  const from = startOfMonth(targetDate);
  const to = endOfMonth(targetDate);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { baseCurrency: true },
  });
  if (!dbUser) return { success: false, error: "User not found" };

  const baseCurrency = dbUser.baseCurrency;

  // Return cached recap if it exists
  const cached = await prisma.monthlyRecap.findUnique({
    where: {
      userId_year_month: {
        userId: user.id,
        year: targetYear,
        month: targetMonth,
      },
    },
  });

  if (cached) {
    const ins = cached.insightsJson as any;
    return {
      success: true,
      data: {
        year: cached.year,
        month: cached.month,
        monthLabel: format(
          new Date(cached.year, cached.month - 1),
          "MMMM yyyy"
        ),
        totalIncome: Number(cached.totalIncome),
        totalExpense: Number(cached.totalExpense),
        netBalance: Number(cached.netBalance),
        savingsRate: Number(cached.savingsRate),
        baseCurrency: cached.baseCurrency,
        topCategories: ins.topCategories ?? [],
        distortionInsights: ins.distortionInsights ?? [],
        behavioralInsights: ins.behavioralInsights ?? [],
        vsLastMonth: ins.vsLastMonth,
      },
    };
  }

  // Build fresh recap
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
  const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

  // Category breakdown
  const catRows = await prisma.transaction.groupBy({
    by: ["category"],
    where: { userId: user.id, type: "expense", createdAt: { gte: from, lte: to } },
    _sum: { convertedAmount: true },
    orderBy: { _sum: { convertedAmount: "desc" } },
    take: 6,
  });

  const topCategories: CategoryInsight[] = catRows.map((c) => ({
    category: c.category,
    total: Number(c._sum.convertedAmount ?? 0),
    percentage:
      totalExpense > 0
        ? Math.round(
            (Number(c._sum.convertedAmount ?? 0) / totalExpense) * 100
          )
        : 0,
  }));

  // Currency distortion
  const currencyRows = await prisma.transaction.groupBy({
    by: ["currency"],
    where: {
      userId: user.id,
      type: "expense",
      createdAt: { gte: from, lte: to },
      NOT: { currency: baseCurrency as any },
    },
    _sum: { amount: true, convertedAmount: true },
  });

  const distortionInsights: DistortionInsight[] = currencyRows.map((r) => ({
    currency: r.currency,
    totalOriginal: Number(r._sum.amount ?? 0),
    totalConverted: Number(r._sum.convertedAmount ?? 0),
    note:
      DISTORTION_NOTES[r.currency] ??
      `Spent in ${r.currency}, converted to ${baseCurrency}.`,
  }));

  // Behavioral insights
  const behavioralInsights: BehavioralInsight[] = [];

  const allExpenses = await prisma.transaction.findMany({
    where: { userId: user.id, type: "expense", createdAt: { gte: from, lte: to } },
    select: { convertedAmount: true, createdAt: true },
  });

  if (allExpenses.length > 0) {
    let weekdayTotal = 0,
      weekendTotal = 0;

    allExpenses.forEach((tx) => {
      const day = new Date(tx.createdAt).getDay();
      const amt = Number(tx.convertedAmount);
      if (day === 0 || day === 6) weekendTotal += amt;
      else weekdayTotal += amt;
    });

    const weekdayAvg = weekdayTotal / 5;
    const weekendAvg = weekendTotal / 2;

    if (weekendAvg > weekdayAvg * 1.4) {
      behavioralInsights.push({
        type: "timing",
        message: `Weekend spending ran ${((weekendAvg / weekdayAvg - 1) * 100).toFixed(0)}% higher than weekdays on average.`,
      });
    }

    const daysInMonth = Math.round(
      (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
    );
    const freq = allExpenses.length / daysInMonth;

    if (freq > 3) {
      behavioralInsights.push({
        type: "pattern",
        message: `High transaction frequency — ${freq.toFixed(1)} purchases per day. Small transactions may be accumulating unnoticed.`,
      });
    }
  }

  // Previous month comparison
  const prevDate = subMonths(targetDate, 1);
  const [prevIncomeAgg, prevExpenseAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: "income",
        createdAt: { gte: startOfMonth(prevDate), lte: endOfMonth(prevDate) },
      },
      _sum: { convertedAmount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        type: "expense",
        createdAt: { gte: startOfMonth(prevDate), lte: endOfMonth(prevDate) },
      },
      _sum: { convertedAmount: true },
    }),
  ]);

  const prevIncome = Number(prevIncomeAgg._sum.convertedAmount ?? 0);
  const prevExpense = Number(prevExpenseAgg._sum.convertedAmount ?? 0);
  const prevNet = prevIncome - prevExpense;

  const vsLastMonth = {
    incomeChange:
      prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0,
    expenseChange:
      prevExpense > 0
        ? ((totalExpense - prevExpense) / prevExpense) * 100
        : 0,
    netChange:
      prevNet !== 0 ? ((netBalance - prevNet) / Math.abs(prevNet)) * 100 : 0,
  };

  const insightsJson = {
    topCategories,
    distortionInsights,
    behavioralInsights,
    vsLastMonth,
  };

  await prisma.monthlyRecap.upsert({
    where: {
      userId_year_month: {
        userId: user.id,
        year: targetYear,
        month: targetMonth,
      },
    },
    create: {
      userId: user.id,
      year: targetYear,
      month: targetMonth,
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      baseCurrency: baseCurrency as any,
      insightsJson,
    },
    update: { totalIncome, totalExpense, netBalance, savingsRate, insightsJson },
  });

  return {
    success: true,
    data: {
      year: targetYear,
      month: targetMonth,
      monthLabel: format(targetDate, "MMMM yyyy"),
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      baseCurrency,
      topCategories,
      distortionInsights,
      behavioralInsights,
      vsLastMonth,
    },
  };
}

export async function getAllRecaps() {
  const { user } = await validateRequest();
  if (!user) throw new Error("Not authenticated");

  return prisma.monthlyRecap.findMany({
    where: { userId: user.id },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    select: {
      id: true,
      year: true,
      month: true,
      totalIncome: true,
      totalExpense: true,
      netBalance: true,
      savingsRate: true,
      baseCurrency: true,
      generatedAt: true,
    },
  });
}
