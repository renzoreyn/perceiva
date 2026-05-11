"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CURRENCIES, type Currency, type ExchangeRates } from "@/types";
import type { User } from "@supabase/supabase-js";

const DISPLAY_PAIRS: { from: Currency; to: Currency }[] = [
  { from: "USD", to: "AMD" },
  { from: "USD", to: "IDR" },
  { from: "USD", to: "EUR" },
  { from: "USD", to: "GBP" },
  { from: "USD", to: "CNY" },
  { from: "USD", to: "CHF" },
  { from: "AMD", to: "IDR" },
  { from: "EUR", to: "AMD" },
];

export default function TopBar({ user }: { user: User }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch("/api/rates?base=USD")
      .then(r => r.json())
      .then(setRates)
      .catch(() => {});
  }, []);

  const tickerItems = rates
    ? DISPLAY_PAIRS.map(({ from, to }) => {
        const fromRate = from === "USD" ? 1 : rates.rates[from];
        const toRate = rates.rates[to];
        const rate = toRate / fromRate;
        const sym = CURRENCIES.find(c => c.code === to)?.symbol ?? to;
        const precision = rate >= 100 ? 0 : rate >= 1 ? 2 : 4;
        return `1 ${from} = ${sym}${rate.toFixed(precision)} ${to}`;
      })
    : [];

  return (
    <header className="h-12 border-b border-border/50 bg-card/60 backdrop-blur-apple flex items-center px-4 gap-4 shrink-0">
      {/* Exchange rate ticker */}
      <div className="flex-1 overflow-hidden">
        {tickerItems.length > 0 ? (
          <div className="flex gap-8 ticker-scroll whitespace-nowrap">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="text-xs text-muted-foreground font-mono tabular-nums">
                {item}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-32 h-3 shimmer rounded" />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="w-4 h-4" />
        </Button>

        {mounted && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <AnimatePresence mode="wait">
              {resolvedTheme === "dark" ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        )}
      </div>
    </header>
  );
}
