"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  motion, useScroll, useTransform, useSpring,
  useInView, AnimatePresence, useMotionValue, useVelocity, useAnimationFrame,
} from "framer-motion";
import {
  ArrowRight, Globe, Layers, ShieldCheck, RefreshCw,
  BarChart2, Heart, Menu, X, ChevronDown, ArrowLeftRight,
  Zap, Sun, Moon, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

// ── Spring config (silky smooth) ──────────────────────────────────────────────
const SPRING = { stiffness: 120, damping: 20, mass: 1 };
const SPRING_FAST = { stiffness: 200, damping: 22, mass: 0.8 };

// ── FadeUp ────────────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 36, filter: "blur(4px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.7, delay }}
    >
      {children}
    </motion.div>
  );
}

// ── Magnetic ──────────────────────────────────────────────────────────────────
function Magnetic({ children, className = "", strength = 0.22 }: { children: React.ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  return (
    <motion.div ref={ref} style={{ x, y }} className={className}
      onMouseMove={e => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}

// ── Typewriter ────────────────────────────────────────────────────────────────
const WORDS = ["AMD", "IDR", "USD", "GBP", "EUR", "CHF", "CNY", "RUB", "anything"];
function Typewriter({ dark }: { dark: boolean }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  const [pause, setPause] = useState(false);
  useEffect(() => {
    if (pause) { const t = setTimeout(() => { setPause(false); setDel(true); }, 1600); return () => clearTimeout(t); }
    const w = WORDS[idx];
    if (!del) {
      if (text.length < w.length) { const t = setTimeout(() => setText(w.slice(0, text.length + 1)), 88); return () => clearTimeout(t); }
      setPause(true);
    } else {
      if (text.length > 0) { const t = setTimeout(() => setText(text.slice(0, -1)), 52); return () => clearTimeout(t); }
      setDel(false); setIdx((idx + 1) % WORDS.length);
    }
  }, [text, del, pause, idx]);
  return (
    <span className={`tw ${dark ? "tw-dark" : "tw-light"}`}>
      {text}<span className="tw-cur" />
    </span>
  );
}

// ── Infinite marquee (velocity-aware) ────────────────────────────────────────
function Marquee({ items, speed = 40, dark }: { items: string[]; speed?: number; dark: boolean }) {
  const x = useMotionValue(0);
  const baseX = useMotionValue(0);
  const listRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);

  useEffect(() => {
    if (listRef.current) setW(listRef.current.scrollWidth / 2);
  }, []);

  useAnimationFrame((_, delta) => {
    const moveBy = -speed * (delta / 1000);
    baseX.set(baseX.get() + moveBy);
    if (listRef.current && Math.abs(baseX.get()) >= w) baseX.set(0);
    x.set(baseX.get());
  });

  const doubled = [...items, ...items];
  return (
    <div className={`mq-wrap ${dark ? "mq-dark" : "mq-light"}`}>
      <motion.div className="mq-inner" ref={listRef} style={{ x }}>
        {doubled.map((t, i) => (
          <span key={i} className="mq-item">
            {t}<span className="mq-dot" />
          </span>
        ))}
      </motion.div>
    </div>
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
      c.width = window.innerWidth; c.height = window.innerHeight;
      const img = ctx.createImageData(c.width, c.height);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 14;
      }
      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="noise-c" />;
}

// ── Counter ───────────────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return;
      done.current = true;
      const t0 = performance.now();
      const go = (now: number) => {
        const p = Math.min((now - t0) / 1800, 1);
        setVal((1 - Math.pow(1 - p, 4)) * to);
        if (p < 1) requestAnimationFrame(go);
      };
      requestAnimationFrame(go);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{Math.round(val)}{suffix}</span>;
}

// ── Data ──────────────────────────────────────────────────────────────────────
// Rates accurate as of May 2026 (xe.com reference)
const PERCEPTION = [
  { code: "AMD", sym: "֏",   amount: "390",      label: "Armenian Dram",     note: "pocket change vibes" },
  { code: "IDR", sym: "Rp",  amount: "17,417",   label: "Indonesian Rupiah", note: "17k feels like nothing" },
  { code: "RUB", sym: "₽",   amount: "91.2",     label: "Russian Ruble",     note: "" },
  { code: "CNY", sym: "¥",   amount: "7.26",     label: "Chinese Yuan",      note: "" },
  { code: "GBP", sym: "£",   amount: "0.79",     label: "British Pound",     note: "worth more than $1" },
];

const FEATURES = [
  { icon: Globe,          title: "8+ currencies",          body: "USD, GBP, EUR, CHF, CNY, IDR, AMD, RUB — and more on the way. Log in any of them." },
  { icon: RefreshCw,      title: "Live rates",             body: "Converts the moment you log it. Frankfurter API. No key needed, always fresh." },
  { icon: Layers,         title: "Multiple wallets",       body: "AMD salary, USD freelance, IDR spending. Separate streams, one unified view." },
  { icon: BarChart2,      title: "Budget tracking",        body: "Monthly limits per category. Progress bars that turn red before your bank does." },
  { icon: ArrowLeftRight, title: "Recurring transactions", body: "Salary, rent, subs. Set once. They log themselves every cycle." },
  { icon: ShieldCheck,    title: "Your data only",         body: "Email or Google sign-in. Your numbers live in your account — nowhere else." },
];

const WHO = [
  { n: "01", title: "The expat juggling three currencies",  body: "Company pays USD. Landlord wants AMD. Family needs IDR. Perceiva holds all of it without losing the thread." },
  { n: "02", title: "The freelancer with global clients",   body: "GBP from London, EUR from Berlin, USD from New York. You live somewhere else entirely. Everything converts at the moment it lands." },
  { n: "03", title: "The traveler who stops tracking",      body: "Spending 12,000 AMD on lunch feels fine until you see it is 207,000 IDR. Perceiva makes that visible — before it becomes a habit." },
];

const TICKER = [
  "1 USD = ֏390 AMD", "1 USD = Rp 17,417 IDR", "1 EUR = $1.09 USD",
  "1 GBP = $1.27 USD", "1 USD = Fr 0.88 CHF", "1 USD = ¥7.26 CNY",
  "1 AMD = Rp 44.7 IDR", "1 CHF = $1.14 USD", "1 USD = ₽91.2 RUB",
  "1 EUR = ֏425 AMD", "1 GBP = Rp 22,100 IDR", "1 CNY = Rp 2,399 IDR",
];

const FLOATS = [
  { from: "4,700 AMD",   to: "$12.05",   d: 0.65 },
  { from: "Rp 207,000",  to: "$11.89",   d: 0.77 },
  { from: "£80 GBP",     to: "$101.60",  d: 0.90 },
  { from: "Fr 50 CHF",   to: "$57.00",   d: 1.02 },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [dark, setDark] = useState(true);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: rootRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.11], [1, 0]);
  const heroY       = useTransform(scrollYProgress, [0, 0.13], [0, -52]);
  const heroScale   = useTransform(scrollYProgress, [0, 0.13], [1, 0.95]);

  // Smooth spring versions
  const sHeroOpacity = useSpring(heroOpacity, { stiffness: 80, damping: 20 });
  const sHeroY       = useSpring(heroY,       { stiffness: 80, damping: 20 });
  const sHeroScale   = useSpring(heroScale,   { stiffness: 80, damping: 20 });

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 44);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // css vars driven by dark
  const d = dark;

  return (
    <TooltipProvider delayDuration={200}>
      <div className={`lp ${d ? "lp-dark" : "lp-light"}`} ref={rootRef}>
        <Noise />

        {/* ── NAV ── */}
        <motion.header className={`lp-nav ${scrolled ? "lp-nav-scrolled" : ""} ${d ? "nav-dark" : "nav-light"}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="lp-logo">Perceiva</span>

          <nav className="lp-nav-links">
            {[["What it does","what"],["Who it is for","who"],["Why it exists","perception"]].map(([l, id], i) => (
              <motion.a key={l} href={`#${id}`} className="lp-nav-a"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.07, duration: 0.5 }}
                whileHover={{ opacity: 1 }}
              >{l}</motion.a>
            ))}
          </nav>

          <div className="lp-nav-right">
            {/* theme toggle */}
            <motion.div className="lp-theme-toggle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            >
              <Sun size={13} className={`theme-icon ${!d ? "theme-icon-active" : ""}`} />
              <Switch
                checked={d}
                onCheckedChange={setDark}
                className="theme-switch"
              />
              <Moon size={13} className={`theme-icon ${d ? "theme-icon-active" : ""}`} />
            </motion.div>

            <Link href="/login">
              <Button variant="ghost" size="sm" className={`lp-ghost ${d ? "lp-ghost-dark" : "lp-ghost-light"}`}>
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="lp-primary-btn">
                Get started <ArrowRight size={13} />
              </Button>
            </Link>
            <button className={`lp-burger ${d ? "burger-dark" : "burger-light"}`} onClick={() => setMenu(true)}>
              <Menu size={20} />
            </button>
          </div>
        </motion.header>

        {/* mobile menu */}
        <AnimatePresence>
          {menu && (
            <motion.div className={`lp-mob ${d ? "mob-dark" : "mob-light"}`}
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <button className="lp-mob-x" onClick={() => setMenu(false)}><X size={22} /></button>
              <div className="lp-mob-links">
                {[["What it does","what"],["Who it is for","who"],["Why it exists","perception"]].map(([l, id], i) => (
                  <motion.a key={l} href={`#${id}`} className="lp-mob-a"
                    initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setMenu(false)}
                  >{l}</motion.a>
                ))}
              </div>
              <div className="lp-mob-btns">
                <Link href="/signup" onClick={() => setMenu(false)}>
                  <Button size="lg" className="w-full lp-primary-btn">Get started <ArrowRight size={15} /></Button>
                </Link>
                <Link href="/login" onClick={() => setMenu(false)}>
                  <Button size="lg" variant="outline" className="w-full">Sign in</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HERO ── */}
        <section className="lp-hero">
          <motion.div className="lp-hero-inner"
            style={{ opacity: sHeroOpacity, y: sHeroY, scale: sHeroScale }}
          >
            <motion.div
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Badge className={`hero-badge ${d ? "hero-badge-dark" : "hero-badge-light"}`}>
                <Zap size={11} /> Live rates. 8+ currencies. Always free.
              </Badge>
            </motion.div>

            <motion.h1 className={`lp-h1 ${d ? "h1-dark" : "h1-light"}`}
              initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.36, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              Log in <Typewriter dark={d} /><br />
              <span className={`h1-dim ${d ? "h1-dim-dark" : "h1-dim-light"}`}>
                get the real number.
              </span>
            </motion.h1>

            <motion.p className={`lp-hero-sub ${d ? "sub-dark" : "sub-light"}`}
              initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.50, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Your AMD salary hits different when you realize how much it actually is in IDR.
              Perceiva converts everything, live, so you always know what you are working with.
            </motion.p>

            <motion.div className="lp-hero-btns"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Magnetic>
                <Link href="/signup" className="lp-btn-p">
                  Start for free <ArrowRight size={15} />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="/login" className={`lp-btn-g ${d ? "btn-g-dark" : "btn-g-light"}`}>
                  Sign in
                </Link>
              </Magnetic>
            </motion.div>

            <motion.div className={`lp-scroll-hint ${d ? "hint-dark" : "hint-light"}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: [0.45, 0, 0.55, 1] }}
              >
                <ChevronDown size={17} />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* floating cards */}
          <div className="lp-floats">
            {FLOATS.map((f, i) => (
              <motion.div key={i}
                className={`lp-float ${d ? "float-dark" : "float-light"}`}
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: f.d, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.06, y: -3 }}
              >
                <span className={`float-from ${d ? "float-from-dark" : "float-from-light"}`}>{f.from}</span>
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 2.4, delay: i * 0.4, ease: "easeInOut" }}
                >
                  <ArrowRight size={11} className="float-arr" />
                </motion.span>
                <span className={`float-to ${d ? "float-to-dark" : "float-to-light"}`}>{f.to}</span>
              </motion.div>
            ))}
          </div>

          {/* glows */}
          <div className={`glow-a ${d ? "glow-dark" : "glow-light"}`} />
          <div className="glow-b" />
        </section>

        {/* ── TICKER ── */}
        <Marquee items={TICKER} dark={d} />

        {/* ── PERCEPTION ── */}
        <section className="lp-sec" id="perception">
          <div className="lp-inner">
            <FadeUp>
              <p className={`lp-label ${d ? "label-dark" : "label-light"}`}>Why it exists</p>
              <h2 className={`lp-h2 ${d ? "h2-dark" : "h2-light"}`}>
                $1 hits different<br />everywhere you go.
              </h2>
              <p className={`lp-body ${d ? "body-dark" : "body-light"}`}>
                Numbers lie. 4,700 AMD sounds cheap until you do the math. 
                Perceiva does it for you — instantly, every time, no calculator needed.
              </p>
            </FadeUp>

            <div className="lp-perc-grid">
              <FadeUp delay={0.06} className={`perc-anchor ${d ? "anchor-dark" : "anchor-light"}`}>
                <span className={`perc-eye ${d ? "perc-eye-dark" : "perc-eye-light"}`}>anchor</span>
                <span className={`perc-big ${d ? "perc-big-dark" : "perc-big-light"}`}>$1.00</span>
                <span className={`perc-cur ${d ? "perc-cur-dark" : "perc-cur-light"}`}>USD</span>
              </FadeUp>

              {PERCEPTION.map((p, i) => (
                <FadeUp key={p.code} delay={0.06 + i * 0.08}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div className={`perc-card ${d ? "perc-card-dark" : "perc-card-light"}`}
                        whileHover={{ scale: 1.03, y: -4 }}
                        transition={{ type: "spring", ...SPRING_FAST }}
                      >
                        <div className="perc-top">
                          <Badge variant="outline" className={`perc-badge ${d ? "perc-badge-dark" : "perc-badge-light"}`}>
                            {p.code}
                          </Badge>
                          <span className={`perc-name ${d ? "perc-name-dark" : "perc-name-light"}`}>{p.label}</span>
                        </div>
                        <span className={`perc-amt ${d ? "perc-amt-dark" : "perc-amt-light"}`}>
                          {p.sym}{p.amount}
                        </span>
                        {p.note && <span className={`perc-note ${d ? "perc-note-dark" : "perc-note-light"}`}>{p.note}</span>}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-medium">1 USD = {p.sym}{p.amount} {p.code}</p>
                    </TooltipContent>
                  </Tooltip>
                </FadeUp>
              ))}
            </div>

            <FadeUp delay={0.3}>
              <p className={`perc-footnote ${d ? "perc-fn-dark" : "perc-fn-light"}`}>
                Rates updated live via Frankfurter API. Reference: xe.com
              </p>
            </FadeUp>
          </div>
        </section>

        <div className={`lp-sep ${d ? "sep-dark" : "sep-light"}`} />

        {/* ── FEATURES ── */}
        <section className="lp-sec" id="what">
          <div className="lp-inner">
            <FadeUp>
              <p className={`lp-label ${d ? "label-dark" : "label-light"}`}>What it does</p>
              <h2 className={`lp-h2 ${d ? "h2-dark" : "h2-light"}`}>
                Every currency.<br />One dashboard.
              </h2>
            </FadeUp>

            <div className="feat-grid">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <FadeUp key={i} delay={i * 0.06}>
                    <motion.div className={`feat-card ${d ? "feat-dark" : "feat-light"}`}
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ type: "spring", ...SPRING_FAST }}
                    >
                      <motion.div className={`feat-icon ${d ? "feat-icon-dark" : "feat-icon-light"}`}
                        whileHover={{ rotate: 10, scale: 1.15 }}
                        transition={{ type: "spring", stiffness: 300, damping: 14 }}
                      >
                        <Icon size={18} />
                      </motion.div>
                      <h3 className={`feat-title ${d ? "feat-title-dark" : "feat-title-light"}`}>{f.title}</h3>
                      <p className={`feat-body ${d ? "feat-body-dark" : "feat-body-light"}`}>{f.body}</p>
                    </motion.div>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </section>

        <div className={`lp-sep ${d ? "sep-dark" : "sep-light"}`} />

        {/* ── WHO ── */}
        <section className="lp-sec" id="who">
          <div className="lp-inner">
            <FadeUp>
              <p className={`lp-label ${d ? "label-dark" : "label-light"}`}>Who it is for</p>
              <h2 className={`lp-h2 ${d ? "h2-dark" : "h2-light"}`}>
                For anyone who earns<br />in one world and lives in another.
              </h2>
            </FadeUp>

            <div className="who-grid">
              {WHO.map((w, i) => (
                <FadeUp key={i} delay={i * 0.1}>
                  <motion.div className={`who-card ${d ? "who-dark" : "who-light"}`}
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", ...SPRING_FAST }}
                  >
                    <span className={`who-n ${d ? "who-n-dark" : "who-n-light"}`}>{w.n}</span>
                    <h3 className={`who-title ${d ? "who-title-dark" : "who-title-light"}`}>{w.title}</h3>
                    <p className={`who-body ${d ? "who-body-dark" : "who-body-light"}`}>{w.body}</p>
                    <motion.div className="who-bar"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.35 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </motion.div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className={`stats-wrap ${d ? "stats-dark" : "stats-light"}`}>
          <div className="lp-inner">
            <div className="stats-grid">
              {[
                { v: 8,   s: "+",    l: "Currencies, more coming" },
                { v: 100, s: "%",    l: "Free, no credit card" },
                { v: 5,   s: " min", l: "To set up and log your first transaction" },
                { v: 0,   s: "",     l: "Mental math required" },
              ].map((s, i) => (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="stat-card">
                    <span className={`stat-v ${d ? "stat-v-dark" : "stat-v-light"}`}>
                      <Counter to={s.v} suffix={s.s} />
                    </span>
                    <span className={`stat-l ${d ? "stat-l-dark" : "stat-l-light"}`}>{s.l}</span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <section className="cta-sec">
          <div className="lp-inner cta-inner">
            <FadeUp>
              <h2 className={`cta-h ${d ? "h2-dark" : "h2-light"}`}>
                Stop guessing.<br />Start perceiving.
              </h2>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className={`cta-sub ${d ? "body-dark" : "body-light"}`}>
                Takes five minutes to set up. Saves you from a lot of "wait, how much is that actually?"
              </p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <Magnetic>
                <Link href="/signup" className="lp-btn-p lp-btn-lg">
                  Create your account <ArrowRight size={17} />
                </Link>
              </Magnetic>
            </FadeUp>
            <FadeUp delay={0.28}>
              <Link href="/login" className={`cta-signin ${d ? "cta-signin-dark" : "cta-signin-light"}`}>
                Already have an account? Sign in
              </Link>
            </FadeUp>
          </div>
          <div className={`cta-glow ${d ? "glow-dark" : "glow-light"}`} />
        </section>

        {/* ── FOOTER ── */}
        <footer className={`lp-foot ${d ? "foot-dark" : "foot-light"}`}>
          <div className={`lp-sep ${d ? "sep-dark" : "sep-light"}`} />
          <div className="foot-inner">
            <span className={`foot-logo ${d ? "foot-logo-dark" : "foot-logo-light"}`}>Perceiva</span>
            <span className={`foot-made ${d ? "foot-made-dark" : "foot-made-light"}`}>
              made with
              <motion.span
                animate={{ scale: [1, 1.35, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: [0.45, 0, 0.55, 1] }}
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                <Heart size={12} fill="#ff453a" color="#ff453a" />
              </motion.span>
              by ren
            </span>
          </div>
        </footer>

        <style>{`
          /* ─── TOKENS ─── */
          .lp { min-height:100vh; overflow-x:hidden; position:relative; transition:background 0.45s ease, color 0.45s ease; }
          .lp-dark  { background:#080808; color:#f0f0f0; }
          .lp-light { background:#f4f4f0; color:#111111; }

          /* noise */
          .noise-c { position:fixed; inset:0; width:100%; height:100%; pointer-events:none; z-index:1; opacity:0.3; }

          /* ─── NAV ─── */
          .lp-nav { position:fixed; top:0; left:0; right:0; z-index:200; display:flex; align-items:center; justify-content:space-between; padding:0 52px; height:58px; backdrop-filter:blur(28px) saturate(1.6); -webkit-backdrop-filter:blur(28px) saturate(1.6); border-bottom:1px solid transparent; transition:background 0.4s, border-color 0.4s; }
          .nav-dark.lp-nav-scrolled  { background:rgba(8,8,8,0.85); border-bottom-color:rgba(255,255,255,0.07); }
          .nav-light.lp-nav-scrolled { background:rgba(244,244,240,0.88); border-bottom-color:rgba(0,0,0,0.09); }
          .lp-logo { font-size:17px; font-weight:700; letter-spacing:-0.025em; transition:color 0.4s; }
          .lp-dark  .lp-logo { color:#f0f0f0; }
          .lp-light .lp-logo { color:#111; }
          .lp-nav-links { display:flex; gap:36px; }
          .lp-nav-a { font-size:13px; text-decoration:none; transition:color 0.2s, opacity 0.2s; opacity:0.65; }
          .lp-dark  .lp-nav-a { color:#f0f0f0; }
          .lp-light .lp-nav-a { color:#111; }
          .lp-nav-a:hover { opacity:1; }
          .lp-nav-right { display:flex; align-items:center; gap:10px; }

          /* theme toggle */
          .lp-theme-toggle { display:flex; align-items:center; gap:6px; }
          .theme-icon { opacity:0.3; transition:opacity 0.25s; }
          .theme-icon-active { opacity:0.8; }
          .lp-dark  .theme-icon { color:#f0f0f0; }
          .lp-light .theme-icon { color:#111; }
          .theme-switch { transform:scale(0.85); }

          /* nav buttons */
          .lp-ghost { font-size:13px !important; transition:color 0.2s !important; }
          .lp-ghost-dark  { color:rgba(240,240,240,0.6) !important; }
          .lp-ghost-light { color:rgba(17,17,17,0.65) !important; }
          .lp-ghost:hover { opacity:1 !important; }
          .lp-primary-btn { font-size:13px !important; border-radius:980px !important; display:inline-flex !important; align-items:center !important; gap:6px !important; background:#0a84ff !important; color:#fff !important; transition:background 0.25s, transform 0.2s !important; }
          .lp-primary-btn:hover { background:#1a90ff !important; transform:translateY(-1px) !important; }
          .lp-burger { display:none; background:none; border:none; cursor:pointer; padding:7px; border-radius:8px; }
          .burger-dark  { color:rgba(240,240,240,0.7); }
          .burger-light { color:rgba(17,17,17,0.65); }

          /* ─── MOBILE ─── */
          .lp-mob { position:fixed; inset:0; z-index:300; backdrop-filter:blur(32px); display:flex; flex-direction:column; padding:88px 32px 52px; }
          .mob-dark  { background:rgba(8,8,8,0.97); }
          .mob-light { background:rgba(244,244,240,0.97); }
          .lp-mob-x { position:absolute; top:16px; right:18px; background:rgba(128,128,128,0.12); border:none; cursor:pointer; padding:10px; border-radius:50%; }
          .lp-dark  .lp-mob-x { color:#f0f0f0; }
          .lp-light .lp-mob-x { color:#111; }
          .lp-mob-links { display:flex; flex-direction:column; flex:1; }
          .lp-mob-a { font-size:28px; font-weight:600; text-decoration:none; padding:16px 0; border-bottom:1px solid; transition:opacity 0.2s; opacity:0.65; }
          .mob-dark  .lp-mob-a { color:#f0f0f0; border-color:rgba(255,255,255,0.07); }
          .mob-light .lp-mob-a { color:#111; border-color:rgba(0,0,0,0.08); }
          .lp-mob-a:hover { opacity:1; }
          .lp-mob-btns { display:flex; flex-direction:column; gap:12px; margin-top:32px; }

          /* ─── HERO ─── */
          .lp-hero { position:relative; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:130px 24px 110px; overflow:hidden; z-index:2; }
          .lp-hero-inner { position:relative; z-index:3; max-width:860px; width:100%; display:flex; flex-direction:column; align-items:center; gap:24px; will-change:transform,opacity; }
          .hero-badge { gap:6px; border-radius:980px !important; padding:5px 14px !important; font-size:12px !important; }
          .hero-badge-dark  { border-color:rgba(10,132,255,0.35) !important; background:rgba(10,132,255,0.12) !important; color:rgba(100,180,255,0.95) !important; }
          .hero-badge-light { border-color:rgba(0,100,220,0.25) !important; background:rgba(0,100,220,0.08) !important; color:rgba(0,90,200,1) !important; }

          /* headline */
          .lp-h1 { font-size:clamp(48px,8.5vw,108px); font-weight:700; letter-spacing:-0.045em; line-height:1.01; font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",sans-serif; }
          .h1-dark  { color:#f0f0f0; }
          .h1-light { color:#0d0d0d; }
          .h1-dim { display:block; }
          .h1-dim-dark  { color:rgba(240,240,240,0.28); }
          .h1-dim-light { color:rgba(13,13,13,0.32); }

          /* typewriter */
          .tw { min-width:3ch; display:inline-block; }
          .tw-dark  { background:linear-gradient(90deg,#0a84ff,#40c4ff,#0a84ff); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:grad 2.8s linear infinite; }
          .tw-light { background:linear-gradient(90deg,#0060d4,#0a84ff,#0060d4); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:grad 2.8s linear infinite; }
          @keyframes grad { from{background-position:0%} to{background-position:200%} }
          .tw-cur { display:inline-block; width:3px; height:0.8em; background:#0a84ff; margin-left:3px; vertical-align:middle; border-radius:2px; animation:blink 1s step-end infinite; -webkit-text-fill-color:initial; }
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

          /* sub */
          .lp-hero-sub { font-size:clamp(15px,2vw,19px); line-height:1.7; max-width:520px; }
          .sub-dark  { color:rgba(240,240,240,0.52); }
          .sub-light { color:rgba(13,13,13,0.58); }

          .lp-hero-btns { display:flex; align-items:center; gap:16px; flex-wrap:wrap; justify-content:center; margin-top:6px; }
          .lp-scroll-hint { margin-top:14px; }
          .hint-dark  { color:rgba(240,240,240,0.2); }
          .hint-light { color:rgba(13,13,13,0.22); }

          /* float cards */
          .lp-floats { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:12px; position:relative; z-index:3; }
          .lp-float { display:inline-flex; align-items:center; gap:8px; border-radius:980px; padding:9px 18px; font-size:13px; backdrop-filter:blur(12px); cursor:default; border:1px solid; transition:border-color 0.25s; }
          .float-dark  { background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.1); }
          .float-light { background:rgba(0,0,0,0.04); border-color:rgba(0,0,0,0.1); }
          .float-from { font-variant-numeric:tabular-nums; }
          .float-from-dark  { color:rgba(240,240,240,0.4); }
          .float-from-light { color:rgba(13,13,13,0.45); }
          .float-arr { color:#0a84ff; }
          .float-to { font-weight:600; font-variant-numeric:tabular-nums; }
          .float-to-dark  { color:#f0f0f0; }
          .float-to-light { color:#0d0d0d; }

          /* glows */
          .glow-a { position:absolute; top:16%; left:50%; transform:translateX(-50%); width:820px; height:520px; pointer-events:none; z-index:0; }
          .glow-dark  { background:radial-gradient(ellipse,rgba(10,132,255,0.15) 0%,transparent 68%); }
          .glow-light { background:radial-gradient(ellipse,rgba(0,100,220,0.08) 0%,transparent 68%); }
          .glow-b { position:absolute; bottom:0; left:15%; width:400px; height:400px; background:radial-gradient(ellipse,rgba(94,92,230,0.06) 0%,transparent 70%); pointer-events:none; z-index:0; }

          /* buttons */
          .lp-btn-p { display:inline-flex; align-items:center; gap:8px; background:#0a84ff; color:#fff; font-size:15px; font-weight:500; border-radius:980px; padding:13px 26px; text-decoration:none; transition:background 0.25s,transform 0.18s; }
          .lp-btn-p:hover { background:#1a90ff; transform:translateY(-2px); }
          .lp-btn-p:active { transform:scale(0.97); }
          .lp-btn-lg { font-size:17px; padding:16px 34px; }
          .lp-btn-g { display:inline-flex; align-items:center; font-size:15px; font-weight:500; text-decoration:none; padding:13px 6px; transition:opacity 0.2s; opacity:0.6; }
          .lp-btn-g:hover { opacity:1; }
          .btn-g-dark  { color:#f0f0f0; }
          .btn-g-light { color:#111; }

          /* ─── MARQUEE ─── */
          .mq-wrap { overflow:hidden; border-top:1px solid; border-bottom:1px solid; padding:13px 0; position:relative; z-index:2; }
          .mq-dark  { border-color:rgba(255,255,255,0.06); background:rgba(255,255,255,0.014); }
          .mq-light { border-color:rgba(0,0,0,0.07); background:rgba(0,0,0,0.022); }
          .mq-inner { display:flex; width:max-content; }
          .mq-item { font-size:11.5px; font-variant-numeric:tabular-nums; letter-spacing:0.04em; white-space:nowrap; font-family:"SF Mono",ui-monospace,monospace; display:flex; align-items:center; padding:0 26px; transition:color 0.4s; }
          .mq-dark  .mq-item { color:rgba(240,240,240,0.35); }
          .mq-light .mq-item { color:rgba(13,13,13,0.45); }
          .mq-dot { width:3px; height:3px; border-radius:50%; background:rgba(10,132,255,0.4); margin-left:26px; flex-shrink:0; }

          /* ─── SECTIONS ─── */
          .lp-sec { padding:120px 24px; position:relative; z-index:2; }
          .lp-inner { max-width:1100px; margin:0 auto; }
          .lp-sep { height:1px; position:relative; z-index:2; }
          .sep-dark  { background:rgba(255,255,255,0.06); }
          .sep-light { background:rgba(0,0,0,0.08); }
          .lp-label { font-size:11.5px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:16px; transition:color 0.4s; }
          .label-dark  { color:rgba(10,132,255,0.8); }
          .label-light { color:rgba(0,80,200,0.85); }
          .lp-h2 { font-size:clamp(32px,5vw,64px); font-weight:700; letter-spacing:-0.038em; line-height:1.06; margin-bottom:20px; transition:color 0.4s; font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",sans-serif; }
          .h2-dark  { color:#f0f0f0; }
          .h2-light { color:#0d0d0d; }
          .lp-body { font-size:17px; line-height:1.72; max-width:500px; margin-bottom:56px; transition:color 0.4s; }
          .body-dark  { color:rgba(240,240,240,0.52); }
          .body-light { color:rgba(13,13,13,0.62); }

          /* perception */
          .lp-perc-grid { display:grid; grid-template-columns:160px repeat(5,1fr); gap:2px; border-radius:22px; overflow:hidden; border:1px solid; transition:border-color 0.4s, background 0.4s; }
          .lp-dark  .lp-perc-grid { border-color:rgba(255,255,255,0.07); background:rgba(255,255,255,0.05); }
          .lp-light .lp-perc-grid { border-color:rgba(0,0,0,0.08); background:rgba(0,0,0,0.05); }
          .perc-anchor { display:flex; flex-direction:column; justify-content:center; padding:44px 24px; gap:4px; transition:background 0.4s; }
          .anchor-dark  { background:rgba(10,132,255,0.12); }
          .anchor-light { background:rgba(0,80,200,0.07); }
          .perc-eye { font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; }
          .perc-eye-dark  { color:rgba(10,132,255,0.7); }
          .perc-eye-light { color:rgba(0,80,200,0.7); }
          .perc-big { font-size:44px; font-weight:700; letter-spacing:-0.04em; font-variant-numeric:tabular-nums; }
          .perc-big-dark  { color:#f0f0f0; }
          .perc-big-light { color:#0d0d0d; }
          .perc-cur { font-size:11px; font-weight:600; letter-spacing:0.08em; }
          .perc-cur-dark  { color:rgba(240,240,240,0.3); }
          .perc-cur-light { color:rgba(13,13,13,0.4); }
          .perc-card { display:flex; flex-direction:column; justify-content:center; padding:44px 20px; gap:5px; cursor:default; border:1px solid transparent; transition:background 0.25s, border-color 0.25s; }
          .perc-card-dark  { background:rgba(255,255,255,0.018); }
          .perc-card-light { background:rgba(255,255,255,0.6); }
          .perc-top { display:flex; align-items:center; gap:7px; flex-wrap:wrap; }
          .perc-badge { font-size:9px !important; padding:2px 7px !important; font-weight:700 !important; letter-spacing:0.07em !important; }
          .perc-badge-dark  { border-color:rgba(255,255,255,0.11) !important; color:rgba(240,240,240,0.5) !important; background:transparent !important; }
          .perc-badge-light { border-color:rgba(0,0,0,0.12) !important; color:rgba(13,13,13,0.55) !important; background:transparent !important; }
          .perc-name { font-size:10px; }
          .perc-name-dark  { color:rgba(240,240,240,0.28); }
          .perc-name-light { color:rgba(13,13,13,0.42); }
          .perc-amt { font-size:28px; font-weight:700; letter-spacing:-0.03em; font-variant-numeric:tabular-nums; }
          .perc-amt-dark  { color:#f0f0f0; }
          .perc-amt-light { color:#0d0d0d; }
          .perc-note { font-size:11px; font-style:italic; }
          .perc-note-dark  { color:rgba(240,240,240,0.26); }
          .perc-note-light { color:rgba(13,13,13,0.38); }
          .perc-footnote { margin-top:16px; font-size:11.5px; }
          .perc-fn-dark  { color:rgba(240,240,240,0.22); }
          .perc-fn-light { color:rgba(13,13,13,0.32); }

          /* features */
          .feat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; border-radius:22px; overflow:hidden; border:1px solid; margin-top:52px; transition:border-color 0.4s, background 0.4s; }
          .lp-dark  .feat-grid { border-color:rgba(255,255,255,0.07); background:rgba(255,255,255,0.05); }
          .lp-light .feat-grid { border-color:rgba(0,0,0,0.08); background:rgba(0,0,0,0.05); }
          .feat-card { padding:40px 34px; display:flex; flex-direction:column; gap:13px; border:1px solid transparent; cursor:default; transition:background 0.25s; }
          .feat-dark  { background:rgba(255,255,255,0.014); }
          .feat-light { background:rgba(255,255,255,0.7); }
          .feat-icon { width:42px; height:42px; border-radius:13px; display:flex; align-items:center; justify-content:center; }
          .feat-icon-dark  { background:rgba(10,132,255,0.1); border:1px solid rgba(10,132,255,0.17); color:#0a84ff; }
          .feat-icon-light { background:rgba(0,80,200,0.08); border:1px solid rgba(0,80,200,0.14); color:#0060d4; }
          .feat-title { font-size:15px; font-weight:600; letter-spacing:-0.02em; line-height:1.3; }
          .feat-title-dark  { color:#f0f0f0; }
          .feat-title-light { color:#0d0d0d; }
          .feat-body { font-size:13.5px; line-height:1.65; }
          .feat-body-dark  { color:rgba(240,240,240,0.44); }
          .feat-body-light { color:rgba(13,13,13,0.58); }

          /* who */
          .who-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-top:52px; }
          .who-card { padding:38px 30px; border:1px solid; border-radius:22px; display:flex; flex-direction:column; gap:12px; cursor:default; position:relative; overflow:hidden; transition:background 0.25s, border-color 0.25s; }
          .who-dark  { background:rgba(255,255,255,0.024); border-color:rgba(255,255,255,0.07); }
          .who-light { background:rgba(255,255,255,0.75); border-color:rgba(0,0,0,0.09); }
          .who-n { font-size:11px; font-weight:700; letter-spacing:0.12em; font-family:"SF Mono",ui-monospace,monospace; }
          .who-n-dark  { color:rgba(10,132,255,0.55); }
          .who-n-light { color:rgba(0,80,200,0.6); }
          .who-title { font-size:17px; font-weight:600; letter-spacing:-0.025em; line-height:1.28; }
          .who-title-dark  { color:#f0f0f0; }
          .who-title-light { color:#0d0d0d; }
          .who-body { font-size:14px; line-height:1.72; }
          .who-body-dark  { color:rgba(240,240,240,0.42); }
          .who-body-light { color:rgba(13,13,13,0.58); }
          .who-bar { position:absolute; bottom:0; left:0; height:2px; width:100%; background:linear-gradient(90deg,#0a84ff,transparent); transform-origin:left; }

          /* stats */
          .stats-wrap { padding:76px 24px; border-top:1px solid; border-bottom:1px solid; position:relative; z-index:2; transition:border-color 0.4s, background 0.4s; }
          .stats-dark  { border-color:rgba(255,255,255,0.06); background:rgba(255,255,255,0.01); }
          .stats-light { border-color:rgba(0,0,0,0.07); background:rgba(0,0,0,0.018); }
          .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:2px; border-radius:22px; overflow:hidden; border:1px solid; transition:border-color 0.4s, background 0.4s; }
          .lp-dark  .stats-grid { border-color:rgba(255,255,255,0.07); background:rgba(255,255,255,0.05); }
          .lp-light .stats-grid { border-color:rgba(0,0,0,0.08); background:rgba(0,0,0,0.05); }
          .stat-card { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:52px 20px; text-align:center; transition:background 0.4s; }
          .lp-dark  .stat-card { background:rgba(255,255,255,0.014); }
          .lp-light .stat-card { background:rgba(255,255,255,0.7); }
          .stat-v { font-size:54px; font-weight:700; letter-spacing:-0.045em; font-variant-numeric:tabular-nums; line-height:1; }
          .stat-v-dark  { color:#f0f0f0; }
          .stat-v-light { color:#0d0d0d; }
          .stat-l { font-size:13px; max-width:120px; line-height:1.45; }
          .stat-l-dark  { color:rgba(240,240,240,0.38); }
          .stat-l-light { color:rgba(13,13,13,0.52); }

          /* cta */
          .cta-sec { padding:140px 24px 120px; text-align:center; position:relative; overflow:hidden; z-index:2; }
          .cta-inner { display:flex; flex-direction:column; align-items:center; gap:20px; position:relative; z-index:2; }
          .cta-h { font-size:clamp(36px,7vw,82px); font-weight:700; letter-spacing:-0.045em; line-height:1.02; }
          .cta-sub { font-size:17px; max-width:380px; line-height:1.65; }
          .cta-signin { font-size:13px; text-decoration:none; transition:opacity 0.2s; opacity:0.4; }
          .cta-signin-dark  { color:#f0f0f0; }
          .cta-signin-light { color:#111; }
          .cta-signin:hover { opacity:0.7; }
          .cta-glow { position:absolute; top:25%; left:50%; transform:translateX(-50%); width:680px; height:380px; pointer-events:none; }

          /* footer */
          .lp-foot { position:relative; z-index:2; transition:background 0.4s; }
          .foot-dark  { background:#080808; }
          .foot-light { background:#f4f4f0; }
          .foot-inner { display:flex; align-items:center; justify-content:space-between; padding:26px 52px; }
          .foot-logo { font-size:14px; font-weight:600; letter-spacing:-0.02em; transition:color 0.4s; }
          .foot-logo-dark  { color:rgba(240,240,240,0.24); }
          .foot-logo-light { color:rgba(13,13,13,0.3); }
          .foot-made { display:flex; align-items:center; gap:5px; font-size:13px; transition:color 0.4s; }
          .foot-made-dark  { color:rgba(240,240,240,0.24); }
          .foot-made-light { color:rgba(13,13,13,0.32); }

          /* ─── RESPONSIVE ─── */
          @media (max-width:1024px) {
            .lp-perc-grid { grid-template-columns:repeat(3,1fr); }
            .perc-anchor { grid-column:span 3; flex-direction:row; align-items:center; gap:20px; padding:28px; }
            .perc-big { font-size:34px; }
          }
          @media (max-width:900px) {
            .lp-nav { padding:0 24px; }
            .lp-nav-links { display:none; }
            .lp-burger { display:flex; }
            .lp-ghost { display:none !important; }
            .feat-grid { grid-template-columns:repeat(2,1fr); }
            .who-grid { grid-template-columns:1fr 1fr; }
            .stats-grid { grid-template-columns:repeat(2,1fr); }
            .lp-perc-grid { grid-template-columns:repeat(2,1fr); }
            .perc-anchor { grid-column:span 2; }
          }
          @media (max-width:640px) {
            .lp-hero { padding:110px 20px 90px; }
            .lp-sec { padding:80px 20px; }
            .feat-grid { grid-template-columns:1fr; }
            .who-grid { grid-template-columns:1fr; }
            .lp-perc-grid { grid-template-columns:1fr 1fr; }
            .perc-anchor { grid-column:span 2; }
            .lp-float:nth-child(n+3) { display:none; }
            .foot-inner { padding:22px 20px; }
            .cta-sec { padding:100px 20px 80px; }
            .stats-wrap { padding:60px 20px; }
            .stats-grid { grid-template-columns:repeat(2,1fr); }
            .lp-nav { padding:0 20px; }
          }
        `}</style>
      </div>
    </TooltipProvider>
  );
}
