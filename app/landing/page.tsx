"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Globe, TrendingUp, Layers, ShieldCheck,
  RefreshCw, BarChart2, Heart
} from "lucide-react";

// ─── Animated counter ────────────────────────────────────────────────────────
function Counter({ to, prefix = "", suffix = "", decimals = 0 }: {
  to: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const dur = 1400;
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(ease * to);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return (
    <span ref={ref}>
      {prefix}{val.toFixed(decimals)}{suffix}
    </span>
  );
}

// ─── Currency perception row ──────────────────────────────────────────────────
const PERCEPTION_ROWS = [
  { currency: "AMD", symbol: "\u058F", amount: 387,    label: "Armenian Dram",    feels: "pocket change" },
  { currency: "IDR", symbol: "Rp",     amount: 15800,  label: "Indonesian Rupiah", feels: "sounds like a lot" },
  { currency: "RUB", symbol: "\u20BD", symbol2: "",    amount: 89,    label: "Russian Ruble",   feels: "" },
  { currency: "CNY", symbol: "\u00A5", amount: 7.24,   label: "Chinese Yuan",     feels: "" },
];

// ─── Feature cards ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Globe,
    title: "Eight currencies, one truth",
    body: "USD, GBP, EUR, CHF, CNY, IDR, AMD, and RUB. Log in any of them. See everything in one unified view.",
  },
  {
    icon: RefreshCw,
    title: "Live exchange rates",
    body: "Every transaction is converted the moment you log it. No stale numbers, no manual math, no guessing.",
  },
  {
    icon: Layers,
    title: "Multiple wallets",
    body: "Separate your AMD salary, your USD freelance income, your IDR spending. Keep them distinct, see them unified.",
  },
  {
    icon: BarChart2,
    title: "Spending budgets",
    body: "Set monthly limits per category. Watch them fill in real time. Get warned before you overshoot.",
  },
  {
    icon: TrendingUp,
    title: "Income and expense tracking",
    body: "Every flow in and out, categorized, dated, searchable. Recurring transactions log themselves.",
  },
  {
    icon: ShieldCheck,
    title: "Your data, your account",
    body: "Sign in with email or Google. Your transactions live in your account and nowhere else.",
  },
];

// ─── Who is it for ────────────────────────────────────────────────────────────
const FOR_WHO = [
  {
    title: "The expat with two salaries",
    body: "Your company pays in USD. Your landlord wants AMD. Your family needs IDR. Perceiva holds all three without losing the thread.",
  },
  {
    title: "The freelancer with global clients",
    body: "One client pays in GBP, another in EUR, another in USD. You live somewhere else entirely. Perceiva converts everything at the moment it lands.",
  },
  {
    title: "The traveler who loses track",
    body: "Spending 12,000 AMD on lunch feels fine until you realize it is the same as 45,000 IDR. Perceiva makes that visible before it becomes a habit.",
  },
];

// ─── Ticker currencies ────────────────────────────────────────────────────────
const TICKER = [
  "1 USD = 387 AMD", "1 USD = Rp 15,800", "1 EUR = $1.09",
  "1 GBP = $1.27", "1 USD = Fr 0.88", "1 USD = \u00A57.24",
  "1 AMD = Rp 40.8", "1 CHF = $1.13", "1 USD = \u20BD89.5",
  "1 EUR = 422 AMD",
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const heroOpacity = Math.max(0, 1 - scrollY / 500);
  const heroY = scrollY * 0.3;

  return (
    <div className="landing-root">
      {/* ── NAV ── */}
      <nav
        className="landing-nav"
        style={{ background: scrollY > 40 ? "rgba(0,0,0,0.72)" : "transparent" }}
      >
        <span className="landing-nav-logo">Perceiva</span>
        <div className="landing-nav-links">
          <a href="#what">What it does</a>
          <a href="#who">Who it is for</a>
          <a href="#perception">The perception gap</a>
        </div>
        <Link href="/signup" className="landing-nav-cta">
          Get started <ArrowRight size={14} />
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero">
        <div
          className="landing-hero-inner"
          style={{ opacity: heroOpacity, transform: `translateY(${heroY}px)` }}
        >
          <p className="landing-hero-eyebrow">Free. Personal. Precise.</p>
          <h1 className="landing-hero-title">
            Money has<br />
            <span className="landing-hero-accent">no accent.</span>
          </h1>
          <p className="landing-hero-sub">
            You earn in one currency, spend in another, and save in a third.
            Perceiva shows you what you actually have, in terms you actually understand.
          </p>
          <div className="landing-hero-actions">
            <Link href="/signup" className="landing-btn-primary">
              Start for free <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="landing-btn-ghost">
              Sign in
            </Link>
          </div>
        </div>

        {/* floating rate cards */}
        <div className="landing-hero-cards" style={{ opacity: heroOpacity }}>
          {[
            { from: "4,700 AMD", to: "$12.13", delay: "0s" },
            { from: "170,000 IDR", to: "$10.76", delay: "0.15s" },
            { from: "£80 GBP", to: "$101.60", delay: "0.3s" },
          ].map((c, i) => (
            <div key={i} className="landing-float-card" style={{ animationDelay: c.delay }}>
              <span className="landing-float-from">{c.from}</span>
              <ArrowRight size={12} className="landing-float-arrow" />
              <span className="landing-float-to">{c.to}</span>
            </div>
          ))}
        </div>

        <div className="landing-hero-glow" />
      </section>

      {/* ── TICKER ── */}
      <div className="landing-ticker-wrap">
        <div className="landing-ticker">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="landing-ticker-item">{t}</span>
          ))}
        </div>
      </div>

      {/* ── PERCEPTION SECTION ── */}
      <section className="landing-section landing-perception" id="perception">
        <div className="landing-section-inner">
          <p className="landing-label">The perception gap</p>
          <h2 className="landing-h2">
            One dollar.<br />Four realities.
          </h2>
          <p className="landing-body-lg">
            The same amount of money looks completely different depending on which currency you are holding.
            Perceiva corrects that gap so you stop treating expensive things as cheap.
          </p>

          <div className="landing-perception-grid">
            <div className="landing-perception-anchor">
              <span className="landing-perception-usd-label">1 USD</span>
              <span className="landing-perception-usd-value">$1.00</span>
              <span className="landing-perception-usd-sub">The anchor</span>
            </div>
            {PERCEPTION_ROWS.map((row) => (
              <div key={row.currency} className="landing-perception-card">
                <div className="landing-perception-flag-row">
                  <span className="landing-perception-code">{row.currency}</span>
                  <span className="landing-perception-name">{row.label}</span>
                </div>
                <span className="landing-perception-amount">
                  {row.symbol}{row.amount.toLocaleString()}
                </span>
                {row.feels && (
                  <span className="landing-perception-feels">{row.feels}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT IT DOES ── */}
      <section className="landing-section landing-features" id="what">
        <div className="landing-section-inner">
          <p className="landing-label">What it does</p>
          <h2 className="landing-h2">
            Every currency.<br />One dashboard.
          </h2>
          <div className="landing-features-grid">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="landing-feature-card">
                  <div className="landing-feature-icon">
                    <Icon size={20} />
                  </div>
                  <h3 className="landing-feature-title">{f.title}</h3>
                  <p className="landing-feature-body">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHO IS IT FOR ── */}
      <section className="landing-section landing-who" id="who">
        <div className="landing-section-inner">
          <p className="landing-label">Who it is for</p>
          <h2 className="landing-h2">
            Built for people<br />who live between currencies.
          </h2>
          <div className="landing-who-grid">
            {FOR_WHO.map((w, i) => (
              <div key={i} className="landing-who-card">
                <span className="landing-who-number">0{i + 1}</span>
                <h3 className="landing-who-title">{w.title}</h3>
                <p className="landing-who-body">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="landing-section landing-stats">
        <div className="landing-section-inner">
          <div className="landing-stats-grid">
            {[
              { value: 8, suffix: "", label: "Currencies supported", decimals: 0 },
              { value: 100, suffix: "%", label: "Free to use", decimals: 0 },
              { value: 5, suffix: " min", label: "To set up", decimals: 0 },
              { value: 0, suffix: "", label: "Mental math required", decimals: 0 },
            ].map((s, i) => (
              <div key={i} className="landing-stat">
                <span className="landing-stat-value">
                  <Counter to={s.value} suffix={s.suffix} decimals={s.decimals} />
                </span>
                <span className="landing-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-section landing-cta">
        <div className="landing-section-inner landing-cta-inner">
          <h2 className="landing-cta-title">
            See your money<br />for what it is.
          </h2>
          <p className="landing-cta-sub">
            Set up in minutes. No credit card. No subscriptions. Just clarity.
          </p>
          <Link href="/signup" className="landing-btn-primary landing-btn-large">
            Create your account <ArrowRight size={18} />
          </Link>
          <Link href="/login" className="landing-cta-login">
            Already have an account? Sign in
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <span className="landing-footer-logo">Perceiva</span>
        <span className="landing-footer-made">
          made with <Heart size={12} className="landing-footer-heart" fill="currentColor" /> by ren
        </span>
      </footer>

      <style>{`
        /* ── Reset & root ── */
        .landing-root {
          min-height: 100vh;
          background: #000;
          color: #f5f5f7;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif;
          overflow-x: hidden;
        }

        /* ── Nav ── */
        .landing-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          height: 56px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.0);
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .landing-nav-logo {
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #f5f5f7;
        }
        .landing-nav-links {
          display: flex;
          gap: 32px;
        }
        .landing-nav-links a {
          font-size: 13px;
          color: rgba(245,245,247,0.7);
          text-decoration: none;
          transition: color 0.2s;
        }
        .landing-nav-links a:hover { color: #f5f5f7; }
        .landing-nav-cta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #f5f5f7;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 980px;
          padding: 7px 18px;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .landing-nav-cta:hover {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.25);
        }

        /* ── Hero ── */
        .landing-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 120px 24px 80px;
          overflow: hidden;
        }
        .landing-hero-glow {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 600px;
          background: radial-gradient(ellipse at center,
            rgba(10, 132, 255, 0.18) 0%,
            rgba(10, 132, 255, 0.06) 40%,
            transparent 70%
          );
          pointer-events: none;
          z-index: 0;
        }
        .landing-hero-inner {
          position: relative;
          z-index: 1;
          max-width: 780px;
          will-change: transform, opacity;
        }
        .landing-hero-eyebrow {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(10, 132, 255, 0.9);
          margin-bottom: 24px;
        }
        .landing-hero-title {
          font-size: clamp(56px, 8vw, 96px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.02;
          color: #f5f5f7;
          margin-bottom: 28px;
        }
        .landing-hero-accent {
          background: linear-gradient(90deg, #0a84ff 0%, #40a9ff 50%, #0a84ff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s linear infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .landing-hero-sub {
          font-size: 19px;
          line-height: 1.6;
          color: rgba(245,245,247,0.6);
          max-width: 560px;
          margin: 0 auto 40px;
          font-weight: 400;
        }
        .landing-hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* floating cards */
        .landing-hero-cards {
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          z-index: 2;
          will-change: opacity;
        }
        .landing-float-card {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 980px;
          padding: 10px 18px;
          font-size: 13px;
          animation: floatUp 0.6s ease both;
          backdrop-filter: blur(12px);
        }
        @keyframes floatUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .landing-float-from { color: rgba(245,245,247,0.5); font-variant-numeric: tabular-nums; }
        .landing-float-arrow { color: rgba(10,132,255,0.7); flex-shrink: 0; }
        .landing-float-to { color: #f5f5f7; font-weight: 600; font-variant-numeric: tabular-nums; }

        /* ── Buttons ── */
        .landing-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #0a84ff;
          color: #fff;
          font-size: 15px;
          font-weight: 500;
          border-radius: 980px;
          padding: 14px 28px;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .landing-btn-primary:hover {
          background: #1a8fff;
          transform: translateY(-1px);
        }
        .landing-btn-primary:active { transform: scale(0.98); }
        .landing-btn-large {
          font-size: 17px;
          padding: 17px 36px;
        }
        .landing-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(245,245,247,0.7);
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
        }
        .landing-btn-ghost:hover { color: #f5f5f7; }

        /* ── Ticker ── */
        .landing-ticker-wrap {
          overflow: hidden;
          border-top: 1px solid rgba(255,255,255,0.07);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          padding: 14px 0;
        }
        .landing-ticker {
          display: flex;
          gap: 48px;
          width: max-content;
          animation: tickerMove 28s linear infinite;
        }
        @keyframes tickerMove {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .landing-ticker-item {
          font-size: 12px;
          font-variant-numeric: tabular-nums;
          color: rgba(245,245,247,0.4);
          letter-spacing: 0.04em;
          white-space: nowrap;
          font-family: "SF Mono", ui-monospace, monospace;
        }

        /* ── Sections ── */
        .landing-section {
          padding: 120px 24px;
        }
        .landing-section-inner {
          max-width: 1080px;
          margin: 0 auto;
        }
        .landing-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(10,132,255,0.8);
          margin-bottom: 20px;
        }
        .landing-h2 {
          font-size: clamp(36px, 5vw, 60px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.08;
          color: #f5f5f7;
          margin-bottom: 24px;
        }
        .landing-body-lg {
          font-size: 18px;
          line-height: 1.65;
          color: rgba(245,245,247,0.55);
          max-width: 560px;
          margin-bottom: 64px;
        }

        /* ── Perception ── */
        .landing-perception {
          background: linear-gradient(180deg, #000 0%, #0a0a0f 100%);
        }
        .landing-perception-grid {
          display: grid;
          grid-template-columns: 1fr repeat(4, 1fr);
          gap: 2px;
          background: rgba(255,255,255,0.06);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .landing-perception-anchor {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 32px;
          background: rgba(10,132,255,0.12);
          border-right: 1px solid rgba(255,255,255,0.06);
          gap: 6px;
        }
        .landing-perception-usd-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(10,132,255,0.7);
        }
        .landing-perception-usd-value {
          font-size: 40px;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #f5f5f7;
          font-variant-numeric: tabular-nums;
        }
        .landing-perception-usd-sub {
          font-size: 12px;
          color: rgba(245,245,247,0.35);
        }
        .landing-perception-card {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px 28px;
          background: rgba(255,255,255,0.02);
          gap: 6px;
          transition: background 0.2s;
        }
        .landing-perception-card:hover {
          background: rgba(255,255,255,0.05);
        }
        .landing-perception-flag-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .landing-perception-code {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: rgba(245,245,247,0.4);
        }
        .landing-perception-name {
          font-size: 11px;
          color: rgba(245,245,247,0.3);
        }
        .landing-perception-amount {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #f5f5f7;
          font-variant-numeric: tabular-nums;
        }
        .landing-perception-feels {
          font-size: 12px;
          color: rgba(245,245,247,0.3);
          font-style: italic;
        }

        /* ── Features ── */
        .landing-features {
          background: #000;
        }
        .landing-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          background: rgba(255,255,255,0.06);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .landing-feature-card {
          padding: 40px 36px;
          background: rgba(255,255,255,0.015);
          transition: background 0.2s;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .landing-feature-card:hover {
          background: rgba(255,255,255,0.04);
        }
        .landing-feature-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(10,132,255,0.12);
          border: 1px solid rgba(10,132,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a84ff;
          flex-shrink: 0;
        }
        .landing-feature-title {
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #f5f5f7;
          line-height: 1.3;
        }
        .landing-feature-body {
          font-size: 14px;
          line-height: 1.65;
          color: rgba(245,245,247,0.45);
        }

        /* ── Who ── */
        .landing-who {
          background: linear-gradient(180deg, #0a0a0f 0%, #000 100%);
        }
        .landing-who-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .landing-who-card {
          padding: 40px 32px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: border-color 0.2s, background 0.2s;
        }
        .landing-who-card:hover {
          border-color: rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.05);
        }
        .landing-who-number {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: rgba(10,132,255,0.6);
          font-family: "SF Mono", ui-monospace, monospace;
        }
        .landing-who-title {
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #f5f5f7;
          line-height: 1.3;
        }
        .landing-who-body {
          font-size: 14px;
          line-height: 1.7;
          color: rgba(245,245,247,0.45);
        }

        /* ── Stats ── */
        .landing-stats {
          background: #000;
          border-top: 1px solid rgba(255,255,255,0.07);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 80px 24px;
        }
        .landing-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          background: rgba(255,255,255,0.06);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .landing-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 48px 24px;
          background: rgba(255,255,255,0.015);
          text-align: center;
        }
        .landing-stat-value {
          font-size: 52px;
          font-weight: 700;
          letter-spacing: -0.04em;
          color: #f5f5f7;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }
        .landing-stat-label {
          font-size: 13px;
          color: rgba(245,245,247,0.4);
          max-width: 120px;
          text-align: center;
          line-height: 1.4;
        }

        /* ── CTA ── */
        .landing-cta {
          background: linear-gradient(180deg, #000 0%, #030712 100%);
          text-align: center;
        }
        .landing-cta-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .landing-cta-title {
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.06;
          color: #f5f5f7;
        }
        .landing-cta-sub {
          font-size: 17px;
          color: rgba(245,245,247,0.5);
          max-width: 400px;
          line-height: 1.6;
          margin-bottom: 8px;
        }
        .landing-cta-login {
          font-size: 14px;
          color: rgba(245,245,247,0.35);
          text-decoration: none;
          transition: color 0.2s;
          margin-top: 4px;
        }
        .landing-cta-login:hover { color: rgba(245,245,247,0.65); }

        /* ── Footer ── */
        .landing-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 48px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .landing-footer-logo {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: rgba(245,245,247,0.35);
        }
        .landing-footer-made {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          color: rgba(245,245,247,0.3);
        }
        .landing-footer-heart {
          color: #ff453a;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
