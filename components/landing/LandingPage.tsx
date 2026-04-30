"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Globe, Lock, ShieldCheck, ArrowRight, TrendingUp,
  TrendingDown, AlertTriangle, CheckCircle, BarChart3,
  RefreshCw, Zap, Eye, ChevronRight, CircleDot, Minus,
} from "lucide-react";
import { LogoFull, LogoMark } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// ── Intro Modal ───────────────────────────────────────────────────

function IntroModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="modal-bg fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass-md anim-in relative w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--border-2)" }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(108,144,216,0.5), transparent)" }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--blue)" }}>
              What is Perceiva?
            </p>
            <h2 className="font-display text-2xl font-700" style={{ color: "var(--t1)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Currency perception, corrected.
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all btn-ghost"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-7 max-h-[68vh] overflow-y-auto space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe size={13} style={{ color: "var(--blue)" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--blue)" }}>The Problem</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--t2)" }}>
              When you live or spend across multiple currencies, your brain misjudges value based on the numbers it sees, not what those numbers actually represent. Spending 165,000 IDR hits different than spending 3,980 AMD. But both are roughly{" "}
              <span style={{ color: "var(--t-accent)", fontWeight: 500 }}>$10 USD</span>.
              This mismatch quietly wrecks your budget.
            </p>
            <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--t2)" }}>
              Perceiva converts everything to your base currency the moment you log it. You always see the real cost, not the number your brain tricks you with.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Eye size={13} style={{ color: "var(--blue)" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--blue)" }}>Built for</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Globe, title: "Expats and Nomads", desc: "Living in one currency, thinking in another." },
                { icon: Zap, title: "Remote Workers", desc: "Paid in USD, spending in AMD. All the time." },
                { icon: ArrowRight, title: "Frequent Travelers", desc: "Hopping currencies without losing track of your real budget." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="glass rounded-xl p-4">
                  <Icon size={15} className="mb-3" style={{ color: "var(--blue)" }} />
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--t1)" }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--t2)" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={13} style={{ color: "var(--blue)" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--blue)" }}>Privacy</span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--t2)" }}>
              Your financial data is yours. Full stop. No selling, no tracking, no weird third-party stuff.
            </p>
            <div className="flex flex-wrap gap-2">
              {["No data selling", "No analytics", "Encrypted auth", "User-owned data", "Zero cross-user visibility", "bcrypt passwords"].map((label) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg glass" style={{ color: "var(--t2)" }}>
                  <CheckCircle size={10} style={{ color: "var(--green)", flexShrink: 0 }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="px-8 py-5 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
          <span className="text-xs" style={{ color: "var(--t3)" }}>Press Esc to close</span>
          <a href="/register" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium">
            Get Started <ArrowRight size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────

function Nav({ onIntroClick }: { onIntroClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between transition-all duration-300"
      style={{
        padding: scrolled ? "12px 40px" : "20px 40px",
        background: scrolled ? "rgba(8,8,18,0.92)" : "rgba(8,8,18,0.6)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <a href="/"><LogoFull size={26} /></a>

      <ul className="hidden md:flex items-center gap-8 list-none">
        {[
          { label: "The problem", href: "#problem" },
          { label: "Features", href: "#features" },
          { label: "Insights", href: "#insights" },
          { label: "Privacy", href: "#trust" },
        ].map(({ label, href }) => (
          <li key={label}>
            <a href={href} className="text-sm transition-colors" style={{ color: "var(--t2)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--t1)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--t2)")}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <button onClick={onIntroClick}
          className="hidden md:flex items-center gap-1 text-sm transition-colors"
          style={{ color: "var(--t3)", background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--t2)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--t3)")}
        >
          About <ChevronRight size={12} />
        </button>
        <a href="/login" className="btn-ghost px-4 py-2 rounded-xl text-sm">Sign in</a>
        <a href="/register" className="btn-primary px-4 py-2 rounded-xl text-sm font-medium">Get Started</a>
      </div>
    </nav>
  );
}

// ── Dashboard mockup ──────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="glass-md rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-2)" }}>
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <span className="font-display text-sm font-medium" style={{ color: "var(--t1)", fontWeight: 600 }}>
          March Overview · USD
        </span>
        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
          style={{ background: "var(--green-soft)", color: "var(--green)", border: "1px solid rgba(61,184,122,0.2)" }}>
          <CircleDot size={7} /> Live
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 p-5 pb-4">
        {[
          { label: "Net Balance", amount: "$842.50", sub: "335,800 AMD", up: true, change: "+12.4%" },
          { label: "Total Income", amount: "$2,400", sub: "60.3M IDR", up: true, change: "Stable" },
          { label: "Total Spent", amount: "$1,557", sub: "391,400 AMD", up: false, change: "8.1% over target" },
        ].map((c) => (
          <div key={c.label} className="glass rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--t3)" }}>{c.label}</p>
            <p className="font-display text-xl font-700 mb-1" style={{ color: "var(--t1)", fontWeight: 700 }}>{c.amount}</p>
            <p className="text-xs mb-1.5" style={{ color: "var(--blue)" }}>{c.sub}</p>
            <div className="flex items-center gap-1 text-xs" style={{ color: c.up ? "var(--green)" : "var(--red)" }}>
              {c.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {c.change}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-5 space-y-2">
        {[
          { name: "Yerevan Cafe", meta: "Food · AMD", amount: "3,500 AMD", converted: "$8.82", income: false },
          { name: "Bali Market", meta: "Groceries · IDR", amount: "85,000 IDR", converted: "$5.22", income: false },
          { name: "Freelance Pay", meta: "Income · USD", amount: "+$800.00", converted: "201,200 AMD", income: true },
        ].map((tx) => (
          <div key={tx.name} className="flex items-center justify-between glass rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: tx.income ? "var(--green-soft)" : "rgba(255,255,255,0.05)" }}>
                {tx.income
                  ? <TrendingUp size={13} style={{ color: "var(--green)" }} />
                  : <Minus size={13} style={{ color: "var(--red)" }} />}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--t1)" }}>{tx.name}</p>
                <p className="text-xs" style={{ color: "var(--t3)" }}>{tx.meta}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium" style={{ color: tx.income ? "var(--green)" : "var(--red)" }}>{tx.amount}</p>
              <p className="text-xs" style={{ color: "var(--t3)" }}>{tx.converted}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Reveal hook ───────────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("in-view"); },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ── Main ──────────────────────────────────────────────────────────

export default function LandingPage() {
  const [introOpen, setIntroOpen] = useState(false);
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal(), r5 = useReveal();

  return (
    <>
      {introOpen && <IntroModal onClose={() => setIntroOpen(false)} />}
      <Nav onIntroClick={() => setIntroOpen(true)} />

      {/* Ambient blobs */}
      <div className="ambient" aria-hidden />
      <div className="ambient-blob3" aria-hidden />

      <main className="relative z-10 noise">
        {/* Intro pill */}
        <div className="flex justify-center" style={{ paddingTop: "108px" }}>
          <button onClick={() => setIntroOpen(true)}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm transition-all btn-ghost"
            style={{ cursor: "pointer" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--blue)", boxShadow: "0 0 6px var(--blue)" }} />
            Introducing Perceiva
            <ChevronRight size={12} style={{ color: "var(--t3)" }} />
          </button>
        </div>

        {/* Hero */}
        <section className="text-center" style={{ padding: "68px 24px 96px", maxWidth: "880px", margin: "0 auto" }}>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-7"
            style={{ color: "var(--blue)" }}>
            <span style={{ display: "inline-block", width: "24px", height: "1px", background: "var(--blue)", opacity: 0.5 }} />
            Personal Finance, Unclouded
            <span style={{ display: "inline-block", width: "24px", height: "1px", background: "var(--blue)", opacity: 0.5 }} />
          </div>

          <h1 className="font-display font-800 text-balance"
            style={{ fontSize: "clamp(38px,6vw,68px)", lineHeight: 1.08, letterSpacing: "-0.03em", color: "var(--t1)", marginBottom: "22px", fontWeight: 800 }}>
            See what your money
            <br />
            <span style={{ color: "var(--t-accent)" }}>actually costs.</span>
          </h1>

          <p className="text-balance" style={{ fontSize: "17px", lineHeight: 1.65, color: "var(--t2)", maxWidth: "480px", margin: "0 auto 38px", fontWeight: 300 }}>
            Perceiva corrects currency perception so you stop misjudging your spending across AMD, IDR, USD, and beyond.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="/register" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold">
              Get Started, free <ArrowRight size={13} />
            </a>
            <a href="#problem" className="btn-ghost px-6 py-3 rounded-xl text-sm">How it works</a>
          </div>

          <div style={{ marginTop: "68px" }}>
            <DashboardMockup />
          </div>
        </section>

        {/* Problem */}
        <section id="problem" style={{ padding: "110px 32px" }}>
          <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
            <div className="grid gap-14" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "center" }}>
              <div ref={r1} className="reveal">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--blue)" }}>The problem</p>
                <h2 className="font-display font-700 text-balance"
                  style={{ fontSize: "clamp(26px,3.5vw,42px)", lineHeight: 1.15, letterSpacing: "-0.025em", color: "var(--t1)", marginBottom: "18px", fontWeight: 700 }}>
                  Your brain is lying to you about money.
                </h2>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--t2)" }}>
                  Large numbers in weak currencies feel expensive. Small numbers in strong currencies feel cheap. Neither is accurate, but your brain just vibes with the number it sees, not its real value.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--t2)" }}>
                  Perceiva strips that away. Every transaction shows you what it actually costs in your terms.
                </p>
              </div>

              <div ref={r2} className="reveal reveal-d2 g1 glass-spec glass-hover rounded-2xl p-7">
                <div className="flex items-center gap-2 mb-5" style={{ color: "var(--gold)" }}>
                  <AlertTriangle size={13} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Currency Perception Map</span>
                </div>
                <div className="space-y-3">
                  {[
                    { code: "AM", name: "AMD", amount: "3,980 AMD", usd: "$10.00 USD", status: "accurate" },
                    { code: "ID", name: "IDR", amount: "163,000 IDR", usd: "$10.00 USD", status: "distorted" },
                    { code: "US", name: "USD", amount: "$10.00 USD", usd: "$10.00 USD", status: "baseline" },
                    { code: "CN", name: "CNY", amount: "72.5 CNY", usd: "$10.00 USD", status: "distorted" },
                  ].map((row) => (
                    <div key={row.name} className="flex items-center justify-between glass rounded-xl px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ background: "rgba(255,255,255,0.06)", color: "var(--t2)", letterSpacing: "0.3px" }}>
                          {row.code}
                        </div>
                        <div>
                          <p className="text-xs mb-0.5" style={{ color: "var(--t3)" }}>{row.name}</p>
                          <p className="font-display text-base font-600" style={{ color: "var(--t1)", fontWeight: 600 }}>{row.amount}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs mb-1.5" style={{ color: "var(--t3)" }}>{row.usd}</p>
                        {row.status !== "distorted" ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                            style={{ background: "var(--green-soft)", color: "var(--green)", border: "1px solid rgba(61,184,122,0.2)" }}>
                            <CheckCircle size={9} /> {row.status === "baseline" ? "Baseline" : "Accurate"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                            style={{ background: "var(--red-soft)", color: "var(--red)", border: "1px solid rgba(224,92,92,0.2)" }}>
                            <AlertTriangle size={9} /> Feels cheap
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl px-4 py-3.5 text-xs leading-relaxed"
                  style={{ background: "var(--gold-soft)", border: "1px solid rgba(201,170,113,0.15)", color: "var(--gold)" }}>
                  All four amounts equal exactly <strong>$10 USD</strong>. Yet each hits your brain differently. Perceiva shows you the truth.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" style={{ padding: "110px 32px", background: "linear-gradient(to bottom, transparent, rgba(107,143,212,0.03), transparent)" }}>
          <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
            <div ref={r3} className="reveal text-center" style={{ maxWidth: "540px", margin: "0 auto 60px" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--blue)" }}>Features</p>
              <h2 className="font-display font-700" style={{ fontSize: "clamp(26px,3.5vw,42px)", lineHeight: 1.15, letterSpacing: "-0.025em", color: "var(--t1)", marginBottom: "14px", fontWeight: 700 }}>
                Everything you need. Nothing extra.
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--t2)" }}>
                Deliberately minimal. Every feature exists to give you a clearer picture of where your money actually went.
              </p>
            </div>

            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              {/* Wide feature card */}
              <div className="g1 glass-spec glass-hover rounded-2xl p-7" style={{ gridColumn: "span 2", background: "var(--blue-soft)", border: "1px solid rgba(108,144,216,0.2)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(108,144,216,0.2)", border: "1px solid rgba(107,143,212,0.3)" }}>
                  <RefreshCw size={17} style={{ color: "var(--blue)" }} />
                </div>
                <p className="font-display text-lg font-600 mb-2" style={{ color: "var(--t1)", fontWeight: 600 }}>Live Currency Conversion</p>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--t2)", maxWidth: "460px" }}>
                  Every transaction converts to your base currency the moment you log it using live exchange rates. The original amount is always preserved alongside it. Rate snapshots are stored per transaction so your history stays accurate even as markets move.
                </p>
                <span className="text-xs px-3 py-1 rounded-md" style={{ background: "var(--blue-soft)", color: "var(--t-accent)" }}>
                  Core feature
                </span>
              </div>

              {[
                { icon: BarChart3, title: "Monthly Recaps", desc: "A calm, non-gamified recap drops on the 1st of each month. Spending patterns, distortion insights, behavioral notes." },
                { icon: Lock, title: "Privacy First", desc: "No analytics. No trackers. No data selling. Your financial data stays yours." },
                { icon: Globe, title: "6 Currencies", desc: "USD, EUR, GBP, CNY, IDR, and AMD. Live rates, cached hourly." },
                { icon: Zap, title: "Quick Logging", desc: "Log a transaction in under 10 seconds. Category and description are always optional." },
                { icon: Eye, title: "Category Breakdown", desc: "See where spending actually went, all in one currency so comparisons are honest." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="g1 glass-spec glass-hover rounded-2xl p-6">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "var(--blue-soft)", border: "1px solid rgba(108,144,216,0.2)" }}>
                    <Icon size={15} style={{ color: "var(--blue)" }} />
                  </div>
                  <p className="font-display text-base font-600 mb-2" style={{ color: "var(--t1)", fontWeight: 600 }}>{title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--t2)" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Insights */}
        <section id="insights" style={{ padding: "110px 32px" }}>
          <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
            <div className="grid gap-14" style={{ gridTemplateColumns: "1fr 1fr", alignItems: "center" }}>
              <div ref={r4} className="reveal">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--blue)" }}>Monthly Insights</p>
                <h2 className="font-display font-700 text-balance"
                  style={{ fontSize: "clamp(26px,3.5vw,42px)", lineHeight: 1.15, letterSpacing: "-0.025em", color: "var(--t1)", marginBottom: "18px", fontWeight: 700 }}>
                  Reflect on your <span style={{ color: "var(--t-accent)" }}>actual</span> spending.
                </h2>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--t2)" }}>
                  On the 1st of every month, a calm recap surfaces automatically. No scores, no alarm bells. Just an honest look at what happened with your money and why.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--t2)" }}>
                  Currency distortion notes show when perception misled you. Behavioral patterns track when and how you spend. Month-over-month comparison keeps tabs on whether habits are actually shifting.
                </p>
              </div>

              <div className="g1 glass-spec glass-hover rounded-2xl p-7">
                <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--blue)" }}>March 2025 Recap</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: "Income", val: "$2,400", color: "var(--green)" },
                    { label: "Spent", val: "$1,557", color: "var(--red)" },
                    { label: "Net", val: "$843", color: "var(--t1)" },
                    { label: "Savings", val: "35.1%", color: "var(--green)" },
                  ].map((s) => (
                    <div key={s.label} className="glass rounded-xl p-4">
                      <p className="text-xs uppercase tracking-wide mb-2" style={{ color: "var(--t3)" }}>{s.label}</p>
                      <p className="font-display text-xl font-700" style={{ color: s.color, fontWeight: 700 }}>{s.val}</p>
                    </div>
                  ))}
                </div>
                <div className="glass rounded-xl p-4 mb-4"
                  style={{ background: "var(--blue-soft)", border: "1px solid var(--blue-soft)" }}>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--blue)" }}>
                    <AlertTriangle size={10} /> Perception Alert
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--t-accent)" }}>
                    48% more was spent in IDR transactions than the USD equivalent looked like at the time. Currency distortion contributed to roughly $210 in untracked overspend this month.
                  </p>
                </div>
                <div className="space-y-2.5">
                  {[
                    { name: "Food and Drink", pct: 72 },
                    { name: "Transport", pct: 41 },
                    { name: "Shopping", pct: 28 },
                    { name: "Utilities", pct: 15 },
                  ].map((c) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <p className="text-xs w-24 flex-shrink-0" style={{ color: "var(--t2)" }}>{c.name}</p>
                      <div className="ptrack flex-1">
                        <div className="pfill" style={{ width: `${c.pct}%`, background: "var(--blue)", boxShadow: "0 0 8px var(--primary-glow)" }} />
                      </div>
                      <p className="text-xs w-8 text-right flex-shrink-0" style={{ color: "var(--t3)" }}>{c.pct}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section id="trust" style={{ padding: "110px 32px", background: "linear-gradient(to bottom, transparent, rgba(155,127,232,0.03), transparent)" }}>
          <div ref={r5} className="reveal" style={{ maxWidth: "1060px", margin: "0 auto" }}>
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--blue)" }}>Privacy</p>
              <h2 className="font-display font-700" style={{ fontSize: "clamp(26px,3.5vw,42px)", lineHeight: 1.15, letterSpacing: "-0.025em", color: "var(--t1)", fontWeight: 700 }}>
                Your money stays yours.
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {[
                { icon: Lock, title: "Zero data selling", desc: "No ad partners, no brokers, no monetization model that touches your data. Your info is not a product." },
                { icon: ShieldCheck, title: "No analytics at all", desc: "No Google Analytics. No behavioral tracking. No third-party scripts watching what you do. None." },
                { icon: CheckCircle, title: "Encrypted and isolated", desc: "Passwords are bcrypt-hashed. Sessions are secured. Your data is fully isolated from every other user." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="g1 glass-spec glass-hover rounded-2xl p-7">
                  <Icon size={22} className="mb-5" style={{ color: "var(--blue)" }} />
                  <p className="font-display text-base font-600 mb-2" style={{ color: "var(--t1)", fontWeight: 600 }}>{title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--t2)" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "110px 32px 140px" }}>
          <div style={{ maxWidth: "620px", margin: "0 auto", textAlign: "center" }}>
            <div className="g1 glass-spec glass-hover rounded-2xl p-14">
              <h2 className="font-display font-800 text-balance"
                style={{ fontSize: "clamp(24px,4vw,40px)", lineHeight: 1.2, letterSpacing: "-0.025em", color: "var(--t1)", marginBottom: "14px", fontWeight: 800 }}>
                Stop misjudging your spend.
              </h2>
              <p className="text-sm leading-relaxed mb-9" style={{ color: "var(--t2)", fontWeight: 300 }}>
                Join Perceiva and start seeing your money for what it actually is, not what your brain thinks it looks like.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <a href="/register" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold">
                  Create free account <ArrowRight size={13} />
                </a>
                <a href="#problem" className="btn-ghost px-6 py-3 rounded-xl text-sm">Learn more</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 40px" }}>
        <div className="flex items-center justify-between flex-wrap gap-4" style={{ maxWidth: "1060px", margin: "0 auto" }}>
          <LogoFull size={24} />
          <div className="flex items-center gap-6">
            {["Privacy", "Security", "Contact"].map((l) => (
              <a key={l} href="#" className="text-xs transition-colors" style={{ color: "var(--t3)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--t2)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--t3)")}
              >
                {l}
              </a>
            ))}
          </div>
          <p className="text-xs" style={{ color: "var(--t3)" }}>2025 Perceiva</p>
        </div>
      </footer>
    </>
  );
}
