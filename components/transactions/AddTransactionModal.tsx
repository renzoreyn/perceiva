"use client";

import { useEffect, useState } from "react";
import { X, AlertCircle, RefreshCw } from "lucide-react";
import { createTransaction } from "@/server/actions/transaction.actions";
import { SUPPORTED_CURRENCIES, CURRENCY_LABELS, type CurrencyCode } from "@/lib/currency";
import {
  CATEGORY_LABELS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  baseCurrency: CurrencyCode;
}

export default function AddTransactionModal({ open, onClose, baseCurrency }: Props) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const categories =
    type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const result = await createTransaction({
      type,
      amount: Number(fd.get("amount")),
      currency: fd.get("currency") as CurrencyCode,
      category: fd.get("category") as any,
      description: (fd.get("description") as string) || undefined,
    });

    if (result.success) {
      onClose();
      setType("expense");
      setError(null);
    } else {
      setError(result.error ?? "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(8,8,10,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border animate-scale-in"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--primary), transparent)",
            opacity: 0.4,
          }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-7 pt-7 pb-5 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h2
            className="font-playfair text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Add Transaction
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--text-dim)", background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")
            }
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-7 py-6 space-y-5">
            {/* Type toggle */}
            <div
              className="flex rounded-lg p-1"
              style={{ background: "var(--bg)" }}
            >
              {(["expense", "income"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="flex-1 py-2 rounded-md text-sm font-medium capitalize transition-all"
                  style={{
                    background:
                      type === t ? "var(--surface-raised)" : "transparent",
                    color:
                      type === t ? "var(--text-primary)" : "var(--text-dim)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Amount + Currency */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Amount
                </label>
                <input
                  name="amount"
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) =>
                    ((e.target as HTMLInputElement).style.borderColor =
                      "var(--primary)")
                  }
                  onBlur={(e) =>
                    ((e.target as HTMLInputElement).style.borderColor =
                      "var(--border)")
                  }
                />
              </div>

              <div style={{ width: "120px" }}>
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Currency
                </label>
                <select
                  name="currency"
                  defaultValue={baseCurrency}
                  className="w-full px-3 py-3 rounded-lg text-sm outline-none appearance-none"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option
                      key={c}
                      value={c}
                      style={{ background: "var(--bg)" }}
                    >
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label
                className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Category
              </label>
              <select
                name="category"
                required
                className="w-full px-4 py-3 rounded-lg text-sm outline-none appearance-none"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                {categories.map((c) => (
                  <option
                    key={c}
                    value={c}
                    style={{ background: "var(--bg)" }}
                  >
                    {CATEGORY_LABELS[c] ?? c}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Description{" "}
                <span
                  className="normal-case tracking-normal font-normal"
                  style={{ color: "var(--text-dim)" }}
                >
                  optional
                </span>
              </label>
              <input
                name="description"
                type="text"
                placeholder="e.g. Lunch at Yerevan café"
                maxLength={300}
                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor =
                    "var(--primary)")
                }
                onBlur={(e) =>
                  ((e.target as HTMLInputElement).style.borderColor =
                    "var(--border)")
                }
              />
            </div>

            {/* Conversion note */}
            <div
              className="flex items-center gap-2 text-xs rounded-lg px-3 py-2.5"
              style={{
                background: "var(--primary-muted)",
                color: "var(--text-accent)",
              }}
            >
              <RefreshCw size={11} />
              Automatically converted to {baseCurrency} at live rates and stored
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2 text-sm px-4 py-3 rounded-lg"
                style={{
                  background: "var(--danger-muted)",
                  border: "1px solid rgba(224,107,107,0.2)",
                  color: "var(--danger)",
                }}
              >
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3 px-7 pb-7"
          >
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm transition-all"
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border-hover)";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border)";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--text-secondary)";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
              style={{ background: "var(--primary)", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => {
                if (!loading)
                  (e.currentTarget as HTMLElement).style.background =
                    "var(--primary-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "var(--primary)";
              }}
            >
              {loading ? "Saving..." : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
