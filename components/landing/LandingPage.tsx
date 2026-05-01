"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Globe, Lock, ShieldCheck, ArrowRight,
  TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, BarChart3, RefreshCw, Zap,
  Eye, ChevronRight, CircleDot, Minus, Menu, Heart,
} from "lucide-react";
import { LogoFull } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// ── Intro Modal ───────────────────────────────────────────────

function IntroModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div
      className="modal-bg fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="g2 glass-spec anim-in relative w-full max-w-xl rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--border-2)", maxHeight: "90vh" }}>
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg,transparent,rgba(108,144,216,0.5),transparent)" }}
        />
        <div className="flex items-center justify-between px-6 pt-6 pb-5"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--blue)", marginBottom: "4px" }}>
              What is Perceiva?
            </p>
            <h2 className="font-display" style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--t1)" }}>
              Currency perception, corrected.
            </h2>
          </div>
          <button onClick={onClose} className="btn-outline w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0">
            <X size={15} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 space-y-7" style={{ maxHeight: "60vh" }}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe size={12} style={{ color: "var(--blue)" }} />
              <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--blue)" }}>The Problem</span>
            </div>
            <p style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--t2)" }}>
              When you spend across multiple currencies, your brain misjudges value based on the number it sees — not what it actually represents.
              Spending 165,000 IDR feels like a lot. Spending 3,980 AMD feels like nothing.
              Both are roughly <span style={{ color: "var(--t-accent)", fontWeight: 500 }}>$10 USD</span>. That mismatch wrecks budgets quietly.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Eye size={12} style={{ color: "var(--blue)" }} />
              <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--blue)" }}>Built for</span>
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              {[
                { icon: Globe, title: "Expats", desc: "Living in one currency, thinking in another." },
                { icon: Zap, title: "Remote workers", desc: "Paid in USD, spending in AMD." },
                { icon: ArrowRight, title: "Travelers", desc: "Hopping currencies without losing track." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="g1 glass-spec rounded-xl p-4">
                  <Icon size={13} style={{ color: "var(--blue)", marginBottom: "10px" }} />
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--t1)", marginBottom: "4px" }}>{title}</p>
                  <p style={{ fontSize: "12px", color: "var(--t2)", lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={12} style={{ color: "var(--blue)" }} />
              <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--blue)" }}>Privacy</span>
            </div>
            <p style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--t2)", marginBottom: "14px" }}>
              Your financial data belongs to you. No selling, no tracking, no third-party anything.
            </p>
            <div className="flex flex-wrap gap-2">
              {["No data selling","No analytics","Encrypted auth","User-owned data","Zero cross-user visibility","bcrypt passwords"].map((l) => (
                <span key={l} className="g1 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5"
                  style={{ fontSize: "12px", color: "var(--t2)" }}>
                  <CheckCircle size={10} style={{ color: "var(--green)", flexShrink: 0 }} />
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: "12px", color: "var(--t3)" }}>Press Esc to close</span>
          <a href="/register" className="btn-blue inline-flex items-center gap-2 px-5 py-2.5 rounded-xl"
            style={{ fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
            Get Started <ArrowRight size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────

function Nav({ onIntroClick }: { onIntroClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        background: scrolled ? "rgba(9,9,15,0.88)" : "rgba(9,9,15,0.55)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border)",
        transition: "background 0.3s",
      }}
    >
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 20px" }}>
        <div className="flex items-center justify-between" style={{ height: "60px" }}>
          <a href="/"><LogoFull size={24} /></a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-7 list-none">
            {[["The problem","#problem"],["Features","#features"],["Privacy","#trust"]].map(([l,h]) => (
              <li key={l}>
                <a href={h} style={{ fontSize: "14px", color: "var(--t2)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--t1)")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--t2)")}
                >{l}</a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href="/login" className="btn-outline hidden sm:flex px-4 py-2 rounded-xl"
              style={{ fontSize: "13px", textDecoration: "none" }}>
              Sign in
            </a>
            <a href="/register" className="btn-blue hidden sm:flex px-4 py-2 rounded-xl"
              style={{ fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
              Get Started
            </a>
            {/* Mobile menu */}
            <button className="md:hidden btn-outline w-9 h-9 flex items-center justify-center rounded-xl"
              onClick={() => setMenuOpen(o => !o)}>
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden g3 glass-spec" style={{ borderTop: "1px solid var(--border)", padding: "16px 20px 20px" }}>
          <div className="flex flex-col gap-2">
            {[["The problem","#problem"],["Features","#features"],["Privacy","#trust"]].map(([l,h]) => (
              <a key={l} href={h} onClick={() => setMenuOpen(false)}
                style={{ fontSize: "15px", color: "var(--t2)", textDecoration: "none", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                {l}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <a href="/login" className="btn-outline flex-1 py-2.5 rounded-xl text-center"
                style={{ fontSize: "14px", textDecoration: "none" }}>Sign in</a>
              <a href="/register" className="btn-blue flex-1 py-2.5 rounded-xl text-center"
                style={{ fontSize: "14px", fontWeight: 500, textDecoration: "none" }}>Get Started</a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Dashboard Mockup ──────────────────────────────────────────

function MockDashboard() {
  return (
    <div className="g2 glass-spec rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border-2)" }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <span className="font-display" style={{ fontSize: "13px", fontWeight: 600, color: "var(--t1)" }}>
          March Overview · USD
        </span>
        <span className="flex items-center gap-1.5"
          style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "99px", background: "var(--green-soft)", color: "var(--green)", border: "1px solid rgba(61,186,126,0.2)" }}>
          <CircleDot size={7} /> Live
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4">
        {[
          { label: "Net Balance", amount: "$842", sub: "335,800 AMD", up: true },
          { label: "Income", amount: "$2,400", sub: "Stable", up: true },
          { label: "Spent", amount: "$1,557", sub: "8.1% over", up: false },
        ].map((c) => (
          <div key={c.label} className="g1 glass-spec rounded-xl p-3">
            <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--t3)", marginBottom: "6px" }}>{c.label}</p>
            <p className="font-display" style={{ fontSize: "18px", fontWeight: 700, color: "var(--t1)", marginBottom: "2px" }}>{c.amount}</p>
            <div className="flex items-center gap-1" style={{ fontSize: "11px", color: c.up ? "var(--green)" : "var(--red)" }}>
              {c.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {c.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4 space-y-2">
        {[
          { name: "Yerevan Cafe", cat: "Food · AMD", amount: "-3,500 AMD", conv: "$8.82", income: false },
          { name: "Bali Market", cat: "Groceries · IDR", amount: "-85,000 IDR", conv: "$5.22", income: false },
          { name: "Freelance", cat: "Income · USD", amount: "+$800", conv: "201,200 AMD", income: true },
        ].map((tx) => (
          <div key={tx.name} className="g1 glass-spec flex items-center justify-between rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: tx.income ? "var(--green-soft)" : "var(--red-soft)" }}>
                {tx.income
                  ? <TrendingUp size={13} style={{ color: "var(--green)" }} />
                  : <Minus size={13} style={{ color: "var(--red)" }} />}
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--t1)" }}>{tx.name}</p>
                <p style={{ fontSize: "11px", color: "var(--t3)" }}>{tx.cat}</p>
              </div>
            </div>
            <div className="text-right">
              <p style={{ fontSize: "13px", fontWeight: 500, color: tx.income ? "var(--green)" : "var(--red)" }}>{tx.amount}</p>
              <p style={{ fontSize: "11px", color: "var(--t3)" }}>{tx.conv}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Reveal hook ───────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.classList.add("in-view"); },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ── Main ──────────────────────────────────────────────────────

export default function LandingPage() {
  const [introOpen, setIntroOpen] = useState(false);
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal();

  return (
    <>
      {introOpen && <IntroModal onClose={() => setIntroOpen(false)} />}
      <Nav onIntroClick={() => setIntroOpen(true)} />

      <div className="ambient" aria-hidden />
      <div className="ambient-3" aria-hidden />
      <div className="noise-layer" aria-hidden />

      <main style={{ position: "relative", zIndex: 10 }}>

        {/* ── Hero ── */}
        <section style={{ paddingTop: "100px", paddingBottom: "80px", paddingLeft: "20px", paddingRight: "20px" }}>
          <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>

            {/* Intro pill */}
            <button
              onClick={() => setIntroOpen(true)}
              className="g1 glass-spec inline-flex items-center gap-2.5 rounded-full"
              style={{ padding: "7px 16px", fontSize: "13px", color: "var(--t2)", border: "1px solid var(--border-2)", cursor: "pointer", marginBottom: "32px" }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--blue)", boxShadow: "0 0 6px var(--blue)" }} />
              Introducing Perceiva
              <ChevronRight size={12} style={{ color: "var(--t3)" }} />
            </button>

            <div className="inline-flex items-center gap-2 mb-6"
              style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--blue)" }}>
              <span style={{ width: "24px", height: "1px", background: "var(--blue)", opacity: 0.5 }} />
              Personal Finance, Unclouded
              <span style={{ width: "24px", height: "1px", background: "var(--blue)", opacity: 0.5 }} />
            </div>

            <h1 className="font-display"
              style={{ fontSize: "clamp(36px,7vw,68px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em", color: "var(--t1)", marginBottom: "20px" }}>
              See what your money
              <br />
              <span style={{ color: "var(--t-accent)" }}>actually costs.</span>
            </h1>

            <p style={{ fontSize: "clamp(15px,2.5vw,18px)", lineHeight: 1.65, color: "var(--t2)", maxWidth: "460px", margin: "0 auto 36px", fontWeight: 300 }}>
              Perceiva converts every transaction to your base currency in real time. No more misjudging what things cost because the number looks cheap.
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a href="/register" className="btn-blue inline-flex items-center gap-2 rounded-xl"
                style={{ padding: "13px 24px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
                Get Started, free <ArrowRight size={14} />
              </a>
              <a href="#problem" className="btn-outline inline-flex items-center rounded-xl"
                style={{ padding: "13px 24px", fontSize: "14px", textDecoration: "none" }}>
                How it works
              </a>
            </div>

            <div style={{ marginTop: "60px" }}>
              <MockDashboard />
            </div>
          </div>
        </section>

        {/* ── Problem ── */}
        <section id="problem" style={{ padding: "100px 20px" }}>
          <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
            <div ref={r1} className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "48px", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--blue)", marginBottom: "12px" }}>The Problem</p>
                <h2 className="font-display"
                  style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", color: "var(--t1)", marginBottom: "16px" }}>
                  Your brain lies to you about money.
                </h2>
                <p style={{ fontSize: "15px", lineHeight: 1.7, color: "var(--t2)", marginBottom: "12px" }}>
                  Large numbers in weak currencies feel expensive. Small numbers in strong ones feel cheap. Neither is real, but your brain just vibes with whatever digit it sees.
                </p>
                <p style={{ fontSize: "15px", lineHeight: 1.7, color: "var(--t2)" }}>
                  Perceiva strips that away. Every transaction shows you what it costs in your actual terms.
                </p>
              </div>

              <div ref={r2} className="reveal reveal-d2 g1 glass-spec glass-hover rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5" style={{ color: "var(--gold)" }}>
                  <AlertTriangle size={12} />
                  <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Currency Perception Map</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { code: "AM", name: "AMD", amount: "3,980 AMD", usd: "$10.00", ok: true, label: "Accurate" },
                    { code: "ID", name: "IDR", amount: "163,000 IDR", usd: "$10.00", ok: false, label: "Feels cheap" },
                    { code: "US", name: "USD", amount: "$10.00", usd: "$10.00", ok: true, label: "Baseline" },
                    { code: "CN", name: "CNY", amount: "72.5 CNY", usd: "$10.00", ok: false, label: "Feels cheap" },
                  ].map((r) => (
                    <div key={r.name} className="g1 glass-spec flex items-center justify-between rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "var(--t2)", letterSpacing: "0.3px", flexShrink: 0 }}>
                          {r.code}
                        </div>
                        <div>
                          <p style={{ fontSize: "11px", color: "var(--t3)", marginBottom: "2px" }}>{r.name}</p>
                          <p className="font-display" style={{ fontSize: "15px", fontWeight: 600, color: "var(--t1)" }}>{r.amount}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p style={{ fontSize: "11px", color: "var(--t3)", marginBottom: "5px" }}>{r.usd}</p>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          fontSize: "11px", padding: "2px 8px", borderRadius: "99px",
                          background: r.ok ? "var(--green-soft)" : "var(--red-soft)",
                          color: r.ok ? "var(--green)" : "var(--red)",
                          border: `1px solid ${r.ok ? "rgba(61,186,126,0.2)" : "rgba(224,92,92,0.2)"}`,
                        }}>
                          {r.ok ? <CheckCircle size={9} /> : <AlertTriangle size={9} />}
                          {r.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "14px", padding: "12px 14px", borderRadius: "12px", background: "var(--gold-soft)", border: "1px solid rgba(201,170,113,0.15)", fontSize: "12px", lineHeight: 1.6, color: "var(--gold)" }}>
                  All four equal exactly <strong>$10 USD</strong>. Yet each hits your brain differently. Perceiva shows you the truth.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" style={{ padding: "100px 20px", background: "linear-gradient(to bottom, transparent, rgba(108,144,216,0.03), transparent)" }}>
          <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
            <div ref={r3} className="reveal text-center" style={{ maxWidth: "500px", margin: "0 auto 56px" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--blue)", marginBottom: "12px" }}>Features</p>
              <h2 className="font-display" style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", color: "var(--t1)", marginBottom: "14px" }}>
                Everything you need. Nothing extra.
              </h2>
              <p style={{ fontSize: "15px", lineHeight: 1.65, color: "var(--t2)" }}>
                Deliberately minimal. Every feature exists to give you a clearer picture of your money.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "14px" }}>
              {/* Wide card */}
              <div className="g1 glass-spec glass-hover rounded-2xl p-7"
                style={{ gridColumn: "span 2", background: "var(--blue-soft)", border: "1px solid rgba(108,144,216,0.2)" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(108,144,216,0.2)", border: "1px solid rgba(108,144,216,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                  <RefreshCw size={16} style={{ color: "var(--blue)" }} />
                </div>
                <p className="font-display" style={{ fontSize: "17px", fontWeight: 600, color: "var(--t1)", marginBottom: "10px" }}>Live Currency Conversion</p>
                <p style={{ fontSize: "14px", lineHeight: 1.65, color: "var(--t2)", maxWidth: "420px", marginBottom: "16px" }}>
                  Every transaction converts to your base currency the moment you log it. The original amount is always preserved. Rate snapshots are stored per transaction so your history stays accurate even as markets move.
                </p>
                <span style={{ display: "inline-block", fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "6px", background: "var(--blue-soft)", color: "var(--t-accent)" }}>
                  Core feature
                </span>
              </div>

              {[
                { icon: BarChart3, title: "Monthly Recaps", desc: "A calm recap drops on the 1st of each month. Spending patterns, distortion insights, behavioral notes." },
                { icon: Lock, title: "Privacy First", desc: "No analytics. No trackers. No data selling. Your financial data stays yours, period." },
                { icon: Globe, title: "6 Currencies", desc: "USD, EUR, GBP, CNY, IDR, and AMD. Live rates, cached hourly." },
                { icon: Zap, title: "Quick Logging", desc: "Log a transaction in under 10 seconds. Category and description are always optional." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="g1 glass-spec glass-hover rounded-2xl p-6">
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "var(--blue-soft)", border: "1px solid rgba(108,144,216,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    <Icon size={15} style={{ color: "var(--blue)" }} />
                  </div>
                  <p className="font-display" style={{ fontSize: "15px", fontWeight: 600, color: "var(--t1)", marginBottom: "8px" }}>{title}</p>
                  <p style={{ fontSize: "13px", lineHeight: 1.65, color: "var(--t2)" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust ── */}
        <section id="trust" style={{ padding: "100px 20px" }}>
          <div ref={r4} className="reveal" style={{ maxWidth: "1040px", margin: "0 auto" }}>
            <div className="text-center" style={{ marginBottom: "52px" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--blue)", marginBottom: "12px" }}>Privacy</p>
              <h2 className="font-display" style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.025em", color: "var(--t1)" }}>
                Your money stays yours.
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "14px" }}>
              {[
                { icon: Lock, title: "Zero data selling", desc: "No ad partners, no data brokers. Your info is not a product and never will be." },
                { icon: ShieldCheck, title: "No analytics, at all", desc: "No Google Analytics, no behavioral scripts, no third-party monitoring anywhere." },
                { icon: CheckCircle, title: "Encrypted and isolated", desc: "bcrypt-hashed passwords, secure sessions, fully isolated data per user." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="g1 glass-spec glass-hover rounded-2xl p-7">
                  <Icon size={22} style={{ color: "var(--blue)", marginBottom: "18px" }} />
                  <p className="font-display" style={{ fontSize: "15px", fontWeight: 600, color: "var(--t1)", marginBottom: "8px" }}>{title}</p>
                  <p style={{ fontSize: "13px", lineHeight: 1.65, color: "var(--t2)" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: "100px 20px 140px" }}>
          <div style={{ maxWidth: "580px", margin: "0 auto", textAlign: "center" }}>
            <div className="g1 glass-spec glass-hover rounded-2xl" style={{ padding: "clamp(40px,6vw,64px) clamp(24px,5vw,56px)" }}>
              <h2 className="font-display"
                style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 800, lineHeight: 1.18, letterSpacing: "-0.025em", color: "var(--t1)", marginBottom: "14px" }}>
                Stop misjudging your spend.
              </h2>
              <p style={{ fontSize: "15px", lineHeight: 1.65, color: "var(--t2)", marginBottom: "32px", fontWeight: 300 }}>
                Join Perceiva and start seeing your money for what it actually is.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <a href="/register" className="btn-blue inline-flex items-center gap-2 rounded-xl"
                  style={{ padding: "12px 24px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
                  Create free account <ArrowRight size={13} />
                </a>
                <a href="#problem" className="btn-outline rounded-xl"
                  style={{ padding: "12px 24px", fontSize: "14px", textDecoration: "none" }}>
                  Learn more
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "28px 20px" }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <LogoFull size={22} />
          <div style={{ display: "flex", gap: "20px" }}>
            {["Privacy","Security","Contact"].map((l) => (
              <a key={l} href="#" style={{ fontSize: "13px", color: "var(--t3)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--t2)")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--t3)")}
              >{l}</a>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--t3)" }}>
            Made with
            <Heart size={12} style={{ color: "var(--red)", fill: "var(--red)" }} />
            by{" "}
            <a
              href="https://github.com/renzoreyn"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--t2)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--t1)")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--t2)")}
            >
              @Renzoreyn
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
