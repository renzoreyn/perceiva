"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { generateId } from "lucia";
import { lucia } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RegisterSchema, LoginSchema } from "@/lib/validations";

type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function register(
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    baseCurrency: formData.get("baseCurrency") ?? "USD",
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
    };
  }

  const { name, email, password, baseCurrency } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      success: false,
      error: "An account with this email already exists.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = generateId(21);

  await prisma.user.create({
    data: {
      id: userId,
      email,
      name,
      passwordHash,
      baseCurrency: baseCurrency as any,
    },
  });

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  redirect("/dashboard");
}

export async function login(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
    };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // Always hash to prevent timing attacks regardless of user existence
  const DUMMY_HASH =
    "$2b$12$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
  const valid = await bcrypt.compare(password, hashToCompare);

  if (!user || !valid) {
    return { success: false, error: "Invalid email or password." };
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value;
  if (sessionId) {
    await lucia.invalidateSession(sessionId);
    const blank = lucia.createBlankSessionCookie();
    cookies().set(blank.name, blank.value, blank.attributes);
  }
  redirect("/");
}
