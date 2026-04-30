"use client";

import { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { SUPPORTED_CURRENCIES, CURRENCY_LABELS } from "@/lib/currency";

type ActionResult =
  | { success: true; error?: never }
  | { success: false; error: string };

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
  action: (formData: FormData) => Promise<ActionResult | undefined>;
}

function Field({ label, name, type = "text", placeholder, hint }: {
  label: string; name: string; type?: string; placeholder?: string; hint?: string;
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPw = type === "password";
  const inputType = isPw ? (show ? "text" : "password") : type;

  return (
    <div>
      <label htmlFor={name} style={{ display: "block", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--t2)", marginBottom: "6px" }}>
        {label}
        {hint && <span style={{ marginLeft: "6px", textTransform: "none", letterSpacing: "normal", fontWeight: 400, color: "var(--t3)" }}>{hint}</span>}
      </label>
      <div className="relative">
        <input
          id={name} name={name} type={inputType} required placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: isPw ? "12px 44px 12px 16px" : "12px 16px",
            borderRadius: "12px",
            fontSize: "14px",
            outline: "none",
            background: "var(--glass-2)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${focused ? "var(--blue)" : "var(--border-2)"}`,
            color: "var(--t1)",
            transition: "border-color 0.2s",
          }}
        />
        {isPw && (
          <button type="button" onClick={() => setShow(v => !v)}
            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--t3)", display: "flex", alignItems: "center" }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AuthForm({ mode, action }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await action(new FormData(e.currentTarget));
    if (result && !result.success) setError(result.error);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {mode === "register" && <Field label="Full Name" name="name" placeholder="Your name" />}
      <Field label="Email" name="email" type="email" placeholder="you@example.com" />
      <Field label="Password" name="password" type="password"
        placeholder={mode === "register" ? "8+ chars, 1 uppercase, 1 number" : "Your password"} />

      {mode === "register" && (
        <div>
          <label htmlFor="baseCurrency" style={{ display: "block", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--t2)", marginBottom: "6px" }}>
            Base Currency
            <span style={{ marginLeft: "6px", textTransform: "none", letterSpacing: "normal", fontWeight: 400, color: "var(--t3)" }}>all spending converts to this</span>
          </label>
          <select id="baseCurrency" name="baseCurrency" defaultValue="USD"
            style={{ width: "100%", padding: "12px 16px", borderRadius: "12px", fontSize: "14px", outline: "none", appearance: "none", background: "var(--glass-2)", border: "1px solid var(--border-2)", color: "var(--t1)" }}>
            {SUPPORTED_CURRENCIES.map(c => (
              <option key={c} value={c} style={{ background: "var(--bg-2)" }}>{c} — {CURRENCY_LABELS[c]}</option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5" style={{ padding: "12px 16px", borderRadius: "12px", background: "var(--red-soft)", border: "1px solid rgba(224,92,92,0.2)", color: "var(--red)", fontSize: "13px" }}>
          <AlertCircle size={14} style={{ marginTop: "1px", flexShrink: 0 }} />
          {error}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="btn-blue w-full py-3 rounded-xl text-sm font-medium disabled:opacity-50"
        style={{ marginTop: "4px" }}>
        {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
      </button>
    </form>
  );
}
