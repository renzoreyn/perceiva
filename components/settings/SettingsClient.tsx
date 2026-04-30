"use client";

import { useState } from "react";
import { ShieldCheck, Globe, User, Save } from "lucide-react";
import { SUPPORTED_CURRENCIES, CURRENCY_LABELS, type CurrencyCode } from "@/lib/currency";
import Sidebar from "@/components/layout/Sidebar";

interface Props {
  user: {
    name: string | null;
    email: string;
    baseCurrency: string;
  };
}

export default function SettingsClient({ user }: Props) {
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Update settings action would go here
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar userName={user.name ?? user.email} />

      <main className="flex-1 overflow-auto">
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 32px" }}>
          <div style={{ marginBottom: "36px" }}>
            <h1
              className="font-playfair text-3xl font-semibold"
              style={{ color: "var(--text-primary)", marginBottom: "4px" }}
            >
              Settings
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Manage your account and preferences.
            </p>
          </div>

          <div className="space-y-5">
            {/* Profile */}
            <div
              className="rounded-2xl border p-7"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="flex items-center gap-2 mb-5"
                style={{ color: "var(--text-secondary)" }}
              >
                <User size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Profile
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Display Name
                  </label>
                  <input
                    defaultValue={user.name ?? ""}
                    name="name"
                    type="text"
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

                <div>
                  <label
                    className="block text-xs font-medium uppercase tracking-wider mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Email
                  </label>
                  <input
                    value={user.email}
                    type="email"
                    disabled
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none opacity-50 cursor-not-allowed"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <p
                    className="text-xs mt-1.5"
                    style={{ color: "var(--text-dim)" }}
                  >
                    Email cannot be changed after registration.
                  </p>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all"
                  style={{ background: "var(--primary)", border: "none", cursor: "pointer" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "var(--primary-hover)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "var(--primary)")
                  }
                >
                  <Save size={14} />
                  {saved ? "Saved" : "Save Changes"}
                </button>
              </form>
            </div>

            {/* Currency preferences */}
            <div
              className="rounded-2xl border p-7"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="flex items-center gap-2 mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                <Globe size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Base Currency
                </span>
              </div>
              <p
                className="text-xs mb-5"
                style={{ color: "var(--text-dim)" }}
              >
                All transactions are normalized to this currency. Changing this
                does not retroactively convert past transactions.
              </p>

              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <div
                    key={c}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                    style={{
                      background:
                        user.baseCurrency === c
                          ? "var(--primary-muted)"
                          : "var(--bg)",
                      border: `1px solid ${
                        user.baseCurrency === c
                          ? "rgba(107,143,212,0.3)"
                          : "var(--border)"
                      }`,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
                      style={{
                        background: "var(--surface-raised)",
                        color: "var(--text-secondary)",
                        letterSpacing: "0.3px",
                      }}
                    >
                      {c.slice(0, 2)}
                    </div>
                    <div>
                      <div
                        className="text-sm font-medium"
                        style={{
                          color:
                            user.baseCurrency === c
                              ? "var(--text-accent)"
                              : "var(--text-primary)",
                        }}
                      >
                        {c}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {CURRENCY_LABELS[c as CurrencyCode]}
                      </div>
                    </div>
                    {user.baseCurrency === c && (
                      <span
                        className="ml-auto text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--primary-muted)",
                          color: "var(--primary)",
                        }}
                      >
                        Active
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy note */}
            <div
              className="rounded-2xl border p-7"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="flex items-center gap-2 mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                <ShieldCheck size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Privacy
                </span>
              </div>
              <div className="space-y-2">
                {[
                  "Your data is never sold or shared with third parties",
                  "No analytics or behavioral tracking is used",
                  "Passwords are hashed with bcrypt — never stored in plaintext",
                  "Sessions expire and are invalidated on sign-out",
                  "All data is isolated to your account — no cross-user visibility",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2.5 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <ShieldCheck
                      size={13}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: "var(--success)" }}
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
