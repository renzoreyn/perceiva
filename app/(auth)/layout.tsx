"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

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
        img.data[i] = img.data[i+1] = img.data[i+2] = v; img.data[i+3] = 11;
      }
      ctx.putImageData(img, 0, 0); raf = requestAnimationFrame(draw);
    };
    draw(); return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0,opacity:0.28 }} />;
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const bg      = mounted ? (dark ? "#090909" : "#f5f5f0") : "#f5f5f0";
  const accentDim = "rgba(0,96,212,0.08)";

  return (
    <div style={{ minHeight:"100vh", background:bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24, position:"relative", transition:"background 0.5s", fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif" }}>
      <Noise />

      {/* subtle background glow */}
      <div style={{ position:"fixed", top:"30%", left:"50%", transform:"translateX(-50%)", width:600, height:400, background:`radial-gradient(ellipse,${accentDim} 0%,transparent 68%)`, pointerEvents:"none", zIndex:0 }} />

      <motion.div
        initial={{ opacity:0, y:20, filter:"blur(6px)" }}
        animate={{ opacity:1, y:0, filter:"blur(0px)" }}
        transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}
        style={{ width:"100%", maxWidth:400, position:"relative", zIndex:1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
