"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Globe, TrendingUp, Layers, ShieldCheck,
  RefreshCw, BarChart2, Heart, Menu, X, ChevronDown,
  ArrowLeftRight, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ── FadeUp wrapper ────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.div>
  );
}

// ── Counter ───────────────────────────────────────────────────────────────────
function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / 1600, 1);
        setVal((1 - Math.pow(1 - p, 4)) * to);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toFixed(decimals)}{suffix}</span>;
}

// ── Magnetic wrapper ──────────────────────────────────────────────────────────
function Magnetic({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 180, damping: 14 });
  const y = useSpring(0, { stiffness: 180, damping: 14 });
  return (
    <motion.div ref={ref} style={{ x, y }} className={className}
      onMouseMove={e => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.22);
        y.set((e.clientY - r.top - r.height / 2) * 0.22);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}

// ── Typewriter ────────────────────────────────────────────────────────────────
const WORDS = ["AMD", "IDR", "USD", "GBP", "EUR", "CHF", "CNY", "RUB"];
function Typewriter() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  const [pause, setPause] = useState(false);
  useEffect(() => {
    if (pause) { const t = setTimeout(() => { setPause(false); setDel(true); }, 1500); return () => clearTimeout(t); }
    const w = WORDS[idx];
    if (!del) {
      if (text.length < w.length) { const t = setTimeout(() => setText(w.slice(0, text.length + 1)), 95); return () => clearTimeout(t); }
      setPause(true);
    } else {
      if (text.length > 0) { const t = setTimeout(() => setText(text.slice(0, -1)), 58); return () => clearTimeout(t); }
      setDel(false); setIdx((idx + 1) % WORDS.length);
    }
  }, [text, del, pause, idx]);
  return (
    <span className="tw-word">
      {text}<span className="tw-cursor" />
    </span>
  );
}

// ── Noise ─────────────────────────────────────────────────────────────────────
function Noise() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let raf: number;
    const draw = () => {
      c.width = c.offsetWidth; c.height = c.offsetHeight;
      const img = ctx.createImageData(c.width, c.height);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 16;
      }
      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="noise" />;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Globe,          title: "Eight currencies",       body: "USD, GBP, EUR, CHF, CNY, IDR, AMD, RUB. Log in any. See all in one place." },
  { icon: RefreshCw,      title: "Live exchange rates",    body: "Every transaction converts the moment you log it. No API key, no cost, no delay." },
  { icon: Layers,         title: "Multiple wallets",       body: "Separate your streams. AMD salary, USD freelance, IDR spending. All unified." },
  { icon: BarChart2,      title: "Budget tracking",        body: "Monthly limits per category. Progress bars that go red before you do." },
  { icon: ArrowLeftRight, title: "Recurring transactions", body: "Salary, rent, subscriptions. Set once and they log themselves every cycle." },
  { icon: ShieldCheck,    title: "Your data only",         body: "Email or Google sign-in. Your numbers live in your account and nowhere else." },
];

const WHO = [
  { title: "The expat with two salaries",       body: "Company pays USD. Landlord wants AMD. Family needs IDR. Perceiva holds all three without losing the thread." },
  { title: "The freelancer with global clients", body: "One client pays GBP, another EUR, another USD. You live somewhere else entirely. Everything converts at the moment it lands." },
  { title: "The traveler who stops tracking",   body: "12,000 AMD on lunch feels fine until you realize it is 45,000 IDR. Perceiva makes that visible before it becomes a habit." },
];

const PERCEPTION = [
  { code: "AMD", sym: "\u058F", amount: "387",    label: "Armenian Dram",     note: "feels like pocket change" },
  { code: "IDR", sym: "Rp",     amount: "15,800", label: "Indonesian Rupiah", note: "sounds enormous" },
  { code: "RUB", sym: "\u20BD", amount: "89.5",   label: "Russian Ruble",     note: "" },
  { code: "CNY", sym: "\u00A5", amount: "7.24",   label: "Chinese Yuan",      note: "" },
  { code: "GBP", sym: "\u00A3", amount: "0.79",   label: "British Pound",     note: "worth more than $1" },
];

const TICKER = [
  "1 USD = \u058F387 AMD","1 USD = Rp 15,800","1 EUR = $1.09 USD",
  "1 GBP = $1.27 USD","1 USD = Fr 0.88 CHF","1 USD = \u00A57.24 CNY",
  "1 AMD = Rp 40.8 IDR","1 CHF = $1.13 USD","1 USD = \u20BD89.5 RUB",
  "1 EUR = \u058F422 AMD","1 GBP = Rp 20,000 IDR","1 USD = \u00A30.79 GBP",
];

const FLOATS = [
  { from: "4,700 AMD",  to: "$12.13",  d: 0.68 },
  { from: "Rp 170,000", to: "$10.76", d: 0.80 },
  { from: "\u00A380 GBP",   to: "$101.60", d: 0.92 },
  { from: "Fr 500 CHF", to: "$565.00", d: 1.04 },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: rootRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const heroY       = useTransform(scrollYProgress, [0, 0.12], [0, -48]);
  const heroScale   = useTransform(scrollYProgress, [0, 0.12], [1, 0.96]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 44);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <TooltipProvider>
      <div className="lp" ref={rootRef}>
        <Noise />

        {/* NAV */}
        <motion.nav className="lp-nav"
          initial={{ y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ background: scrolled ? "rgba(0,0,0,0.82)" : "transparent", borderBottomColor: scrolled ? "rgba(255,255,255,0.07)" : "transparent" }}
        >
          <span className="lp-logo">Perceiva</span>
          <nav className="lp-links">
            {["What it does","Who it is for","Perception gap"].map((l, i) => (
              <motion.a key={l} href={`#${["what","who","perception"][i]}`} className="lp-link"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.06 }}
                whileHover={{ color: "#f5f5f7" }}
              >{l}</motion.a>
            ))}
          </nav>
          <div className="lp-nav-right">
            <Link href="/login"><Button variant="ghost" size="sm" className="lp-ghost-btn">Sign in</Button></Link>
            <Link href="/signup">
              <Button size="sm" className="lp-cta-btn">Get started <ArrowRight size={13} /></Button>
            </Link>
            <button className="lp-burger" onClick={() => setMenu(true)}><Menu size={20} /></button>
          </div>
        </motion.nav>

        <AnimatePresence>
          {menu && (
            <motion.div className="lp-mobile"
              initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
            >
              <button className="lp-mobile-x" onClick={() => setMenu(false)}><X size={22} /></button>
              <div className="lp-mobile-links">
                {["What it does","Who it is for","Perception gap"].map((l, i) => (
                  <motion.a key={l} href={`#${["what","who","perception"][i]}`} className="lp-mobile-link"
                    initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }} onClick={() => setMenu(false)}
                  >{l}</motion.a>
                ))}
              </div>
              <div className="lp-mobile-btns">
                <Link href="/signup" onClick={() => setMenu(false)}><Button size="lg" className="w-full">Get started <ArrowRight size={15} /></Button></Link>
                <Link href="/login"  onClick={() => setMenu(false)}><Button size="lg" variant="outline" className="w-full">Sign in</Button></Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO */}
        <section className="lp-hero">
          <motion.div className="lp-hero-inner" style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.55 }}>
              <Badge className="lp-hero-badge"><Zap size={11} />Live exchange rates across 8 currencies</Badge>
            </motion.div>

            <motion.h1 className="lp-h1"
              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Log in <Typewriter /><br />
              <span className="lp-h1-dim">understand in USD.</span>
            </motion.h1>

            <motion.p className="lp-hero-sub"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.55 }}
            >
              You earn in one currency, spend in another, and save in a third.
              Perceiva shows you what you actually have, in terms you actually understand.
            </motion.p>

            <motion.div className="lp-hero-btns"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.60, duration: 0.5 }}
            >
              <Magnetic>
                <Link href="/signup" className="lp-btn-primary">Start for free <ArrowRight size={15} /></Link>
              </Magnetic>
              <Magnetic>
                <Link href="/login" className="lp-btn-ghost">Sign in</Link>
              </Magnetic>
            </motion.div>

            <motion.div className="lp-chevron" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
              <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                <ChevronDown size={17} />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* float cards */}
          <div className="lp-floats">
            {FLOATS.map((f, i) => (
              <motion.div key={i} className="lp-float"
                initial={{ opacity: 0, y: 18, scale: 0.93 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: f.d, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.05, borderColor: "rgba(10,132,255,0.45)" }}
              >
                <span className="lp-float-from">{f.from}</span>
                <motion.div animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.35 }}>
                  <ArrowRight size={11} className="lp-float-arr" />
                </motion.div>
                <span className="lp-float-to">{f.to}</span>
              </motion.div>
            ))}
          </div>

          <div className="lp-glow-a" />
          <div className="lp-glow-b" />
        </section>

        {/* TICKER */}
        <div className="lp-ticker-wrap">
          <div className="lp-ticker">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="lp-tick">
                {t}<span className="lp-tick-dot" />
              </span>
            ))}
          </div>
        </div>

        {/* PERCEPTION */}
        <section className="lp-sec" id="perception">
          <div className="lp-inner">
            <FadeUp><p className="lp-label">The perception gap</p></FadeUp>
            <FadeUp delay={0.05}><h2 className="lp-h2">One dollar.<br />Five realities.</h2></FadeUp>
            <FadeUp delay={0.1}>
              <p className="lp-body">
                The same amount looks completely different depending on which currency you are holding.
                Perceiva corrects that gap so you stop treating expensive things as cheap.
              </p>
            </FadeUp>

            <div className="lp-perc-grid">
              <FadeUp delay={0.08} className="lp-perc-anchor">
                <span className="lp-perc-eye">Base</span>
                <span className="lp-perc-big">$1.00</span>
                <span className="lp-perc-code-sm">USD</span>
              </FadeUp>
              {PERCEPTION.map((p, i) => (
                <FadeUp key={p.code} delay={0.08 + i * 0.07}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div className="lp-perc-card"
                        whileHover={{ scale: 1.025, borderColor: "rgba(10,132,255,0.3)", backgroundColor: "rgba(255,255,255,0.04)" }}
                        transition={{ type: "spring", stiffness: 280, damping: 20 }}
                      >
                        <div className="lp-perc-top">
                          <Badge variant="outline" className="lp-perc-badge">{p.code}</Badge>
                          <span className="lp-perc-name">{p.label}</span>
                        </div>
                        <span className="lp-perc-amt">{p.sym}{p.amount}</span>
                        {p.note && <span className="lp-perc-note">{p.note}</span>}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">1 USD = {p.sym}{p.amount} {p.code}</p>
                    </TooltipContent>
                  </Tooltip>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        <Separator className="lp-divider" />

        {/* FEATURES */}
        <section className="lp-sec" id="what">
          <div className="lp-inner">
            <FadeUp><p className="lp-label">What it does</p></FadeUp>
            <FadeUp delay={0.05}><h2 className="lp-h2">Every currency.<br />One dashboard.</h2></FadeUp>
            <div className="lp-feat-grid">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <FadeUp key={i} delay={i * 0.055}>
                    <motion.div className="lp-feat-card"
                      whileHover={{ y: -5, borderColor: "rgba(10,132,255,0.22)" }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <motion.div className="lp-feat-icon"
                        whileHover={{ scale: 1.12, rotate: 8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 14 }}
                      >
                        <Icon size={19} />
                      </motion.div>
                      <h3 className="lp-feat-title">{f.title}</h3>
                      <p className="lp-feat-body">{f.body}</p>
                    </motion.div>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </section>

        <Separator className="lp-divider" />

        {/* WHO */}
        <section className="lp-sec" id="who">
          <div className="lp-inner">
            <FadeUp><p className="lp-label">Who it is for</p></FadeUp>
            <FadeUp delay={0.05}><h2 className="lp-h2">Built for people who<br />live between currencies.</h2></FadeUp>
            <div className="lp-who-grid">
              {WHO.map((w, i) => (
                <FadeUp key={i} delay={i * 0.09}>
                  <motion.div className="lp-who-card"
                    whileHover={{ y: -7, borderColor: "rgba(255,255,255,0.15)" }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <span className="lp-who-num">0{i + 1}</span>
                    <h3 className="lp-who-title">{w.title}</h3>
                    <p className="lp-who-body">{w.body}</p>
                    <motion.div className="lp-who-bar"
                      initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.55 }}
                    />
                  </motion.div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="lp-stats-wrap">
          <div className="lp-inner">
            <div className="lp-stats-grid">
              {[
                { v: 8,   s: "",     l: "Currencies supported" },
                { v: 100, s: "%",    l: "Free to use" },
                { v: 5,   s: " min", l: "To set up" },
                { v: 0,   s: "",     l: "Mental math required" },
              ].map((s, i) => (
                <FadeIn key={i} delay={i * 0.07}>
                  <div className="lp-stat">
                    <span className="lp-stat-v"><Counter to={s.v} suffix={s.s} /></span>
                    <span className="lp-stat-l">{s.l}</span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <section className="lp-cta-sec">
          <div className="lp-inner lp-cta-inner">
            <FadeUp><h2 className="lp-cta-h">See your money<br />for what it is.</h2></FadeUp>
            <FadeUp delay={0.1}><p className="lp-cta-sub">Set up in minutes. No credit card. No subscriptions. Just clarity.</p></FadeUp>
            <FadeUp delay={0.18}>
              <Magnetic>
                <Link href="/signup" className="lp-btn-primary lp-btn-lg">Create your account <ArrowRight size={17} /></Link>
              </Magnetic>
            </FadeUp>
            <FadeUp delay={0.24}>
              <Link href="/login" className="lp-cta-login">Already have an account? Sign in</Link>
            </FadeUp>
          </div>
          <div className="lp-cta-glow" />
        </section>

        {/* FOOTER */}
        <footer className="lp-footer">
          <Separator className="lp-divider" />
          <div className="lp-foot-inner">
            <span className="lp-foot-logo">Perceiva</span>
            <span className="lp-foot-made">
              made with
              <motion.span className="lp-foot-heart"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.7, ease: "easeInOut" }}
              >
                <Heart size={12} fill="#ff453a" color="#ff453a" />
              </motion.span>
              by ren
            </span>
          </div>
        </footer>

        <style>{`
          .lp { min-height:100vh; background:#000; color:#f5f5f7; font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",sans-serif; overflow-x:hidden; position:relative; }

          /* noise */
          .noise { position:fixed; inset:0; width:100%; height:100%; pointer-events:none; z-index:1; opacity:0.35; }

          /* nav */
          .lp-nav { position:fixed; top:0; left:0; right:0; z-index:200; display:flex; align-items:center; justify-content:space-between; padding:0 52px; height:58px; backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); border-bottom:1px solid transparent; transition:background 0.4s,border-color 0.4s; }
          .lp-logo { font-size:17px; font-weight:700; letter-spacing:-0.025em; }
          .lp-links { display:flex; gap:36px; }
          .lp-link { font-size:13px; color:rgba(245,245,247,0.55); text-decoration:none; transition:color 0.2s; }
          .lp-nav-right { display:flex; align-items:center; gap:8px; }
          .lp-ghost-btn { color:rgba(245,245,247,0.6) !important; font-size:13px !important; }
          .lp-cta-btn { font-size:13px !important; border-radius:980px !important; display:flex; align-items:center; gap:6px; }
          .lp-burger { display:none; background:none; border:none; color:rgba(245,245,247,0.7); cursor:pointer; padding:7px; border-radius:8px; }
          .lp-burger:hover { background:rgba(255,255,255,0.08); }

          /* mobile */
          .lp-mobile { position:fixed; inset:0; z-index:300; background:rgba(0,0,0,0.96); backdrop-filter:blur(28px); display:flex; flex-direction:column; padding:84px 32px 48px; }
          .lp-mobile-x { position:absolute; top:16px; right:18px; background:rgba(255,255,255,0.07); border:none; color:#f5f5f7; cursor:pointer; padding:10px; border-radius:50%; }
          .lp-mobile-links { display:flex; flex-direction:column; flex:1; }
          .lp-mobile-link { font-size:28px; font-weight:600; color:rgba(245,245,247,0.65); text-decoration:none; padding:16px 0; border-bottom:1px solid rgba(255,255,255,0.07); transition:color 0.2s; }
          .lp-mobile-link:hover { color:#f5f5f7; }
          .lp-mobile-btns { display:flex; flex-direction:column; gap:12px; margin-top:32px; }

          /* hero */
          .lp-hero { position:relative; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:130px 24px 100px; overflow:hidden; z-index:2; }
          .lp-hero-inner { position:relative; z-index:3; max-width:840px; width:100%; display:flex; flex-direction:column; align-items:center; gap:22px; will-change:transform,opacity; }
          .lp-hero-badge { border-color:rgba(10,132,255,0.3) !important; background:rgba(10,132,255,0.1) !important; color:rgba(10,132,255,0.9) !important; font-size:12px !important; gap:6px; border-radius:980px !important; padding:5px 14px !important; }
          .lp-h1 { font-size:clamp(50px,8vw,104px); font-weight:700; letter-spacing:-0.045em; line-height:1.01; color:#f5f5f7; }
          .lp-h1-dim { color:rgba(245,245,247,0.32); }
          .lp-hero-sub { font-size:clamp(15px,2vw,19px); line-height:1.68; color:rgba(245,245,247,0.48); max-width:500px; }
          .lp-hero-btns { display:flex; align-items:center; gap:16px; flex-wrap:wrap; justify-content:center; margin-top:6px; }
          .lp-chevron { color:rgba(245,245,247,0.18); margin-top:16px; }

          /* typewriter */
          .tw-word { background:linear-gradient(90deg,#0a84ff,#40c4ff,#0a84ff); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:grad 2.6s linear infinite; min-width:3ch; display:inline-block; }
          @keyframes grad { from{background-position:0%} to{background-position:200%} }
          .tw-cursor { display:inline-block; width:3px; height:0.82em; background:#0a84ff; margin-left:3px; vertical-align:middle; border-radius:2px; animation:blink 1s step-end infinite; -webkit-text-fill-color:initial; }
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

          /* float cards */
          .lp-floats { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:10px; position:relative; z-index:3; }
          .lp-float { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:980px; padding:9px 18px; font-size:13px; backdrop-filter:blur(12px); cursor:default; }
          .lp-float-from { color:rgba(245,245,247,0.38); font-variant-numeric:tabular-nums; }
          .lp-float-arr { color:rgba(10,132,255,0.65); }
          .lp-float-to { color:#f5f5f7; font-weight:600; font-variant-numeric:tabular-nums; }

          /* glows */
          .lp-glow-a { position:absolute; top:18%; left:50%; transform:translateX(-50%); width:820px; height:520px; background:radial-gradient(ellipse,rgba(10,132,255,0.14) 0%,transparent 68%); pointer-events:none; z-index:0; }
          .lp-glow-b { position:absolute; bottom:0; left:18%; width:420px; height:420px; background:radial-gradient(ellipse,rgba(94,92,230,0.07) 0%,transparent 70%); pointer-events:none; z-index:0; }

          /* buttons */
          .lp-btn-primary { display:inline-flex; align-items:center; gap:8px; background:#0a84ff; color:#fff; font-size:15px; font-weight:500; border-radius:980px; padding:13px 26px; text-decoration:none; transition:background 0.2s,transform 0.15s; }
          .lp-btn-primary:hover { background:#1a90ff; transform:translateY(-1px); }
          .lp-btn-primary:active { transform:scale(0.97); }
          .lp-btn-lg { font-size:17px; padding:16px 34px; }
          .lp-btn-ghost { display:inline-flex; align-items:center; color:rgba(245,245,247,0.55); font-size:15px; font-weight:500; text-decoration:none; padding:13px 4px; transition:color 0.2s; }
          .lp-btn-ghost:hover { color:#f5f5f7; }

          /* ticker */
          .lp-ticker-wrap { overflow:hidden; border-top:1px solid rgba(255,255,255,0.06); border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.014); padding:13px 0; position:relative; z-index:2; }
          .lp-ticker { display:flex; width:max-content; animation:tick 32s linear infinite; }
          @keyframes tick { from{transform:translateX(0)} to{transform:translateX(-50%)} }
          .lp-tick { font-size:11.5px; font-variant-numeric:tabular-nums; color:rgba(245,245,247,0.32); letter-spacing:0.04em; white-space:nowrap; font-family:"SF Mono",ui-monospace,monospace; display:flex; align-items:center; padding:0 28px; }
          .lp-tick-dot { width:3px; height:3px; border-radius:50%; background:rgba(10,132,255,0.35); margin-left:28px; flex-shrink:0; }

          /* sections */
          .lp-sec { padding:120px 24px; position:relative; z-index:2; }
          .lp-inner { max-width:1100px; margin:0 auto; }
          .lp-divider { background:rgba(255,255,255,0.06) !important; position:relative; z-index:2; }
          .lp-label { font-size:11.5px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:rgba(10,132,255,0.72); margin-bottom:16px; }
          .lp-h2 { font-size:clamp(34px,5vw,64px); font-weight:700; letter-spacing:-0.038em; line-height:1.06; color:#f5f5f7; margin-bottom:20px; }
          .lp-body { font-size:17px; line-height:1.7; color:rgba(245,245,247,0.48); max-width:500px; margin-bottom:56px; }

          /* perception */
          .lp-perc-grid { display:grid; grid-template-columns:170px repeat(5,1fr); gap:2px; background:rgba(255,255,255,0.05); border-radius:22px; overflow:hidden; border:1px solid rgba(255,255,255,0.07); }
          .lp-perc-anchor { display:flex; flex-direction:column; justify-content:center; padding:44px 26px; background:rgba(10,132,255,0.1); gap:4px; }
          .lp-perc-card { display:flex; flex-direction:column; justify-content:center; padding:44px 22px; background:rgba(255,255,255,0.018); gap:5px; cursor:default; border:1px solid transparent; transition:background 0.2s; }
          .lp-perc-eye { font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:rgba(10,132,255,0.65); }
          .lp-perc-big { font-size:46px; font-weight:700; letter-spacing:-0.04em; color:#f5f5f7; font-variant-numeric:tabular-nums; }
          .lp-perc-code-sm { font-size:11px; color:rgba(245,245,247,0.32); font-weight:600; letter-spacing:0.08em; }
          .lp-perc-top { display:flex; align-items:center; gap:7px; flex-wrap:wrap; }
          .lp-perc-badge { font-size:9px !important; padding:2px 7px !important; border-color:rgba(255,255,255,0.11) !important; color:rgba(245,245,247,0.45) !important; background:transparent !important; font-weight:700 !important; letter-spacing:0.07em !important; }
          .lp-perc-name { font-size:10px; color:rgba(245,245,247,0.28); }
          .lp-perc-amt { font-size:28px; font-weight:700; letter-spacing:-0.03em; color:#f5f5f7; font-variant-numeric:tabular-nums; }
          .lp-perc-note { font-size:11px; color:rgba(245,245,247,0.26); font-style:italic; }

          /* features */
          .lp-feat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; background:rgba(255,255,255,0.05); border-radius:22px; overflow:hidden; border:1px solid rgba(255,255,255,0.07); margin-top:52px; }
          .lp-feat-card { padding:40px 34px; background:rgba(255,255,255,0.014); display:flex; flex-direction:column; gap:13px; border:1px solid transparent; cursor:default; }
          .lp-feat-icon { width:42px; height:42px; border-radius:13px; background:rgba(10,132,255,0.1); border:1px solid rgba(10,132,255,0.17); display:flex; align-items:center; justify-content:center; color:#0a84ff; }
          .lp-feat-title { font-size:15px; font-weight:600; letter-spacing:-0.02em; color:#f5f5f7; line-height:1.3; }
          .lp-feat-body { font-size:13.5px; line-height:1.65; color:rgba(245,245,247,0.4); }

          /* who */
          .lp-who-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-top:52px; }
          .lp-who-card { padding:38px 30px; background:rgba(255,255,255,0.024); border:1px solid rgba(255,255,255,0.07); border-radius:22px; display:flex; flex-direction:column; gap:11px; cursor:default; position:relative; overflow:hidden; }
          .lp-who-num { font-size:11px; font-weight:700; letter-spacing:0.12em; color:rgba(10,132,255,0.52); font-family:"SF Mono",ui-monospace,monospace; }
          .lp-who-title { font-size:17px; font-weight:600; letter-spacing:-0.025em; color:#f5f5f7; line-height:1.28; }
          .lp-who-body { font-size:14px; line-height:1.72; color:rgba(245,245,247,0.4); }
          .lp-who-bar { position:absolute; bottom:0; left:0; height:2px; width:100%; background:linear-gradient(90deg,#0a84ff,transparent); transform-origin:left; }

          /* stats */
          .lp-stats-wrap { padding:76px 24px; border-top:1px solid rgba(255,255,255,0.06); border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.01); position:relative; z-index:2; }
          .lp-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:2px; background:rgba(255,255,255,0.05); border-radius:22px; overflow:hidden; border:1px solid rgba(255,255,255,0.07); }
          .lp-stat { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:52px 20px; background:rgba(255,255,255,0.014); text-align:center; }
          .lp-stat-v { font-size:54px; font-weight:700; letter-spacing:-0.045em; color:#f5f5f7; font-variant-numeric:tabular-nums; line-height:1; }
          .lp-stat-l { font-size:13px; color:rgba(245,245,247,0.36); max-width:110px; line-height:1.45; }

          /* cta */
          .lp-cta-sec { padding:140px 24px 120px; text-align:center; position:relative; overflow:hidden; z-index:2; }
          .lp-cta-inner { display:flex; flex-direction:column; align-items:center; gap:18px; position:relative; z-index:2; }
          .lp-cta-h { font-size:clamp(38px,6.5vw,80px); font-weight:700; letter-spacing:-0.045em; line-height:1.03; color:#f5f5f7; }
          .lp-cta-sub { font-size:17px; color:rgba(245,245,247,0.42); max-width:360px; line-height:1.65; }
          .lp-cta-login { font-size:13px; color:rgba(245,245,247,0.28); text-decoration:none; transition:color 0.2s; }
          .lp-cta-login:hover { color:rgba(245,245,247,0.58); }
          .lp-cta-glow { position:absolute; top:25%; left:50%; transform:translateX(-50%); width:680px; height:380px; background:radial-gradient(ellipse,rgba(10,132,255,0.11) 0%,transparent 66%); pointer-events:none; }

          /* footer */
          .lp-footer { position:relative; z-index:2; }
          .lp-foot-inner { display:flex; align-items:center; justify-content:space-between; padding:26px 52px; }
          .lp-foot-logo { font-size:14px; font-weight:600; letter-spacing:-0.02em; color:rgba(245,245,247,0.26); }
          .lp-foot-made { display:flex; align-items:center; gap:5px; font-size:13px; color:rgba(245,245,247,0.26); }
          .lp-foot-heart { display:inline-flex; align-items:center; }

          /* responsive */
          @media (max-width:1024px) {
            .lp-perc-grid { grid-template-columns:repeat(3,1fr); }
            .lp-perc-anchor { grid-column:span 3; flex-direction:row; align-items:center; gap:20px; padding:28px; }
            .lp-perc-big { font-size:34px; }
          }
          @media (max-width:900px) {
            .lp-nav { padding:0 24px; }
            .lp-links { display:none; }
            .lp-burger { display:flex; }
            .lp-ghost-btn { display:none; }
            .lp-feat-grid { grid-template-columns:repeat(2,1fr); }
            .lp-who-grid { grid-template-columns:1fr 1fr; }
            .lp-stats-grid { grid-template-columns:repeat(2,1fr); }
            .lp-perc-grid { grid-template-columns:repeat(2,1fr); }
            .lp-perc-anchor { grid-column:span 2; }
          }
          @media (max-width:640px) {
            .lp-hero { padding:110px 20px 80px; }
            .lp-sec { padding:80px 20px; }
            .lp-feat-grid { grid-template-columns:1fr; }
            .lp-who-grid { grid-template-columns:1fr; }
            .lp-perc-grid { grid-template-columns:1fr 1fr; }
            .lp-perc-anchor { grid-column:span 2; }
            .lp-float:nth-child(n+3) { display:none; }
            .lp-foot-inner { padding:22px 20px; }
            .lp-cta-sec { padding:100px 20px 80px; }
            .lp-stats-wrap { padding:60px 20px; }
            .lp-stats-grid { grid-template-columns:repeat(2,1fr); }
          }
        `}</style>
      </div>
    </TooltipProvider>
  );
}
