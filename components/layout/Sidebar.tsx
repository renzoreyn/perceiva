"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowUpDown, LineChart, Settings, LogOut, Plane } from "lucide-react";
import { logout } from "@/server/actions/auth.actions";
import { LogoFull } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV = [
  { href: "/dashboard",    label: "Overview",      icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions",  icon: ArrowUpDown },
  { href: "/trips",        label: "Trips",         icon: Plane },
  { href: "/insights",     label: "Insights",      icon: LineChart },
  { href: "/settings",     label: "Settings",      icon: Settings },
];

export default function Sidebar({ userName }: { userName: string }) {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard" ? path === href : path.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="d-sidebar w-52 flex flex-col h-screen sticky top-0 flex-shrink-0 g2"
        style={{ borderRight: "1px solid var(--border)", zIndex: 40 }}
      >
        <div className="px-5 py-6" style={{ borderBottom: "1px solid var(--border)" }}>
          <a href="/dashboard"><LogoFull size={26} /></a>
        </div>

        <nav className="flex-1 px-2.5 py-5 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <a key={href} href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  background: active ? "var(--blue-soft)" : "transparent",
                  color: active ? "var(--t-accent)" : "var(--t3)",
                  borderLeft: `2px solid ${active ? "var(--blue)" : "transparent"}`,
                  fontWeight: active ? 500 : 400,
                }}
              >
                <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </a>
            );
          })}
        </nav>

        <div className="px-4 py-5" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium truncate" style={{ color: "var(--t2)" }} title={userName}>
              {userName}
            </p>
            <ThemeToggle />
          </div>
          <form action={logout}>
            <button type="submit"
              className="flex items-center gap-2 text-xs transition-colors"
              style={{ color: "var(--t3)", background: "none", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--t2)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--t3)")}
            >
              <LogOut size={13} /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="m-nav fixed bottom-0 left-0 right-0 z-50 items-center justify-around px-2 g3"
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "10px",
          paddingBottom: "max(10px, env(safe-area-inset-bottom))",
        }}
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <a key={href} href={href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
              style={{
                color: active ? "var(--blue)" : "var(--t3)",
                background: active ? "var(--blue-soft)" : "transparent",
                minWidth: "48px",
              }}
            >
              <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
              <span style={{ fontSize: "9px", fontWeight: active ? 600 : 400, letterSpacing: "0.02em" }}>
                {label}
              </span>
            </a>
          );
        })}
      </nav>
    </>
  );
}
