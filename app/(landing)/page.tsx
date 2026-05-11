"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Globe, TrendingUp, Wallet, PieChart,
  RefreshCw, ShieldCheck, Heart, Users, Zap,
  ArrowUpRight, ArrowDownLeft, Eye
} from "lucide-react";

const CURRENCIES = [
  { code: "AMD", symbol: "֏", amount: "4,700", label: "feels like pocket change" },
  { code: "IDR", symbol: "Rp", amount: "170,000", label: "is not nothing" },
  { code: "USD", symbol: "$", amount: "12.16", label: "is the truth" },
];

const FEATURES = [
  {
    icon: Globe,
    title: "8 Currencies, One Truth",
    body: "USD, GBP, EUR, CHF, CNY, IDR, AMD, RUB. Log in any of them. See everything in one unified view.",
  },
  {
    icon: RefreshCw,
    title: "Live Exchange Rates",
    body: "Every transaction converts in real-time the moment you log it. No manual updates. No stale numbers.",
  },
  {
    icon: Wallet,
    title: "Multiple Wallets",
    body: "Separate your accounts. One for salary, one for freelance, one for daily spending. All talking to each other.",
  },
  {
    icon: PieChart,
    title: "Budget Limits",
    body: "Set monthly ceilings per category. Watch them fill up in real time so you never blow past a limit without knowing.",
  },
  {
    icon: TrendingUp,
    title: "Spending Clarity",
    body: "See your income vs expenses over time. Understand your savings rate. Know where every dollar actually went.",
  },
  {
    icon: Zap,
    title: "Recurring Transactions",
    body: "Mark your salary, rent, or subscriptions as recurring. They log themselves so your history stays complete.",
  },
];

const FOR_WHO = [
  {
    icon: Globe,
    who: "The expat",
    desc: "Living abroad, paid in a foreign currency, spending in another. Perceiva makes all three feel real.",
  },
  {
    icon: Users,
    who: "The remote worker",
    desc: "USD salary, local expenses. You know the numbers but you have never really felt them until now.",
  },
  {
    icon: ArrowUpRight,
    who: "The freelancer",
    desc: "Clients in different countries, invoices in different currencies, taxes in yet another. One place for all of it.",
  },
  {
    icon: Eye,
    who: "Anyone who has ever felt rich in the wrong currency",
    desc: "That feeling when 50,000 sounds like a lot but is barely enough for dinner. Perceiva fixes the perception.",
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [activeRate, setActiveRate] = useState(0);

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setActiveRate(r => (r + 1) % CURRENCIES.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden" style={{ fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Grain overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "128px" }}
      />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-5"
        style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.9) 0%, transparent 100%)", backdropFilter: "blur(12px)" }}>
        <span className="text-lg font-semibold tracking-tight">Perceiva</span>
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/signup"
            className="text-sm font-medium bg-white text-black px-5 py-2 rounded-full hover:bg-white/90 transition-all active:scale-95">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 overflow-hidden">

        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(10,132,255,0.08) 0%, transparent 70%)" }} />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(48,209,88,0.04) 0%, transparent 70%)" }} />

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/50 mb-10 backdrop-blur-sm"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
            background: "rgba(255,255,255,0.03)"
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live exchange rates. Always.
        </div>

        {/* Headline */}
        <h1
          className="text-[clamp(48px,8vw,96px)] font-bold tracking-[-0.04em] leading-[0.95] max-w-4xl"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.95)" }}>Money feels</span>
          <br />
          <span style={{ background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.4) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            different
          </span>
          <br />
          <span style={{ color: "rgba(255,255,255,0.95)" }}>everywhere.</span>
        </h1>

        <p
          className="mt-8 text-[clamp(16px,2vw,20px)] text-white/50 max-w-xl leading-relaxed font-light"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.7s ease 0.35s, transform 0.7s ease 0.35s",
          }}
        >
          Perceiva shows you what your money is actually worth, across every currency you live in.
        </p>

        {/* CTA */}
        <div
          className="mt-10 flex items-center gap-3"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.7s ease 0.45s, transform 0.7s ease 0.45s",
          }}
        >
          <Link href="/signup"
            className="group flex items-center gap-2 bg-white text-black font-semibold px-7 py-3.5 rounded-full text-sm hover:bg-white/90 transition-all active:scale-95">
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/login"
            className="text-sm text-white/50 hover:text-white px-5 py-3.5 rounded-full transition-colors border border-white/10 hover:border-white/20">
            Sign in
          </Link>
        </div>

        {/* Perception demo */}
        <div
          className="mt-20 relative"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.7s ease 0.6s",
          }}
        >
          <p className="text-xs text-white/25 uppercase tracking-widest mb-6 font-medium">The same transaction</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {CURRENCIES.map((c, i) => (
              <div key={c.code}
                className="relative px-6 py-4 rounded-2xl border transition-all duration-500"
                style={{
                  background: activeRate === i ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.02)",
                  borderColor: activeRate === i ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                  transform: activeRate === i ? "scale(1.04)" : "scale(1)",
                }}
              >
                <p className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: activeRate === i ? "white" : "rgba(255,255,255,0.35)" }}>
                  {c.symbol}{c.amount}
                </p>
                <p className="text-[11px] mt-1 font-medium" style={{ color: activeRate === i ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)" }}>
                  {c.code} — {c.label}
                </p>
                {activeRate === i && (
                  <div className="absolute -bottom-px left-4 right-4 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(10,132,255,0.8), transparent)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statement section */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(10,132,255,0.04) 0%, transparent 70%)" }} />
        <FadeIn className="max-w-4xl mx-auto text-center">
          <p className="text-[clamp(28px,4vw,52px)] font-semibold tracking-tight leading-[1.15]" style={{ color: "rgba(255,255,255,0.9)" }}>
            4,700 AMD sounds cheap.
            <br />
            <span style={{ color: "rgba(255,255,255,0.3)" }}>
              It is Rp 170,000. It is not cheap.
            </span>
          </p>
          <p className="mt-8 text-lg text-white/40 max-w-2xl mx-auto leading-relaxed font-light">
            Your brain anchors to the number, not the value. Perceiva recalibrates that. Every single time you log a transaction, you see the truth.
          </p>
        </FadeIn>
      </section>

      {/* Features grid */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-20">
            <p className="text-xs uppercase tracking-widest text-white/30 font-medium mb-4">What it does</p>
            <h2 className="text-[clamp(32px,4vw,56px)] font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.95)" }}>
              Everything your finances need.
              <br />
              <span style={{ color: "rgba(255,255,255,0.3)" }}>Nothing they do not.</span>
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ background: "rgba(255,255,255,0.06)", borderRadius: 24, overflow: "hidden" }}>
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.07}>
                <div className="p-8 h-full group hover:bg-white/[0.03] transition-colors duration-300"
                  style={{ background: "rgba(8,8,8,0.8)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <f.icon className="w-5 h-5" style={{ color: "rgba(255,255,255,0.6)" }} />
                  </div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: "rgba(255,255,255,0.9)" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{f.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Transaction preview */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-white/30 font-medium mb-4">How it works</p>
            <h2 className="text-[clamp(28px,4vw,48px)] font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.95)" }}>
              Log once. Understand everything.
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Log in any currency", desc: "Type the amount in whatever currency you paid. AMD, IDR, USD, anything.", icon: ArrowDownLeft, color: "rgba(48,209,88,0.8)" },
              { step: "02", title: "We convert instantly", desc: "Live exchange rates fire the moment you hit save. No settings. No manual rates.", icon: RefreshCw, color: "rgba(10,132,255,0.8)" },
              { step: "03", title: "See the real picture", desc: "Your dashboard shows everything in USD with the original amount side by side.", icon: Eye, color: "rgba(255,159,10,0.8)" },
            ].map((s, i) => (
              <FadeIn key={s.step} delay={i * 0.1}>
                <div className="relative p-6 rounded-2xl h-full"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-4xl font-bold tabular-nums" style={{ color: "rgba(255,255,255,0.08)" }}>{s.step}</span>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: s.color + "15", border: `1px solid ${s.color}30` }}>
                      <s.icon className="w-4 h-4" style={{ color: s.color }} />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: "rgba(255,255,255,0.9)" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-white/30 font-medium mb-4">Who it is for</p>
            <h2 className="text-[clamp(28px,4vw,48px)] font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.95)" }}>
              Built for people who live between currencies.
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-4">
            {FOR_WHO.map((w, i) => (
              <FadeIn key={w.who} delay={i * 0.08}>
                <div className="flex gap-4 p-6 rounded-2xl group hover:bg-white/[0.03] transition-colors duration-300"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <w.icon className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>{w.who}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{w.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Currencies strip */}
      <section className="py-20 px-6 overflow-hidden">
        <FadeIn>
          <p className="text-center text-xs uppercase tracking-widest text-white/20 font-medium mb-8">Supported currencies</p>
          <div className="flex items-center justify-center flex-wrap gap-3 max-w-2xl mx-auto">
            {[
              { code: "USD", name: "US Dollar" },
              { code: "GBP", name: "British Pound" },
              { code: "EUR", name: "Euro" },
              { code: "CHF", name: "Swiss Franc" },
              { code: "CNY", name: "Chinese Yuan" },
              { code: "IDR", name: "Indonesian Rupiah" },
              { code: "AMD", name: "Armenian Dram" },
              { code: "RUB", name: "Russian Ruble" },
            ].map(c => (
              <div key={c.code}
                className="px-4 py-2 rounded-full text-xs font-medium"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                {c.code}
                <span className="ml-1.5" style={{ color: "rgba(255,255,255,0.2)" }}>{c.name}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(10,132,255,0.07) 0%, transparent 70%)" }} />
        <FadeIn className="relative text-center max-w-2xl mx-auto">
          <h2 className="text-[clamp(36px,5vw,64px)] font-bold tracking-tight leading-tight" style={{ color: "rgba(255,255,255,0.95)" }}>
            Start perceiving
            <br />
            <span style={{ color: "rgba(255,255,255,0.3)" }}>what you actually spend.</span>
          </h2>
          <p className="mt-6 text-lg font-light" style={{ color: "rgba(255,255,255,0.35)" }}>
            Free to use. No credit card. Just clarity.
          </p>
          <Link href="/signup"
            className="group inline-flex items-center gap-2 mt-10 bg-white text-black font-semibold px-8 py-4 rounded-full text-base hover:bg-white/90 transition-all active:scale-95">
            Create your account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="py-10 px-8 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>Perceiva</span>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            <span>made with</span>
            <Heart className="w-3 h-3 fill-current" style={{ color: "rgba(255,69,58,0.8)" }} />
            <span>by ren</span>
          </div>
          <div className="flex items-center gap-6 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            <Link href="/login" className="hover:text-white/50 transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-white/50 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
