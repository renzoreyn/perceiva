"use client";

import { useState, useTransition } from "react";
import {
  Plus, Trash2, TrendingUp, TrendingDown, Filter,
  Search, Download, RefreshCw, X,
} from "lucide-react";
import { deleteTransaction, exportTransactionsCSV } from "@/server/actions/transaction.actions";
import { CURRENCY_SYMBOLS, SUPPORTED_CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { CATEGORY_LABELS, EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatDate } from "@/lib/utils";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import Sidebar from "@/components/layout/Sidebar";
import AmbientBackground from "@/components/layout/AmbientBackground";

type Transaction = {
  id: string; type: string; amount: any; currency: string;
  convertedAmount: any; baseCurrency: string; category: string;
  description: string | null; createdAt: Date; isRecurring: boolean;
  trip?: { id: string; name: string } | null;
};

interface Props {
  transactions: Transaction[];
  total: number;
  baseCurrency: CurrencyCode;
  userName: string;
  trips?: { id: string; name: string }[];
}

export default function TransactionsClient({ transactions, total, baseCurrency, userName, trips = [] }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [exporting, startExport] = useTransition();

  const symbol = CURRENCY_SYMBOLS[baseCurrency] ?? "$";

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (categoryFilter && tx.category !== categoryFilter) return false;
    if (currencyFilter && tx.currency !== currencyFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !tx.description?.toLowerCase().includes(s) &&
        !CATEGORY_LABELS[tx.category]?.toLowerCase().includes(s) &&
        !tx.currency.toLowerCase().includes(s)
      ) return false;
    }
    return true;
  });

  const hasFilters = typeFilter !== "all" || categoryFilter !== "" || currencyFilter !== "" || search !== "";

  function clearFilters() {
    setTypeFilter("all");
    setCategoryFilter("");
    setCurrencyFilter("");
    setSearch("");
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteTransaction(id);
    setDeleting(null);
  }

  function handleExport() {
    startExport(async () => {
      const csv = await exportTransactionsCSV();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `perceiva-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  return (
    <div className="flex min-h-screen relative" style={{ background: "var(--bg)" }}>
      <AmbientBackground />
      <Sidebar userName={userName} />

      <main className="flex-1 overflow-auto relative z-10 dashboard-main">
        <div style={{ maxWidth: "920px", margin: "0 auto", padding: "40px 24px" }}>

          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: "28px" }}>
            <div>
              <h1 className="font-playfair text-3xl font-semibold" style={{ color: "var(--text-primary)", marginBottom: "4px" }}>
                Transactions
              </h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {filtered.length} shown · {total} total · {baseCurrency}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="btn-ghost-glass inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
                style={{ cursor: "pointer" }}
              >
                <Download size={13} />
                {exporting ? "Exporting..." : "CSV"}
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary-glass inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{ cursor: "pointer", border: "none" }}
              >
                <Plus size={15} />
                Add
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="glass glass-shimmer rounded-2xl p-4 mb-5 flex flex-wrap items-center gap-3">
            <div className="relative flex-1" style={{ minWidth: "160px" }}>
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-dim)" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-4 py-2 rounded-lg text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            <div className="flex rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.05)" }}>
              {(["all", "expense", "income"] as const).map((f) => (
                <button key={f} onClick={() => setTypeFilter(f)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all"
                  style={{
                    background: typeFilter === f ? "rgba(107,143,212,0.2)" : "transparent",
                    color: typeFilter === f ? "var(--text-accent)" : "var(--text-dim)",
                    border: "none", cursor: "pointer",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs outline-none appearance-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: categoryFilter ? "var(--text-primary)" : "var(--text-dim)" }}
            >
              <option value="">All categories</option>
              {allCategories.map((c) => (
                <option key={c} value={c} style={{ background: "#0a0a0f" }}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>

            <select value={currencyFilter} onChange={(e) => setCurrencyFilter(e.target.value)}
              className="px-3 py-2 rounded-lg text-xs outline-none appearance-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: currencyFilter ? "var(--text-primary)" : "var(--text-dim)" }}
            >
              <option value="">All currencies</option>
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c} style={{ background: "#0a0a0f" }}>{c}</option>
              ))}
            </select>

            {hasFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg"
                style={{ background: "rgba(224,107,107,0.1)", color: "var(--danger)", border: "1px solid rgba(224,107,107,0.2)", cursor: "pointer" }}
              >
                <X size={11} /> Clear
              </button>
            )}
          </div>

          {/* List */}
          <div className="glass glass-shimmer rounded-2xl overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <Filter size={18} style={{ color: "var(--text-dim)" }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>No transactions found</p>
                <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                  {hasFilters ? "Try adjusting your filters" : "Add your first transaction above"}
                </p>
              </div>
            ) : (
              filtered.map((tx, idx) => (
                <div key={tx.id}
                  className="flex items-center justify-between px-6 py-4 group transition-all"
                  style={{ borderBottom: idx < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {tx.description || CATEGORY_LABELS[tx.category] || tx.category}
                        </span>
                        {tx.isRecurring && (
                          <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md"
                            style={{ background: "var(--primary-muted)", color: "var(--text-accent)" }}>
                            <RefreshCw size={9} /> Recurring
                          </span>
                        )}
                        {tx.trip && (
                          <span className="text-xs px-1.5 py-0.5 rounded-md"
                            style={{ background: "var(--violet-muted)", color: "var(--violet)" }}>
                            {tx.trip.name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                        {CATEGORY_LABELS[tx.category]} · {tx.currency} · {formatDate(tx.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium" style={{ color: tx.type === "income" ? "var(--success)" : "var(--danger)" }}>
                        {tx.type === "expense" ? "−" : "+"}{Number(tx.amount).toLocaleString()} {tx.currency}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                        ≈ {symbol}{Number(tx.convertedAmount).toFixed(2)}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(tx.id)} disabled={deleting === tx.id}
                      className="opacity-0 group-hover:opacity-100 transition-all w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
                      style={{ color: "var(--text-dim)", background: "none", border: "none", cursor: "pointer" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--danger)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <AddTransactionModal open={showModal} onClose={() => setShowModal(false)} baseCurrency={baseCurrency} trips={trips} />
    </div>
  );
}
