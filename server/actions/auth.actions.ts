"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { generateId } from "lucia";
import { lucia } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RegisterSchema, LoginSchema } from "@/lib/validations";

type ActionResult =
  | { success: true; error?: never }
  | { success: false; error: string };

export async function register(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    baseCurrency: formData.get("baseCurrency") ?? "USD",
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { name, email, password, baseCurrency } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { success: false, error: "An account with this email already exists." };

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = generateId(21);

    await prisma.user.create({
      data: { id: userId, email, name, passwordHash, baseCurrency: baseCurrency as any },
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  } catch (e) {
    console.error("Register error:", e);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  redirect("/dashboard");
}

export async function login(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Timing-safe — always hash even if user not found
    const DUMMY = "$2b$12$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY);

    if (!user || !valid) {
      return { success: false, error: "Invalid email or password." };
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  } catch (e) {
    console.error("Login error:", e);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  try {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value;
    if (sessionId) {
      await lucia.invalidateSession(sessionId);
      const blank = lucia.createBlankSessionCookie();
      cookies().set(blank.name, blank.value, blank.attributes);
    }
  } catch (e) {
    console.error("Logout error:", e);
  }
  redirect("/");
}
