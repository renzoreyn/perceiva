"use client";

import { BarChart3, AlertTriangle, TrendingUp, TrendingDown, Minus, Globe } from "lucide-react";
import { format } from "date-fns";
import type { MonthlyRecapData } from "@/server/actions/recap.actions";
import { CURRENCY_SYMBOLS, type CurrencyCode } from "@/lib/currency";
import { CATEGORY_LABELS } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";
import AmbientBackground from "@/components/layout/AmbientBackground";

interface Props {
  currentRecap: MonthlyRecapData | null;
  allRecaps: Array<{
    id: string; year: number; month: number;
    totalIncome: any; totalExpense: any; netBalance: any;
    savingsRate: any; baseCurrency: string; generatedAt: Date;
  }>;
  userName: string;
}

function ChangeChip({ value }: { value: number }) {
  const abs = Math.abs(value);
  if (abs < 0.5) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
        style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" }}>
        <Minus size={9} /> Flat
      </span>
    );
  }
  const up = value > 0;
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
      style={{ background: up ? "var(--success-muted)" : "var(--danger-muted)", color: up ? "var(--success)" : "var(--danger)" }}>
      {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {abs.toFixed(1)}%
    </span>
  );
}

export default function InsightsClient({ currentRecap, allRecaps, userName }: Props) {
  const recap = currentRecap;
  const baseCurrency = (recap?.baseCurrency ?? "USD") as CurrencyCode;
  const symbol = CURRENCY_SYMBOLS[baseCurrency] ?? "$";

  return (
    <div className="flex min-h-screen relative" style={{ background: "var(--bg)" }}>
      <AmbientBackground />
      <Sidebar userName={userName} />

      <main className="flex-1 overflow-auto relative z-10 dashboard-main">
        <div className="page-content">

          <div style={{ marginBottom: "32px" }}>
            <h1 className="font-display text-3xl font-700 mb-1"
              style={{ color: "var(--text-primary)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Monthly Insights
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              A calm look at what actually went down with your money.
            </p>
          </div>

          {recap ? (
            <div className="glass-card rounded-2xl mb-6" style={{ overflow: "hidden" }}>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-6" style={{ color: "var(--primary)" }}>
                  <BarChart3 size={13} />
                  <span className="text-xs font-semibold uppercase tracking-widest">{recap.monthLabel}</span>
                </div>

                {/* Stats */}
                <div className="grid gap-3 mb-7 summary-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
                  {[
                    { label: "Income", val: `${symbol}${recap.totalIncome.toFixed(2)}`, color: "var(--success)" },
                    { label: "Spent", val: `${symbol}${recap.totalExpense.toFixed(2)}`, color: "var(--danger)" },
                    { label: "Net", val: `${symbol}${recap.netBalance.toFixed(2)}`, color: recap.netBalance >= 0 ? "var(--success)" : "var(--danger)" },
                    { label: "Savings", val: `${recap.savingsRate.toFixed(1)}%`, color: "var(--text-accent)" },
                  ].map((s) => (
                    <div key={s.label} className="glass rounded-xl p-5">
                      <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-dim)" }}>{s.label}</p>
                      <p className="font-display text-xl font-700" style={{ color: s.color, fontWeight: 700 }}>{s.val}</p>
                    </div>
                  ))}
                </div>

                {/* vs last month */}
                {recap.vsLastMonth && (
                  <div className="glass rounded-xl px-5 py-4 mb-7">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-dim)" }}>
                      vs Previous Month
                    </p>
                    <div className="flex gap-8 flex-wrap">
                      {[
                        { label: "Income", val: recap.vsLastMonth.incomeChange },
                        { label: "Spending", val: recap.vsLastMonth.expenseChange },
                        { label: "Net", val: recap.vsLastMonth.netChange },
                      ].map((m) => (
                        <div key={m.label} className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: "var(--text-dim)" }}>{m.label}</span>
                          <ChangeChip value={m.val} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-6 main-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  {/* Categories */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-dim)" }}>
                      Top spending categories
                    </p>
                    {recap.topCategories.length === 0 ? (
                      <p className="text-xs" style={{ color: "var(--text-dim)" }}>No expense data for this month.</p>
                    ) : (
                      <div className="space-y-3">
                        {recap.topCategories.map((c) => (
                          <div key={c.category}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                                {CATEGORY_LABELS[c.category] ?? c.category}
                              </span>
                              <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{c.percentage}%</span>
                            </div>
                            <div className="progress-track">
                              <div className="progress-fill"
                                style={{ width: `${c.percentage}%`, background: "var(--primary)", boxShadow: "0 0 8px var(--primary-glow)" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Distortion + behavioral */}
                  <div className="space-y-4">
                    {recap.distortionInsights.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3" style={{ color: "var(--text-dim)" }}>
                          <Globe size={12} />
                          <span className="text-xs font-semibold uppercase tracking-wider">Currency distortion</span>
                        </div>
                        <div className="space-y-2">
                          {recap.distortionInsights.map((d) => (
                            <div key={d.currency} className="rounded-xl p-4"
                              style={{ background: "var(--gold-muted)", border: "1px solid rgba(201,170,113,0.15)" }}>
                              <div className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: "var(--gold)" }}>
                                <AlertTriangle size={10} /> {d.currency}
                              </div>
                              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{d.note}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {recap.behavioralInsights.length > 0 && (
                      <div className="space-y-2">
                        {recap.behavioralInsights.map((b, i) => (
                          <div key={i} className="rounded-xl px-4 py-3 text-xs leading-relaxed"
                            style={{ background: "var(--primary-muted)", color: "var(--text-accent)" }}>
                            {b.message}
                          </div>
                        ))}
                      </div>
                    )}

                    {recap.distortionInsights.length === 0 && recap.behavioralInsights.length === 0 && (
                      <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                        All transactions in base currency. No distortion detected this month.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-14 text-center mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(255,255,255,0.04)" }}>
                <BarChart3 size={20} style={{ color: "var(--text-dim)" }} />
              </div>
              <h2 className="font-display text-xl font-700 mb-2" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                No recap yet
              </h2>
              <p className="text-sm max-w-xs mx-auto" style={{ color: "var(--text-secondary)" }}>
                Log some transactions and your first monthly recap will show up on the 1st of next month.
              </p>
            </div>
          )}

          {/* History */}
          {allRecaps.length > 1 && (
            <div>
              <h2 className="font-display text-xl font-700 mb-4"
                style={{ color: "var(--text-primary)", fontWeight: 700, letterSpacing: "-0.02em" }}>
                Previous months
              </h2>
              <div className="space-y-3">
                {allRecaps.slice(1).map((r) => {
                  const bc = r.baseCurrency as CurrencyCode;
                  const sym = CURRENCY_SYMBOLS[bc] ?? "$";
                  const label = format(new Date(r.year, r.month - 1), "MMMM yyyy");
                  return (
                    <div key={r.id}
                      className="glass-card rounded-xl flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>{r.baseCurrency} base</p>
                      </div>
                      <div className="flex gap-7">
                        {[
                          { label: "Income", val: `+${sym}${Number(r.totalIncome).toFixed(0)}`, color: "var(--success)" },
                          { label: "Spent", val: `-${sym}${Number(r.totalExpense).toFixed(0)}`, color: "var(--danger)" },
                          { label: "Savings", val: `${Number(r.savingsRate).toFixed(1)}%`, color: "var(--text-accent)" },
                        ].map((s) => (
                          <div key={s.label} className="text-right">
                            <p className="text-xs mb-1" style={{ color: "var(--text-dim)" }}>{s.label}</p>
                            <p className="text-sm font-medium" style={{ color: s.color }}>{s.val}</p>
                          </div>
                        ))}
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
