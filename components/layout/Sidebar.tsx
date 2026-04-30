"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ArrowUpDown, LineChart,
  Settings, LogOut, Plane,
} from "lucide-react";
import { logout } from "@/server/actions/auth.actions";
import { LogoFull, LogoMark } from "@/components/ui/Logo";

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
        className="desktop-sidebar w-52 flex flex-col h-screen sticky top-0 flex-shrink-0"
        style={{
          background: "rgba(8,8,18,0.65)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderRight: "1px solid var(--border)",
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div className="px-5 py-6" style={{ borderBottom: "1px solid var(--border)" }}>
          <a href="/dashboard">
            <LogoFull size={28} />
          </a>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2.5 py-5 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <a
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  background: active ? "rgba(107,143,212,0.13)" : "transparent",
                  color: active ? "var(--text-accent)" : "var(--text-dim)",
                  borderLeft: active ? "2px solid var(--primary)" : "2px solid transparent",
                  fontWeight: active ? 500 : 400,
                }}
              >
                <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </a>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-5" style={{ borderTop: "1px solid var(--border)" }}>
          <p
            className="text-xs mb-3 truncate"
            style={{ color: "var(--text-secondary)", fontWeight: 500 }}
            title={userName}
          >
            {userName}
          </p>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 text-xs transition-colors"
              style={{ color: "var(--text-dim)", background: "none", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-dim)")}
            >
              <LogOut size={13} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="mobile-nav-show fixed bottom-0 left-0 right-0 z-50 items-center justify-around px-2"
        style={{
          background: "rgba(6,6,14,0.88)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderTop: "1px solid var(--border)",
          paddingTop: "10px",
          paddingBottom: "max(10px, env(safe-area-inset-bottom))",
        }}
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <a
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
              style={{
                color: active ? "var(--primary)" : "var(--text-dim)",
                background: active ? "var(--primary-muted)" : "transparent",
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
