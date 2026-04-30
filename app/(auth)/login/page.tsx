import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateRequest } from "@/lib/auth";
import { login } from "@/server/actions/auth.actions";
import AuthForm from "@/components/auth/AuthForm";
import { LogoFull } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage() {
  const { user } = await validateRequest();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: "var(--bg)" }}>
      <div className="ambient-bg" aria-hidden />
      <div className="ambient-blob3" aria-hidden />

      <div className="relative z-10 w-full max-w-md noise">
        <div className="flex justify-center mb-10">
          <LogoFull size={30} />
        </div>

        <div className="glass-md rounded-2xl px-10 py-9" style={{ border: "1px solid var(--border-md)" }}>
          <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
            style={{ background: "linear-gradient(90deg, transparent, rgba(107,143,212,0.4), transparent)" }} />

          <h1 className="font-display text-2xl font-700 mb-1" style={{ color: "var(--text-primary)", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            Sign in to pick up where you left off.
          </p>

          <AuthForm mode="login" action={login} />

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
            No account yet?{" "}
            <a href="/register" className="transition-colors" style={{ color: "var(--text-accent)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-accent)")}
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
