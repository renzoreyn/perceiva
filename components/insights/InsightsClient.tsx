"use client";

import {
  BarChart3,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  LineChart,
  Globe,
} from "lucide-react";
import { format } from "date-fns";
import type { MonthlyRecapData } from "@/server/actions/recap.actions";
import { CURRENCY_SYMBOLS, type CurrencyCode } from "@/lib/currency";
import { CATEGORY_LABELS } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";

interface Props {
  currentRecap: MonthlyRecapData | null;
  allRecaps: Array<{
    id: string;
    year: number;
    month: number;
    totalIncome: any;
    totalExpense: any;
    netBalance: any;
    savingsRate: any;
    baseCurrency: string;
    generatedAt: Date;
  }>;
  userName: string;
}

function ChangeChip({ value }: { value: number }) {
  const abs = Math.abs(value);
  const isFlat = abs < 0.5;
  if (isFlat) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
        style={{
          background: "var(--surface-high)",
          color: "var(--text-secondary)",
        }}
      >
        <Minus size={9} />
        Flat
      </span>
    );
  }
  const up = value > 0;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
      style={{
        background: up ? "var(--success-muted)" : "var(--danger-muted)",
        color: up ? "var(--success)" : "var(--danger)",
      }}
    >
      {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {abs.toFixed(1)}%
    </span>
  );
}

export default function InsightsClient({
  currentRecap,
  allRecaps,
  userName,
}: Props) {
  const recap = currentRecap;
  const baseCurrency = (recap?.baseCurrency ?? "USD") as CurrencyCode;
  const symbol = CURRENCY_SYMBOLS[baseCurrency] ?? "$";

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar userName={userName} />

      <main className="flex-1 overflow-auto">
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 32px" }}>

          {/* Header */}
          <div style={{ marginBottom: "36px" }}>
            <h1
              className="font-playfair text-3xl font-semibold"
              style={{ color: "var(--text-primary)", marginBottom: "4px" }}
            >
              Monthly Insights
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Reflective recap of your spending and currency perception.
            </p>
          </div>

          {/* ── Current recap ── */}
          {recap ? (
            <div
              className="rounded-2xl border relative overflow-hidden"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                marginBottom: "24px",
              }}
            >
              {/* Top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--primary), transparent)",
                  opacity: 0.35,
                }}
              />

              <div className="p-8">
                <div
                  className="flex items-center gap-2 mb-6"
                  style={{ color: "var(--primary)" }}
                >
                  <LineChart size={14} />
                  <span className="text-xs font-semibold uppercase tracking-widest">
                    {recap.monthLabel}
                  </span>
                </div>

                {/* Stats */}
                <div
                  className="grid gap-3 mb-7"
                  style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
                >
                  {[
                    {
                      label: "Total Income",
                      val: `${symbol}${recap.totalIncome.toFixed(2)}`,
                      color: "var(--success)",
                    },
                    {
                      label: "Total Spent",
                      val: `${symbol}${recap.totalExpense.toFixed(2)}`,
                      color: "var(--danger)",
                    },
                    {
                      label: "Net Balance",
                      val: `${symbol}${recap.netBalance.toFixed(2)}`,
                      color:
                        recap.netBalance >= 0
                          ? "var(--success)"
                          : "var(--danger)",
                    },
                    {
                      label: "Savings Rate",
                      val: `${recap.savingsRate.toFixed(1)}%`,
                      color: "var(--text-accent)",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl p-5"
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="text-xs uppercase tracking-wider mb-2"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {s.label}
                      </div>
                      <div
                        className="font-playfair text-xl font-semibold"
                        style={{ color: s.color }}
                      >
                        {s.val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* vs Last Month */}
                {recap.vsLastMonth && (
                  <div
                    className="rounded-xl px-5 py-4 mb-7"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="text-xs font-semibold uppercase tracking-wider mb-3"
                      style={{ color: "var(--text-dim)" }}
                    >
                      vs Previous Month
                    </div>
                    <div className="flex gap-8">
                      {[
                        { label: "Income", val: recap.vsLastMonth.incomeChange },
                        { label: "Spending", val: recap.vsLastMonth.expenseChange },
                        { label: "Net", val: recap.vsLastMonth.netChange },
                      ].map((m) => (
                        <div key={m.label} className="flex items-center gap-2">
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-dim)" }}
                          >
                            {m.label}
                          </span>
                          <ChangeChip value={m.val} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className="grid gap-6"
                  style={{ gridTemplateColumns: "1fr 1fr" }}
                >
                  {/* Category breakdown */}
                  <div>
                    <div
                      className="flex items-center gap-2 mb-4"
                      style={{ color: "var(--text-dim)" }}
                    >
                      <BarChart3 size={13} />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Top Spending Categories
                      </span>
                    </div>
                    {recap.topCategories.length === 0 ? (
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-dim)" }}
                      >
                        No expense data for this month.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {recap.topCategories.map((c) => (
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
                                {c.percentage}%
                              </span>
                            </div>
                            <div
                              className="h-1.5 rounded-full overflow-hidden"
                              style={{ background: "var(--bg)" }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${c.percentage}%`,
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

                  {/* Distortion + behavioral insights */}
                  <div className="space-y-4">
                    {recap.distortionInsights.length > 0 && (
                      <div>
                        <div
                          className="flex items-center gap-2 mb-3"
                          style={{ color: "var(--text-dim)" }}
                        >
                          <Globe size={13} />
                          <span className="text-xs font-semibold uppercase tracking-wider">
                            Currency Distortion
                          </span>
                        </div>
                        <div className="space-y-2">
                          {recap.distortionInsights.map((d) => (
                            <div
                              key={d.currency}
                              className="rounded-xl p-4"
                              style={{
                                background: "rgba(201,170,113,0.06)",
                                border: "1px solid rgba(201,170,113,0.14)",
                              }}
                            >
                              <div
                                className="flex items-center gap-1.5 text-xs font-semibold mb-1.5"
                                style={{ color: "var(--gold)" }}
                              >
                                <AlertTriangle size={11} />
                                {d.currency}
                              </div>
                              <p
                                className="text-xs leading-relaxed"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                {d.note}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {recap.behavioralInsights.length > 0 && (
                      <div className="space-y-2">
                        {recap.behavioralInsights.map((b, i) => (
                          <div
                            key={i}
                            className="rounded-xl px-4 py-3 text-xs leading-relaxed"
                            style={{
                              background: "var(--primary-muted)",
                              color: "var(--text-accent)",
                            }}
                          >
                            {b.message}
                          </div>
                        ))}
                      </div>
                    )}

                    {recap.distortionInsights.length === 0 &&
                      recap.behavioralInsights.length === 0 && (
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-dim)" }}
                        >
                          All transactions in base currency — no distortion
                          detected this month.
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl border p-14 text-center mb-6"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "var(--surface-raised)" }}
              >
                <BarChart3 size={20} style={{ color: "var(--text-dim)" }} />
              </div>
              <h2
                className="font-playfair text-xl font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                No recap yet
              </h2>
              <p
                className="text-sm max-w-xs mx-auto"
                style={{ color: "var(--text-secondary)" }}
              >
                Add transactions and your first monthly recap will appear at
                the start of next month.
              </p>
            </div>
          )}

          {/* ── Historical recaps ── */}
          {allRecaps.length > 1 && (
            <div>
              <h2
                className="font-playfair text-xl font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Previous Months
              </h2>
              <div className="space-y-3">
                {allRecaps.slice(1).map((r) => {
                  const bc = r.baseCurrency as CurrencyCode;
                  const sym = CURRENCY_SYMBOLS[bc] ?? "$";
                  const label = format(
                    new Date(r.year, r.month - 1),
                    "MMMM yyyy"
                  );
                  return (
                    <div
                      key={r.id}
                      className="rounded-xl border flex items-center justify-between px-6 py-4 transition-all"
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
                      <div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {label}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "var(--text-dim)" }}
                        >
                          {r.baseCurrency} base
                        </div>
                      </div>
                      <div className="flex gap-7 text-right">
                        <div>
                          <div
                            className="text-xs mb-1"
                            style={{ color: "var(--text-dim)" }}
                          >
                            Income
                          </div>
                          <div
                            className="text-sm font-medium"
                            style={{ color: "var(--success)" }}
                          >
                            +{sym}
                            {Number(r.totalIncome).toFixed(0)}
                          </div>
                        </div>
                        <div>
                          <div
                            className="text-xs mb-1"
                            style={{ color: "var(--text-dim)" }}
                          >
                            Spent
                          </div>
                          <div
                            className="text-sm font-medium"
                            style={{ color: "var(--danger)" }}
                          >
                            −{sym}
                            {Number(r.totalExpense).toFixed(0)}
                          </div>
                        </div>
                        <div>
                          <div
                            className="text-xs mb-1"
                            style={{ color: "var(--text-dim)" }}
                          >
                            Savings
                          </div>
                          <div
                            className="text-sm font-medium"
                            style={{ color: "var(--text-accent)" }}
                          >
                            {Number(r.savingsRate).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
