import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateRequest } from "@/lib/auth";
import { login } from "@/server/actions/auth.actions";
import AuthForm from "@/components/auth/AuthForm";
import { LogoFull } from "@/components/ui/Logo";
import AmbientBackground from "@/components/layout/AmbientBackground";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage() {
  const { user } = await validateRequest();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: "var(--bg)" }}>
      <AmbientBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-10">
          <LogoFull size={30} />
        </div>
        <div className="g2 glass-spec rounded-2xl px-10 py-9" style={{ border: "1px solid var(--border-2)" }}>
          <h1 className="font-display mb-1" style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.025em", color: "var(--t1)" }}>
            Welcome back
          </h1>
          <p className="mb-8" style={{ fontSize: "14px", color: "var(--t2)" }}>
            Sign in to pick up where you left off.
          </p>
          <AuthForm mode="login" action={login} />
          <p className="text-center mt-6" style={{ fontSize: "13px", color: "var(--t2)" }}>
            No account yet?{" "}
            <a href="/register" style={{ color: "var(--t-accent)" }}>Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
}
