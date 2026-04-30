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

function InputField({
  label,
  name,
  type = "text",
  placeholder,
  required = true,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPw ? "text" : "password") : type;

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs font-medium uppercase tracking-wider mb-1.5"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
        {hint && (
          <span
            className="ml-2 normal-case tracking-normal font-normal"
            style={{ color: "var(--text-dim)" }}
          >
            {hint}
          </span>
        )}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          required={required}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
          style={{
            background: "var(--bg)",
            border: `1px solid ${focused ? "var(--primary)" : "var(--border)"}`,
            color: "var(--text-primary)",
            paddingRight: isPassword ? "44px" : undefined,
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{
              color: "var(--text-dim)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--text-secondary)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")
            }
            tabIndex={-1}
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
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
    const fd = new FormData(e.currentTarget);
    const result = await action(fd);
    if (result && !result.success) setError(result.error);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "register" && (
        <InputField
          label="Full Name"
          name="name"
          placeholder="Your name"
        />
      )}

      <InputField
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
      />

      <InputField
        label="Password"
        name="password"
        type="password"
        placeholder={
          mode === "register"
            ? "Min. 8 chars, 1 uppercase, 1 number"
            : "Your password"
        }
      />

      {mode === "register" && (
        <div>
          <label
            htmlFor="baseCurrency"
            className="block text-xs font-medium uppercase tracking-wider mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Base Currency{" "}
            <span
              className="normal-case tracking-normal font-normal"
              style={{ color: "var(--text-dim)" }}
            >
              — all transactions normalized to this
            </span>
          </label>
          <select
            id="baseCurrency"
            name="baseCurrency"
            defaultValue="USD"
            className="w-full px-4 py-3 rounded-lg text-sm outline-none appearance-none"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c} style={{ background: "var(--bg)" }}>
                {c} — {CURRENCY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-lg text-sm"
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

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg text-sm font-medium text-white transition-all mt-1 disabled:opacity-50"
        style={{ background: "var(--primary)", border: "none", cursor: "pointer" }}
        onMouseEnter={(e) => {
          if (!loading)
            (e.currentTarget as HTMLElement).style.background =
              "var(--primary-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--primary)";
        }}
      >
        {loading
          ? "Please wait..."
          : mode === "login"
          ? "Sign In"
          : "Create Account"}
      </button>
    </form>
  );
}