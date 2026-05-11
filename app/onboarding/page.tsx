"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCIES, CARD_THEMES } from "@/types";
import type { Currency, CardThemeId } from "@/types";
import WalletCard from "@/components/cards/WalletCard";
import { cn } from "@/lib/utils";

const STEPS = ["welcome", "currency", "wallet", "done"] as const;
type Step = typeof STEPS[number];

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [direction, setDirection] = useState(1);
  const [homeCurrency, setHomeCurrency] = useState<Currency>("USD");
  const [walletName, setWalletName] = useState("Main Wallet");
  const [walletCurrency, setWalletCurrency] = useState<Currency>("USD");
  const [cardColor, setCardColor] = useState<CardThemeId>("card-space");
  const [emoji, setEmoji] = useState("💳");
  const [saving, setSaving] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  function goNext() {
    setDirection(1);
    setStep(STEPS[stepIndex + 1]);
  }
  function goPrev() {
    setDirection(-1);
    setStep(STEPS[stepIndex - 1]);
  }

  async function handleFinish() {
    setSaving(true);
    // Create first wallet
    await fetch("/api/wallets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: walletName,
        baseCurrency: walletCurrency,
        cardColor,
        emoji,
      }),
    });
    setSaving(false);
    router.push("/dashboard");
  }

  const previewWallet = {
    id: "preview", name: walletName || "My Wallet", baseCurrency: walletCurrency,
    cardColor, cardStyle: "dark", emoji: emoji || null, isDefault: true,
    totalIncomeUsd: 0, totalExpenseUsd: 0, balanceUsd: 0, transactionCount: 0,
  };

  return (
    <div className="w-full max-w-lg">
      {/* Progress */}
      <div className="flex gap-1.5 mb-8 justify-center">
        {STEPS.map((s, i) => (
          <div key={s} className={cn(
            "h-1 rounded-full transition-all duration-500",
            i <= stepIndex ? "bg-primary" : "bg-border",
            i === stepIndex ? "w-8" : "w-4"
          )} />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {step === "welcome" && (
            <div className="apple-card p-8 text-center space-y-6">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
                <h1 className="text-4xl font-bold tracking-tight">Welcome to Perceiva</h1>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  The finance tracker that helps you <span className="text-foreground font-medium">understand what your money is actually worth</span> — no matter which currency you use.
                </p>
              </motion.div>
              <div className="grid grid-cols-3 gap-3 text-left">
                {[
                  { emoji: "💱", title: "8 Currencies", desc: "USD, EUR, AMD, IDR and more" },
                  { emoji: "📊", title: "Live Rates", desc: "Real-time conversion on every log" },
                  { emoji: "🎯", title: "Budgets", desc: "Spending limits that make sense" },
                ].map(f => (
                  <div key={f.title} className="bg-secondary/60 rounded-2xl p-3 space-y-1">
                    <span className="text-xl">{f.emoji}</span>
                    <p className="text-xs font-semibold">{f.title}</p>
                    <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>
              <Button size="lg" className="w-full gap-2" onClick={goNext}>
                Get started <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {step === "currency" && (
            <div className="apple-card p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Home currency</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  This is your main reference currency. All transactions will show their equivalent in this currency.
                </p>
              </div>
              <div className="space-y-3">
                {CURRENCIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => setHomeCurrency(c.code)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 text-left",
                      homeCurrency === c.code
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-border/80 hover:bg-secondary/50"
                    )}
                  >
                    <span className="text-2xl">{c.flag}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{c.code}</p>
                      <p className="text-xs text-muted-foreground">{c.name}</p>
                    </div>
                    <span className="text-lg font-medium text-muted-foreground">{c.symbol}</span>
                    {homeCurrency === c.code && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={goPrev} className="gap-2"><ChevronLeft className="w-4 h-4" /></Button>
                <Button className="flex-1 gap-2" onClick={goNext}>Continue <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}

          {step === "wallet" && (
            <div className="apple-card p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Create your first wallet</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  This is where your transactions will live. You can create more later.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Wallet name</Label>
                    <Input value={walletName} onChange={e => setWalletName(e.target.value)} placeholder="Main Wallet" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Emoji</Label>
                    <Input value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={2} placeholder="💳" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Currency</Label>
                    <Select value={walletCurrency} onValueChange={v => setWalletCurrency(v as Currency)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => (
                          <SelectItem key={c.code} value={c.code}>
                            <span className="flex items-center gap-2">{c.flag} {c.code}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Card style</Label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {CARD_THEMES.map(theme => (
                        <button key={theme.id} onClick={() => setCardColor(theme.id as CardThemeId)}
                          className={cn(
                            "h-8 rounded-xl text-[10px] font-medium transition-all border-2",
                            theme.class, theme.textClass,
                            cardColor === theme.id ? "border-primary scale-105" : "border-transparent opacity-60 hover:opacity-100"
                          )}>
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-3">
                  <WalletCard wallet={previewWallet} size="sm" />
                  <p className="text-[10px] text-muted-foreground">Tap to flip</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={goPrev} className="gap-2"><ChevronLeft className="w-4 h-4" /></Button>
                <Button className="flex-1 gap-2" onClick={goNext} disabled={!walletName.trim()}>
                  Almost done <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="apple-card p-8 text-center space-y-6">
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-green-500" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">You&apos;re all set!</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Your first wallet is ready. Head to the dashboard and start logging your transactions.
                </p>
              </div>
              <div className="bg-secondary/60 rounded-2xl p-4 text-left space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick tip</p>
                <p className="text-sm">
                  When you log 4,700 AMD, Perceiva will show you it&apos;s actually ~$12 USD (or ~Rp 190,000 IDR). That&apos;s the perception shift.
                </p>
              </div>
              <Button size="xl" className="w-full gap-2" onClick={handleFinish} disabled={saving}>
                {saving
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <>Go to dashboard <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
