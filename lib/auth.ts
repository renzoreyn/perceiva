import { Lucia } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "./prisma";
import { cookies } from "next/headers";
import { cache } from "react";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "perceiva_session",
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => ({
    email: attributes.email,
    name: attributes.name,
    baseCurrency: attributes.baseCurrency,
  }),
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
      name: string | null;
      baseCurrency: string;
    };
  }
}

export const validateRequest = cache(async () => {
  const sessionId =
    cookies().get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) return { user: null, session: null };

  const result = await lucia.validateSession(sessionId);

  try {
    if (result.session?.fresh) {
      const cookie = lucia.createSessionCookie(result.session.id);
      cookies().set(cookie.name, cookie.value, cookie.attributes);
    }
    if (!result.session) {
      const blank = lucia.createBlankSessionCookie();
      cookies().set(blank.name, blank.value, blank.attributes);
    }
  } catch {
    // read-only cookies during static rendering — safe to ignore
  }

  return result;
});
