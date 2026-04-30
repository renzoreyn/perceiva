import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateRequest } from "@/lib/auth";
import { register } from "@/server/actions/auth.actions";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Create Account" };

export default async function RegisterPage() {
  const { user } = await validateRequest();
  if (user) redirect("/dashboard");

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-10">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-playfair font-bold text-white text-lg"
            style={{ background: "var(--primary)" }}
          >
            P
          </div>
          <span
            className="font-playfair font-bold text-xl"
            style={{ color: "var(--text-primary)" }}
          >
            Perceiva
          </span>
        </div>

        <div
          className="rounded-2xl border px-10 py-9"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <h1
            className="font-playfair text-2xl font-semibold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Create your account
          </h1>
          <p
            className="text-sm mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Start seeing your money clearly.
          </p>

          <AuthForm mode="register" action={register} />

          <p
            className="text-center text-sm mt-6"
            style={{ color: "var(--text-secondary)" }}
          >
            Already have an account?{" "}
            <a
              href="/login"
              className="transition-colors"
              style={{ color: "var(--text-accent)" }}
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
