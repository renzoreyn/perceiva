"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowUpDown,
  LineChart,
  Settings,
  LogOut,
} from "lucide-react";
import { logout } from "@/server/actions/auth.actions";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowUpDown },
  { href: "/insights", label: "Insights", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside
      className="w-56 flex flex-col h-screen sticky top-0 flex-shrink-0"
      style={{
        background: "var(--bg-deep)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div
        className="px-5 py-6"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <a href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-playfair font-bold text-white text-sm"
            style={{ background: "var(--primary)" }}
          >
            P
          </div>
          <span
            className="font-playfair font-bold text-base"
            style={{ color: "var(--text-primary)" }}
          >
            Perceiva
          </span>
        </a>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <a
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all"
              style={{
                background: active ? "var(--surface)" : "transparent",
                color: active ? "var(--text-primary)" : "var(--text-dim)",
                borderLeft: active
                  ? "2px solid var(--primary)"
                  : "2px solid transparent",
              }}
            >
              <Icon size={15} />
              {label}
            </a>
          );
        })}
      </nav>

      {/* User */}
      <div
        className="px-4 py-5"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div
          className="text-xs font-medium truncate mb-3"
          style={{ color: "var(--text-secondary)" }}
          title={userName}
        >
          {userName}
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 text-xs transition-colors"
            style={{ color: "var(--text-dim)", background: "none", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--text-secondary)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--text-dim)")
            }
          >
            <LogOut size={13} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
