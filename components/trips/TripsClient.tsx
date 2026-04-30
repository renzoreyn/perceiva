"use client";

import { useState } from "react";
import { Plus, Plane, Trash2, X, AlertCircle } from "lucide-react";
import { createTrip, deleteTrip } from "@/server/actions/trip.actions";
import { SUPPORTED_CURRENCIES, CURRENCY_SYMBOLS, type CurrencyCode } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";
import AmbientBackground from "@/components/layout/AmbientBackground";

type Trip = {
  id: string; name: string; description: string | null;
  baseCurrency: string; startDate: Date | null; endDate: Date | null;
  createdAt: Date; transactionCount: number; totalSpent: number; totalIncome: number;
};

interface Props { trips: Trip[]; userName: string; }

function CreateTripModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await createTrip({
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || undefined,
      baseCurrency: fd.get("baseCurrency") as any,
      startDate: (fd.get("startDate") as string) || undefined,
      endDate: (fd.get("endDate") as string) || undefined,
    });
    if (result.success) { onClose(); }
    else { setError(result.error ?? "Failed"); }
    setLoading(false);
  }

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass-md glass-shimmer animate-scale-in relative w-full max-w-md rounded-2xl"
        style={{ border: "1px solid var(--border-md)" }}>
        <div className="flex items-center justify-between px-7 pt-7 pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="font-playfair text-xl font-semibold" style={{ color: "var(--text-primary)" }}>New Trip</h2>
          <button onClick={onClose} style={{ color: "var(--text-dim)", background: "none", border: "none", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-7 py-6 space-y-4">
            {[
              { label: "Trip Name", name: "name", type: "text", placeholder: "e.g. Bali 2025", required: true },
              { label: "Description", name: "description", type: "text", placeholder: "Optional note", required: false },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  {f.label}
                </label>
                <input name={f.name} type={f.type} placeholder={f.placeholder} required={f.required}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--primary)")}
                  onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--border)")}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Base Currency
              </label>
              <select name="baseCurrency" defaultValue="USD"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c} value={c} style={{ background: "#0a0a0f" }}>{c}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Start Date", name: "startDate" },
                { label: "End Date", name: "endDate" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    {f.label} <span style={{ color: "var(--text-dim)" }}>optional</span>
                  </label>
                  <input name={f.name} type="date"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              ))}
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
                style={{ background: "var(--danger-muted)", color: "var(--danger)" }}>
                <AlertCircle size={13} /> {error}
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 px-7 pb-7">
            <button type="button" onClick={onClose} className="btn-ghost-glass px-5 py-2.5 rounded-xl text-sm" style={{ cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary-glass px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50" style={{ border: "none", cursor: "pointer" }}>
              {loading ? "Creating..." : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TripsClient({ trips, userName }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteTrip(id);
    setDeleting(null);
  }

  return (
    <div className="flex min-h-screen relative" style={{ background: "var(--bg)" }}>
      <AmbientBackground />
      <Sidebar userName={userName} />

      <main className="flex-1 overflow-auto relative z-10 dashboard-main">
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "32px" }}>
            <div>
              <h1 className="font-playfair text-3xl font-semibold" style={{ color: "var(--text-primary)", marginBottom: "4px" }}>Trips</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Track spending per trip, normalized to one currency.</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="btn-primary-glass inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ border: "none", cursor: "pointer" }}>
              <Plus size={15} /> New Trip
            </button>
          </div>

          {trips.length === 0 ? (
            <div className="glass glass-shimmer rounded-2xl p-14 text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <Plane size={20} style={{ color: "var(--text-dim)" }} />
              </div>
              <h2 className="font-playfair text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No trips yet</h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Create a trip to start tracking expenses per destination.
              </p>
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {trips.map((trip) => {
                const sym = CURRENCY_SYMBOLS[trip.baseCurrency as CurrencyCode] ?? "$";
                return (
                  <div key={trip.id}
                    className="glass glass-shimmer glass-hover-glow rounded-2xl p-6 group relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(155,127,232,0.15)", border: "1px solid rgba(155,127,232,0.2)" }}>
                        <Plane size={16} style={{ color: "var(--violet)" }} />
                      </div>
                      <button onClick={() => handleDelete(trip.id)} disabled={deleting === trip.id}
                        className="opacity-0 group-hover:opacity-100 transition-all w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ color: "var(--text-dim)", background: "none", border: "none", cursor: "pointer" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--danger)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <h3 className="font-playfair text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                      {trip.name}
                    </h3>
                    {trip.description && (
                      <p className="text-xs mb-3" style={{ color: "var(--text-dim)" }}>{trip.description}</p>
                    )}
                    {(trip.startDate || trip.endDate) && (
                      <p className="text-xs mb-3" style={{ color: "var(--text-dim)" }}>
                        {trip.startDate ? formatDate(trip.startDate) : "?"} →{" "}
                        {trip.endDate ? formatDate(trip.endDate) : "ongoing"}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                      <div>
                        <div className="text-xs mb-1" style={{ color: "var(--text-dim)" }}>Total spent</div>
                        <div className="font-playfair text-lg font-semibold" style={{ color: "var(--danger)" }}>
                          {sym}{trip.totalSpent.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs mb-1" style={{ color: "var(--text-dim)" }}>Transactions</div>
                        <div className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{trip.transactionCount}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {showCreate && <CreateTripModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
