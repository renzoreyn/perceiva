import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import { getMonthRange } from "@/lib/utils/index";

// Don't cache — dashboard shows live data
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Upsert user (single query, avoids findUnique + create round trip)
  const dbUser = await prisma.user.upsert({
    where:  { supabaseId: user.id },
    update: {},
    create: {
      supabaseId: user.id,
      email:      user.email!,
      name:       user.user_metadata?.full_name ?? null,
      avatarUrl:  user.user_metadata?.avatar_url ?? null,
    },
  });

  const { start, end } = getMonthRange();

  // Run all queries in parallel
  const [wallets, transactions, budgets] = await Promise.all([
    // Only fetch aggregated balance — no raw transaction rows
    prisma.wallet.findMany({
      where:  { userId: dbUser.id },
      select: {
        id: true, name: true, baseCurrency: true,
        cardColor: true, cardStyle: true, emoji: true, isDefault: true,
        _count: { select: { transactions: true } },
        // Use aggregation instead of loading all rows
        transactions: {
          select: { type: true, amountUsd: true },
          // Only need this for balance calc — keep it light
        },
      },
    }),

    prisma.transaction.findMany({
      where:   { userId: dbUser.id, date: { gte: start, lte: end } },
      include: { category: true, wallet: { select: { id:true, name:true, baseCurrency:true, cardColor:true } } },
      orderBy: { date: "desc" },
      take:    20,
    }),

    prisma.budget.findMany({
      where:   { userId: dbUser.id },
      include: { category: true },
    }),
  ]);

  // Compute wallet stats in JS (already have rows)
  const walletsWithStats = wallets.map(w => {
    let incomeUsd = 0, expenseUsd = 0;
    for (const t of w.transactions) {
      if (t.type === "INCOME") incomeUsd  += t.amountUsd;
      else                     expenseUsd += t.amountUsd;
    }
    return {
      id: w.id, name: w.name, baseCurrency: w.baseCurrency,
      cardColor: w.cardColor, cardStyle: w.cardStyle,
      emoji: w.emoji, isDefault: w.isDefault,
      totalIncomeUsd:  incomeUsd,
      totalExpenseUsd: expenseUsd,
      balanceUsd:      incomeUsd - expenseUsd,
      transactionCount: w._count.transactions,
    };
  });

  let monthIncomeUsd = 0, monthExpenseUsd = 0;
  for (const t of transactions) {
    if (t.type === "INCOME") monthIncomeUsd  += t.amountUsd;
    else                     monthExpenseUsd += t.amountUsd;
  }
  const netWorthUsd = walletsWithStats.reduce((s, w) => s + w.balanceUsd, 0);

  const budgetsWithSpending = budgets.map(b => {
    const spent = transactions
      .filter(t => t.type === "EXPENSE" && t.categoryId === b.categoryId)
      .reduce((s, t) => s + t.amountUsd, 0);
    return {
      id: b.id, categoryId: b.categoryId, amount: b.amount,
      period: b.period, spent,
      percentage: b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0,
      category: b.category,
    };
  });

  return (
    <DashboardClient
      user={{ name: dbUser.name, homeCurrency: dbUser.homeCurrency ?? "USD" }}
      wallets={walletsWithStats}
      recentTransactions={transactions.map(t => ({
        ...t,
        date: t.date.toISOString(),
        category: t.category,
        wallet: t.wallet,
      }))}
      monthIncomeUsd={monthIncomeUsd}
      monthExpenseUsd={monthExpenseUsd}
      netWorthUsd={netWorthUsd}
      budgets={budgetsWithSpending}
    />
  );
}
