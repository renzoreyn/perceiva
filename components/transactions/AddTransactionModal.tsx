"use client";

import { useEffect, useState } from "react";
import { X, AlertCircle, RefreshCw } from "lucide-react";
import { createTransaction } from "@/server/actions/transaction.actions";
import { SUPPORTED_CURRENCIES, CURRENCY_LABELS, type CurrencyCode } from "@/lib/currency";
import { CATEGORY_LABELS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/utils";

interface Trip { id: string; name: string; }

interface Props {
  open: boolean;
  onClose: () => void;
  baseCurrency: CurrencyCode;
  trips?: Trip[];
}

export default function AddTransactionModal({ open, onClose, baseCurrency, trips = [] }: Props) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

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
      isRecurring,
      recurringFreq: isRecurring ? (fd.get("recurringFreq") as any) : undefined,
      tripId: (fd.get("tripId") as string) || undefined,
    });

    if (result.success) {
      onClose();
      setType("expense");
      setIsRecurring(false);
      setError(null);
    } else {
      setError(result.error ?? "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass-md glass-shimmer animate-scale-in relative w-full max-w-md rounded-2xl"
        style={{ border: "1px solid var(--border-2)" }}
      >
        <div
          className="flex items-center justify-between px-7 pt-7 pb-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2 className="font-playfair text-xl font-semibold" style={{ color: "var(--t1)" }}>
            Add Transaction
          </h2>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--t3)", background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--t1)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--t3)")}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-7 py-6 space-y-5">
            {/* Type toggle */}
            <div className="flex rounded-xl p-1" style={{ background: "rgba(255,255,255,0.05)" }}>
              {(["expense", "income"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                  style={{
                    background: type === t ? "rgba(108,144,216,0.2)" : "transparent",
                    color: type === t ? "var(--t-accent)" : "var(--t3)",
                    border: "none", cursor: "pointer",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Amount + Currency */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--t2)" }}>
                  Amount
                </label>
                <input name="amount" type="number" step="any" min="0.01" required placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--t1)" }}
                  onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--blue)")}
                  onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--border)")}
                />
              </div>
              <div style={{ width: "110px" }}>
                <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--t2)" }}>
                  Currency
                </label>
                <select name="currency" defaultValue={baseCurrency}
                  className="w-full px-3 py-3 rounded-xl text-sm outline-none appearance-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--t1)" }}
                >
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c} value={c} style={{ background: "#090910" }}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--t2)" }}>
                Category
              </label>
              <select name="category" required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--t1)" }}
              >
                {categories.map((c) => (
                  <option key={c} value={c} style={{ background: "#090910" }}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--t2)" }}>
                Description{" "}
                <span className="normal-case tracking-normal font-normal" style={{ color: "var(--t3)" }}>optional</span>
              </label>
              <input name="description" type="text" placeholder="e.g. Lunch at Yerevan café" maxLength={300}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--t1)" }}
                onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--blue)")}
                onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--border)")}
              />
            </div>

            {/* Trip (if trips exist) */}
            {trips.length > 0 && (
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--t2)" }}>
                  Trip{" "}
                  <span className="normal-case tracking-normal font-normal" style={{ color: "var(--t3)" }}>optional</span>
                </label>
                <select name="tripId"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--t1)" }}
                >
                  <option value="" style={{ background: "#090910" }}>No trip</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id} style={{ background: "#090910" }}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Recurring toggle */}
            <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <RefreshCw size={13} style={{ color: "var(--t3)" }} />
                <span className="text-sm" style={{ color: "var(--t2)" }}>Recurring</span>
              </div>
              <button type="button" onClick={() => setIsRecurring(!isRecurring)}
                className="w-10 h-5 rounded-full transition-all relative"
                style={{ background: isRecurring ? "var(--blue)" : "rgba(255,255,255,0.1)", border: "none", cursor: "pointer" }}
              >
                <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: isRecurring ? "calc(100% - 18px)" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
                />
              </button>
            </div>

            {isRecurring && (
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--t2)" }}>
                  Frequency
                </label>
                <select name="recurringFreq" defaultValue="monthly"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--t1)" }}
                >
                  <option value="daily" style={{ background: "#090910" }}>Daily</option>
                  <option value="weekly" style={{ background: "#090910" }}>Weekly</option>
                  <option value="monthly" style={{ background: "#090910" }}>Monthly</option>
                </select>
              </div>
            )}

            {/* Conversion note */}
            <div className="flex items-center gap-2 text-xs rounded-xl px-3 py-2.5"
              style={{ background: "var(--blue-soft)", color: "var(--t-accent)" }}>
              <RefreshCw size={11} />
              Auto-converted to {baseCurrency} at live rates
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm px-4 py-3 rounded-xl"
                style={{ background: "var(--red-soft)", border: "1px solid rgba(224,92,92,0.2)", color: "var(--red)" }}>
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-7 pb-7">
            <button type="button" onClick={onClose}
              className="btn-ghost-glass px-5 py-2.5 rounded-xl text-sm"
              style={{ cursor: "pointer" }}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="btn-primary-glass px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
              style={{ cursor: "pointer", border: "none" }}
            >
              {loading ? "Saving..." : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
