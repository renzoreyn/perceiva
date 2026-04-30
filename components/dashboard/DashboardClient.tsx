"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpDown,
  Wallet,
  PiggyBank,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CURRENCY_SYMBOLS, type CurrencyCode } from "@/lib/currency";
import { CATEGORY_LABELS, formatRelative } from "@/lib/utils";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import Sidebar from "@/components/layout/Sidebar";

type DashboardData = {
  user: { baseCurrency: string; name: string | null; email: string } | null;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    savingsRate: string;
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: any;
    currency: string;
    convertedAmount: any;
    category: string;
    description: string | null;
    createdAt: Date;
  }>;
  categoryBreakdown: Array<{ category: string; total: number }>;
  currencyBreakdown: Array<{
    currency: string;
    totalConverted: number;
    totalOriginal: number;
  }>;
};

// Custom tooltip for recharts
function CustomTooltip({ active, payload, label, symbol }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-xs"
      style={{
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        color: "var(--text-secondary)",
      }}
    >
      <div className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>
        {label}
      </div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {symbol}
          {Number(p.value).toLocaleString("en-US", { maximumFractionDigits: 2 })}
        </div>
      ))}
    </div>
  );
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const [showModal, setShowModal] = useState(false);

  const { user, summary, recentTransactions, categoryBreakdown, currencyBreakdown } =
    data;
  const baseCurrency = (user?.baseCurrency ?? "USD") as CurrencyCode;
  const symbol = CURRENCY_SYMBOLS[baseCurrency] ?? "$";
  const maxCat = categoryBreakdown[0]?.total ?? 1;
  const totalCurrencySpend = currencyBreakdown.reduce(
    (s, c) => s + c.totalConverted,
    0
  );

  // Build simple sparkline data from category breakdown for area chart
  const chartData = categoryBreakdown.slice(0, 6).map((c, i) => ({
    name: CATEGORY_LABELS[c.category]?.split(" ")[0] ?? c.category,
    Expense: Number(c.total.toFixed(2)),
  }));

  const summaryCards = [
    {
      label: "Net Balance",
      value: summary.netBalance,
      icon: Wallet,
      color:
        summary.netBalance >= 0 ? "var(--success)" : "var(--danger)",
      sub: "Last 30 days",
    },
    {
      label: "Total Income",
      value: summary.totalIncome,
      icon: TrendingUp,
      color: "var(--success)",
      sub: "Converted",
    },
    {
      label: "Total Spent",
      value: summary.totalExpense,
      icon: TrendingDown,
      color: "var(--danger)",
      sub: "Converted",
    },
    {
      label: "Savings Rate",
      value: null,
      rawValue: `${summary.savingsRate}%`,
      icon: PiggyBank,
      color: "var(--text-accent)",
      sub: "Of income",
    },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar userName={user?.name ?? user?.email ?? "User"} />

      <main className="flex-1 overflow-auto">
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 32px" }}>

          {/* ── Header ── */}
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: "36px" }}
          >
            <div>
              <h1
                className="font-playfair text-3xl font-semibold"
                style={{ color: "var(--text-primary)", marginBottom: "4px" }}
              >
                Overview
              </h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Last 30 days · Normalized to {baseCurrency}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
              style={{ background: "var(--primary)", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "var(--primary-hover)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "var(--primary)";
                (e.currentTarget as HTMLElement).style.transform = "none";
              }}
            >
              <Plus size={15} />
              Add Transaction
            </button>
          </div>

          {/* ── Summary Cards ── */}
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(4, 1fr)",
              marginBottom: "28px",
            }}
          >
            {summaryCards.map(({ label, value, rawValue, icon: Icon, color, sub }) => (
              <div
                key={label}
                className="rounded-xl border p-5 transition-all"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor =
                    "var(--border-hover)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor =
                    "var(--border)")
                }
              >
                <div
                  className="flex items-center justify-between mb-4"
                >
                  <span
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--text-dim)" }}
                  >
                    {label}
                  </span>
                  <Icon size={14} style={{ color: "var(--text-dim)" }} />
                </div>
                <div
                  className="font-playfair text-2xl font-semibold"
                  style={{ color, marginBottom: "4px" }}
                >
                  {rawValue ??
                    `${symbol}${Number(value).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
                </div>
                <div className="text-xs" style={{ color: "var(--text-dim)" }}>
                  {sub}
                </div>
              </div>
            ))}
          </div>

          {/* ── Main Grid ── */}
          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "1fr 340px" }}
          >
            {/* Left column */}
            <div className="flex flex-col gap-5">
              {/* Spending chart */}
              {chartData.length > 0 && (
                <div
                  className="rounded-xl border p-6"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <h2
                    className="font-playfair text-base font-semibold mb-5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Spending by Category
                  </h2>
                  <div style={{ height: "160px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="expenseGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="var(--primary)"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="var(--primary)"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="name"
                          tick={{
                            fill: "var(--text-dim)",
                            fontSize: 11,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis hide />
                        <Tooltip
                          content={<CustomTooltip symbol={symbol} />}
                          cursor={{ stroke: "var(--border-hover)" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="Expense"
                          stroke="var(--primary)"
                          strokeWidth={1.5}
                          fill="url(#expenseGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Recent transactions */}
              <div
                className="rounded-xl border"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <div
                  className="flex items-center justify-between px-6 py-4 border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <h2
                    className="font-playfair text-base font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Recent Transactions
                  </h2>
                  <a
                    href="/transactions"
                    className="flex items-center gap-1.5 text-xs transition-colors"
                    style={{ color: "var(--text-accent)" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color =
                        "var(--text-primary)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color =
                        "var(--text-accent)")
                    }
                  >
                    View all
                    <ArrowUpDown size={11} />
                  </a>
                </div>

                {recentTransactions.length === 0 ? (
                  <div className="flex flex-col items-center py-14 text-center">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: "var(--surface-raised)" }}
                    >
                      <Wallet size={18} style={{ color: "var(--text-dim)" }} />
                    </div>
                    <p
                      className="text-sm font-medium mb-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      No transactions yet
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                      Add your first transaction to get started
                    </p>
                  </div>
                ) : (
                  <div>
                    {recentTransactions.map((tx, idx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between px-6 py-4 transition-colors"
                        style={{
                          borderBottom:
                            idx < recentTransactions.length - 1
                              ? "1px solid var(--border)"
                              : "none",
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            "var(--surface-raised)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            "transparent")
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "var(--surface-high)" }}
                          >
                            {tx.type === "income" ? (
                              <TrendingUp
                                size={14}
                                style={{ color: "var(--success)" }}
                              />
                            ) : (
                              <TrendingDown
                                size={14}
                                style={{ color: "var(--danger)" }}
                              />
                            )}
                          </div>
                          <div>
                            <div
                              className="text-sm font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {tx.description ||
                                CATEGORY_LABELS[tx.category] ||
                                tx.category}
                            </div>
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: "var(--text-dim)" }}
                            >
                              {CATEGORY_LABELS[tx.category]} · {tx.currency} ·{" "}
                              {formatRelative(tx.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div
                            className="text-sm font-medium"
                            style={{
                              color:
                                tx.type === "income"
                                  ? "var(--success)"
                                  : "var(--danger)",
                            }}
                          >
                            {tx.type === "expense" ? "−" : "+"}
                            {Number(tx.amount).toLocaleString()} {tx.currency}
                          </div>
                          <div
                            className="text-xs mt-0.5"
                            style={{ color: "var(--text-dim)" }}
                          >
                            ≈ {symbol}
                            {Number(tx.convertedAmount).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-5">
              {/* Category breakdown */}
              <div
                className="rounded-xl border p-6"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <h2
                  className="font-playfair text-base font-semibold mb-5"
                  style={{ color: "var(--text-primary)" }}
                >
                  By Category
                </h2>
                {categoryBreakdown.length === 0 ? (
                  <p
                    className="text-xs text-center py-4"
                    style={{ color: "var(--text-dim)" }}
                  >
                    No expense data yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {categoryBreakdown.slice(0, 6).map((c) => (
                      <div key={c.category}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {CATEGORY_LABELS[c.category] ?? c.category}
                          </span>
                          <span
                            className="text-xs font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {symbol}
                            {c.total.toFixed(0)}
                          </span>
                        </div>
                        <div
                          className="h-1 rounded-full overflow-hidden"
                          style={{ background: "var(--bg)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(c.total / maxCat) * 100}%`,
                              background: "var(--primary)",
                              opacity: 0.65,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Currency mix */}
              <div
                className="rounded-xl border p-6"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                }}
              >
                <h2
                  className="font-playfair text-base font-semibold mb-5"
                  style={{ color: "var(--text-primary)" }}
                >
                  Currency Mix
                </h2>
                {currencyBreakdown.length === 0 ? (
                  <p
                    className="text-xs text-center py-4"
                    style={{ color: "var(--text-dim)" }}
                  >
                    No data yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {currencyBreakdown.map((c) => {
                      const pct =
                        totalCurrencySpend > 0
                          ? Math.round(
                              (c.totalConverted / totalCurrencySpend) * 100
                            )
                          : 0;
                      return (
                        <div
                          key={c.currency}
                          className="flex items-center justify-between py-2.5 border-b last:border-0"
                          style={{ borderColor: "var(--border)" }}
                        >
                          <div>
                            <div
                              className="text-sm font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {c.currency}
                            </div>
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: "var(--text-dim)" }}
                            >
                              {pct}% of spend
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className="text-sm"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {symbol}
                              {c.totalConverted.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AddTransactionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        baseCurrency={baseCurrency}
      />
    </div>
  );
}
