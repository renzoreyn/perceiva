"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Globe,
  Lock,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  RefreshCw,
  Zap,
  Eye,
  ChevronRight,
  CircleDot,
  Minus,
} from "lucide-react";

// ─── INTRO MODAL ─────────────────────────────────────────────────

function IntroModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(8,8,10,0.85)", backdropFilter: "blur(12px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border animate-scale-in overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Top gradient line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--primary), transparent)",
            opacity: 0.5,
          }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-8 pt-8 pb-6 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <div
              className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: "var(--primary)" }}
            >
              What is Perceiva?
            </div>
            <h2
              className="font-playfair text-2xl font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Currency perception, corrected.
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ color: "var(--text-dim)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                "var(--text-dim)")
            }
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-8 py-7 max-h-[70vh] overflow-y-auto space-y-8">
          {/* What is it */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe size={14} style={{ color: "var(--primary)" }} />
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--primary)" }}
              >
                The Problem
              </span>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              When you live or spend across multiple currencies, your brain
              misjudges value based on the numbers it sees — not what those
              numbers actually represent. Spending 165,000 IDR feels like a
              lot. Spending 3,980 AMD feels like nothing. Both equal roughly{" "}
              <span style={{ color: "var(--text-accent)", fontWeight: 500 }}>
                $10 USD
              </span>
              . This psychological mismatch quietly drives overspending.
            </p>
            <p
              className="text-sm leading-relaxed mt-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Perceiva strips away the illusion. Every transaction is
              normalized to your base currency in real time — so you see what
              every purchase actually costs, regardless of which currency it
              was made in.
            </p>
          </div>

          {/* Who it's for */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Eye size={14} style={{ color: "var(--primary)" }} />
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--primary)" }}
              >
                Who It&apos;s For
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: Globe,
                  title: "Expats & Nomads",
                  desc: "Living in a foreign currency but thinking in your home one.",
                },
                {
                  icon: Zap,
                  title: "Remote Workers",
                  desc: "Earning in one currency, spending in another, constantly.",
                },
                {
                  icon: ArrowRight,
                  title: "Frequent Travelers",
                  desc: "Spending across borders without losing your real budget.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <Icon
                    size={16}
                    className="mb-3"
                    style={{ color: "var(--primary)" }}
                  />
                  <div
                    className="text-sm font-medium mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {title}
                  </div>
                  <div
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={14} style={{ color: "var(--primary)" }} />
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--primary)" }}
              >
                Safety & Privacy
              </span>
            </div>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              Your financial data belongs to you — and only you. Perceiva is
              built privacy-first by design, not as an afterthought.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "No data selling",
                "No analytics tracking",
                "Encrypted authentication",
                "User-owned data only",
                "Zero cross-user visibility",
                "bcrypt password hashing",
              ].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <CheckCircle
                    size={11}
                    style={{ color: "var(--success)", flexShrink: 0 }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-8 py-5 border-t flex items-center justify-between"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="text-xs" style={{ color: "var(--text-dim)" }}>
            Press Esc to close
          </span>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:-translate-y-px"
            style={{ background: "var(--primary)" }}
          >
            Get Started
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────

function Nav({ onIntroClick }: { onIntroClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between transition-all duration-300"
      style={{
        padding: scrolled ? "14px 40px" : "20px 40px",
        background: scrolled
          ? "rgba(14,14,16,0.96)"
          : "rgba(14,14,16,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <a href="/" className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-playfair font-bold text-white text-sm"
          style={{ background: "var(--primary)" }}
        >
          P
        </div>
        <span
          className="font-playfair font-bold text-lg"
          style={{ color: "var(--text-primary)" }}
        >
          Perceiva
        </span>
      </a>

      <ul className="hidden md:flex items-center gap-8 list-none">
        {[
          { label: "The Problem", href: "#problem" },
          { label: "Features", href: "#features" },
          { label: "Insights", href: "#insights" },
          { label: "Privacy", href: "#trust" },
        ].map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              className="text-sm transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "var(--text-secondary)")
              }
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <button
          onClick={onIntroClick}
          className="hidden md:flex items-center gap-1.5 text-sm transition-colors"
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
          About
          <ChevronRight size={13} />
        </button>
        <a
          href="/login"
          className="px-4 py-2 rounded-lg text-sm transition-all"
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor =
              "var(--border-hover)";
            (e.currentTarget as HTMLElement).style.color =
              "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor =
              "var(--border)";
            (e.currentTarget as HTMLElement).style.color =
              "var(--text-secondary)";
          }}
        >
          Sign in
        </a>
        <a
          href="/register"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
          style={{ background: "var(--primary)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "var(--primary-hover)";
            (e.currentTarget as HTMLElement).style.transform =
              "translateY(-1px)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 8px 24px rgba(107,143,212,0.3)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "var(--primary)";
            (e.currentTarget as HTMLElement).style.transform = "none";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          Get Started
        </a>
      </div>
    </nav>
  );
}

// ─── HERO DASHBOARD MOCKUP ────────────────────────────────────────

function HeroDashboardMockup() {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <span
          className="font-playfair text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          March Overview — Normalized to USD
        </span>
        <span
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
          style={{
            background: "var(--success-muted)",
            color: "var(--success)",
            border: "1px solid rgba(76,175,125,0.2)",
          }}
        >
          <CircleDot size={8} />
          Live
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 p-5 pb-4">
        {[
          {
            label: "Net Balance",
            amount: "$842.50",
            sub: "≈ 335,800 AMD",
            change: "+12.4%",
            up: true,
          },
          {
            label: "Total Income",
            amount: "$2,400.00",
            sub: "≈ 60.3M IDR",
            change: "Stable",
            up: true,
          },
          {
            label: "Total Spent",
            amount: "$1,557.50",
            sub: "≈ 391,400 AMD",
            change: "−8.1% target",
            up: false,
          },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl p-4"
            style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
          >
            <div
              className="text-xs uppercase tracking-wider mb-2"
              style={{ color: "var(--text-dim)" }}
            >
              {c.label}
            </div>
            <div
              className="font-playfair text-xl font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {c.amount}
            </div>
            <div className="text-xs mb-2" style={{ color: "var(--primary)" }}>
              {c.sub}
            </div>
            <div
              className="flex items-center gap-1 text-xs"
              style={{
                color: c.up ? "var(--success)" : "var(--danger)",
              }}
            >
              {c.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {c.change}
            </div>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="px-5 pb-5 space-y-2">
        {[
          {
            name: "Yerevan Café",
            meta: "Food & Drink · AMD",
            original: "−3,500 AMD",
            converted: "≈ −$8.82",
            income: false,
          },
          {
            name: "Bali Market",
            meta: "Groceries · IDR",
            original: "−85,000 IDR",
            converted: "≈ −$5.22",
            income: false,
          },
          {
            name: "Freelance Payment",
            meta: "Income · USD",
            original: "+$800.00",
            converted: "≈ 201,200 AMD",
            income: true,
          },
        ].map((tx) => (
          <div
            key={tx.name}
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--surface-raised)" }}
              >
                {tx.income ? (
                  <TrendingUp size={14} style={{ color: "var(--success)" }} />
                ) : (
                  <Minus size={14} style={{ color: "var(--danger)" }} />
                )}
              </div>
              <div>
                <div
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {tx.name}
                </div>
                <div className="text-xs" style={{ color: "var(--text-dim)" }}>
                  {tx.meta}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-sm font-medium"
                style={{
                  color: tx.income ? "var(--success)" : "var(--danger)",
                }}
              >
                {tx.original}
              </div>
              <div className="text-xs" style={{ color: "var(--text-dim)" }}>
                {tx.converted}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── REVEAL HOOK ─────────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("in-view");
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── MAIN LANDING PAGE ───────────────────────────────────────────

export default function LandingPage() {
  const [introOpen, setIntroOpen] = useState(false);

  // Refs for reveal animations
  const r1 = useReveal();
  const r2 = useReveal();
  const r3 = useReveal();
  const r4 = useReveal();
  const r5 = useReveal();

  return (
    <>
      {introOpen && <IntroModal onClose={() => setIntroOpen(false)} />}
      <Nav onIntroClick={() => setIntroOpen(true)} />

      <main>
        {/* ── INTRO TRIGGER ─────────────────────────────────── */}
        <div
          className="flex justify-center"
          style={{ paddingTop: "108px", paddingBottom: "0" }}
        >
          <button
            onClick={() => setIntroOpen(true)}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm transition-all"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "var(--border-hover)";
              (e.currentTarget as HTMLElement).style.color =
                "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "var(--border)";
              (e.currentTarget as HTMLElement).style.color =
                "var(--text-secondary)";
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "var(--primary)",
                boxShadow: "0 0 6px var(--primary)",
              }}
            />
            Introducing Perceiva
            <ChevronRight size={13} style={{ color: "var(--text-dim)" }} />
          </button>
        </div>

        {/* ── HERO ──────────────────────────────────────────── */}
        <section
          className="text-center"
          style={{ padding: "72px 24px 100px", maxWidth: "900px", margin: "0 auto" }}
        >
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-7"
            style={{ color: "var(--primary)" }}
          >
            <span
              style={{
                display: "inline-block",
                width: "28px",
                height: "1px",
                background: "var(--primary)",
                opacity: 0.5,
              }}
            />
            Personal Finance, Corrected
            <span
              style={{
                display: "inline-block",
                width: "28px",
                height: "1px",
                background: "var(--primary)",
                opacity: 0.5,
              }}
            />
          </div>

          <h1
            className="font-playfair font-bold text-balance"
            style={{
              fontSize: "clamp(40px, 6vw, 70px)",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              color: "var(--text-primary)",
              marginBottom: "22px",
            }}
          >
            See your money in
            <br />
            <em style={{ color: "var(--text-accent)", fontStyle: "italic" }}>
              its real value.
            </em>
          </h1>

          <p
            className="text-balance"
            style={{
              fontSize: "17px",
              lineHeight: 1.65,
              color: "var(--text-secondary)",
              maxWidth: "500px",
              margin: "0 auto 38px",
              fontWeight: 300,
            }}
          >
            Perceiva corrects currency perception so you never misjudge your
            spending again — across every currency you live in.
          </p>

          <div className="flex items-center justify-center gap-3">
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all"
              style={{ background: "var(--primary)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "var(--primary-hover)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-1px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 8px 28px rgba(107,143,212,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "var(--primary)";
                (e.currentTarget as HTMLElement).style.transform = "none";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              Get Started — Free
              <ArrowRight size={14} />
            </a>
            <a
              href="#problem"
              className="px-6 py-3 rounded-xl text-sm transition-all"
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border-hover)";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border)";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--text-secondary)";
              }}
            >
              How it works
            </a>
          </div>

          {/* Dashboard mockup */}
          <div style={{ marginTop: "72px" }}>
            <HeroDashboardMockup />
          </div>
        </section>

        {/* ── PROBLEM SECTION ───────────────────────────────── */}
        <section
          id="problem"
          style={{ padding: "120px 32px" }}
        >
          <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
            <div
              className="grid gap-16"
              style={{ gridTemplateColumns: "1fr 1fr", alignItems: "center" }}
            >
              <div ref={r1} className="reveal">
                <div
                  className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "var(--primary)" }}
                >
                  The Problem
                </div>
                <h2
                  className="font-playfair font-bold text-balance"
                  style={{
                    fontSize: "clamp(28px, 3.5vw, 44px)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.8px",
                    color: "var(--text-primary)",
                    marginBottom: "18px",
                  }}
                >
                  Your brain lies to you
                  <br />
                  about money.
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)", marginBottom: "14px" }}
                >
                  Currency distortion is real. When you see large numbers in
                  weaker currencies, your brain signals abundance. When you see
                  small numbers in strong currencies, it signals restraint. The
                  mismatch drives overspending — silently, consistently.
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Perceiva strips the illusion away. Every transaction is
                  normalized. Every purchase is shown as what it actually costs
                  — in your real terms, not in how a number feels.
                </p>
              </div>

              {/* Distortion visual */}
              <div
                ref={r2}
                className="reveal reveal-delay-2 surface-shimmer rounded-2xl border p-7"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div
                  className="flex items-center gap-2 mb-5"
                  style={{ color: "var(--gold)" }}
                >
                  <AlertTriangle size={13} />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Currency Perception Map
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      flag: "AM",
                      name: "Armenian Dram",
                      code: "AMD",
                      amount: "3,980 AMD",
                      usd: "≈ $10.00 USD",
                      status: "accurate",
                    },
                    {
                      flag: "ID",
                      name: "Indonesian Rupiah",
                      code: "IDR",
                      amount: "163,000 IDR",
                      usd: "≈ $10.00 USD",
                      status: "distorted",
                    },
                    {
                      flag: "US",
                      name: "US Dollar",
                      code: "USD",
                      amount: "$10.00 USD",
                      usd: "= $10.00 USD",
                      status: "baseline",
                    },
                    {
                      flag: "CN",
                      name: "Chinese Yuan",
                      code: "CNY",
                      amount: "72.5 CNY",
                      usd: "≈ $10.00 USD",
                      status: "distorted",
                    },
                  ].map((row) => (
                    <div
                      key={row.code}
                      className="flex items-center justify-between rounded-xl px-4 py-3.5 transition-colors"
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{
                            background: "var(--surface-raised)",
                            color: "var(--text-secondary)",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {row.flag}
                        </div>
                        <div>
                          <div
                            className="text-xs"
                            style={{ color: "var(--text-dim)", marginBottom: "2px" }}
                          >
                            {row.code}
                          </div>
                          <div
                            className="font-playfair text-base font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {row.amount}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="text-xs mb-1.5"
                          style={{ color: "var(--text-dim)" }}
                        >
                          {row.usd}
                        </div>
                        {row.status === "accurate" || row.status === "baseline" ? (
                          <span
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                            style={{
                              background: "var(--success-muted)",
                              color: "var(--success)",
                              border: "1px solid rgba(76,175,125,0.2)",
                            }}
                          >
                            <CheckCircle size={9} />
                            {row.status === "baseline" ? "Baseline" : "Accurate"}
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                            style={{
                              background: "var(--danger-muted)",
                              color: "var(--danger)",
                              border: "1px solid rgba(224,107,107,0.2)",
                            }}
                          >
                            <AlertTriangle size={9} />
                            Feels cheap
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-4 rounded-xl px-4 py-3.5 text-xs leading-relaxed"
                  style={{
                    background: "var(--gold-muted)",
                    border: "1px solid rgba(201,170,113,0.15)",
                    color: "var(--gold)",
                  }}
                >
                  All four amounts equal exactly{" "}
                  <strong>$10 USD</strong>. Yet each feels psychologically
                  different. Perceiva shows you the truth — not the feeling.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES SECTION ──────────────────────────────── */}
        <section
          id="features"
          style={{
            padding: "120px 32px",
            background:
              "linear-gradient(to bottom, transparent, var(--bg-deep), transparent)",
          }}
        >
          <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
            <div
              ref={r3}
              className="reveal text-center"
              style={{ maxWidth: "560px", margin: "0 auto 64px" }}
            >
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--primary)" }}
              >
                Features
              </div>
              <h2
                className="font-playfair font-bold"
                style={{
                  fontSize: "clamp(28px, 3.5vw, 44px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.8px",
                  color: "var(--text-primary)",
                  marginBottom: "14px",
                }}
              >
                Everything you need.
                <br />
                Nothing you don&apos;t.
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Perceiva is deliberately minimal. Every feature exists to give
                you financial clarity — not complexity.
              </p>
            </div>

            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: "repeat(3, 1fr)",
                gridTemplateRows: "auto auto",
              }}
            >
              {/* Featured card — spans 2 cols */}
              <div
                className="surface-shimmer rounded-2xl border p-7 transition-all"
                style={{
                  gridColumn: "span 2",
                  background: "var(--primary-muted)",
                  borderColor: "rgba(107,143,212,0.2)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(107,143,212,0.35)";
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(107,143,212,0.2)";
                  (e.currentTarget as HTMLElement).style.transform = "none";
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: "rgba(107,143,212,0.2)",
                    border: "1px solid rgba(107,143,212,0.3)",
                  }}
                >
                  <RefreshCw size={18} style={{ color: "var(--primary)" }} />
                </div>
                <div
                  className="font-playfair text-lg font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Live Currency Normalization
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)", maxWidth: "480px" }}
                >
                  Every transaction is converted to your base currency at the
                  moment of entry using live exchange rates. The original amount
                  is preserved alongside — so you always see both the real cost
                  and the original context. Exchange rate snapshots are stored
                  per transaction for historical accuracy.
                </p>
                <span
                  className="inline-block mt-4 text-xs font-medium px-3 py-1 rounded-md"
                  style={{
                    background: "var(--primary-muted)",
                    color: "var(--text-accent)",
                  }}
                >
                  Core System
                </span>
              </div>

              {[
                {
                  icon: BarChart3,
                  title: "Monthly Recap Cards",
                  desc: "A calm, reflective recap on the 1st of each month — spending patterns, behavioral insights, distortion analysis.",
                },
                {
                  icon: Lock,
                  title: "Privacy-First by Design",
                  desc: "No analytics. No tracking. No data selling. Your financial data is encrypted and owned exclusively by you.",
                },
                {
                  icon: Globe,
                  title: "6 Currencies",
                  desc: "USD, EUR, GBP, CNY, IDR, and AMD — covering the most common multi-currency living patterns.",
                },
                {
                  icon: Zap,
                  title: "Fast Transaction Entry",
                  desc: "Add income or expenses in seconds. Category and description are optional — never required.",
                },
                {
                  icon: Eye,
                  title: "Category Breakdown",
                  desc: "See where your money actually goes — organized by category, normalized to one currency.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border p-6 transition-all"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--border-hover)";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(-2px)";
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--surface-raised)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--border)";
                    (e.currentTarget as HTMLElement).style.transform = "none";
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--surface)";
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: "var(--primary-muted)",
                      border: "1px solid rgba(107,143,212,0.2)",
                    }}
                  >
                    <Icon size={16} style={{ color: "var(--primary)" }} />
                  </div>
                  <div
                    className="font-playfair text-base font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {title}
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INSIGHTS SECTION ──────────────────────────────── */}
        <section id="insights" style={{ padding: "120px 32px" }}>
          <div
            className="grid gap-16"
            style={{
              maxWidth: "1080px",
              margin: "0 auto",
              gridTemplateColumns: "1fr 1fr",
              alignItems: "center",
            }}
          >
            <div ref={r4} className="reveal">
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--primary)" }}
              >
                Monthly Insights
              </div>
              <h2
                className="font-playfair font-bold text-balance"
                style={{
                  fontSize: "clamp(28px, 3.5vw, 44px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.8px",
                  color: "var(--text-primary)",
                  marginBottom: "18px",
                }}
              >
                Reflect on your
                <br />
                <em style={{ color: "var(--text-accent)" }}>real</em> spending.
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)", marginBottom: "14px" }}
              >
                On the first of every month, Perceiva generates a calm,
                thoughtful recap — not a gamified score or an alarm. Just honest
                reflection on what happened with your money and why.
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Currency distortion insights reveal when perception misled you.
                Behavioral patterns show when and how you spend. Month-over-month
                comparison tracks whether you&apos;re building better habits.
              </p>
            </div>

            {/* Recap card mockup */}
            <div
              className="surface-shimmer rounded-2xl border p-7"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-5"
                style={{ color: "var(--primary)" }}
              >
                March 2025 — Monthly Recap
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Total Income", val: "$2,400", color: "var(--success)" },
                  { label: "Total Spent", val: "$1,557", color: "var(--danger)" },
                  { label: "Net Balance", val: "$843", color: "var(--text-primary)" },
                  { label: "Savings Rate", val: "35.1%", color: "var(--success)" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl p-4"
                    style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                  >
                    <div
                      className="text-xs uppercase tracking-wide mb-2"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {s.label}
                    </div>
                    <div
                      className="font-playfair text-xl font-semibold"
                      style={{ color: s.color }}
                    >
                      {s.val}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="rounded-xl p-4 mb-4"
                style={{
                  background: "var(--primary-muted)",
                  border: "1px solid rgba(107,143,212,0.15)",
                }}
              >
                <div
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "var(--primary)" }}
                >
                  <AlertTriangle size={11} />
                  Perception Insight
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--text-accent)" }}
                >
                  48% more was spent in IDR transactions than the USD
                  equivalent suggested at entry time. Currency distortion
                  contributed to ~$210 in untracked overspending this month.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: "Food & Drink", pct: 72 },
                  { name: "Transport", pct: 41 },
                  { name: "Shopping", pct: 28 },
                  { name: "Utilities", pct: 15 },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <div
                      className="text-xs w-24 flex-shrink-0"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {c.name}
                    </div>
                    <div
                      className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: "var(--bg)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${c.pct}%`,
                          background: "var(--primary)",
                          opacity: 0.65,
                        }}
                      />
                    </div>
                    <div
                      className="text-xs w-8 text-right flex-shrink-0"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {c.pct}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST SECTION ─────────────────────────────────── */}
        <section
          id="trust"
          style={{
            padding: "120px 32px",
            background:
              "linear-gradient(to bottom, transparent, var(--bg-deep), transparent)",
          }}
        >
          <div
            ref={r5}
            className="reveal"
            style={{ maxWidth: "1080px", margin: "0 auto" }}
          >
            <div className="text-center mb-14">
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "var(--primary)" }}
              >
                Privacy & Trust
              </div>
              <h2
                className="font-playfair font-bold"
                style={{
                  fontSize: "clamp(28px, 3.5vw, 44px)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.8px",
                  color: "var(--text-primary)",
                }}
              >
                Your money stays yours.
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-5">
              {[
                {
                  icon: Lock,
                  title: "No Data Selling. Ever.",
                  desc: "No advertising partners, no data brokers, no monetization model that depends on your information. Your data is not a product.",
                },
                {
                  icon: ShieldCheck,
                  title: "Zero Analytics Tracking",
                  desc: "No Google Analytics. No behavioral tracking scripts. No third-party monitoring embedded anywhere. You browse privately.",
                },
                {
                  icon: CheckCircle,
                  title: "Encrypted & Isolated",
                  desc: "Passwords are bcrypt-hashed. Sessions are secured. Your data is completely isolated — no other user can ever see your records.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-2xl border p-7 transition-all"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--border-hover)";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--border)";
                    (e.currentTarget as HTMLElement).style.transform = "none";
                  }}
                >
                  <Icon
                    size={24}
                    className="mb-5"
                    style={{ color: "var(--primary)" }}
                  />
                  <div
                    className="font-playfair text-base font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {title}
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ───────────────────────────────────── */}
        <section style={{ padding: "120px 32px 160px" }}>
          <div style={{ maxWidth: "660px", margin: "0 auto", textAlign: "center" }}>
            <div
              className="surface-shimmer rounded-2xl border p-14"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <h2
                className="font-playfair font-bold text-balance"
                style={{
                  fontSize: "clamp(26px, 4vw, 42px)",
                  lineHeight: 1.2,
                  letterSpacing: "-0.8px",
                  color: "var(--text-primary)",
                  marginBottom: "14px",
                }}
              >
                Stop misjudging
                <br />
                <em style={{ color: "var(--text-accent)" }}>your spending.</em>
              </h2>
              <p
                className="text-sm leading-relaxed mb-9"
                style={{
                  color: "var(--text-secondary)",
                  fontWeight: 300,
                }}
              >
                Join Perceiva and start seeing your money as it truly is — not
                as your brain interprets it across currencies.
              </p>
              <div className="flex items-center justify-center gap-3">
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all"
                  style={{ background: "var(--primary)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--primary-hover)";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(-1px)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 8px 28px rgba(107,143,212,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "var(--primary)";
                    (e.currentTarget as HTMLElement).style.transform = "none";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  Create Free Account
                  <ArrowRight size={14} />
                </a>
                <a
                  href="#problem"
                  className="px-6 py-3 rounded-xl text-sm transition-all"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--border-hover)";
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "var(--border)";
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--text-secondary)";
                  }}
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "36px 40px",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ maxWidth: "1080px", margin: "0 auto" }}
        >
          <a href="/" className="flex items-center gap-2.5">
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

          <div className="flex items-center gap-6">
            {["Privacy", "Security", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-xs transition-colors"
                style={{ color: "var(--text-dim)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--text-secondary)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color =
                    "var(--text-dim)")
                }
              >
                {l}
              </a>
            ))}
          </div>

          <div className="text-xs" style={{ color: "var(--text-dim)" }}>
            © {new Date().getFullYear()} Perceiva
          </div>
        </div>
      </footer>
    </>
  );
}
