import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/transactions", "/insights", "/settings"];
const AUTH_ONLY = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("perceiva_session");
  const isAuthed = !!session?.value;

  const needsAuth = PROTECTED.some((r) => pathname.startsWith(r));
  const isAuthPage = AUTH_ONLY.some((r) => pathname.startsWith(r));

  if (needsAuth && !isAuthed) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon|.*\\.svg).*)"],
};
