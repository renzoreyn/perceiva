"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import {
  motion, useScroll, useTransform, useSpring,
  useInView, AnimatePresence, useAnimationFrame, useMotionValue,
} from "framer-motion";
import {
  ArrowRight, Globe, Layers, ShieldCheck, RefreshCw, BarChart2,
  Heart, Menu, X, ChevronDown, ArrowLeftRight, Zap, Sun, Moon,
  Check, Sparkles, TrendingUp, TrendingDown, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

// ─── Blue accent system ──────────────────────────────────────────────────────
// Dark mode: Apple blue #0A84FF (iOS system blue)
// Light mode: #0060D4 (deeper, readable on white)
const IR_GRADIENT_DARK  = "linear-gradient(90deg,#0A84FF,#40a9ff,#0A84FF)";
const IR_GRADIENT_LIGHT = "linear-gradient(90deg,#0060D4,#0a84ff,#0060D4)";
const IR_SOLID_DARK  = "#0A84FF";
const IR_SOLID_LIGHT = "#0060D4";
const IR_DIM_DARK    = "rgba(10,132,255,0.12)";
const IR_DIM_LIGHT   = "rgba(0,96,212,0.09)";
const IR_BDR_DARK    = "rgba(10,132,255,0.28)";
const IR_BDR_LIGHT   = "rgba(0,96,212,0.22)";

const SP  = { stiffness: 100, damping: 22, mass: 1.1 };
const SPF = { stiffness: 200, damping: 22, mass: 0.85 };
const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Global CSS ──────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @keyframes twBlink  { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes irShift  { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  @keyframes shineSweep { 0%{transform:translateX(-120%)} 100%{transform:translateX(280%)} }
  @keyframes floatY   { 0%,100%{transform:translateY(0px) rotateX(0deg)} 50%{transform:translateY(-8px) rotateX(2deg)} }
  @keyframes cardGlow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
  * { box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  a { text-decoration:none; }
  .ir-text {
    /* solid blue — no animation needed for monochrome accent */
    color: var(--ir-solid);
  }
  .ir-text-static {
    background: var(--ir-grad);
    background-size: 300% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .tw-cursor {
    display: inline-block;
    width: 3px;
    height: 0.8em;
    border-radius: 2px;
    vertical-align: text-bottom;
    margin-left: 3px;
    animation: twBlink 1s step-end infinite;
  }
  .shine-wrap { position:relative; overflow:hidden; }
  .shine-wrap::after {
    content:'';
    position:absolute;
    top:0; left:0;
    width:45%;
    height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);
    transform:translateX(-120%);
    animation: shineSweep 2.8s ease-in-out infinite;
    animation-delay: 0.6s;
    pointer-events:none;
  }
  .card-3d {
    transform-style: preserve-3d;
    transition: transform 0.08s ease-out;
  }
  .card-float {
    animation: floatY 4s ease-in-out infinite;
  }
  .card-glow-pulse {
    animation: cardGlow 3s ease-in-out infinite;
  }
  .hov-lift:hover { transform:translateY(-2px); }

  /* ── Skiper-inspired enhancements ── */
  .stat-flex-item { flex: 1 1 180px; min-width: 160px; }

  /* animated label underline */
  .lp-label-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: default;
  }
  .lp-label-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1.5px;
    background: currentColor;
    border-radius: 9999px;
    transition: width 0.4s cubic-bezier(0.16,1,0.3,1);
  }
  .lp-label-link:hover::after { width: 100%; }

  /* bento card hover glow */
  .bento-glow {
    position: relative;
    overflow: hidden;
  }
  .bento-glow::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    background: conic-gradient(from 180deg at 50% 50%, transparent 0deg, var(--ir-solid) 60deg, transparent 120deg);
    opacity: 0;
    transition: opacity 0.4s;
    z-index: 0;
    pointer-events: none;
  }
  .bento-glow:hover::before { opacity: 0.15; }

  /* shimmer text effect for CTA */
  @keyframes shimmerText {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  /* card flip transition */
  .card-float {
    animation: floatY 4s ease-in-out infinite;
  }
  @keyframes floatY {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }

  /* ── Button overrides ── */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 14px;
    padding: 13px 24px;
    border: none;
    cursor: pointer;
    letter-spacing: -0.01em;
    transition: background 0.25s, box-shadow 0.25s, transform 0.15s;
    text-decoration: none;
    white-space: nowrap;
  }
  .btn-primary-dark {
    background: #0A84FF;
    color: #ffffff;
    box-shadow: 0 1px 3px rgba(10,132,255,0.25), 0 4px 12px rgba(10,132,255,0.2), inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .btn-primary-dark:hover {
    background: #1a8fff;
    box-shadow: 0 2px 8px rgba(10,132,255,0.35), 0 8px 24px rgba(10,132,255,0.25), inset 0 1px 0 rgba(255,255,255,0.18);
    transform: translateY(-1px);
  }
  .btn-primary-dark:active { transform: scale(0.97); }

  .btn-primary-light {
    background: #0060D4;
    color: #ffffff;
    box-shadow: 0 1px 3px rgba(0,96,212,0.2), 0 4px 12px rgba(0,96,212,0.15), inset 0 1px 0 rgba(255,255,255,0.18);
  }
  .btn-primary-light:hover {
    background: #0068e8;
    box-shadow: 0 2px 8px rgba(0,96,212,0.3), 0 8px 24px rgba(0,96,212,0.2), inset 0 1px 0 rgba(255,255,255,0.2);
    transform: translateY(-1px);
  }
  .btn-primary-light:active { transform: scale(0.97); }

  .btn-ghost-dark {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 15px;
    font-weight: 500;
    border-radius: 14px;
    padding: 12px 20px;
    cursor: pointer;
    letter-spacing: -0.01em;
    color: rgba(236,236,236,0.75);
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
    text-decoration: none;
    white-space: nowrap;
  }
  .btn-ghost-dark:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.18);
    color: rgba(236,236,236,1);
    transform: translateY(-1px);
  }
  .btn-ghost-dark:active { transform: scale(0.97); }

  .btn-ghost-light {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 15px;
    font-weight: 500;
    border-radius: 14px;
    padding: 12px 20px;
    cursor: pointer;
    letter-spacing: -0.01em;
    color: rgba(17,17,17,0.72);
    background: rgba(0,0,0,0.04);
    border: 1px solid rgba(0,0,0,0.1);
    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
    text-decoration: none;
    white-space: nowrap;
  }
  .btn-ghost-light:hover {
    background: rgba(0,0,0,0.07);
    border-color: rgba(0,0,0,0.16);
    color: rgba(17,17,17,1);
    transform: translateY(-1px);
  }
  .btn-ghost-light:active { transform: scale(0.97); }

  .btn-lg { font-size: 17px !important; padding: 15px 30px !important; border-radius: 16px !important; }

  .nav-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 10px;
    padding: 8px 16px;
    border: none;
    cursor: pointer;
    letter-spacing: -0.01em;
    transition: background 0.25s, box-shadow 0.2s, transform 0.15s;
    text-decoration: none;
    white-space: nowrap;
    color: #fff;
  }
  .nav-btn-primary-dark { background: #0A84FF; box-shadow: 0 1px 4px rgba(10,132,255,0.3); }
  .nav-btn-primary-dark:hover { background: #1a8fff; box-shadow: 0 2px 8px rgba(10,132,255,0.4); transform: translateY(-1px); }
  .nav-btn-primary-light { background: #0060D4; box-shadow: 0 1px 4px rgba(0,96,212,0.25); }
  .nav-btn-primary-light:hover { background: #0068e8; box-shadow: 0 2px 8px rgba(0,96,212,0.35); transform: translateY(-1px); }

  @media (max-width:1024px) {
    .perc-grid { grid-template-columns:repeat(3,1fr) !important; }
    .perc-anc  { grid-column:span 3 !important; flex-direction:row !important; align-items:center !important; gap:16px !important; padding:22px 24px !important; }
    .perc-big  { font-size:34px !important; }
    .card-preview-grid { grid-template-columns:1fr !important; }
  }
  @media (max-width:900px) {
    .desk-nav  { display:none !important; }
    .desk-si   { display:none !important; }
    .mob-icon  { display:flex !important; }
    .feat-grid { grid-template-columns:repeat(2,1fr) !important; }
    .who-grid  { grid-template-columns:1fr 1fr !important; }
    .stat-grid { grid-template-columns:repeat(2,1fr) !important; }
    .perc-grid { grid-template-columns:repeat(2,1fr) !important; }
    .perc-anc  { grid-column:span 2 !important; }
    .check-grid{ grid-template-columns:1fr !important; gap:40px !important; }
    .graph-grid{ grid-template-columns:1fr !important; }
  }
  @media (max-width:640px) {
    .nav-inner { padding:0 18px !important; }
    .lp-sec    { padding:72px 18px !important; }
    .feat-grid { grid-template-columns:1fr !important; }
    .who-grid  { grid-template-columns:1fr !important; }
    .perc-grid { grid-template-columns:1fr 1fr !important; }
    .perc-anc  { grid-column:span 2 !important; }
    .float-hide{ display:none !important; }
    .foot-inner{ padding:22px 18px !important; }
    .hero-pad  { padding:120px 18px 90px !important; }
    .stat-grid { grid-template-columns:1fr 1fr !important; }
    .cta-sec   { padding:100px 18px 80px !important; }
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, SP); const y = useSpring(0, SP);
  return (
    <motion.div ref={ref} style={{ x, y }}
      onMouseMove={e => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.16);
        y.set((e.clientY - r.top - r.height / 2) * 0.16);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}>
      {children}
    </motion.div>
  );
}

// ─── Typewriter — plain span approach, no inline-flex on h1 level ─────────────
const WORDS = ["AMD", "IDR", "USD", "GBP", "EUR", "CHF", "CNY", "RUB", "PHP", "SGD", "anything"];
function Typewriter() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("AMD");
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

  // Key insight: render as a plain <span> without any background/clip
  // The iridescent effect comes from a CSS class applied to this specific span only
  // The cursor is a separate DOM sibling rendered AFTER this span in the h1
  return <span className="ir-text">{text}</span>;
}

// Cursor rendered separately in the h1, completely independent
function TwCursor({ dark }: { dark: boolean }) {
  return (
    <span
      className="tw-cursor"
      style={{ background: dark ? IR_SOLID_DARK : IR_SOLID_LIGHT, transition: "background 0.5s" }}
    />
  );
}

// ─── Noise ────────────────────────────────────────────────────────────────────
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
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 11;
      }
      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(draw);
    };
    draw(); return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, opacity: 0.3 }} />;
}

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
  return (
    <div style={{ overflow: "hidden", borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`, borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`, background: dark ? "rgba(255,255,255,0.012)" : "rgba(0,0,0,0.018)", padding: "12px 0", position: "relative", zIndex: 2 }}>
      <motion.div ref={ref} style={{ x, display: "flex", width: "max-content" }}>
        {[...items, ...items].map((t, i) => (
          <span key={i} style={{ fontSize: 11.5, fontVariantNumeric: "tabular-nums", color: dark ? "rgba(240,240,240,0.34)" : "rgba(17,17,17,0.45)", letterSpacing: "0.04em", whiteSpace: "nowrap", fontFamily: '"SF Mono",ui-monospace,monospace', display: "flex", alignItems: "center", padding: "0 26px" }}>
            {t}<span style={{ width: 3, height: 3, borderRadius: "50%", background: dark ? IR_BDR_DARK : IR_BDR_LIGHT, marginLeft: 26, flexShrink: 0 }} />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Card theme carousel ─────────────────────────────────────────────────────
const CARD_THEMES_PREVIEW = [
  { name:"Space Grey",   grad:"linear-gradient(135deg,#2C2C2E 0%,#48484A 50%,#1C1C1E 100%)", text:"#f0f0f0", sub:"rgba(240,240,240,0.5)" },
  { name:"Starlight",    grad:"linear-gradient(135deg,#E8E8ED 0%,#F5F5F7 50%,#D2D2D7 100%)", text:"#1d1d1f", sub:"rgba(29,29,31,0.5)" },
  { name:"Midnight",     grad:"linear-gradient(135deg,#1A1A2E 0%,#16213E 50%,#0F3460 100%)", text:"#f0f0f0", sub:"rgba(240,240,240,0.5)" },
  { name:"Product Red",  grad:"linear-gradient(135deg,#BF0000 0%,#E31212 50%,#8B0000 100%)", text:"#fff",    sub:"rgba(255,255,255,0.55)" },
  { name:"Alpine Green", grad:"linear-gradient(135deg,#1B4D3E 0%,#2D6A4F 50%,#1B4D3E 100%)", text:"#fff",   sub:"rgba(255,255,255,0.55)" },
  { name:"Deep Purple",  grad:"linear-gradient(135deg,#2D1B69 0%,#4A2C8F 50%,#1A0F3D 100%)", text:"#fff",   sub:"rgba(255,255,255,0.55)" },
  { name:"Gold",         grad:"linear-gradient(135deg,#C8A96E 0%,#E8D5A3 40%,#B8965A 100%)", text:"#2d1a00",sub:"rgba(45,26,0,0.5)" },
  { name:"Ocean Blue",   grad:"linear-gradient(135deg,#0077B6 0%,#00B4D8 50%,#0077B6 100%)", text:"#fff",   sub:"rgba(255,255,255,0.55)" },
];

function CardCarousel({ dark }: { dark: boolean }) {
  const [active, setActive] = useState(0);
  const theme = CARD_THEMES_PREVIEW[active];

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
      {/* main card */}
      <div style={{perspective:1000}}>
        <motion.div
          key={active}
          initial={{opacity:0,rotateY:-12,scale:0.96}}
          animate={{opacity:1,rotateY:0,scale:1}}
          transition={{duration:0.45,ease:[0.16,1,0.3,1]}}
          className="card-float"
          style={{width:320,aspectRatio:"85.6/53.98",borderRadius:20,background:theme.grad,
            boxShadow:dark?"0 28px 70px rgba(0,0,0,0.65),0 6px 20px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.12)":"0 28px 70px rgba(0,0,0,0.15),0 6px 20px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,0.7)",
            position:"relative",overflow:"hidden",cursor:"default"}}>
          {/* foil overlay */}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.04) 40%,rgba(0,0,0,0.04) 60%,rgba(255,255,255,0.08) 100%)",zIndex:1,pointerEvents:"none"}}/>
          {/* gloss strip */}
          <div style={{position:"absolute",top:0,left:"-30%",width:"55%",height:"100%",background:"linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.1) 50%,transparent 60%)",zIndex:2,transform:"skewX(-15deg)",pointerEvents:"none"}}/>
          {/* chip */}
          <div style={{position:"absolute",top:24,left:22,zIndex:3}}>
            <svg viewBox="0 0 50 40" width={40} height={30} style={{opacity:0.7}}>
              <rect x="1" y="1" width="48" height="38" rx="6" fill="none" stroke={theme.text} strokeWidth="1.2" opacity="0.5"/>
              <rect x="10" y="1" width="4" height="38" fill={theme.text} opacity="0.2"/>
              <rect x="36" y="1" width="4" height="38" fill={theme.text} opacity="0.2"/>
              <rect x="1" y="12" width="48" height="4" fill={theme.text} opacity="0.2"/>
              <rect x="1" y="24" width="48" height="4" fill={theme.text} opacity="0.2"/>
            </svg>
          </div>
          {/* balance */}
          <div style={{position:"absolute",bottom:28,left:22,zIndex:3}}>
            <p style={{fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:theme.sub,margin:"0 0 3px"}}>Balance</p>
            <p style={{fontSize:24,fontWeight:700,letterSpacing:"-0.03em",color:theme.text,margin:0,fontVariantNumeric:"tabular-nums"}}>$4,271.00</p>
          </div>
          <div style={{position:"absolute",bottom:10,left:22,right:22,zIndex:3,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{fontSize:10,fontFamily:'"SF Mono",monospace',letterSpacing:"0.15em",color:theme.sub,margin:0}}>●●●● ●●●● 4291</p>
            <p style={{fontSize:9,fontWeight:700,letterSpacing:"0.08em",color:theme.sub,margin:0}}>PERCEIVA</p>
          </div>
          {/* decorative circles */}
          <div style={{position:"absolute",top:-24,right:-24,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.05)",zIndex:0}}/>
        </motion.div>
      </div>

      {/* theme dots */}
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {CARD_THEMES_PREVIEW.map((t,i) => (
          <motion.button key={i} onClick={()=>setActive(i)}
            whileHover={{scale:1.2}} whileTap={{scale:0.9}}
            style={{width:i===active?28:10,height:10,borderRadius:9999,background:i===active?t.grad:"rgba(128,128,128,0.25)",border:"none",cursor:"pointer",padding:0,transition:"width 0.3s,background 0.3s"}}
          />
        ))}
      </div>
      <p style={{fontSize:12,color:"rgba(128,128,128,0.6)",margin:0,fontStyle:"italic"}}>{theme.name}</p>
    </div>
  );
}

// ─── 3D Tilt Card ─────────────────────────────────────────────────────────────
function TiltCard3D({ dark }: { dark: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotX = useSpring(0, { stiffness: 120, damping: 18 });
  const rotY = useSpring(0, { stiffness: 120, damping: 18 });
  const glowX = useSpring(50, { stiffness: 120, damping: 18 });
  const glowY = useSpring(50, { stiffness: 120, damping: 18 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width;
    const cy = (e.clientY - r.top) / r.height;
    rotX.set((cy - 0.5) * -22);
    rotY.set((cx - 0.5) * 22);
    glowX.set(cx * 100);
    glowY.set(cy * 100);
  };
  const handleLeave = () => {
    rotX.set(0); rotY.set(0);
    glowX.set(50); glowY.set(50);
  };

  // Iridescent card gradient — holographic foil effect
  const CARD_GRAD_DARK  = "linear-gradient(135deg,#0f172a 0%,#1e293b 40%,#0f3460 70%,#1e0a3c 100%)";
  const CARD_GRAD_LIGHT = "linear-gradient(135deg,#e2e8f0 0%,#f1f5f9 40%,#dbeafe 70%,#f0e6ff 100%)";
  const txtColor = dark ? "#e2e8f0" : "#1e293b";
  const subColor = dark ? "rgba(226,232,240,0.45)" : "rgba(30,41,59,0.5)";

  return (
    <div style={{ perspective: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 0" }}>
      <motion.div
        ref={cardRef}
        className="card-float"
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouse}
        onMouseLeave={handleLeave}
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* card body */}
        <div style={{ width: 340, aspectRatio: "85.6/53.98", borderRadius: 20, position: "relative", overflow: "hidden", background: dark ? CARD_GRAD_DARK : CARD_GRAD_LIGHT, boxShadow: dark ? "0 32px 80px rgba(0,0,0,0.7),0 8px 24px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.1)" : "0 32px 80px rgba(0,0,0,0.18),0 8px 24px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.8)", cursor: "none" }}>

          {/* iridescent foil overlay — follows mouse */}
          <motion.div style={{
            position: "absolute", inset: 0, opacity: 0.35, zIndex: 1, pointerEvents: "none",
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(168,85,247,0.6) 0%,rgba(56,189,248,0.5) 25%,rgba(52,211,153,0.4) 50%,rgba(251,191,36,0.3) 75%,transparent 100%)`,
          }} />

          {/* specular gloss strip */}
          <div style={{ position: "absolute", top: 0, left: "-30%", width: "60%", height: "100%", background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.12) 50%,transparent 60%)", zIndex: 2, pointerEvents: "none", transform: "skewX(-15deg)" }} />

          {/* chip */}
          <div style={{ position: "absolute", top: 28, left: 24, zIndex: 3 }}>
            <svg viewBox="0 0 50 40" width={44} height={34} style={{ opacity: 0.75 }}>
              <rect x="1" y="1" width="48" height="38" rx="6" fill="none" stroke={txtColor} strokeWidth="1.2" opacity="0.5"/>
              <rect x="10" y="1" width="4" height="38" fill={txtColor} opacity="0.2"/>
              <rect x="36" y="1" width="4" height="38" fill={txtColor} opacity="0.2"/>
              <rect x="1" y="12" width="48" height="4" fill={txtColor} opacity="0.2"/>
              <rect x="1" y="24" width="48" height="4" fill={txtColor} opacity="0.2"/>
              <rect x="14" y="5" width="22" height="30" rx="2" fill={txtColor} opacity="0.15"/>
            </svg>
          </div>

          {/* NFC icon */}
          <div style={{ position: "absolute", top: 28, right: 24, zIndex: 3, opacity: 0.55 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={txtColor} strokeWidth="1.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" opacity="0.3"/>
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" opacity="0.5"/>
              <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>

          {/* balance */}
          <div style={{ position: "absolute", bottom: 36, left: 24, zIndex: 3 }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: subColor, margin: "0 0 4px" }}>Total Balance</p>
            <p style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", color: txtColor, margin: 0, fontVariantNumeric: "tabular-nums" }}>$4,271.00</p>
          </div>

          {/* card number + info bottom row */}
          <div style={{ position: "absolute", bottom: 10, left: 24, right: 24, zIndex: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 11, fontFamily: '"SF Mono",ui-monospace,monospace', letterSpacing: "0.18em", color: subColor, margin: 0 }}>●●●● ●●●● ●●●● 4291</p>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: subColor, margin: 0 }}>PERCEIVA</p>
          </div>

          {/* decorative circles */}
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", zIndex: 0 }} />
          <div style={{ position: "absolute", bottom: -20, left: -20, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.03)", zIndex: 0 }} />
        </div>

        {/* shadow plane (parallax) */}
        <div style={{ position: "absolute", bottom: -24, left: "10%", width: "80%", height: 28, background: "radial-gradient(ellipse,rgba(0,0,0,0.35) 0%,transparent 75%)", borderRadius: "50%", filter: "blur(10px)", transform: "translateZ(-40px)" }} />
      </motion.div>
    </div>
  );
}

// ─── Mini graph components ────────────────────────────────────────────────────
function MiniSparkline({ data, color, height = 48 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const w = 200, h = height;
  const pts = data.map((v, i) => (i / (data.length - 1)) * w + "," + (h - ((v - min) / range) * (h - 4) - 2)).join(" ");
  const firstPt = pts.split(" ")[0];
  const lastIdx = data.length - 1;
  const lastX = (lastIdx / (data.length - 1)) * w;
  const area = "M0," + h + " L" + pts.split(" ").join(" L") + " L" + lastX + "," + h + " Z";
  const gradId = "sg-" + color.replace("#", "");
  return (
    <svg width="100%" viewBox={"0 0 " + w + " " + h} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={"url(#" + gradId + ")"} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DonutChart({ segments, size = 96 }: { segments: { v: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((s, x) => s + x.v, 0);
  const r = 36;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = 12;
  let cumAngle = -90;

  const arcs = segments.map((seg) => {
    const angle = (seg.v / total) * 360;
    const sa = cumAngle;
    cumAngle += angle;
    const rad = (a: number) => (a * Math.PI) / 180;
    const ax1 = cx + r * Math.cos(rad(sa));
    const ay1 = cy + r * Math.sin(rad(sa));
    const ax2 = cx + r * Math.cos(rad(sa + angle - 1));
    const ay2 = cy + r * Math.sin(rad(sa + angle - 1));
    const lg = angle > 180 ? 1 : 0;
    const p = "M " + ax1.toFixed(2) + " " + ay1.toFixed(2) + " A " + r + " " + r + " 0 " + lg + " 1 " + ax2.toFixed(2) + " " + ay2.toFixed(2);
    return { p, color: seg.color };
  });

  return (
    <svg width={size} height={size}>
      {arcs.map((arc, i) => (
        <path key={i} d={arc.p} fill="none" stroke={arc.color} strokeWidth={stroke} strokeLinecap="round" />
      ))}
      <circle cx={cx} cy={cy} r={r - stroke / 2 - 2} fill="none" stroke="rgba(128,128,128,0.08)" strokeWidth="1" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TICKER = [
  "1 USD = £0.79 GBP","1 GBP = $1.27 USD","1 EUR = $1.09 USD",
  "1 USD = Rp 17,417 IDR","1 USD = Fr 0.88 CHF","1 USD = ¥7.26 CNY",
  "1 USD = S$1.35 SGD","1 USD = ₱58.4 PHP","1 SGD = Rp 12,886 IDR",
  "1 EUR = £0.84 GBP","1 GBP = €1.19 EUR","1 CHF = $1.14 USD",
  "1 USD = ₽91.2 RUB","1 USD = ֏390 AMD","1 EUR = ¥8.65 CNY",
];

const PERCEPTION = [
  { code:"GBP",sym:"\u00A3",amount:"0.79",   label:"British Pound",    note:"worth more than $1" },
  { code:"EUR",sym:"\u20AC",amount:"0.92",   label:"Euro",             note:"almost a dollar" },
  { code:"IDR",sym:"Rp",    amount:"17,417",  label:"Indonesian Rupiah",note:"17k feels like nothing" },
  { code:"PHP",sym:"\u20B1",amount:"58.4",   label:"Philippine Peso",  note:"" },
  { code:"SGD",sym:"S$",    amount:"1.35",    label:"Singapore Dollar", note:"close to $1" },
];

const FEATURES = [
  { icon:Globe,          title:"10 currencies",          body:"USD, GBP, EUR, CHF, CNY, IDR, AMD, RUB, PHP, SGD — and more on the way. Log in any of them." },
  { icon:RefreshCw,      title:"Live rates",             body:"Converts the moment you log. Frankfurter API. No key, always fresh." },
  { icon:Layers,         title:"Multiple wallets",       body:"GBP salary. EUR freelance. SGD savings. Separate streams, one unified view." },
  { icon:BarChart2,      title:"Budget tracking",        body:"Monthly limits per category. Turns red before your bank does." },
  { icon:ArrowLeftRight, title:"Recurring transactions", body:"Salary, rent, subs. Set once. Logs itself every cycle." },
  { icon:ShieldCheck,    title:"Your data only",         body:"Email or Google. Your numbers live in your account. Nowhere else." },
];

const FLOATS = [
  { from:"£500 GBP",   to:"$635",    d:0.65 },
  { from:"€200 EUR",   to:"$218",    d:0.78 },
  { from:"S$300 SGD",  to:"$222",    d:0.91 },
  { from:"Rp 500k IDR",to:"$28.70",  d:1.04 },
];

// Mock graph data
const INCOME_DATA  = [1200,1800,1400,2100,1900,2600,2200,3100,2800,3400,3100,4200];
const EXPENSE_DATA = [800,1100,950,1400,1200,1700,1400,2100,1800,2200,1950,2800];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CATEGORIES = [
  { label:"Food",    v:32, color:"#f59e0b" },
  { label:"Rent",    v:28, color:"#3b82f6" },
  { label:"Subs",    v:14, color:"#8b5cf6" },
  { label:"Travel",  v:16, color:"#10b981" },
  { label:"Other",   v:10, color:"#6b7280" },
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
  const rY = useTransform(scrollYProgress, [0, 0.12], [0, -44]);
  const rS = useTransform(scrollYProgress, [0, 0.12], [1, 0.95]);
  const hO = useSpring(rO, { stiffness: 70, damping: 18 });
  const hY = useSpring(rY, { stiffness: 70, damping: 18 });
  const hS = useSpring(rS, { stiffness: 70, damping: 18 });

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Tokens
  const irGrad   = dark ? IR_GRADIENT_DARK  : IR_GRADIENT_LIGHT;
  const irSolid  = dark ? IR_SOLID_DARK     : IR_SOLID_LIGHT;
  const irDim    = dark ? IR_DIM_DARK       : IR_DIM_LIGHT;
  const irBdr    = dark ? IR_BDR_DARK       : IR_BDR_LIGHT;
  const bg       = dark ? "#080808"         : "#f5f5f0";
  const surface  = dark ? "#131313"         : "#ffffff";
  const bdr      = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const fg       = dark ? "#ececec"         : "#111111";
  const fgMuted  = dark ? "rgba(236,236,236,0.52)" : "rgba(17,17,17,0.6)";
  const fgSub    = dark ? "rgba(236,236,236,0.3)"  : "rgba(17,17,17,0.38)";
  const navBg    = scrolled ? (dark?"rgba(8,8,8,0.88)":"rgba(245,245,240,0.92)") : "transparent";
  const T        = { transition:"color 0.5s,background 0.5s,border-color 0.5s" } as React.CSSProperties;

  return (
    <TooltipProvider delayDuration={150}>
      <style>{GLOBAL_CSS}</style>
      {/* CSS variables for blue accent */}
      <style>{`:root { --ir-grad: ${irGrad}; --ir-solid: ${irSolid}; }`}</style>

      <div ref={rootRef} style={{ minHeight:"100vh", background:bg, color:fg, fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif", overflowX:"hidden", position:"relative", transition:"background 0.5s,color 0.5s" }}>
        <Noise />

        {/* ── NAV ── */}
        <motion.header className="nav-inner"
          initial={{ y:-20,opacity:0 }} animate={{ y:0,opacity:1 }}
          transition={{ duration:0.7,ease:EASE }}
          style={{ position:"fixed",top:0,left:0,right:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 52px",height:58,backdropFilter:"blur(28px) saturate(1.5)",WebkitBackdropFilter:"blur(28px) saturate(1.5)",background:navBg,borderBottom:`1px solid ${scrolled?bdr:"transparent"}`,transition:"background 0.4s,border-color 0.4s" }}>
          <span style={{ fontSize:17,fontWeight:700,letterSpacing:"-0.025em",color:fg,flexShrink:0,...T }}>Perceiva</span>
          <nav className="desk-nav" style={{ display:"flex",gap:36 }}>
            {[["What it does","what"],["Who it is for","who"],["Why it exists","perception"]].map(([l,id],i)=>(
              <motion.a key={l} href={`#${id}`} initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{delay:0.08+i*0.07,duration:0.5}} style={{fontSize:13,color:fgMuted,textDecoration:"none",transition:"color 0.2s"}} whileHover={{color:fg}}>{l}</motion.a>
            ))}
          </nav>
          <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}} style={{display:"flex",alignItems:"center",gap:6}}>
              <Sun size={13} style={{color:!dark?irSolid:fgSub,transition:"color 0.5s"}}/>
              <Switch checked={dark} onCheckedChange={setDark} style={{transform:"scale(0.8)"}}/>
              <Moon size={13} style={{color:dark?irSolid:fgSub,transition:"color 0.5s"}}/>
            </motion.div>
            <Link href="/login" className="desk-si" style={{fontSize:13,fontWeight:500,color:fg,opacity:0.72,padding:"8px 12px",borderRadius:10,textDecoration:"none",transition:"opacity 0.2s,color 0.5s"}}>
              Sign in
            </Link>
            <Link href="/signup" className={`nav-btn-primary ${dark?"nav-btn-primary-dark":"nav-btn-primary-light"}`}>
              Get started <ArrowRight size={13}/>
            </Link>
            <button className="mob-icon" onClick={()=>setMenu(true)} style={{display:"none",background:"none",border:"none",color:fg,cursor:"pointer",padding:7,borderRadius:8,opacity:0.75,...T}}>
              <Menu size={20}/>
            </button>
          </div>
        </motion.header>

        {/* mobile menu */}
        <AnimatePresence>
          {menu&&(
            <motion.div initial={{opacity:0,x:"100%"}} animate={{opacity:1,x:0}} exit={{opacity:0,x:"100%"}} transition={{type:"spring",stiffness:260,damping:28}}
              style={{position:"fixed",inset:0,zIndex:300,backdropFilter:"blur(32px)",background:dark?"rgba(8,8,8,0.97)":"rgba(245,245,240,0.97)",display:"flex",flexDirection:"column",padding:"88px 28px 48px"}}>
              <button onClick={()=>setMenu(false)} style={{position:"absolute",top:16,right:18,background:"rgba(128,128,128,0.12)",border:"none",color:fg,cursor:"pointer",padding:10,borderRadius:"50%"}}><X size={22}/></button>
              <div style={{display:"flex",flexDirection:"column",flex:1}}>
                {[["What it does","what"],["Who it is for","who"],["Why it exists","perception"],["Sign in","/login"]].map(([l,id],i)=>(
                  <motion.a key={l} href={id.startsWith("/")?id:`#${id}`} initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}} onClick={()=>setMenu(false)}
                    style={{fontSize:26,fontWeight:600,color:fgMuted,textDecoration:"none",padding:"14px 0",borderBottom:`1px solid ${bdr}`,transition:"color 0.2s"}}>{l}</motion.a>
                ))}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:28}}>
                <Link href="/signup" onClick={()=>setMenu(false)} className={`btn-primary btn-lg ${dark?"btn-primary-dark":"btn-primary-light"}`} style={{justifyContent:"center",width:"100%"}}>Get started <ArrowRight size={15}/></Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HERO ── */}
        <section className="hero-pad" style={{position:"relative",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"130px 24px 110px",overflow:"hidden",zIndex:2}}>
          <motion.div style={{opacity:hO,y:hY,scale:hS,position:"relative",zIndex:3,maxWidth:900,width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:24,willChange:"transform,opacity"}}>
            {/* shine badge */}
            <motion.div initial={{opacity:0,y:14,filter:"blur(5px)"}} animate={{opacity:1,y:0,filter:"blur(0px)"}} transition={{delay:0.25,duration:0.7,ease:EASE}}>
              <div className="shine-wrap" style={{borderRadius:980,display:"inline-block"}}>
                <Badge style={{borderColor:irBdr,background:irDim,color:irSolid,fontSize:12,gap:6,borderRadius:980,padding:"6px 16px",display:"inline-flex",alignItems:"center",position:"relative",transition:"all 0.5s"}}>
                  <Zap size={11} style={{flexShrink:0}}/> Introducing Perceiva
                </Badge>
              </div>
            </motion.div>

            {/* headline — typewriter and cursor are inline spans, h1 has no clip */}
            <motion.h1
              initial={{opacity:0,y:28,filter:"blur(8px)"}}
              animate={{opacity:1,y:0,filter:"blur(0px)"}}
              transition={{delay:0.36,duration:0.85,ease:EASE}}
              style={{fontSize:"clamp(46px,8vw,104px)",fontWeight:700,letterSpacing:"-0.045em",lineHeight:1.02,color:fg,margin:0,...T}}>
              Log in <Typewriter /><TwCursor dark={dark} /><br/>
              <span style={{color:fgSub,...T}}>get the real number.</span>
            </motion.h1>

            <motion.p initial={{opacity:0,y:18,filter:"blur(4px)"}} animate={{opacity:1,y:0,filter:"blur(0px)"}} transition={{delay:0.50,duration:0.7,ease:EASE}}
              style={{fontSize:"clamp(15px,1.9vw,18px)",lineHeight:1.72,color:fgMuted,maxWidth:500,margin:0,...T}}>
              You earn in one currency, spend in another, and send money in a third.
              Perceiva converts everything in real time — so you always know exactly what you have.
            </motion.p>

            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.62,duration:0.6,ease:EASE}}
              style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",justifyContent:"center",marginTop:6}}>
              <Magnetic>
                <Link href="/signup" className={`btn-primary ${dark?"btn-primary-dark":"btn-primary-light"}`}>
                  Start for free <ArrowRight size={15}/>
                </Link>
              </Magnetic>
              <Magnetic>
                <button onClick={()=>setDemoOpen(true)} className={dark?"btn-ghost-dark":"btn-ghost-light"}>
                  <Sparkles size={14}/> See how it works
                </button>
              </Magnetic>
            </motion.div>

            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.3}} style={{color:fgSub,marginTop:12,...T}}>
              <motion.div animate={{y:[0,6,0]}} transition={{repeat:Infinity,duration:2.2,ease:[0.45,0,0.55,1]}}><ChevronDown size={17}/></motion.div>
            </motion.div>
          </motion.div>

          {/* float cards */}
          <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center",marginTop:16,position:"relative",zIndex:3}}>
            {FLOATS.map((f,i)=>(
              <motion.div key={i} className={i>=2?"float-hide":""}
                initial={{opacity:0,y:20,scale:0.92}} animate={{opacity:1,y:0,scale:1}}
                transition={{delay:f.d,duration:0.65,ease:EASE}} whileHover={{scale:1.05,y:-3}}
                style={{display:"inline-flex",alignItems:"center",gap:8,background:dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)",border:`1px solid ${bdr}`,borderRadius:980,padding:"9px 18px",fontSize:13,backdropFilter:"blur(12px)",cursor:"default",transition:"background 0.5s,border-color 0.4s"}}>
                <span style={{color:fgSub,fontVariantNumeric:"tabular-nums",...T}}>{f.from}</span>
                <motion.span animate={{x:[0,4,0]}} transition={{repeat:Infinity,duration:2.4,delay:i*0.4,ease:"easeInOut"}}>
                  <ArrowRight size={11} style={{color:irSolid,transition:"color 0.5s"}}/>
                </motion.span>
                <span style={{color:fg,fontWeight:600,fontVariantNumeric:"tabular-nums",...T}}>{f.to}</span>
              </motion.div>
            ))}
          </div>

          {/* glows */}
          <div style={{position:"absolute",top:"14%",left:"50%",transform:"translateX(-50%)",width:820,height:520,background:`radial-gradient(ellipse,${irDim} 0%,transparent 68%)`,pointerEvents:"none",zIndex:0,transition:"background 0.5s"}}/>
          <div style={{position:"absolute",bottom:0,left:"12%",width:360,height:360,background:"radial-gradient(ellipse,rgba(94,92,230,0.04) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
        </section>

        <Marquee items={TICKER} dark={dark}/>

        {/* ── 3D CARD PREVIEW ── */}
        <section className="lp-sec" style={{padding:"100px 24px",position:"relative",zIndex:2}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <FadeUp>
              <p style={{fontSize:11.5,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:irSolid,marginBottom:14,transition:"color 0.5s"}}>Wallet cards</p>
              <h2 style={{fontSize:"clamp(28px,4.5vw,58px)",fontWeight:700,letterSpacing:"-0.038em",lineHeight:1.06,color:fg,marginBottom:18,...T}}>
                Your wallets.<br/>Beautifully yours.
              </h2>
              <p style={{fontSize:17,lineHeight:1.72,color:fgMuted,maxWidth:460,marginBottom:52,...T}}>
                Every wallet gets its own card. Skeuomorphic, holographic, tilts with your cursor.
                Customize the color and style — it is yours.
              </p>
            </FadeUp>

            <div className="card-preview-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center"}}>
              {/* Card theme carousel */}
              <FadeUp delay={0.1}>
                <div style={{position:"relative"}}>
                  <div className="card-glow-pulse" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:340,height:220,background:`radial-gradient(ellipse,${irDim} 0%,transparent 70%)`,pointerEvents:"none",zIndex:0,transition:"background 0.5s"}}/>
                  <CardCarousel dark={dark}/>
                </div>
              </FadeUp>

              {/* feature list */}
              <FadeUp delay={0.18}>
                <div style={{display:"flex",flexDirection:"column",gap:22}}>
                  {[
                    { icon:"✦", title:"8 card themes",         body:"Space Grey, Starlight, Gold, Midnight, Product Red, Alpine Green, Deep Purple, Ocean Blue." },
                    { icon:"◈", title:"Holographic foil",      body:"The iridescent overlay follows your cursor. Exactly like a real card catching light." },
                    { icon:"◉", title:"Flip to see stats",     body:"Tap any card to flip it. The back shows your total in, out, and transaction count." },
                    { icon:"⬡", title:"Log in any currency",   body:"The wallet is your AMD account. You can still log USD expenses against it. We handle conversion." },
                  ].map((item,i)=>(
                    <motion.div key={i} initial={{opacity:0,x:16}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.08,duration:0.5,ease:EASE}}
                      style={{display:"flex",gap:16,alignItems:"flex-start"}}>
                      <div style={{width:36,height:36,borderRadius:12,background:irDim,border:`1px solid ${irBdr}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14,color:irSolid,fontWeight:700,transition:"all 0.5s"}}>
                        {item.icon}
                      </div>
                      <div>
                        <p style={{fontSize:14,fontWeight:600,color:fg,margin:"0 0 3px",...T}}>{item.title}</p>
                        <p style={{fontSize:13,lineHeight:1.65,color:fgMuted,margin:0,...T}}>{item.body}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        <div style={{height:1,background:bdr,transition:"background 0.5s"}}/>

        {/* ── GRAPHS / DASHBOARD PREVIEW ── */}
        <section className="lp-sec" style={{padding:"100px 24px",position:"relative",zIndex:2}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <FadeUp>
              <p style={{fontSize:11.5,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:irSolid,marginBottom:14,transition:"color 0.5s"}}>Track everything</p>
              <h2 style={{fontSize:"clamp(28px,4.5vw,58px)",fontWeight:700,letterSpacing:"-0.038em",lineHeight:1.06,color:fg,marginBottom:18,...T}}>
                See where it goes.<br/>All of it. In one place.
              </h2>
              <p style={{fontSize:17,lineHeight:1.72,color:fgMuted,maxWidth:460,marginBottom:52,...T}}>
                Income vs expenses over time. Spending by category. Budget burndown.
                All converted to USD so the numbers actually mean something.
              </p>
            </FadeUp>

            {/* dashboard preview cards */}
            <div className="graph-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>

              {/* income vs expense — shadcn BarChart */}
              <FadeUp delay={0.08}>
                <div style={{background:dark?"rgba(255,255,255,0.025)":surface,border:`1px solid ${bdr}`,borderRadius:22,padding:"28px 28px 16px",overflow:"hidden",transition:"background 0.3s,border-color 0.5s"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                    <div>
                      <p style={{fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:fgSub,margin:"0 0 4px",...T}}>Income vs Expenses</p>
                      <p style={{fontSize:22,fontWeight:700,letterSpacing:"-0.03em",color:fg,margin:0,...T}}>$4,271 <span style={{fontSize:13,color:"#10b981",fontWeight:500}}>+18%</span></p>
                    </div>
                    <div style={{display:"flex",gap:14,fontSize:11}}>
                      <span style={{display:"flex",alignItems:"center",gap:5,color:fgSub,...T}}><span style={{width:8,height:8,borderRadius:2,background:"#10b981",display:"inline-block"}}/>Income</span>
                      <span style={{display:"flex",alignItems:"center",gap:5,color:fgSub,...T}}><span style={{width:8,height:8,borderRadius:2,background:"#f43f5e",display:"inline-block"}}/>Expenses</span>
                    </div>
                  </div>
                  <ChartContainer
                    config={{
                      income:  { label:"Income",   color:"#10b981" },
                      expense: { label:"Expenses",  color:"#f43f5e" },
                    } satisfies ChartConfig}
                    className="h-[120px] w-full"
                  >
                    <BarChart data={INCOME_DATA.map((v,i)=>({ month:["J","F","M","A","M","J","J","A","S","O","N","D"][i], income:v, expense:EXPENSE_DATA[i] }))} barGap={2}>
                      <XAxis dataKey="month" tick={{fontSize:9,fill:dark?"rgba(236,236,236,0.35)":"rgba(17,17,17,0.4)"}} axisLine={false} tickLine={false}/>
                      <ChartTooltip content={<ChartTooltipContent/>}/>
                      <Bar dataKey="income"  fill="#10b981" radius={[3,3,0,0]} maxBarSize={16}/>
                      <Bar dataKey="expense" fill="#f43f5e" radius={[3,3,0,0]} maxBarSize={16}/>
                    </BarChart>
                  </ChartContainer>
                </div>
              </FadeUp>

                            {/* spending by category + net worth */}
              <div style={{display:"flex",flexDirection:"column",gap:18}}>
                                <FadeUp delay={0.14}>
                  <div style={{background:dark?"rgba(255,255,255,0.025)":surface,border:`1px solid ${bdr}`,borderRadius:22,padding:"24px 28px",transition:"background 0.3s,border-color 0.5s"}}>
                    <p style={{fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:fgSub,margin:"0 0 16px",...T}}>Spending by Category</p>
                    <div style={{display:"flex",gap:16,alignItems:"center"}}>
                      <ChartContainer
                        config={{
                          food:   {label:"Food",    color:"#f59e0b"},
                          rent:   {label:"Rent",    color:"#3b82f6"},
                          subs:   {label:"Subs",    color:"#8b5cf6"},
                          travel: {label:"Travel",  color:"#10b981"},
                          other:  {label:"Other",   color:"#6b7280"},
                        } satisfies ChartConfig}
                        className="h-[96px] w-[96px] shrink-0"
                      >
                        <PieChart>
                          <Pie data={CATEGORIES} dataKey="v" cx="50%" cy="50%" innerRadius={28} outerRadius={42} strokeWidth={0} paddingAngle={2}>
                            {CATEGORIES.map((c,i)=><Cell key={i} fill={c.color}/>)}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="label"/>}/>
                        </PieChart>
                      </ChartContainer>
                      <div style={{display:"flex",flexDirection:"column",gap:7,flex:1}}>
                        {CATEGORIES.map((c,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <div style={{display:"flex",alignItems:"center",gap:7}}>
                              <div style={{width:8,height:8,borderRadius:2,background:c.color,flexShrink:0}}/>
                              <span style={{fontSize:12,color:fgMuted,...T}}>{c.label}</span>
                            </div>
                            <span style={{fontSize:12,fontWeight:600,color:fg,fontVariantNumeric:"tabular-nums",...T}}>{c.v}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </FadeUp>

                <FadeUp delay={0.2}>
                  <div style={{background:dark?"rgba(255,255,255,0.025)":surface,border:`1px solid ${bdr}`,borderRadius:22,padding:"24px 28px",transition:"background 0.3s,border-color 0.5s"}}>
                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
                      <div>
                        <p style={{fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:fgSub,margin:"0 0 4px",...T}}>Net Worth</p>
                        <p style={{fontSize:26,fontWeight:700,letterSpacing:"-0.03em",color:fg,margin:0,...T}}>$8,540</p>
                        <p style={{fontSize:12,color:"#10b981",margin:"2px 0 0",fontWeight:500}}>+$1,271 this month</p>
                      </div>
                      <div style={{width:32,height:32,borderRadius:10,background:irDim,border:`1px solid ${irBdr}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.5s"}}>
                        <TrendingUp size={16} style={{color:irSolid,transition:"color 0.5s"}}/>
                      </div>
                    </div>
                    <ChartContainer
                      config={{ worth: { label:"Net Worth", color:irSolid } } satisfies ChartConfig}
                      className="h-[52px] w-full"
                    >
                      <AreaChart data={[4200,5100,4800,6200,5900,7400,6800,8100,7600,8540].map((v,i)=>({i,v}))}>
                        <defs>
                          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={irSolid} stopOpacity={0.2}/>
                            <stop offset="100%" stopColor={irSolid} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke={irSolid} strokeWidth={2} fill="url(#sparkGrad)" dot={false}/>
                        <ChartTooltip content={<ChartTooltipContent hideLabel/>}/>
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </FadeUp>
              </div>

              {/* perception check widget */}
              <FadeUp delay={0.16}>
                <div style={{background:dark?"rgba(255,255,255,0.025)":surface,border:`1px solid ${bdr}`,borderRadius:22,padding:"24px 28px",transition:"background 0.3s,border-color 0.5s"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                    <p style={{fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:fgSub,margin:0,...T}}>Perception Check</p>
                    <Badge style={{fontSize:10,background:irDim,color:irSolid,border:`1px solid ${irBdr}`,borderRadius:980,padding:"2px 8px",transition:"all 0.5s"}}>Live</Badge>
                  </div>
                  <p style={{fontSize:12,color:fgMuted,margin:"0 0 14px",...T}}>What £100 GBP actually is:</p>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {[
                      {code:"USD",sym:"$",   v:"$127.00",  bar:100,  max:100},
                      {code:"IDR",sym:"Rp",  v:"Rp 2,211,959",bar:95,max:100},
                      {code:"PHP",sym:"\u20B1",v:"\u20B17,410", bar:60,  max:100},
                      {code:"SGD",sym:"S$",  v:"S$171.45", bar:72,  max:100},
                    ].map((row,i)=>(
                      <div key={i}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:11,color:fgSub,fontFamily:'"SF Mono",ui-monospace,monospace',...T}}>{row.code}</span>
                          <span style={{fontSize:12,fontWeight:600,color:fg,fontVariantNumeric:"tabular-nums",...T}}>{row.v}</span>
                        </div>
                        <div style={{height:4,borderRadius:9999,background:dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.08)",overflow:"hidden",transition:"background 0.5s"}}>
                          <motion.div initial={{width:0}} whileInView={{width:`${row.bar}%`}} viewport={{once:true}}
                            transition={{delay:i*0.1+0.2,duration:0.7,ease:EASE}}
                            style={{height:"100%",background:i===1?"#f43f5e":irSolid,borderRadius:9999,transition:"background 0.5s"}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>

              {/* recent transactions */}
              <FadeUp delay={0.22}>
                <div style={{background:dark?"rgba(255,255,255,0.025)":surface,border:`1px solid ${bdr}`,borderRadius:22,padding:"24px 28px",transition:"background 0.3s,border-color 0.5s"}}>
                  <p style={{fontSize:12,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:fgSub,margin:"0 0 16px",...T}}>Recent Transactions</p>
                  <div style={{display:"flex",flexDirection:"column",gap:0}}>
                    {[
                      {label:"GBP Freelance",  sub:"UK client · recurring",    amt:"+$812",  cur:"£640 GBP",    pos:true},
                      {label:"Lunch London",   sub:"Food · today",              amt:"-$14.20", cur:"£11.20 GBP",  pos:false},
                      {label:"Grab Jakarta",   sub:"Transport · yesterday",     amt:"-$4.32",  cur:"Rp 75,200",   pos:false},
                      {label:"EUR Invoice",    sub:"EU client · 2 days ago",    amt:"+$218.00",cur:"€200 EUR",     pos:true},
                    ].map((tx,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<3?`1px solid ${bdr}`:"none",transition:"border-color 0.5s"}}>
                        <div style={{width:34,height:34,borderRadius:12,background:tx.pos?"rgba(16,185,129,0.12)":"rgba(244,63,94,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          {tx.pos?<TrendingUp size={14} style={{color:"#10b981"}}/>:<TrendingDown size={14} style={{color:"#f43f5e"}}/>}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:13,fontWeight:500,color:fg,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",...T}}>{tx.label}</p>
                          <p style={{fontSize:11,color:fgSub,margin:0,...T}}>{tx.sub}</p>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <p style={{fontSize:13,fontWeight:600,color:tx.pos?"#10b981":"#f43f5e",margin:0,fontVariantNumeric:"tabular-nums"}}>{tx.amt}</p>
                          <p style={{fontSize:10,color:fgSub,margin:0,fontVariantNumeric:"tabular-nums",...T}}>{tx.cur}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        <div style={{height:1,background:bdr,transition:"background 0.5s"}}/>

        {/* ── PERCEPTION ── */}
        <section className="lp-sec" style={{padding:"100px 24px",position:"relative",zIndex:2}} id="perception">
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <FadeUp>
              <p style={{fontSize:11.5,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:irSolid,marginBottom:14,transition:"color 0.5s"}}>Why it exists</p>
              <h2 style={{fontSize:"clamp(28px,5vw,60px)",fontWeight:700,letterSpacing:"-0.038em",lineHeight:1.06,color:fg,marginBottom:18,...T}}>$1 hits different<br/>everywhere you go.</h2>
              <p style={{fontSize:17,lineHeight:1.72,color:fgMuted,maxWidth:460,marginBottom:48,...T}}>Numbers lie. £80 sounds expensive until you realize it is the same as a casual lunch in some cities. Perceiva shows you what every number actually means — instantly, every time.</p>
            </FadeUp>
            <div className="perc-grid bento-glow" style={{display:"grid",gridTemplateColumns:"160px repeat(5,1fr)",gap:2,borderRadius:22,overflow:"hidden",border:`1px solid ${bdr}`,background:bdr,transition:"border-color 0.5s,background 0.5s"}}>
              <FadeUp delay={0.05}>
                <div className="perc-anc" style={{display:"flex",flexDirection:"column",justifyContent:"center",padding:"40px 22px",background:irDim,gap:4,height:"100%",transition:"background 0.5s"}}>
                  <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:irSolid,transition:"color 0.5s"}}>anchor</span>
                  <span className="perc-big" style={{fontSize:42,fontWeight:700,letterSpacing:"-0.04em",color:fg,fontVariantNumeric:"tabular-nums",...T}}>$1.00</span>
                  <span style={{fontSize:11,fontWeight:600,letterSpacing:"0.08em",color:fgSub,...T}}>USD</span>
                </div>
              </FadeUp>
              {PERCEPTION.map((p,i)=>(
                <FadeUp key={p.code} delay={0.05+i*0.08}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{scale:1.03,y:-3}} transition={{type:"spring",...SPF}}
                        style={{display:"flex",flexDirection:"column",justifyContent:"center",padding:"40px 16px",background:dark?"rgba(255,255,255,0.018)":surface,gap:5,cursor:"default",height:"100%",transition:"background 0.25s"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                          <Badge variant="outline" style={{fontSize:9,padding:"2px 7px",fontWeight:700,letterSpacing:"0.07em",borderColor:bdr,color:fgSub,background:"transparent",...T}}>{p.code}</Badge>
                          <span style={{fontSize:10,color:fgSub,...T}}>{p.label}</span>
                        </div>
                        <span style={{fontSize:"clamp(18px,2.2vw,26px)",fontWeight:700,letterSpacing:"-0.03em",color:fg,fontVariantNumeric:"tabular-nums",...T}}>{p.sym}{p.amount}</span>
                        {p.note&&<span style={{fontSize:11,color:fgSub,fontStyle:"italic",...T}}>{p.note}</span>}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent><p style={{fontSize:12,fontWeight:500}}>1 USD = {p.sym}{p.amount} {p.code}</p></TooltipContent>
                  </Tooltip>
                </FadeUp>
              ))}
            </div>
            <FadeUp delay={0.3}><p style={{marginTop:12,fontSize:11.5,color:fgSub,...T}}>Rates via OpenExchangeRates API. Updated every 5 minutes.</p></FadeUp>
          </div>
        </section>

        <div style={{height:1,background:bdr,transition:"background 0.5s"}}/>

        {/* ── FEATURES ── */}
        <section className="lp-sec" style={{padding:"100px 24px",position:"relative",zIndex:2}} id="what">
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <FadeUp>
              <p style={{fontSize:11.5,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:irSolid,marginBottom:14,transition:"color 0.5s"}}>What it does</p>
              <h2 style={{fontSize:"clamp(28px,5vw,60px)",fontWeight:700,letterSpacing:"-0.038em",lineHeight:1.06,color:fg,marginBottom:48,...T}}>Every currency.<br/>One dashboard.</h2>
            </FadeUp>
            <FadeUp delay={0.08}>
              <div className="feat-grid bento-glow" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:2,borderRadius:22,overflow:"hidden",border:`1px solid ${bdr}`,background:bdr,transition:"border-color 0.5s,background 0.5s"}}>
                {FEATURES.map((f,i)=>{
                  const Icon=f.icon;
                  return(
                    <motion.div key={i} whileHover={{y:-5,scale:1.01}} transition={{type:"spring",...SPF}}
                      style={{padding:"36px 28px",background:dark?"rgba(255,255,255,0.014)":surface,display:"flex",flexDirection:"column",gap:12,cursor:"default",transition:"background 0.3s"}}>
                      <motion.div whileHover={{rotate:10,scale:1.14}} transition={{type:"spring",stiffness:300,damping:14}}
                        style={{width:40,height:40,borderRadius:12,background:irDim,border:`1px solid ${irBdr}`,display:"flex",alignItems:"center",justifyContent:"center",color:irSolid,flexShrink:0,transition:"all 0.5s"}}>
                        <Icon size={17}/>
                      </motion.div>
                      <h3 style={{fontSize:14,fontWeight:600,letterSpacing:"-0.02em",color:fg,lineHeight:1.3,margin:0,...T}}>{f.title}</h3>
                      <p style={{fontSize:13,lineHeight:1.65,color:fgMuted,margin:0,...T}}>{f.body}</p>
                    </motion.div>
                  );
                })}
              </div>
            </FadeUp>
          </div>
        </section>

        <div style={{height:1,background:bdr,transition:"background 0.5s"}}/>

        {/* ── WHO ── */}
        <section className="lp-sec" style={{padding:"100px 24px",position:"relative",zIndex:2}} id="who">
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <FadeUp>
              <p style={{fontSize:11.5,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:irSolid,marginBottom:14,transition:"color 0.5s"}}>Who it is for</p>
              <h2 style={{fontSize:"clamp(28px,5vw,60px)",fontWeight:700,letterSpacing:"-0.038em",lineHeight:1.06,color:fg,marginBottom:52,...T}}>For anyone who earns in one world<br/>and lives in another.</h2>
            </FadeUp>
            <div className="who-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
              {[
                {n:"01",title:"The expat splitting across currencies", body:"Salary in USD. Rent in local currency. Family back home in another. Perceiva holds all of it in one place without losing the thread."},
                {n:"02",title:"The freelancer with global clients",  body:"GBP from London, EUR from Berlin, USD from New York. Every payment converts the moment it lands — no spreadsheet needed."},
                {n:"03",title:"The traveler who stops tracking",     body:"50,000 IDR on lunch feels like nothing until you convert it. Perceiva makes every number visible before it becomes a habit."},
              ].map((w,i)=>(
                <FadeUp key={i} delay={i*0.09}>
                  <motion.div whileHover={{y:-7}} transition={{type:"spring",...SPF}}
                    style={{padding:"36px 26px",background:dark?"rgba(255,255,255,0.025)":surface,border:`1px solid ${bdr}`,borderRadius:22,display:"flex",flexDirection:"column",gap:12,cursor:"default",position:"relative",overflow:"hidden",transition:"background 0.3s,border-color 0.5s"}}>
                    <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.12em",color:irSolid,fontFamily:'"SF Mono",ui-monospace,monospace',transition:"color 0.5s"}}>{w.n}</span>
                    <h3 style={{fontSize:16,fontWeight:600,letterSpacing:"-0.02em",color:fg,lineHeight:1.3,margin:0,...T}}>{w.title}</h3>
                    <p style={{fontSize:14,lineHeight:1.72,color:fgMuted,margin:0,...T}}>{w.body}</p>
                    <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}} transition={{delay:0.3+i*0.1,duration:0.65,ease:EASE}}
                      style={{position:"absolute",bottom:0,left:0,height:2,width:"100%",background:`linear-gradient(90deg,${irSolid},transparent)`,transformOrigin:"left",transition:"background 0.5s"}}/>
                  </motion.div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        
        {/* ── STATS ── */}
        <div style={{padding:"80px 24px",borderTop:`1px solid ${bdr}`,borderBottom:`1px solid ${bdr}`,background:dark?"rgba(255,255,255,0.01)":"rgba(0,0,0,0.015)",position:"relative",zIndex:2,transition:"background 0.5s,border-color 0.5s"}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <div style={{display:"flex",alignItems:"stretch",gap:24,flexWrap:"wrap"}}>
              {[
                {v:10,s:"+",l:"Currencies",sub:"and growing"},
                {v:100,s:"%",l:"Free",sub:"no credit card, ever"},
                {v:5,s:"",l:"Minutes",sub:"to set up and log your first transaction"},
                {v:0,s:"",l:"Mental math",sub:"required — we handle all conversions"},
              ].map((s,i)=>(
                <FadeIn key={i} delay={i*0.06} className="stat-flex-item">
                  <motion.div whileHover={{y:-3}} transition={{type:"spring",stiffness:260,damping:20}}
                    style={{flex:"1 1 180px",padding:"32px 28px",background:dark?"rgba(255,255,255,0.025)":surface,border:`1px solid ${bdr}`,borderRadius:20,display:"flex",flexDirection:"column",gap:4,transition:"background 0.3s,border-color 0.5s",minWidth:160}}>
                    <span style={{fontSize:"clamp(44px,4.5vw,64px)",fontWeight:700,letterSpacing:"-0.05em",color:fg,fontVariantNumeric:"tabular-nums",lineHeight:1,...T}}>
                      <Counter to={s.v} suffix={s.s}/>
                    </span>
                    <span style={{fontSize:16,fontWeight:600,color:fg,letterSpacing:"-0.02em",...T}}>{s.l}</span>
                    <span style={{fontSize:13,color:fgMuted,lineHeight:1.5,...T}}>{s.sub}</span>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <section className="cta-sec" style={{padding:"130px 24px 110px",textAlign:"center",position:"relative",overflow:"hidden",zIndex:2}}>
          <div style={{maxWidth:1100,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",gap:22,position:"relative",zIndex:2}}>
            <FadeUp><h2 style={{fontSize:"clamp(34px,7vw,80px)",fontWeight:700,letterSpacing:"-0.045em",lineHeight:1.02,color:fg,margin:0,...T}}>Stop guessing.<br/>Start perceiving.</h2></FadeUp>
            <FadeUp delay={0.1}><p style={{fontSize:17,color:fgMuted,maxWidth:360,lineHeight:1.65,margin:0,...T}}>Five minutes to set up. No more mental math. No more currency confusion.</p></FadeUp>
            <FadeUp delay={0.2}>
              <Magnetic>
                <Link href="/signup" className={`btn-primary btn-lg ${dark?"btn-primary-dark":"btn-primary-light"}`}>
                  Create your account <ArrowRight size={17}/>
                </Link>
              </Magnetic>
            </FadeUp>
            <FadeUp delay={0.26}><Link href="/login" style={{fontSize:13,color:fgSub,textDecoration:"none",transition:"color 0.3s"}}>Already have an account? Sign in</Link></FadeUp>
          </div>
          <div style={{position:"absolute",top:"25%",left:"50%",transform:"translateX(-50%)",width:680,height:360,background:`radial-gradient(ellipse,${irDim} 0%,transparent 66%)`,pointerEvents:"none",transition:"background 0.5s"}}/>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{position:"relative",zIndex:2}}>
          <div style={{height:1,background:bdr,transition:"background 0.5s"}}/>
          <div className="foot-inner" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"26px 52px"}}>
            <span style={{fontSize:14,fontWeight:600,letterSpacing:"-0.02em",color:fgSub,...T}}>Perceiva</span>
            <a href="https://github.com/renzoreyn" target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"center",gap:5,fontSize:13,color:fgSub,textDecoration:"none",transition:"opacity 0.2s"}}
              onMouseEnter={e=>(e.currentTarget.style.opacity="0.7")}
              onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
              made with
              <motion.span animate={{scale:[1,1.35,1]}} transition={{repeat:Infinity,duration:1.8,ease:[0.45,0,0.55,1]}} style={{display:"inline-flex",alignItems:"center"}}>
                <Heart size={12} fill="#ff453a" color="#ff453a"/>
              </motion.span>
              by @Renzoreyn
            </a>
          </div>
        </footer>

        {/* ── HOW IT WORKS dialog ── */}
        <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
          <DialogContent style={{maxWidth:520,background:surface,borderColor:bdr,borderRadius:24,transition:"background 0.5s"}}>
            <DialogHeader>
              <DialogTitle style={{color:fg,fontSize:20,...T}}>How Perceiva works</DialogTitle>
              <DialogDescription style={{color:fgMuted,fontSize:14,...T}}>Three steps from chaos to clarity.</DialogDescription>
            </DialogHeader>
            <div style={{display:"flex",flexDirection:"column",gap:20,marginTop:8}}>
              {[
                {n:"01",title:"Connect your wallets",body:"Create wallets for AMD, USD, IDR. Name them, pick a card style."},
                {n:"02",title:"Log any transaction",body:"Type the amount in whatever currency you have. We convert it to USD instantly using live rates."},
                {n:"03",title:"See the real picture",body:"Your dashboard shows everything unified. No mental math. No surprises at month end."},
              ].map((s,i)=>(
                <motion.div key={i} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:i*0.1}}
                  style={{display:"flex",gap:16,alignItems:"flex-start"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:irDim,border:`1px solid ${irBdr}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,fontWeight:700,color:irSolid,fontFamily:'"SF Mono",ui-monospace,monospace',transition:"all 0.5s"}}>{s.n}</div>
                  <div>
                    <p style={{fontSize:14,fontWeight:600,color:fg,margin:"0 0 4px",...T}}>{s.title}</p>
                    <p style={{fontSize:13,lineHeight:1.65,color:fgMuted,margin:0,...T}}>{s.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div style={{marginTop:8}}>
              <Link href="/signup" onClick={()=>setDemoOpen(false)} className={`btn-primary ${dark?"btn-primary-dark":"btn-primary-light"}`} style={{width:"100%",justifyContent:"center",borderRadius:12}}>
                Get started now <ArrowRight size={15}/>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
