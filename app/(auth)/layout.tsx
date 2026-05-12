"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function Grain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    // Draw ONCE — static grain, no rAF loop
    const w = 256, h = 256;
    c.width = w; c.height = h;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const img = ctx.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i+1] = img.data[i+2] = v;
      img.data[i+3] = 18;
    }
    ctx.putImageData(img, 0, 0);
  }, []);
  return (
    <canvas ref={ref} style={{
      position:"fixed", inset:0, width:"100%", height:"100%",
      pointerEvents:"none", zIndex:0, opacity:0.35,
      imageRendering:"pixelated", // tile the small canvas
    }}/>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
    const h = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const bg = dark ? "#090909" : "#f5f5f0";

  return (
    <div style={{
      minHeight:"100vh", background:bg,
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:24, position:"relative",
      transition:"background 0.5s",
      fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",
    }}>
      <Grain />
      {/* single static glow — no animation */}
      <div style={{
        position:"fixed", top:"30%", left:"50%", transform:"translateX(-50%)",
        width:500, height:360,
        background:"radial-gradient(ellipse,rgba(0,96,212,0.07) 0%,transparent 68%)",
        pointerEvents:"none", zIndex:0,
      }}/>
      <motion.div
        initial={{ opacity:0, y:16, filter:"blur(6px)" }}
        animate={{ opacity:1, y:0, filter:"blur(0px)" }}
        transition={{ duration:0.55, ease:[0.16,1,0.3,1] }}
        style={{ width:"100%", maxWidth:400, position:"relative", zIndex:1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
