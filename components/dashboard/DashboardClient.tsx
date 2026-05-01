"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Plus, ArrowUpDown, Wallet, PiggyBank, Zap, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CURRENCY_SYMBOLS, type CurrencyCode } from "@/lib/currency";
import { CATEGORY_LABELS, formatRelative } from "@/lib/utils";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import Sidebar from "@/components/layout/Sidebar";
import AmbientBackground from "@/components/layout/AmbientBackground";

type BudgetProgress = {
  category: string; limitAmount: number; limitInBase: number;
  currency: string; baseCurrency: string; spent: number; percentage: number; isOver: boolean;
};

type DashboardData = {
  user: { baseCurrency: string; name: string | null; email: string } | null;
  summary: { totalIncome: number; totalExpense: number; netBalance: number; savingsRate: string };
  velocity: { pct: number; faster: boolean; slower: boolean };
  recentTransactions: Array<{
    id: string; type: string; amount: any; currency: string;
    convertedAmount: any; category: string; description: string | null; createdAt: Date;
  }>;
  categoryBreakdown: Array<{ category: string; total: number }>;
  currencyBreakdown: Array<{ currency: string; totalConverted: number; totalOriginal: number }>;
};

function Tooltip2({ active, payload, label, symbol }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="g3 glass-spec rounded-xl px-4 py-3 text-xs" style={{ border: "1px solid var(--border-2)" }}>
      <p className="font-medium mb-1" style={{ color: "var(--t1)" }}>{label}</p>
      <p style={{ color: "var(--t-accent)" }}>{symbol}{Number(payload[0].value).toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`g1 glass-spec glass-hover rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

export default function DashboardClient({ data, budgetProgress }: { data: DashboardData; budgetProgress: BudgetProgress[] }) {
  const [showModal, setShowModal] = useState(false);
  const { user, summary, velocity, recentTransactions, categoryBreakdown, currencyBreakdown } = data;
  const bc = (user?.baseCurrency ?? "USD") as CurrencyCode;
  const sym = CURRENCY_SYMBOLS[bc] ?? "$";
  const maxCat = categoryBreakdown[0]?.total ?? 1;
  const totalCurrSpend = currencyBreakdown.reduce((s, c) => s + c.totalConverted, 0);

  const chartData = categoryBreakdown.slice(0, 7).map((c) => ({
    name: CATEGORY_LABELS[c.category]?.split(" ")[0] ?? c.category,
    v: Number(c.total.toFixed(2)),
  }));

  return (
    <div className="flex min-h-screen relative" style={{ background: "var(--bg)" }}>
      <AmbientBackground />
      <Sidebar userName={user?.name ?? user?.email ?? "User"} />

      <main className="flex-1 overflow-auto relative z-10 has-mobile-nav" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="page">

          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: "28px" }}>
            <div>
              <h1 className="font-display" style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--t1)", marginBottom: "4px" }}>
                Overview
              </h1>
              <p style={{ fontSize: "13px", color: "var(--t2)" }}>Last 30 days · {bc}</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="btn-blue inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium">
              <Plus size={14} /> Add Transaction
            </button>
          </div>

          {/* Velocity */}
          {(velocity.faster || velocity.slower) && (
            <div className="g1 glass-spec rounded-2xl px-5 py-4 mb-4 flex items-center gap-3"
              style={{ border: `1px solid ${velocity.faster ? "rgba(224,92,92,0.2)" : "rgba(61,186,126,0.2)"}`, background: velocity.faster ? "var(--red-soft)" : "var(--green-soft)" }}>
              <Zap size={14} style={{ color: velocity.faster ? "var(--red)" : "var(--green)", flexShrink: 0 }} />
              <p style={{ fontSize: "13px", color: velocity.faster ? "var(--red)" : "var(--green)" }}>
                {velocity.faster
                  ? `You're spending ${Math.abs(velocity.pct).toFixed(0)}% faster than last month at this point. Worth checking.`
                  : `You're spending ${Math.abs(velocity.pct).toFixed(0)}% slower than last month. Pacing well.`}
              </p>
            </div>
          )}

          {/* Summary cards */}
          <div className="grid gap-4 mb-4 grid-4col" className="summary-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
            {[
              { label: "Net Balance", val: summary.netBalance, color: summary.netBalance >= 0 ? "var(--green)" : "var(--red)", icon: Wallet },
              { label: "Income", val: summary.totalIncome, color: "var(--green)", icon: TrendingUp },
              { label: "Spent", val: summary.totalExpense, color: "var(--red)", icon: TrendingDown },
              { label: "Savings", val: null, raw: `${summary.savingsRate}%`, color: "var(--t-accent)", icon: PiggyBank },
            ].map(({ label, val, raw, color, icon: Icon }) => (
              <Card key={label} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--t3)" }}>{label}</span>
                  <Icon size={13} style={{ color: "var(--t3)" }} />
                </div>
                <p className="font-display" style={{ fontSize: "22px", fontWeight: 700, color, marginBottom: "2px" }}>
                  {raw ?? `${sym}${Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </p>
                <p style={{ fontSize: "11px", color: "var(--t3)" }}>Last 30 days</p>
              </Card>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid gap-4 grid-2col" className="main-grid" style={{ gridTemplateColumns: "1fr 300px" }}>
            <div className="flex flex-col gap-4">

              {/* Chart */}
              {chartData.length > 0 && (
                <Card className="p-6">
                  <p className="font-display mb-4" style={{ fontSize: "14px", fontWeight: 600, color: "var(--t1)" }}>
                    Spending by Category
                  </p>
                  <div style={{ height: "140px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--blue)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--blue)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fill: "var(--t3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip content={<Tooltip2 symbol={sym} />} cursor={{ stroke: "var(--border-2)" }} />
                        <Area type="monotone" dataKey="v" stroke="var(--blue)" strokeWidth={1.5} fill="url(#dg)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* Transactions */}
              <Card>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                  <p className="font-display" style={{ fontSize: "14px", fontWeight: 600, color: "var(--t1)" }}>Recent Transactions</p>
                  <a href="/transactions" className="flex items-center gap-1.5 transition-colors"
                    style={{ fontSize: "12px", color: "var(--t-accent)" }}>
                    View all <ArrowUpDown size={10} />
                  </a>
                </div>

                {recentTransactions.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 g2 glass-spec"
                      style={{ border: "1px solid var(--border)" }}>
                      <Wallet size={16} style={{ color: "var(--t3)" }} />
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--t2)", marginBottom: "4px" }}>No transactions yet</p>
                    <p style={{ fontSize: "12px", color: "var(--t3)" }}>Add your first one above</p>
                  </div>
                ) : (
                  recentTransactions.map((tx, i) => (
                    <div key={tx.id}
                      className="flex items-center justify-between px-6 py-4 transition-all"
                      style={{ borderBottom: i < recentTransactions.length - 1 ? "1px solid var(--border)" : "none", cursor: "default" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--glass-1)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: tx.type === "income" ? "var(--green-soft)" : "var(--red-soft)" }}>
                          {tx.type === "income"
                            ? <TrendingUp size={13} style={{ color: "var(--green)" }} />
                            : <TrendingDown size={13} style={{ color: "var(--red)" }} />}
                        </div>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--t1)" }}>
                            {tx.description || CATEGORY_LABELS[tx.category] || tx.category}
                          </p>
                          <p style={{ fontSize: "11px", color: "var(--t3)", marginTop: "2px" }}>
                            {CATEGORY_LABELS[tx.category]} · {tx.currency} · {formatRelative(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p style={{ fontSize: "13px", fontWeight: 500, color: tx.type === "income" ? "var(--green)" : "var(--red)" }}>
                          {tx.type === "expense" ? "-" : "+"}{Number(tx.amount).toLocaleString()} {tx.currency}
                        </p>
                        <p style={{ fontSize: "11px", color: "var(--t3)", marginTop: "2px" }}>
                          {sym}{Number(tx.convertedAmount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </Card>
            </div>

            {/* Right col */}
            <div className="flex flex-col gap-4">
              {budgetProgress.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <p className="font-display" style={{ fontSize: "14px", fontWeight: 600, color: "var(--t1)" }}>Budget Goals</p>
                    <Target size={13} style={{ color: "var(--t3)" }} />
                  </div>
                  <div className="space-y-4">
                    {budgetProgress.map((b) => (
                      <div key={b.category}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span style={{ fontSize: "12px", color: "var(--t2)" }}>{CATEGORY_LABELS[b.category]}</span>
                          <span style={{ fontSize: "12px", fontWeight: 500, color: b.isOver ? "var(--red)" : "var(--t1)" }}>
                            {sym}{b.spent.toFixed(0)}/{sym}{b.limitInBase.toFixed(0)}
                          </span>
                        </div>
                        <div className="ptrack">
                          <div className="pfill" style={{
                            width: `${b.percentage}%`,
                            background: b.isOver ? "var(--red)" : b.percentage > 80 ? "var(--gold)" : "var(--blue)",
                            boxShadow: b.isOver ? `0 0 8px var(--red-glow)` : `0 0 8px var(--blue-glow)`,
                          }} />
                        </div>
                        {b.isOver && <p style={{ fontSize: "11px", color: "var(--red)", marginTop: "4px" }}>Over by {sym}{(b.spent - b.limitInBase).toFixed(0)}</p>}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card className="p-6">
                <p className="font-display mb-5" style={{ fontSize: "14px", fontWeight: 600, color: "var(--t1)" }}>By Category</p>
                {categoryBreakdown.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "var(--t3)", textAlign: "center", padding: "16px 0" }}>No expense data yet</p>
                ) : (
                  <div className="space-y-4">
                    {categoryBreakdown.slice(0, 6).map((c) => (
                      <div key={c.category}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span style={{ fontSize: "12px", color: "var(--t2)" }}>{CATEGORY_LABELS[c.category] ?? c.category}</span>
                          <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--t1)" }}>{sym}{c.total.toFixed(0)}</span>
                        </div>
                        <div className="ptrack">
                          <div className="pfill" style={{ width: `${(c.total / maxCat) * 100}%`, background: "var(--blue)", boxShadow: `0 0 6px var(--blue-glow)` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <p className="font-display mb-5" style={{ fontSize: "14px", fontWeight: 600, color: "var(--t1)" }}>Currency Mix</p>
                {currencyBreakdown.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "var(--t3)", textAlign: "center", padding: "16px 0" }}>No data yet</p>
                ) : (
                  <div>
                    {currencyBreakdown.map((c, i) => {
                      const pct = totalCurrSpend > 0 ? Math.round((c.totalConverted / totalCurrSpend) * 100) : 0;
                      return (
                        <div key={c.currency} className="flex items-center justify-between py-3"
                          style={{ borderBottom: i < currencyBreakdown.length - 1 ? "1px solid var(--border)" : "none" }}>
                          <div>
                            <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--t1)" }}>{c.currency}</p>
                            <p style={{ fontSize: "11px", color: "var(--t3)", marginTop: "2px" }}>{pct}% of spend</p>
                          </div>
                          <p style={{ fontSize: "13px", color: "var(--t2)" }}>{sym}{c.totalConverted.toFixed(2)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>

      <AddTransactionModal open={showModal} onClose={() => setShowModal(false)} baseCurrency={bc} />
    </div>
  );
}
