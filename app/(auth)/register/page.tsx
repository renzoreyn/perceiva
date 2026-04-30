import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateRequest } from "@/lib/auth";
import { register } from "@/server/actions/auth.actions";
import AuthForm from "@/components/auth/AuthForm";
import { LogoFull } from "@/components/ui/Logo";
import AmbientBackground from "@/components/layout/AmbientBackground";

export const metadata: Metadata = { title: "Create Account" };

export default async function RegisterPage() {
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
            Create your account
          </h1>
          <p className="mb-8" style={{ fontSize: "14px", color: "var(--t2)" }}>
            Start seeing what your money actually costs.
          </p>
          <AuthForm mode="register" action={register} />
          <p className="text-center mt-6" style={{ fontSize: "13px", color: "var(--t2)" }}>
            Already have one?{" "}
            <a href="/login" style={{ color: "var(--t-accent)" }}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
