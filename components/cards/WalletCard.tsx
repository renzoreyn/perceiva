"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CARD_THEMES, getCurrencySymbol, formatAmount } from "@/types";
import type { WalletWithStats, Currency } from "@/types";

interface WalletCardProps {
  wallet: WalletWithStats;
  balance?: number;
  className?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

const CHIP_SVG = (
  <svg viewBox="0 0 50 40" className="w-10 h-8 opacity-80">
    <rect x="2" y="2" width="46" height="36" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
    <rect x="10" y="2" width="4" height="36" fill="currentColor" opacity="0.3"/>
    <rect x="36" y="2" width="4" height="36" fill="currentColor" opacity="0.3"/>
    <rect x="2" y="12" width="46" height="4" fill="currentColor" opacity="0.3"/>
    <rect x="2" y="24" width="46" height="4" fill="currentColor" opacity="0.3"/>
    <rect x="14" y="6" width="22" height="28" rx="2" fill="currentColor" opacity="0.2"/>
  </svg>
);

export default function WalletCard({ wallet, className, onClick, size = "md" }: WalletCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const theme = CARD_THEMES.find(t => t.id === wallet.cardColor) ?? CARD_THEMES[0];
  const isLight = theme.textClass === "text-gray-900";

  const sizeClasses = {
    sm: "w-48",
    md: "w-72",
    lg: "w-96",
  };

  const balance = wallet.balanceUsd;
  const symbol = getCurrencySymbol("USD");

  return (
    <motion.div
      className={cn("relative cursor-pointer select-none", sizeClasses[size], className)}
      style={{ perspective: 1000 }}
      onClick={() => { setIsFlipped(!isFlipped); onClick?.(); }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* FRONT */}
        <div
          className={cn(
            "wallet-card w-full shadow-[0_20px_60px_rgba(0,0,0,0.3),0_4px_16px_rgba(0,0,0,0.2)]",
            theme.class,
            theme.textClass
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] z-0"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
          />

          <div className="relative z-10 p-5 h-full flex flex-col justify-between">
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div>
                <p className={cn("text-[10px] font-semibold tracking-[0.15em] uppercase opacity-60", theme.textClass)}>
                  {wallet.emoji ?? ""} {wallet.name}
                </p>
              </div>
              <div className={cn("text-xs font-bold tracking-wider opacity-70", theme.textClass)}>
                PERCEIVA
              </div>
            </div>

            {/* Chip */}
            <div className={cn("flex items-center gap-3", theme.textClass)}>
              <div className={cn("opacity-70", theme.textClass)}>
                {CHIP_SVG}
              </div>
            </div>

            {/* Bottom row */}
            <div className="space-y-2">
              <div>
                <p className={cn("text-[10px] opacity-50 uppercase tracking-wider mb-0.5", theme.textClass)}>Balance (USD)</p>
                <p className={cn("text-2xl font-bold tabular-nums tracking-tight", theme.textClass)}>
                  {balance >= 0 ? "" : "−"}{symbol}{Math.abs(balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className={cn("text-sm font-mono tracking-[0.2em] opacity-70", theme.textClass)}>
                  ●●●● ●●●● ●●●● {Math.abs(wallet.id.charCodeAt(0) * 7 + wallet.id.charCodeAt(1) * 3) % 9999 + 1000}
                </p>
                <p className={cn("text-[10px] opacity-50 uppercase tracking-wider", theme.textClass)}>
                  {wallet.baseCurrency}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className={cn(
            "wallet-card w-full shadow-[0_20px_60px_rgba(0,0,0,0.3),0_4px_16px_rgba(0,0,0,0.2)]",
            "absolute inset-0",
            theme.class,
            theme.textClass
          )}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="relative z-10 h-full flex flex-col">
            {/* Magnetic stripe */}
            <div className={cn("h-10 mt-6 w-full opacity-60", isLight ? "bg-gray-800" : "bg-black/60")} />

            <div className="px-5 py-3 flex-1 space-y-3">
              {/* Signature strip */}
              <div className={cn("h-8 rounded flex items-center px-3", isLight ? "bg-white/60" : "bg-white/10")}>
                <div className="flex gap-1 flex-1">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={cn("flex-1 h-4 rounded-sm opacity-20", isLight ? "bg-gray-800" : "bg-white")}
                      style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)" }}
                    />
                  ))}
                </div>
                <p className={cn("text-sm font-mono ml-2 opacity-60", theme.textClass)}>CVV</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className={cn("rounded-lg p-2 text-center", isLight ? "bg-black/5" : "bg-white/5")}>
                  <p className={cn("text-[9px] uppercase tracking-wider opacity-50", theme.textClass)}>Total In</p>
                  <p className={cn("text-sm font-semibold tabular-nums", theme.textClass)}>
                    ${wallet.totalIncomeUsd.toFixed(0)}
                  </p>
                </div>
                <div className={cn("rounded-lg p-2 text-center", isLight ? "bg-black/5" : "bg-white/5")}>
                  <p className={cn("text-[9px] uppercase tracking-wider opacity-50", theme.textClass)}>Total Out</p>
                  <p className={cn("text-sm font-semibold tabular-nums", theme.textClass)}>
                    ${wallet.totalExpenseUsd.toFixed(0)}
                  </p>
                </div>
              </div>

              <p className={cn("text-[9px] opacity-40 text-center mt-auto", theme.textClass)}>
                Tap to flip · {wallet.transactionCount} transactions
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
