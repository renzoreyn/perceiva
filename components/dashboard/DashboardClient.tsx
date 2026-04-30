"use client";

import { useState } from "react";
import {
  TrendingUp, TrendingDown, Plus, ArrowUpDown,
  Wallet, PiggyBank, Zap, Target,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CURRENCY_SYMBOLS, type CurrencyCode } from "@/lib/currency";
import { CATEGORY_LABELS, formatRelative } from "@/lib/utils";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import Sidebar from "@/components/layout/Sidebar";
import AmbientBackground from "@/components/layout/AmbientBackground";

type BudgetProgress = {
  category: string;
  limitAmount: number;
  limitInBase: number;
  currency: string;
  baseCurrency: string;
  spent: number;
  percentage: number;
  isOver: boolean;
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

function GlassCard({ children, className = "", style = {} }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div
      className={`glass glass-shimmer glass-hover-glow rounded-2xl ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label, symbol }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-4 py-3 text-xs" style={{ border: "1px solid var(--border-md)" }}>
      <div className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: "var(--text-accent)" }}>
          {symbol}{Number(p.value).toLocaleString("en-US", { maximumFractionDigits: 2 })}
        </div>
      ))}
    </div>
  );
}

export default function DashboardClient({
  data,
  budgetProgress,
}: {
  data: DashboardData;
  budgetProgress: BudgetProgress[];
}) {
  const [showModal, setShowModal] = useState(false);
  const { user, summary, velocity, recentTransactions, categoryBreakdown, currencyBreakdown } = data;
  const baseCurrency = (user?.baseCurrency ?? "USD") as CurrencyCode;
  const symbol = CURRENCY_SYMBOLS[baseCurrency] ?? "$";
  const maxCat = categoryBreakdown[0]?.total ?? 1;
  const totalCurrencySpend = currencyBreakdown.reduce((s, c) => s + c.totalConverted, 0);

  const chartData = categoryBreakdown.slice(0, 7).map((c) => ({
    name: CATEGORY_LABELS[c.category]?.split(" ")[0] ?? c.category,
    Expense: Number(c.total.toFixed(2)),
  }));

  const summaryCards = [
    { label: "Net Balance",   value: summary.netBalance,   icon: Wallet,    color: summary.netBalance >= 0 ? "var(--success)" : "var(--danger)", sub: "Last 30 days" },
    { label: "Total Income",  value: summary.totalIncome,  icon: TrendingUp, color: "var(--success)", sub: "Converted" },
    { label: "Total Spent",   value: summary.totalExpense, icon: TrendingDown, color: "var(--danger)", sub: "Converted" },
    { label: "Savings Rate",  value: null, rawValue: `${summary.savingsRate}%`, icon: PiggyBank, color: "var(--text-accent)", sub: "Of income" },
  ];

  return (
    <div className="flex min-h-screen relative" style={{ background: "var(--bg)" }}>
      <AmbientBackground />
      <Sidebar userName={user?.name ?? user?.email ?? "User"} />

      <main className="flex-1 overflow-auto relative z-10 dashboard-main">
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px" }}>

          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: "32px" }}>
            <div>
              <h1 className="font-playfair text-3xl font-semibold" style={{ color: "var(--text-primary)", marginBottom: "4px" }}>
                Overview
              </h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Last 30 days · Normalized to {baseCurrency}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary-glass inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ cursor: "pointer", border: "none" }}
            >
              <Plus size={15} />
              Add Transaction
            </button>
          </div>

          {/* Velocity banner */}
          {(velocity.faster || velocity.slower) && (
            <div
              className="glass-shimmer rounded-2xl px-5 py-4 mb-5 flex items-center gap-3"
              style={{
                background: velocity.faster ? "rgba(224,107,107,0.08)" : "rgba(76,175,125,0.08)",
                border: `1px solid ${velocity.faster ? "rgba(224,107,107,0.2)" : "rgba(76,175,125,0.2)"}`,
              }}
            >
              <Zap size={15} style={{ color: velocity.faster ? "var(--danger)" : "var(--success)", flexShrink: 0 }} />
              <p className="text-sm" style={{ color: velocity.faster ? "var(--danger)" : "var(--success)" }}>
                {velocity.faster
                  ? `Spending ${Math.abs(velocity.pct).toFixed(0)}% faster than last month at this point. Heads up.`
                  : `Spending ${Math.abs(velocity.pct).toFixed(0)}% slower than last month. You're pacing well.`}
              </p>
            </div>
          )}

          {/* Summary cards */}
          <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
            {summaryCards.map(({ label, value, rawValue, icon: Icon, color, sub }) => (
              <GlassCard key={label} className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>{label}</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <Icon size={13} style={{ color: "var(--text-dim)" }} />
                  </div>
                </div>
                <div className="font-playfair text-2xl font-semibold" style={{ color, marginBottom: "4px" }}>
                  {rawValue ?? `${symbol}${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </div>
                <div className="text-xs" style={{ color: "var(--text-dim)" }}>{sub}</div>
              </GlassCard>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 320px" }}>
            <div className="flex flex-col gap-5">

              {/* Chart */}
              {chartData.length > 0 && (
                <GlassCard className="p-6">
                  <h2 className="font-playfair text-base font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
                    Spending by Category
                  </h2>
                  <div style={{ height: "160px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fill: "var(--text-dim)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip content={<CustomTooltip symbol={symbol} />} cursor={{ stroke: "rgba(255,255,255,0.08)" }} />
                        <Area type="monotone" dataKey="Expense" stroke="var(--primary)" strokeWidth={1.5} fill="url(#grad1)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              )}

              {/* Recent transactions */}
              <GlassCard>
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                  <h2 className="font-playfair text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                    Recent Transactions
                  </h2>
                  <a href="/transactions" className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: "var(--text-accent)" }}>
                    View all <ArrowUpDown size={11} />
                  </a>
                </div>

                {recentTransactions.length === 0 ? (
                  <div className="flex flex-col items-center py-14 text-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <Wallet size={18} style={{ color: "var(--text-dim)" }} />
                    </div>
                    <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>No transactions yet</p>
                    <p className="text-xs" style={{ color: "var(--text-dim)" }}>Add your first transaction above</p>
                  </div>
                ) : (
                  recentTransactions.map((tx, idx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between px-6 py-4 transition-all"
                      style={{
                        borderBottom: idx < recentTransactions.length - 1 ? "1px solid var(--border)" : "none",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: tx.type === "income" ? "rgba(76,175,125,0.12)" : "rgba(224,107,107,0.12)" }}>
                          {tx.type === "income"
                            ? <TrendingUp size={14} style={{ color: "var(--success)" }} />
                            : <TrendingDown size={14} style={{ color: "var(--danger)" }} />}
                        </div>
                        <div>
                          <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                            {tx.description || CATEGORY_LABELS[tx.category] || tx.category}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                            {CATEGORY_LABELS[tx.category]} · {tx.currency} · {formatRelative(tx.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-medium" style={{ color: tx.type === "income" ? "var(--success)" : "var(--danger)" }}>
                          {tx.type === "expense" ? "−" : "+"}{Number(tx.amount).toLocaleString()} {tx.currency}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                          ≈ {symbol}{Number(tx.convertedAmount).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </GlassCard>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-5">

              {/* Budget goals */}
              {budgetProgress.length > 0 && (
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-playfair text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                      Budget Goals
                    </h2>
                    <Target size={14} style={{ color: "var(--text-dim)" }} />
                  </div>
                  <div className="space-y-4">
                    {budgetProgress.map((b) => (
                      <div key={b.category}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            {CATEGORY_LABELS[b.category]}
                          </span>
                          <span className="text-xs font-medium" style={{ color: b.isOver ? "var(--danger)" : "var(--text-primary)" }}>
                            {symbol}{b.spent.toFixed(0)} / {symbol}{b.limitInBase.toFixed(0)}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${b.percentage}%`,
                              background: b.isOver
                                ? "var(--danger)"
                                : b.percentage > 80
                                ? "var(--gold)"
                                : "var(--primary)",
                              boxShadow: b.isOver ? "0 0 8px var(--danger-glow)" : b.percentage > 80 ? "0 0 8px rgba(201,170,113,0.4)" : "0 0 8px var(--primary-glow)",
                            }}
                          />
                        </div>
                        {b.isOver && (
                          <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>
                            Over by {symbol}{(b.spent - b.limitInBase).toFixed(0)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Category breakdown */}
              <GlassCard className="p-6">
                <h2 className="font-playfair text-base font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
                  By Category
                </h2>
                {categoryBreakdown.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: "var(--text-dim)" }}>No expense data yet</p>
                ) : (
                  <div className="space-y-4">
                    {categoryBreakdown.slice(0, 6).map((c) => (
                      <div key={c.category}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{CATEGORY_LABELS[c.category] ?? c.category}</span>
                          <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{symbol}{c.total.toFixed(0)}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${(c.total / maxCat) * 100}%`, background: "var(--primary)", boxShadow: "0 0 6px var(--primary-glow)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

              {/* Currency mix */}
              <GlassCard className="p-6">
                <h2 className="font-playfair text-base font-semibold mb-5" style={{ color: "var(--text-primary)" }}>Currency Mix</h2>
                {currencyBreakdown.length === 0 ? (
                  <p className="text-xs text-center py-4" style={{ color: "var(--text-dim)" }}>No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {currencyBreakdown.map((c) => {
                      const pct = totalCurrencySpend > 0 ? Math.round((c.totalConverted / totalCurrencySpend) * 100) : 0;
                      return (
                        <div key={c.currency} className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                          <div>
                            <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{c.currency}</div>
                            <div className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>{pct}% of spend</div>
                          </div>
                          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{symbol}{c.totalConverted.toFixed(2)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      </main>

      <AddTransactionModal open={showModal} onClose={() => setShowModal(false)} baseCurrency={baseCurrency} />
    </div>
  );
}
