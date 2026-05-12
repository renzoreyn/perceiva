"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else { router.push("/dashboard"); router.refresh(); }
  }

  async function handleGoogle() {
    setGLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
  }

  // tokens
  const bg      = dark ? "#141414" : "#ffffff";
  const bdr     = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)";
  const fg      = dark ? "#ededed" : "#111111";
  const fgMuted = dark ? "rgba(237,237,237,0.5)" : "rgba(17,17,17,0.55)";
  const fgSub   = dark ? "rgba(237,237,237,0.28)" : "rgba(17,17,17,0.36)";
  const inputBg = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const accent  = dark ? "#0A84FF" : "#0060D4";

  const input = {
    width:"100%", padding:"11px 14px", borderRadius:12, fontSize:14,
    background:inputBg, border:`1px solid ${bdr}`, color:fg,
    outline:"none", transition:"border-color 0.2s, box-shadow 0.2s",
    fontFamily:"inherit",
  } as React.CSSProperties;

  const label = { fontSize:13, fontWeight:500, color:fgMuted, display:"block", marginBottom:6 } as React.CSSProperties;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
      {/* wordmark */}
      <div style={{ textAlign:"center" }}>
        <motion.h1 initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05, duration:0.5, ease:EASE }}
          style={{ fontSize:28, fontWeight:700, letterSpacing:"-0.03em", color:fg, margin:0 }}>
          Perceiva
        </motion.h1>
        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.15, duration:0.5 }}
          style={{ fontSize:13, color:fgSub, marginTop:4 }}>
          See what you actually spend
        </motion.p>
      </div>

      {/* card */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.55, ease:EASE }}
        style={{ background:bg, border:`1px solid ${bdr}`, borderRadius:20, padding:"28px 28px", boxShadow: dark?"0 8px 40px rgba(0,0,0,0.4)":"0 8px 40px rgba(0,0,0,0.08)", display:"flex", flexDirection:"column", gap:20 }}>

        <div>
          <h2 style={{ fontSize:18, fontWeight:600, letterSpacing:"-0.02em", color:fg, margin:"0 0 4px" }}>Welcome back</h2>
          <p style={{ fontSize:13, color:fgSub, margin:0 }}>Sign in to your account</p>
        </div>

        {/* Google */}
        <button onClick={handleGoogle} disabled={gLoading}
          style={{ width:"100%", padding:"11px 16px", borderRadius:12, fontSize:14, fontWeight:500, border:`1px solid ${bdr}`, background:inputBg, color:fg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, transition:"background 0.2s, transform 0.15s", fontFamily:"inherit" }}
          onMouseEnter={e=>(e.currentTarget.style.background=dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.06)")}
          onMouseLeave={e=>(e.currentTarget.style.background=inputBg)}>
          {gLoading ? (
            <span style={{ width:16, height:16, border:`2px solid ${bdr}`, borderTopColor:accent, borderRadius:"50%", animation:"spin 0.8s linear infinite", display:"inline-block" }}/>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          Continue with Google
        </button>

        {/* divider */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ flex:1, height:1, background:bdr }} />
          <span style={{ fontSize:12, color:fgSub }}>or</span>
          <div style={{ flex:1, height:1, background:bdr }} />
        </div>

        {/* form */}
        <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={label}>Email</label>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={e=>setEmail(e.target.value)} required autoComplete="email"
              style={input}
              onFocus={e=>{ e.currentTarget.style.borderColor=accent; e.currentTarget.style.boxShadow=`0 0 0 3px ${accent}22`; }}
              onBlur={e=>{ e.currentTarget.style.borderColor=bdr; e.currentTarget.style.boxShadow="none"; }}
            />
          </div>

          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <label style={{ ...label, marginBottom:0 }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize:12, color:accent, textDecoration:"none" }}>Forgot?</Link>
            </div>
            <div style={{ position:"relative" }}>
              <input type={show?"text":"password"} placeholder="••••••••" value={password}
                onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"
                style={{ ...input, paddingRight:44 }}
                onFocus={e=>{ e.currentTarget.style.borderColor=accent; e.currentTarget.style.boxShadow=`0 0 0 3px ${accent}22`; }}
                onBlur={e=>{ e.currentTarget.style.borderColor=bdr; e.currentTarget.style.boxShadow="none"; }}
              />
              <button type="button" onClick={()=>setShow(!show)}
                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:fgMuted, cursor:"pointer", padding:4, display:"flex", alignItems:"center" }}>
                {show ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                style={{ fontSize:13, color:"#FF453A", background:"rgba(255,69,58,0.08)", border:"1px solid rgba(255,69,58,0.2)", borderRadius:10, padding:"10px 14px", margin:0 }}>
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button type="submit" disabled={loading}
            style={{ width:"100%", padding:"12px 20px", borderRadius:12, fontSize:14, fontWeight:600, background:accent, color:"#fff", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"filter 0.2s, transform 0.15s", fontFamily:"inherit" }}
            onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.08)"}
            onMouseLeave={e=>e.currentTarget.style.filter="none"}>
            {loading
              ? <span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite", display:"inline-block" }}/>
              : <><span>Sign in</span><ArrowRight size={15}/></>}
          </button>
        </form>
      </motion.div>

      <p style={{ textAlign:"center", fontSize:13, color:fgSub }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color:accent, fontWeight:500, textDecoration:"none" }}>Sign up</Link>
      </p>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
