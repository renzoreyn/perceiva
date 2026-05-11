"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import WalletCard from "@/components/cards/WalletCard";
import Link from "next/link";
import { formatDate } from "@/lib/utils/index";
import { formatAmount, getCurrencySymbol, CURRENCIES } from "@/types";
import type { WalletWithStats, TransactionWithRelations, BudgetWithSpending } from "@/types";

interface DashboardClientProps {
  user: { name: string | null; homeCurrency: string };
  wallets: WalletWithStats[];
  recentTransactions: TransactionWithRelations[];
  monthIncomeUsd: number;
  monthExpenseUsd: number;
  netWorthUsd: number;
  budgets: BudgetWithSpending[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardClient({
  user, wallets, recentTransactions, monthIncomeUsd, monthExpenseUsd, netWorthUsd, budgets,
}: DashboardClientProps) {
  const firstName = user.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const savingsRate = monthIncomeUsd > 0 ? ((monthIncomeUsd - monthExpenseUsd) / monthIncomeUsd) * 100 : 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div variants={item} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{greeting}, {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/transactions/new">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Log Transaction
            </Button>
          </Link>
          <Link href="/wallets/new">
            <Button size="sm" variant="outline" className="gap-2">
              <Wallet className="w-4 h-4" /> New Wallet
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* KPI row */}
      <motion.div variants={item} className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Net Worth",
            value: `$${netWorthUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: "Total across all wallets",
            color: "text-foreground",
            icon: <TrendingUp className="w-5 h-5 text-primary" />,
            bg: "bg-primary/5",
          },
          {
            label: "This Month — In",
            value: `$${monthIncomeUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: "Total income",
            color: "text-green-500",
            icon: <ArrowDownLeft className="w-5 h-5 text-green-500" />,
            bg: "bg-green-500/5",
          },
          {
            label: "This Month — Out",
            value: `$${monthExpenseUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: "Total expenses",
            color: "text-red-500",
            icon: <ArrowUpRight className="w-5 h-5 text-red-500" />,
            bg: "bg-red-500/5",
          },
          {
            label: "Savings Rate",
            value: `${savingsRate.toFixed(1)}%`,
            sub: savingsRate >= 20 ? "Great job! 🎉" : savingsRate >= 0 ? "Room to improve" : "Spending more than earning",
            color: savingsRate >= 20 ? "text-green-500" : savingsRate >= 0 ? "text-orange-500" : "text-red-500",
            icon: <TrendingUp className={`w-5 h-5 ${savingsRate >= 0 ? "text-green-500" : "text-red-500"}`} />,
            bg: "bg-orange-500/5",
          },
        ].map((kpi, i) => (
          <Card key={i} className="p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.bg}`}>
              {kpi.icon}
            </div>
            <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
            <p className={`text-xl font-bold tabular-nums sf-numbers mt-1 ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        {/* Wallets */}
        <motion.div variants={item} className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Wallets</h2>
            <Link href="/wallets"><Button variant="ghost" size="sm" className="text-xs gap-1">See all</Button></Link>
          </div>

          {wallets.length === 0 ? (
            <Card className="p-8 text-center">
              <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">No wallets yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first wallet to start tracking</p>
              <Link href="/wallets/new">
                <Button size="sm" className="mt-4 gap-2"><Plus className="w-4 h-4" /> Create Wallet</Button>
              </Link>
            </Card>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
              {wallets.slice(0, 4).map((wallet, i) => (
                <motion.div key={wallet.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }} className="snap-start shrink-0">
                  <Link href={`/wallets/${wallet.id}`}>
                    <WalletCard wallet={wallet} size="md" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Recent Transactions */}
          <div className="flex items-center justify-between mt-6">
            <h2 className="text-base font-semibold">Recent Transactions</h2>
            <Link href="/transactions"><Button variant="ghost" size="sm" className="text-xs">See all</Button></Link>
          </div>

          <Card>
            {recentTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No transactions this month</p>
                <Link href="/transactions/new">
                  <Button size="sm" className="mt-3 gap-2"><Plus className="w-4 h-4" /> Log first transaction</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentTransactions.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm"
                      style={{ backgroundColor: (tx.category?.color ?? "#98989D") + "20" }}
                    >
                      {tx.type === "INCOME" ? "↓" : "↑"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.note ?? tx.category?.name ?? "Transaction"}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.wallet.name} · {formatDate(tx.date, "relative")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-semibold tabular-nums ${tx.type === "INCOME" ? "text-green-500" : "text-red-500"}`}>
                        {tx.type === "INCOME" ? "+" : "−"}${Math.abs(tx.amountUsd).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {getCurrencySymbol(tx.currency)}{tx.amount.toLocaleString()} {tx.currency}
                      </p>
                    </div>
                    <Badge variant={tx.type === "INCOME" ? "income" : "expense"} className="shrink-0 text-[10px]">
                      {tx.type === "INCOME" ? "In" : "Out"}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Right column */}
        <motion.div variants={item} className="space-y-4">
          {/* Budgets */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Budgets</h2>
            <Link href="/budgets"><Button variant="ghost" size="sm" className="text-xs">Manage</Button></Link>
          </div>

          <Card>
            {budgets.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-xs text-muted-foreground">No budgets set</p>
                <Link href="/budgets">
                  <Button size="sm" variant="outline" className="mt-2 gap-1 text-xs"><Plus className="w-3 h-3" /> Add budget</Button>
                </Link>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {budgets.map(budget => {
                  const pct = budget.percentage;
                  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-orange-500" : "bg-green-500";
                  return (
                    <div key={budget.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: budget.category?.color ?? "#98989D" }} />
                          <span className="text-xs font-medium">{budget.category?.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground tabular-nums">
                          ${budget.spent.toFixed(0)} / ${budget.amount.toFixed(0)}
                        </span>
                      </div>
                      <Progress value={pct} indicatorClassName={color} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Currency perception */}
          <div className="flex items-center justify-between mt-2">
            <h2 className="text-base font-semibold">Perception Check</h2>
          </div>
          <Card className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">What does 1 USD actually look like?</p>
            {[
              { currency: "AMD" as const, amount: 390,    note: "Feels like nothing" },
              { currency: "IDR" as const, amount: 17417,  note: "Sounds huge" },
              { currency: "PHP" as const, amount: 58,     note: "" },
              { currency: "SGD" as const, amount: 1.35,   note: "Close to " },
              { currency: "RUB" as const, amount: 91,     note: "" },
            ].map(({ currency, amount, note }) => (
              <div key={currency} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{CURRENCIES.find(c => c.code === currency)?.flag}</span>
                  <span className="text-xs font-medium">{currency}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {getCurrencySymbol(currency)}{amount.toLocaleString()}
                  </p>
                  {note && <p className="text-[10px] text-muted-foreground">{note}</p>}
                </div>
              </div>
            ))}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
