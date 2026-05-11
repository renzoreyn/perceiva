"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Wallet, ArrowLeftRight, PieChart, Settings, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js";

const NAV_ITEMS = [
  { href: "/dashboard",     label: "Dashboard",    icon: LayoutDashboard },
  { href: "/wallets",       label: "Wallets",      icon: Wallet },
  { href: "/transactions",  label: "Transactions", icon: ArrowLeftRight },
  { href: "/budgets",       label: "Budgets",      icon: PieChart },
];

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const initials = (user.user_metadata?.full_name ?? user.email ?? "U")
    .split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="w-64 h-full flex flex-col border-r border-border/50 bg-card/60 backdrop-blur-apple shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Perceiva</h1>
        </Link>
        <p className="text-[11px] text-muted-foreground mt-0.5 tracking-wide">FINANCE TRACKER</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", active && "text-primary")} />
                {label}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-border/50 space-y-0.5">
        <Link href="/settings">
          <motion.div
            whileHover={{ x: 2 }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              pathname === "/settings"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <Settings className="w-4 h-4 shrink-0" />
            Settings
          </motion.div>
        </Link>

        <Link href="/settings/profile">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary transition-colors cursor-pointer">
            <Avatar className="w-7 h-7">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.user_metadata?.full_name ?? "User"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
