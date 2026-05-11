"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion, useScroll, useTransform, useSpring,
  useInView, AnimatePresence, useAnimationFrame, useMotionValue,
} from "framer-motion";
import {
  ArrowRight, Globe, Layers, ShieldCheck, RefreshCw, BarChart2,
  Heart, Menu, X, ChevronDown, ArrowLeftRight, Zap, Sun, Moon, Check, Sparkles,
} from "lucide-react";
import { Button }    from "@/components/ui/button";
import { Badge }     from "@/components/ui/badge";
import { Switch }    from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

// ─── Phthalo green palette ────────────────────────────────────────────────────
// True phthalo: #123524 (too dark for dark-bg use)
// Dark mode accent: #1fa55c (bright phthalo-family, readable on dark)
// Light mode accent: #0f6b35 (deep phthalo readable on light)
const PG_DARK  = "#1fa55c";   // bright phthalo — used as accent on dark bg
const PG_LIGHT = "#0f6b35";   // deep phthalo — used as accent on light bg
const PG_DARK_DIM   = "rgba(31,165,92,0.13)";
const PG_DARK_BDR   = "rgba(31,165,92,0.28)";
const PG_LIGHT_DIM  = "rgba(15,107,53,0.1)";
const PG_LIGHT_BDR  = "rgba(15,107,53,0.22)";
const BLUE      = "#0060d4";
const BLUE_DIM  = "rgba(0,96,212,0.09)";
const BLUE_BDR  = "rgba(0,96,212,0.2)";

const SP  = { stiffness: 100, damping: 22, mass: 1.1 };
const SPF = { stiffness: 200, damping: 22, mass: 0.85 };
const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Fade helpers ─────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 28, filter: "blur(5px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.72, delay, ease: EASE }}>
      {children}
    </motion.div>
  );
}
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.55, delay }}>
      {children}
    </motion.div>
  );
}

// ─── Magnetic wrapper ─────────────────────────────────────────────────────────
function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, SP); const y = useSpring(0, SP);
  return (
    <motion.div ref={ref} style={{ x, y }}
      onMouseMove={e => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.18);
        y.set((e.clientY - r.top - r.height / 2) * 0.18);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}>
      {children}
    </motion.div>
  );
}

// ─── Typewriter — cursor is a SIBLING not a child of gradient span ────────────
const WORDS = ["AMD", "IDR", "USD", "GBP", "EUR", "CHF", "CNY", "RUB", "anything"];
function Typewriter({ accent }: { accent: string }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("AMD");
  const [del, setDel] = useState(false);
  const [pause, setPause] = useState(false);
  useEffect(() => {
    if (pause) { const t = setTimeout(() => { setPause(false); setDel(true); }, 1600); return () => clearTimeout(t); }
    const w = WORDS[idx];
    if (!del) {
      if (text.length < w.length) { const t = setTimeout(() => setText(w.slice(0, text.length + 1)), 90); return () => clearTimeout(t); }
      setPause(true);
    } else {
      if (text.length > 0) { const t = setTimeout(() => setText(text.slice(0, -1)), 55); return () => clearTimeout(t); }
      setDel(false); setIdx((idx + 1) % WORDS.length);
    }
  }, [text, del, pause, idx]);
  return (
    // wrapper with inline-flex keeps cursor on same baseline without gradient bleed
    <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}>
      <span className="tw-gradient" style={{
        background: `linear-gradient(90deg, ${accent}, ${accent}bb, ${accent})`,
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        animation: "twGrad 2.8s linear infinite",
        minWidth: "2ch",
      }}>
        {text}
      </span>
      {/* cursor lives OUTSIDE the clipped span so it is never transparent */}
      <span style={{
        display: "inline-block",
        width: 4,
        height: "0.75em",
        marginLeft: 4,
        borderRadius: 2,
        background: accent,
        verticalAlign: "middle",
        animation: "twBlink 1s step-end infinite",
        flexShrink: 0,
        transition: "background 0.5s",
      }} />
    </span>
  );
}

// ─── Animated noise grain ─────────────────────────────────────────────────────
function Noise() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let raf: number;
    const draw = () => {
      c.width = window.innerWidth; c.height = window.innerHeight;
      const img = ctx.createImageData(c.width, c.height);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 12;
      }
      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(draw);
    };
    draw(); return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, opacity: 0.28 }} />;
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return; done.current = true;
      const t0 = performance.now();
      const go = (n: number) => { const p = Math.min((n - t0) / 1800, 1); setVal((1 - Math.pow(1 - p, 4)) * to); if (p < 1) requestAnimationFrame(go); };
      requestAnimationFrame(go);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current); return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{Math.round(val)}{suffix}</span>;
}

// ─── Velocity-aware marquee ────────────────────────────────────────────────────
function Marquee({ items, dark }: { items: string[]; dark: boolean }) {
  const x = useMotionValue(0), base = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => { if (ref.current) setW(ref.current.scrollWidth / 2); }, []);
  useAnimationFrame((_, dt) => {
    base.set(base.get() - 38 * (dt / 1000));
    if (w && Math.abs(base.get()) >= w) base.set(0);
    x.set(base.get());
  });
  const bdr = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const dotC = dark ? PG_DARK_BDR : PG_LIGHT_BDR;
  return (
    <div style={{ overflow: "hidden", borderTop: `1px solid ${bdr}`, borderBottom: `1px solid ${bdr}`, background: dark ? "rgba(255,255,255,0.012)" : "rgba(0,0,0,0.018)", padding: "13px 0", position: "relative", zIndex: 2 }}>
      <motion.div ref={ref} style={{ x, display: "flex", width: "max-content" }}>
        {[...items, ...items].map((t, i) => (
          <span key={i} style={{ fontSize: 11.5, fontVariantNumeric: "tabular-nums", color: dark ? "rgba(240,240,240,0.35)" : "rgba(17,17,17,0.46)", letterSpacing: "0.04em", whiteSpace: "nowrap", fontFamily: '"SF Mono",ui-monospace,monospace', display: "flex", alignItems: "center", padding: "0 26px" }}>
            {t}<span style={{ width: 3, height: 3, borderRadius: "50%", background: dotC, marginLeft: 26, flexShrink: 0, transition: "background 0.5s" }} />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Shine badge ──────────────────────────────────────────────────────────────
function ShineBadge({ dark, accent, accentDim, accentBdr }: { dark: boolean; accent: string; accentDim: string; accentBdr: string }) {
  return (
    <div style={{ position: "relative", display: "inline-flex", overflow: "hidden", borderRadius: 980 }}>
      <Badge style={{ borderColor: accentBdr, background: accentDim, color: accent, fontSize: 12, gap: 6, borderRadius: 980, padding: "6px 16px", display: "inline-flex", alignItems: "center", transition: "all 0.5s", position: "relative", zIndex: 1 }}>
        <Zap size={11} style={{ flexShrink: 0 }} />
        Introducing Perceiva
      </Badge>
      {/* shine sweep */}
      <motion.span
        style={{ position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)", zIndex: 2, pointerEvents: "none" }}
        animate={{ left: ["−100%", "200%"] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", repeatDelay: 1.6 }}
      />
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TICKER = [
  "1 USD = \u058F390 AMD", "1 USD = Rp 17,417 IDR", "1 EUR = $1.09 USD",
  "1 GBP = $1.27 USD", "1 USD = Fr 0.88 CHF", "1 USD = \u00A57.26 CNY",
  "1 AMD = Rp 44.7 IDR", "1 CHF = $1.14 USD", "1 USD = \u20BD91.2 RUB",
  "1 EUR = \u058F425 AMD", "1 GBP = Rp 22,100 IDR", "1 CNY = Rp 2,399 IDR",
];

const PERCEPTION = [
  { code: "AMD", sym: "\u058F", amount: "390",    label: "Armenian Dram",     note: "pocket change vibes" },
  { code: "IDR", sym: "Rp",    amount: "17,417",  label: "Indonesian Rupiah", note: "17k feels like nothing" },
  { code: "RUB", sym: "\u20BD", amount: "91.2",   label: "Russian Ruble",     note: "" },
  { code: "CNY", sym: "\u00A5", amount: "7.26",   label: "Chinese Yuan",      note: "" },
  { code: "GBP", sym: "\u00A3", amount: "0.79",   label: "British Pound",     note: "worth more than $1" },
];

const FEATURES = [
  { icon: Globe,          title: "8+ currencies",          body: "USD, GBP, EUR, CHF, CNY, IDR, AMD, RUB. More on the way. Log in any." },
  { icon: RefreshCw,      title: "Live rates",             body: "Converts the moment you log. Frankfurter API. No key, always fresh." },
  { icon: Layers,         title: "Multiple wallets",       body: "AMD salary. USD freelance. IDR spending. Separate streams, one view." },
  { icon: BarChart2,      title: "Budget tracking",        body: "Monthly limits per category. Turns red before your bank does." },
  { icon: ArrowLeftRight, title: "Recurring transactions", body: "Salary, rent, subs. Set once. Logs itself every cycle." },
  { icon: ShieldCheck,    title: "Your data only",         body: "Email or Google. Your numbers live in your account. Nowhere else." },
];

const FLOATS = [
  { from: "4,700 AMD",  to: "$12.05",  d: 0.65 },
  { from: "Rp 207,000", to: "$11.89",  d: 0.78 },
  { from: "\u00A380 GBP",    to: "$101.60", d: 0.91 },
  { from: "Fr 50 CHF",  to: "$57.00",  d: 1.04 },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [dark, setDark] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: rootRef });
  const rO = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const rY = useTransform(scrollYProgress, [0, 0.12], [0, -48]);
  const rS = useTransform(scrollYProgress, [0, 0.12], [1, 0.95]);
  const hO = useSpring(rO, { stiffness: 75, damping: 18 });
  const hY = useSpring(rY, { stiffness: 75, damping: 18 });
  const hS = useSpring(rS, { stiffness: 75, damping: 18 });

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 44);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // derived tokens
  const accent    = dark ? PG_DARK      : PG_LIGHT;
  const accentDim = dark ? PG_DARK_DIM  : PG_LIGHT_DIM;
  const accentBdr = dark ? PG_DARK_BDR  : PG_LIGHT_BDR;
  const bg        = dark ? "#080808"    : "#f5f5f0";
  const surface   = dark ? "#131313"    : "#ffffff";
  const bdr       = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const fg        = dark ? "#ececec"    : "#111111";
  const fgMuted   = dark ? "rgba(236,236,236,0.52)" : "rgba(17,17,17,0.6)";
  const fgSub     = dark ? "rgba(236,236,236,0.3)"  : "rgba(17,17,17,0.38)";
  const navBg     = scrolled ? (dark ? "rgba(8,8,8,0.88)" : "rgba(245,245,240,0.92)") : "transparent";

  const T = { transition: "color 0.5s ease, background 0.5s ease, border-color 0.5s ease" };

  return (
    <TooltipProvider delayDuration={150}>
      <style>{`
        @keyframes twGrad  { from{background-position:0%} to{background-position:200%} }
        @keyframes twBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes shine   { 0%{left:-100%} 100%{left:200%} }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; }
        .hov-scale:hover { transform: scale(1.015); }
        /* Responsive grid helpers */
        @media (max-width: 1024px) {
          .perc-grid { grid-template-columns: repeat(3,1fr) !important; }
          .perc-anc  { grid-column: span 3 !important; flex-direction: row !important; align-items: center !important; gap: 20px !important; padding: 24px 28px !important; }
          .perc-anc .perc-big { font-size: 36px !important; }
        }
        @media (max-width: 900px) {
          .desk-nav  { display: none !important; }
          .desk-si   { display: none !important; }
          .mob-icon  { display: flex !important; }
          .feat-grid { grid-template-columns: repeat(2,1fr) !important; }
          .who-grid  { grid-template-columns: 1fr 1fr !important; }
          .stat-grid { grid-template-columns: repeat(2,1fr) !important; }
          .perc-grid { grid-template-columns: repeat(2,1fr) !important; }
          .perc-anc  { grid-column: span 2 !important; }
          .check-grid{ grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 640px) {
          .nav-wrap  { padding: 0 18px !important; }
          .lp-sec    { padding: 72px 18px !important; }
          .feat-grid { grid-template-columns: 1fr !important; }
          .who-grid  { grid-template-columns: 1fr !important; }
          .perc-grid { grid-template-columns: 1fr 1fr !important; }
          .perc-anc  { grid-column: span 2 !important; }
          .float-hide{ display: none !important; }
          .foot-wrap { padding: 22px 18px !important; }
          .hero-wrap { padding: 120px 18px 90px !important; }
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
          .test-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div ref={rootRef} style={{ minHeight: "100vh", background: bg, color: fg, fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif", overflowX: "hidden", position: "relative", transition: "background 0.5s ease, color 0.5s ease" }}>
        <Noise />

        {/* ── NAV ── */}
        <motion.header className="nav-wrap"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE }}
          style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 52px", height: 58, backdropFilter: "blur(28px) saturate(1.5)", WebkitBackdropFilter: "blur(28px) saturate(1.5)", background: navBg, borderBottom: `1px solid ${scrolled ? bdr : "transparent"}`, transition: "background 0.4s, border-color 0.4s" }}>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.025em", color: fg, flexShrink: 0, ...T }}>Perceiva</span>

          {/* desktop links */}
          <nav className="desk-nav" style={{ display: "flex", gap: 36 }}>
            {[["What it does", "what"], ["Who it is for", "who"], ["Why it exists", "perception"]].map(([l, id], i) => (
              <motion.a key={l} href={`#${id}`}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07, duration: 0.5 }}
                style={{ fontSize: 13, color: fgMuted, textDecoration: "none", transition: "color 0.2s" }}
                whileHover={{ color: fg }}>{l}</motion.a>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {/* theme toggle */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Sun size={13} style={{ color: !dark ? accent : fgSub, transition: "color 0.4s" }} />
              <Switch checked={dark} onCheckedChange={setDark} style={{ transform: "scale(0.8)" }} />
              <Moon size={13} style={{ color: dark ? accent : fgSub, transition: "color 0.4s" }} />
            </motion.div>

            {/* sign in — desktop always visible, proper fg color */}
            <Link href="/login" className="desk-si">
              <Button variant="ghost" size="sm"
                style={{ fontSize: 13, color: fg, fontWeight: 500, opacity: 0.72, transition: "opacity 0.2s, color 0.5s" }}>
                Sign in
              </Button>
            </Link>

            <Link href="/signup">
              <Button size="sm"
                style={{ fontSize: 13, borderRadius: 980, background: accent, color: "#fff", border: "none", display: "inline-flex", alignItems: "center", gap: 6, transition: "background 0.5s, transform 0.18s, filter 0.2s" }}
                className="hov-scale">
                Get started <ArrowRight size={13} />
              </Button>
            </Link>

            {/* hamburger — mobile only */}
            <button className="mob-icon"
              onClick={() => setMenu(true)}
              style={{ display: "none", background: "none", border: "none", color: fg, cursor: "pointer", padding: 7, borderRadius: 8, opacity: 0.75, transition: "color 0.5s" }}>
              <Menu size={20} />
            </button>
          </div>
        </motion.header>

        {/* mobile menu */}
        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              style={{ position: "fixed", inset: 0, zIndex: 300, backdropFilter: "blur(32px)", background: dark ? "rgba(8,8,8,0.97)" : "rgba(245,245,240,0.97)", display: "flex", flexDirection: "column", padding: "88px 28px 48px" }}>
              <button onClick={() => setMenu(false)}
                style={{ position: "absolute", top: 16, right: 18, background: "rgba(128,128,128,0.12)", border: "none", color: fg, cursor: "pointer", padding: 10, borderRadius: "50%" }}>
                <X size={22} />
              </button>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                {[["What it does", "what"], ["Who it is for", "who"], ["Why it exists", "perception"], ["Sign in", "/login"]].map(([l, id], i) => (
                  <motion.a key={l} href={id.startsWith("/") ? id : `#${id}`}
                    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => setMenu(false)}
                    style={{ fontSize: 26, fontWeight: 600, color: fgMuted, textDecoration: "none", padding: "14px 0", borderBottom: `1px solid ${bdr}`, transition: "color 0.2s" }}
                  >{l}</motion.a>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>
                <Link href="/signup" onClick={() => setMenu(false)}>
                  <Button size="lg" className="w-full" style={{ background: accent, color: "#fff", border: "none", transition: "background 0.5s" }}>
                    Get started <ArrowRight size={15} />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HERO ── */}
        <section className="hero-wrap" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "130px 24px 110px", overflow: "hidden", zIndex: 2 }}>
          <motion.div style={{ opacity: hO, y: hY, scale: hS, position: "relative", zIndex: 3, maxWidth: 880, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, willChange: "transform, opacity" }}>

            {/* shine badge */}
            <motion.div initial={{ opacity: 0, y: 14, filter: "blur(5px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.25, duration: 0.7, ease: EASE }}>
              <ShineBadge dark={dark} accent={accent} accentDim={accentDim} accentBdr={accentBdr} />
            </motion.div>

            {/* headline */}
            <motion.h1
              initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.36, duration: 0.85, ease: EASE }}
              style={{ fontSize: "clamp(48px,8.5vw,106px)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.02, color: fg, margin: 0, ...T }}>
              Log in <Typewriter accent={accent} /><br />
              <span style={{ color: fgSub, ...T }}>get the real number.</span>
            </motion.h1>

            {/* subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.50, duration: 0.7, ease: EASE }}
              style={{ fontSize: "clamp(15px,1.9vw,18px)", lineHeight: 1.72, color: fgMuted, maxWidth: 500, margin: 0, ...T }}>
              Your AMD salary hits different when you realize what it actually is in IDR.
              Perceiva converts everything, live — so you always know what you are working with.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.6, ease: EASE }}
              style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
              <Magnetic>
                <Link href="/signup"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: accent, color: "#fff", fontSize: 15, fontWeight: 500, borderRadius: 980, padding: "13px 26px", transition: "background 0.5s, filter 0.2s, transform 0.18s" }}
                  className="hov-scale">
                  Start for free <ArrowRight size={15} />
                </Link>
              </Magnetic>
              <Magnetic>
                <button onClick={() => setDemoOpen(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 500, color: fgMuted, background: "none", border: `1px solid ${bdr}`, borderRadius: 980, padding: "12px 20px", cursor: "pointer", transition: "color 0.3s, border-color 0.4s" }}>
                  <Sparkles size={14} /> See how it works
                </button>
              </Magnetic>
            </motion.div>

            {/* scroll hint */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
              style={{ color: fgSub, marginTop: 14, ...T }}>
              <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2.2, ease: [0.45, 0, 0.55, 1] }}>
                <ChevronDown size={17} />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* float cards */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 14, position: "relative", zIndex: 3 }}>
            {FLOATS.map((f, i) => (
              <motion.div key={i}
                className={i >= 2 ? "float-hide" : ""}
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: f.d, duration: 0.65, ease: EASE }}
                whileHover={{ scale: 1.06, y: -3 }}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: `1px solid ${bdr}`, borderRadius: 980, padding: "9px 18px", fontSize: 13, backdropFilter: "blur(12px)", cursor: "default", transition: "background 0.5s, border-color 0.4s" }}>
                <span style={{ color: fgSub, fontVariantNumeric: "tabular-nums", ...T }}>{f.from}</span>
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 2.4, delay: i * 0.4, ease: "easeInOut" }}>
                  <ArrowRight size={11} style={{ color: accent, transition: "color 0.5s" }} />
                </motion.span>
                <span style={{ color: fg, fontWeight: 600, fontVariantNumeric: "tabular-nums", ...T }}>{f.to}</span>
              </motion.div>
            ))}
          </div>

          {/* glow orbs */}
          <div style={{ position: "absolute", top: "16%", left: "50%", transform: "translateX(-50%)", width: 820, height: 520, background: `radial-gradient(ellipse, ${accentDim} 0%, transparent 68%)`, pointerEvents: "none", zIndex: 0, transition: "background 0.5s" }} />
          <div style={{ position: "absolute", bottom: 0, left: "14%", width: 420, height: 420, background: "radial-gradient(ellipse,rgba(94,92,230,0.04) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        </section>

        {/* ── TICKER ── */}
        <Marquee items={TICKER} dark={dark} />

        {/* ── PERCEPTION ── */}
        <section className="lp-sec" style={{ padding: "120px 24px", position: "relative", zIndex: 2 }} id="perception">
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <FadeUp>
              <p style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: 14, transition: "color 0.5s" }}>Why it exists</p>
              <h2 style={{ fontSize: "clamp(30px,5vw,62px)", fontWeight: 700, letterSpacing: "-0.038em", lineHeight: 1.06, color: fg, marginBottom: 18, ...T }}>$1 hits different<br />everywhere you go.</h2>
              <p style={{ fontSize: 17, lineHeight: 1.72, color: fgMuted, maxWidth: 480, marginBottom: 52, ...T }}>
                Numbers lie. 4,700 AMD sounds cheap until you do the math. Perceiva does it for you — instantly, every time, no calculator needed.
              </p>
            </FadeUp>

            <div className="perc-grid" style={{ display: "grid", gridTemplateColumns: "160px repeat(5,1fr)", gap: 2, borderRadius: 22, overflow: "hidden", border: `1px solid ${bdr}`, background: bdr, transition: "border-color 0.5s, background 0.5s" }}>
              {/* anchor */}
              <FadeUp delay={0.05}>
                <div className="perc-anc" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "44px 24px", background: accentDim, gap: 4, height: "100%", transition: "background 0.5s" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, transition: "color 0.5s" }}>anchor</span>
                  <span className="perc-big" style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.04em", color: fg, fontVariantNumeric: "tabular-nums", ...T }}>$1.00</span>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: fgSub, ...T }}>USD</span>
                </div>
              </FadeUp>
              {PERCEPTION.map((p, i) => (
                <FadeUp key={p.code} delay={0.05 + i * 0.08}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{ scale: 1.03, y: -3 }} transition={{ type: "spring", ...SPF }}
                        style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "44px 18px", background: dark ? "rgba(255,255,255,0.018)" : surface, gap: 5, cursor: "default", height: "100%", transition: "background 0.25s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <Badge variant="outline" style={{ fontSize: 9, padding: "2px 7px", fontWeight: 700, letterSpacing: "0.07em", borderColor: bdr, color: fgSub, background: "transparent", ...T }}>{p.code}</Badge>
                          <span style={{ fontSize: 10, color: fgSub, ...T }}>{p.label}</span>
                        </div>
                        <span style={{ fontSize: "clamp(20px,2.5vw,28px)", fontWeight: 700, letterSpacing: "-0.03em", color: fg, fontVariantNumeric: "tabular-nums", ...T }}>{p.sym}{p.amount}</span>
                        {p.note && <span style={{ fontSize: 11, color: fgSub, fontStyle: "italic", ...T }}>{p.note}</span>}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent><p style={{ fontSize: 12, fontWeight: 500 }}>1 USD = {p.sym}{p.amount} {p.code}</p></TooltipContent>
                  </Tooltip>
                </FadeUp>
              ))}
            </div>

            <FadeUp delay={0.3}>
              <p style={{ marginTop: 14, fontSize: 11.5, color: fgSub, ...T }}>
                Rates updated live via Frankfurter API. Reference: xe.com — 1 USD = Rp 17,417 IDR (May 2026).
              </p>
            </FadeUp>
          </div>
        </section>

        <div style={{ height: 1, background: bdr, transition: "background 0.5s" }} />

        {/* ── FEATURES ── */}
        <section className="lp-sec" style={{ padding: "120px 24px", position: "relative", zIndex: 2 }} id="what">
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <FadeUp>
              <p style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: 14, transition: "color 0.5s" }}>What it does</p>
              <h2 style={{ fontSize: "clamp(30px,5vw,62px)", fontWeight: 700, letterSpacing: "-0.038em", lineHeight: 1.06, color: fg, marginBottom: 48, ...T }}>Every currency.<br />One dashboard.</h2>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, borderRadius: 22, overflow: "hidden", border: `1px solid ${bdr}`, background: bdr, transition: "border-color 0.5s, background 0.5s" }}>
                {FEATURES.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <motion.div key={i} whileHover={{ y: -5, scale: 1.01 }} transition={{ type: "spring", ...SPF }}
                      style={{ padding: "38px 30px", background: dark ? "rgba(255,255,255,0.014)" : surface, display: "flex", flexDirection: "column", gap: 12, cursor: "default", transition: "background 0.3s" }}>
                      <motion.div whileHover={{ rotate: 10, scale: 1.14 }} transition={{ type: "spring", stiffness: 300, damping: 14 }}
                        style={{ width: 42, height: 42, borderRadius: 13, background: accentDim, border: `1px solid ${accentBdr}`, display: "flex", alignItems: "center", justifyContent: "center", color: accent, flexShrink: 0, transition: "background 0.5s, border-color 0.5s, color 0.5s" }}>
                        <Icon size={18} />
                      </motion.div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em", color: fg, lineHeight: 1.3, margin: 0, ...T }}>{f.title}</h3>
                      <p style={{ fontSize: 13.5, lineHeight: 1.65, color: fgMuted, margin: 0, ...T }}>{f.body}</p>
                    </motion.div>
                  );
                })}
              </div>
            </FadeUp>
          </div>
        </section>

        <div style={{ height: 1, background: bdr, transition: "background 0.5s" }} />

        {/* ── WHO ── */}
        <section className="lp-sec" style={{ padding: "120px 24px", position: "relative", zIndex: 2 }} id="who">
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <FadeUp>
              <p style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: 14, transition: "color 0.5s" }}>Who it is for</p>
              <h2 style={{ fontSize: "clamp(30px,5vw,62px)", fontWeight: 700, letterSpacing: "-0.038em", lineHeight: 1.06, color: fg, marginBottom: 52, ...T }}>
                For anyone who earns in one world<br />and lives in another.
              </h2>
            </FadeUp>
            <div className="who-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
              {[
                { n: "01", title: "The expat juggling three currencies",  body: "Company pays USD. Landlord wants AMD. Family needs IDR. Perceiva holds all of it without losing the thread." },
                { n: "02", title: "The freelancer with global clients",   body: "GBP from London, EUR from Berlin, USD from New York. Everything converts at the moment it lands." },
                { n: "03", title: "The traveler who stops tracking",      body: "12,000 AMD on lunch feels fine until you see it is Rp 207,000. Perceiva makes that visible before it becomes a habit." },
              ].map((w, i) => (
                <FadeUp key={i} delay={i * 0.09}>
                  <motion.div whileHover={{ y: -7 }} transition={{ type: "spring", ...SPF }}
                    style={{ padding: "38px 28px", background: dark ? "rgba(255,255,255,0.025)" : surface, border: `1px solid ${bdr}`, borderRadius: 22, display: "flex", flexDirection: "column", gap: 12, cursor: "default", position: "relative", overflow: "hidden", transition: "background 0.3s, border-color 0.5s" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: accent, fontFamily: '"SF Mono",ui-monospace,monospace', transition: "color 0.5s" }}>{w.n}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", color: fg, lineHeight: 1.3, margin: 0, ...T }}>{w.title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.72, color: fgMuted, margin: 0, ...T }}>{w.body}</p>
                    <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.65, ease: EASE }}
                      style={{ position: "absolute", bottom: 0, left: 0, height: 2, width: "100%", background: `linear-gradient(90deg,${accent},transparent)`, transformOrigin: "left", transition: "background 0.5s" }} />
                  </motion.div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── FROM THE CREATOR ── */}
        <div style={{ height: 1, background: bdr, transition: "background 0.5s" }} />
        <section className="lp-sec" style={{ padding: "100px 24px", position: "relative", zIndex: 2 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <FadeUp>
              <p style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: 14, transition: "color 0.5s" }}>From the creator</p>
            </FadeUp>
            <FadeUp delay={0.08}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", ...SPF }}>
                <Card style={{ background: dark ? "rgba(255,255,255,0.025)" : surface, border: `1px solid ${bdr}`, borderRadius: 24, overflow: "hidden", transition: "background 0.3s, border-color 0.5s", maxWidth: 720 }}>
                  <CardHeader style={{ paddingBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <Avatar style={{ width: 48, height: 48 }}>
                        <AvatarFallback style={{ background: accentDim, color: accent, fontWeight: 700, fontSize: 16, transition: "background 0.5s, color 0.5s" }}>RZ</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle style={{ fontSize: 15, color: fg, ...T }}>Ren</CardTitle>
                        <CardDescription style={{ fontSize: 12, color: fgSub, ...T }}>Builder of Perceiva</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent style={{ paddingTop: 4 }}>
                    <p style={{ fontSize: 15, lineHeight: 1.75, color: fgMuted, margin: 0, ...T }}>
                      I built Perceiva because I was living in Armenia, getting paid in both AMD and USD,
                      and sending money back in IDR. Every time I spent 4,700 AMD on something I thought
                      it was nothing. Then I checked the IDR equivalent and realized I was just not perceiving
                      what I was actually spending. No app I tried handled multiple currencies in a way that
                      actually made sense. So I made one. This is it.
                    </p>
                    <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 2, background: accent, borderRadius: 9999, transition: "background 0.5s" }} />
                      <span style={{ fontSize: 12, color: fgSub, fontStyle: "italic", ...T }}>Yerevan, Armenia — 2025</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </FadeUp>
          </div>
        </section>

        {/* ── STATS ── */}
        <div style={{ padding: "72px 24px", borderTop: `1px solid ${bdr}`, borderBottom: `1px solid ${bdr}`, background: dark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.016)", position: "relative", zIndex: 2, transition: "background 0.5s, border-color 0.5s" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2, borderRadius: 22, overflow: "hidden", border: `1px solid ${bdr}`, background: bdr, transition: "border-color 0.5s, background 0.5s" }}>
              {[
                { v: 8,   s: "+",    l: "Currencies, more coming" },
                { v: 100, s: "%",    l: "Free, no credit card" },
                { v: 5,   s: " min", l: "To set up and log your first transaction" },
                { v: 0,   s: "",     l: "Mental math required" },
              ].map((s, i) => (
                <FadeIn key={i} delay={i * 0.07}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "50px 18px", background: dark ? "rgba(255,255,255,0.014)" : surface, textAlign: "center", transition: "background 0.5s" }}>
                    <span style={{ fontSize: "clamp(40px,4vw,54px)", fontWeight: 700, letterSpacing: "-0.045em", color: fg, fontVariantNumeric: "tabular-nums", lineHeight: 1, ...T }}>
                      <Counter to={s.v} suffix={s.s} />
                    </span>
                    <span style={{ fontSize: 13, color: fgMuted, maxWidth: 110, lineHeight: 1.45, ...T }}>{s.l}</span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* ── WHAT YOU GET ── */}
        <section className="lp-sec" style={{ padding: "100px 24px", position: "relative", zIndex: 2 }}>
          <div className="check-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <FadeUp>
              <p style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: 14, transition: "color 0.5s" }}>What you get</p>
              <h2 style={{ fontSize: "clamp(26px,4vw,50px)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.08, color: fg, marginBottom: 32, ...T }}>Everything you need.<br />Nothing you don't.</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "Live multi-currency conversion on every log",
                  "Skeuomorphic wallet cards you can customize",
                  "Budget limits with real-time spend tracking",
                  "Recurring transaction scheduling",
                  "Perception check — see what $1 actually looks like",
                  "Google + email auth, your data stays yours",
                  "More currencies being added regularly",
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                    style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: accentDim, border: `1px solid ${accentBdr}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, transition: "background 0.5s, border-color 0.5s" }}>
                      <Check size={11} style={{ color: accent, transition: "color 0.5s" }} />
                    </div>
                    <span style={{ fontSize: 14, color: fgMuted, lineHeight: 1.6, ...T }}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </FadeUp>
            <FadeUp delay={0.15}>
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: fgSub, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px", ...T }}>Currency support</p>
                {[
                  { label: "USD / GBP / EUR / CHF", pct: 100 },
                  { label: "CNY / AMD / RUB / IDR", pct: 100 },
                  { label: "JPY / KRW / AED",       pct: 55  },
                  { label: "BRL / MXN / INR",       pct: 25  },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: fgMuted, fontFamily: '"SF Mono",ui-monospace,monospace', ...T }}>{row.label}</span>
                      <Badge style={{ fontSize: 10, padding: "2px 8px", background: row.pct === 100 ? accentDim : "transparent", color: row.pct === 100 ? accent : fgSub, border: `1px solid ${row.pct === 100 ? accentBdr : bdr}`, borderRadius: 980, fontWeight: 600, transition: "all 0.5s" }}>
                        {row.pct === 100 ? "Live" : "Coming soon"}
                      </Badge>
                    </div>
                    <div style={{ height: 5, borderRadius: 9999, background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)", overflow: "hidden", transition: "background 0.5s" }}>
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${row.pct}%` }} viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: i * 0.1, ease: EASE }}
                        style={{ height: "100%", background: accent, borderRadius: 9999, transition: "background 0.5s" }} />
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: "140px 24px 120px", textAlign: "center", position: "relative", overflow: "hidden", zIndex: 2 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 22, position: "relative", zIndex: 2 }}>
            <FadeUp>
              <h2 style={{ fontSize: "clamp(36px,7vw,82px)", fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.02, color: fg, margin: 0, ...T }}>
                Stop guessing.<br />Start perceiving.
              </h2>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p style={{ fontSize: 17, color: fgMuted, maxWidth: 360, lineHeight: 1.65, margin: 0, ...T }}>
                Takes five minutes. Saves you from a lot of "wait, how much is that actually?"
              </p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <Magnetic>
                <Link href="/signup"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: accent, color: "#fff", fontSize: 17, fontWeight: 500, borderRadius: 980, padding: "16px 34px", transition: "background 0.5s, filter 0.2s, transform 0.18s" }}
                  className="hov-scale">
                  Create your account <ArrowRight size={17} />
                </Link>
              </Magnetic>
            </FadeUp>
            <FadeUp delay={0.26}>
              <Link href="/login" style={{ fontSize: 13, color: fgSub, textDecoration: "none", transition: "color 0.3s" }}>
                Already have an account? Sign in
              </Link>
            </FadeUp>
          </div>
          <div style={{ position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)", width: 680, height: 380, background: `radial-gradient(ellipse, ${accentDim} 0%, transparent 66%)`, pointerEvents: "none", transition: "background 0.5s" }} />
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ position: "relative", zIndex: 2 }}>
          <div style={{ height: 1, background: bdr, transition: "background 0.5s" }} />
          <div className="foot-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "26px 52px" }}>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.02em", color: fgSub, ...T }}>Perceiva</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: fgSub, ...T }}>
              made with
              <motion.span animate={{ scale: [1, 1.35, 1] }} transition={{ repeat: Infinity, duration: 1.8, ease: [0.45, 0, 0.55, 1] }}
                style={{ display: "inline-flex", alignItems: "center" }}>
                <Heart size={12} fill="#ff453a" color="#ff453a" />
              </motion.span>
              by ren
            </span>
          </div>
        </footer>

        {/* ── HOW IT WORKS dialog ── */}
        <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
          <DialogContent style={{ maxWidth: 520, background: surface, borderColor: bdr, borderRadius: 24, transition: "background 0.5s" }}>
            <DialogHeader>
              <DialogTitle style={{ color: fg, fontSize: 20, ...T }}>How Perceiva works</DialogTitle>
              <DialogDescription style={{ color: fgMuted, fontSize: 14, ...T }}>Three steps from chaos to clarity.</DialogDescription>
            </DialogHeader>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 8 }}>
              {[
                { n: "01", title: "Connect your wallets",   body: "Create wallets for AMD, USD, IDR. Name them, pick a card style." },
                { n: "02", title: "Log any transaction",    body: "Type the amount in whatever currency you have. We convert it to USD instantly using live rates." },
                { n: "03", title: "See the real picture",   body: "Your dashboard shows everything unified. No mental math. No surprises at month end." },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: accentDim, border: `1px solid ${accentBdr}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, color: accent, fontFamily: '"SF Mono",ui-monospace,monospace', transition: "background 0.5s, border-color 0.5s, color 0.5s" }}>{s.n}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: fg, margin: "0 0 4px", ...T }}>{s.title}</p>
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: fgMuted, margin: 0, ...T }}>{s.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <Link href="/signup" onClick={() => setDemoOpen(false)}>
                <Button className="w-full" style={{ background: accent, color: "#fff", border: "none", borderRadius: 12, transition: "background 0.5s" }}>
                  Get started now <ArrowRight size={15} />
                </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
