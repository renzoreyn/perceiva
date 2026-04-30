"use client";

import { useState } from "react";
import { ShieldCheck, Globe, User, Check, AlertCircle } from "lucide-react";
import { updateUserSettings } from "@/server/actions/settings.actions";
import { SUPPORTED_CURRENCIES, CURRENCY_LABELS, type CurrencyCode } from "@/lib/currency";
import Sidebar from "@/components/layout/Sidebar";
import AmbientBackground from "@/components/layout/AmbientBackground";

interface Props {
  user: {
    name: string | null;
    email: string;
    baseCurrency: string;
  };
}

export default function SettingsClient({ user }: Props) {
  const [selectedCurrency, setSelectedCurrency] = useState(user.baseCurrency);
  const [name, setName] = useState(user.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const fd = new FormData();
    fd.set("name", name);
    fd.set("baseCurrency", selectedCurrency);

    const result = await updateUserSettings(fd);

    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      setError(result.error ?? "Something went wrong");
    }
    setSaving(false);
  }

  return (
    <div className="flex min-h-screen relative" style={{ background: "var(--bg)" }}>
      <AmbientBackground />
      <Sidebar userName={user.name ?? user.email} />

      <main className="flex-1 overflow-auto relative z-10 dashboard-main">
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px" }}>

          <div style={{ marginBottom: "32px" }}>
            <h1 className="font-display text-3xl font-700 mb-1"
              style={{ color: "var(--t1)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Settings
            </h1>
            <p className="text-sm" style={{ color: "var(--t2)" }}>
              Manage your account and preferences.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">

            {/* Profile */}
            <div className="glass-card rounded-2xl p-7">
              <div className="flex items-center gap-2 mb-5" style={{ color: "var(--t2)" }}>
                <User size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">Profile</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--t2)" }}>
                    Display name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--t1)" }}
                    onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--blue)")}
                    onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--border)")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--t2)" }}>
                    Email
                  </label>
                  <input
                    value={user.email}
                    disabled
                    type="email"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none opacity-40 cursor-not-allowed"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--t1)" }}
                  />
                  <p className="text-xs mt-1.5" style={{ color: "var(--t3)" }}>
                    Email cannot be changed after registration.
                  </p>
                </div>
              </div>
            </div>

            {/* Base Currency */}
            <div className="glass-card rounded-2xl p-7">
              <div className="flex items-center gap-2 mb-2" style={{ color: "var(--t2)" }}>
                <Globe size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">Base Currency</span>
              </div>
              <p className="text-xs mb-5" style={{ color: "var(--t3)" }}>
                All transactions convert to this. Changing it does not retroactively convert past records.
              </p>

              <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
                {SUPPORTED_CURRENCIES.map((c) => {
                  const active = selectedCurrency === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedCurrency(c)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
                      style={{
                        background: active ? "rgba(107,143,212,0.12)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${active ? "rgba(107,143,212,0.35)" : "var(--border)"}`,
                        cursor: "pointer",
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.06)", color: "var(--t2)", letterSpacing: "0.3px" }}>
                        {c.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: active ? "var(--t-accent)" : "var(--t1)" }}>{c}</p>
                        <p className="text-xs truncate" style={{ color: "var(--t3)" }}>{CURRENCY_LABELS[c as CurrencyCode]}</p>
                      </div>
                      {active && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "var(--blue)" }}>
                          <Check size={11} color="white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback */}
            {error && (
              <div className="flex items-center gap-2.5 text-sm px-4 py-3 rounded-xl"
                style={{ background: "var(--red-soft)", border: "1px solid rgba(224,92,92,0.2)", color: "var(--red)" }}>
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {saving ? "Saving..." : saved ? (
                <><Check size={14} /> Saved</>
              ) : "Save Changes"}
            </button>
          </form>

          {/* Privacy */}
          <div className="glass-card rounded-2xl p-7 mt-5">
            <div className="flex items-center gap-2 mb-4" style={{ color: "var(--t2)" }}>
              <ShieldCheck size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Privacy</span>
            </div>
            <div className="space-y-2.5">
              {[
                "Your data is never sold or shared with third parties",
                "No analytics or behavioral tracking anywhere",
                "Passwords hashed with bcrypt, never stored plaintext",
                "Sessions expire and are invalidated on sign out",
                "All data is isolated to your account only",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--t2)" }}>
                  <ShieldCheck size={13} className="mt-0.5 flex-shrink-0" style={{ color: "var(--green)" }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
