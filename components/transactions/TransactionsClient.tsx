"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Filter,
} from "lucide-react";
import { deleteTransaction } from "@/server/actions/transaction.actions";
import { CURRENCY_SYMBOLS, type CurrencyCode } from "@/lib/currency";
import { CATEGORY_LABELS, formatDate } from "@/lib/utils";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import Sidebar from "@/components/layout/Sidebar";

type Transaction = {
  id: string;
  type: string;
  amount: any;
  currency: string;
  convertedAmount: any;
  baseCurrency: string;
  category: string;
  description: string | null;
  createdAt: Date;
};

interface Props {
  transactions: Transaction[];
  total: number;
  baseCurrency: CurrencyCode;
  userName: string;
}

export default function TransactionsClient({
  transactions,
  total,
  baseCurrency,
  userName,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const symbol = CURRENCY_SYMBOLS[baseCurrency] ?? "$";

  const filtered =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteTransaction(id);
    setDeleting(null);
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar userName={userName} />

      <main className="flex-1 overflow-auto">
        <div style={{ maxWidth: "880px", margin: "0 auto", padding: "40px 32px" }}>

          {/* Header */}
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: "32px" }}
          >
            <div>
              <h1
                className="font-playfair text-3xl font-semibold"
                style={{ color: "var(--text-primary)", marginBottom: "4px" }}
              >
                Transactions
              </h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {total} total · Normalized to {baseCurrency}
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

          {/* Filter tabs */}
          <div
            className="flex items-center gap-2 mb-6"
          >
            <Filter size={13} style={{ color: "var(--text-dim)" }} />
            <div
              className="flex rounded-lg p-1"
              style={{ background: "var(--surface)" }}
            >
              {(["all", "expense", "income"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all"
                  style={{
                    background:
                      filter === f ? "var(--surface-raised)" : "transparent",
                    color:
                      filter === f ? "var(--text-primary)" : "var(--text-dim)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions list */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: "var(--surface-raised)" }}
                >
                  <TrendingUp size={18} style={{ color: "var(--text-dim)" }} />
                </div>
                <p
                  className="text-sm font-medium mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  No transactions found
                </p>
                <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                  {filter !== "all"
                    ? `No ${filter} transactions yet`
                    : "Add your first transaction above"}
                </p>
              </div>
            ) : (
              filtered.map((tx, idx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-6 py-4 group transition-colors"
                  style={{
                    borderBottom:
                      idx < filtered.length - 1
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
                        {formatDate(tx.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right">
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
                        {Number(tx.convertedAmount).toFixed(2)}{" "}
                        {baseCurrency}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(tx.id)}
                      disabled={deleting === tx.id}
                      className="opacity-0 group-hover:opacity-100 transition-all w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
                      style={{
                        color: "var(--text-dim)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color =
                          "var(--danger)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color =
                          "var(--text-dim)")
                      }
                      aria-label="Delete transaction"
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

      <AddTransactionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        baseCurrency={baseCurrency}
      />
    </div>
  );
}
