import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import { getMonthRange } from "@/lib/utils/index";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get or create user in DB
  let dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } });
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        supabaseId: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name ?? null,
        avatarUrl: user.user_metadata?.avatar_url ?? null,
      },
    });
  }

  const { start, end } = getMonthRange();

  // Fetch dashboard data
  const [wallets, transactions, budgets, categories] = await Promise.all([
    prisma.wallet.findMany({
      where: { userId: dbUser.id },
      include: {
        transactions: {
          select: { type: true, amountUsd: true },
        },
      },
    }),
    prisma.transaction.findMany({
      where: { userId: dbUser.id, date: { gte: start, lte: end } },
      include: { category: true, wallet: true },
      orderBy: { date: "desc" },
      take: 10,
    }),
    prisma.budget.findMany({
      where: { userId: dbUser.id },
      include: { category: true },
    }),
    prisma.category.findMany({ where: { userId: dbUser.id } }),
  ]);

  // Calculate wallet stats
  const walletsWithStats = wallets.map(w => {
    const totalIncomeUsd = w.transactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amountUsd, 0);
    const totalExpenseUsd = w.transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amountUsd, 0);
    return {
      id: w.id,
      name: w.name,
      baseCurrency: w.baseCurrency,
      cardColor: w.cardColor,
      cardStyle: w.cardStyle,
      emoji: w.emoji,
      isDefault: w.isDefault,
      totalIncomeUsd,
      totalExpenseUsd,
      balanceUsd: totalIncomeUsd - totalExpenseUsd,
      transactionCount: w.transactions.length,
    };
  });

  const monthIncomeUsd = transactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amountUsd, 0);
  const monthExpenseUsd = transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amountUsd, 0);
  const netWorthUsd = walletsWithStats.reduce((s, w) => s + w.balanceUsd, 0);

  const budgetsWithSpending = budgets.map(b => {
    const spent = transactions
      .filter(t => t.type === "EXPENSE" && t.categoryId === b.categoryId)
      .reduce((s, t) => s + t.amountUsd, 0);
    return {
      id: b.id,
      categoryId: b.categoryId,
      amount: b.amount,
      period: b.period,
      spent,
      percentage: Math.min((spent / b.amount) * 100, 100),
      category: b.category,
    };
  });

  return (
    <DashboardClient
      user={dbUser}
      wallets={walletsWithStats}
      recentTransactions={transactions.map(t => ({
        ...t,
        date: t.date.toISOString(),
        category: t.category,
        wallet: { id: t.wallet.id, name: t.wallet.name, baseCurrency: t.wallet.baseCurrency, cardColor: t.wallet.cardColor },
      }))}
      monthIncomeUsd={monthIncomeUsd}
      monthExpenseUsd={monthExpenseUsd}
      netWorthUsd={netWorthUsd}
      budgets={budgetsWithSpending}
    />
  );
}
