import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { validateRequest } from "@/lib/auth";
import { login } from "@/server/actions/auth.actions";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage() {
  const { user } = await validateRequest();
  if (user) redirect("/dashboard");

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
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
            Welcome back
          </h1>
          <p
            className="text-sm mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            Sign in to your account to continue.
          </p>

          <AuthForm mode="login" action={login} />

          <p
            className="text-center text-sm mt-6"
            style={{ color: "var(--text-secondary)" }}
          >
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="transition-colors"
              style={{ color: "var(--text-accent)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "var(--text-accent)")
              }
            >
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
