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

const SAGE="#A9B689",SAGE_DIM="rgba(169,182,137,0.14)",SAGE_BDR="rgba(169,182,137,0.24)";
const BLUE="#0060d4",BLUE_DIM="rgba(0,96,212,0.09)",BLUE_BDR="rgba(0,96,212,0.2)";
const SP={stiffness:100,damping:22,mass:1.1};
const SPF={stiffness:180,damping:20,mass:0.9};

function FadeUp({children,delay=0,className=""}:{children:React.ReactNode;delay?:number;className?:string}){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-50px"});
  return(
    <motion.div ref={ref} className={className}
      initial={{opacity:0,y:32,filter:"blur(6px)"}}
      animate={inView?{opacity:1,y:0,filter:"blur(0px)"}:{}}
      transition={{duration:0.75,delay,ease:[0.16,1,0.3,1]}}>
      {children}
    </motion.div>
  );
}

function FadeIn({children,delay=0,className=""}:{children:React.ReactNode;delay?:number;className?:string}){
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-40px"});
  return(
    <motion.div ref={ref} className={className}
      initial={{opacity:0}} animate={inView?{opacity:1}:{}}
      transition={{duration:0.6,delay}}>
      {children}
    </motion.div>
  );
}

function Magnetic({children,className=""}:{children:React.ReactNode;className?:string}){
  const ref=useRef<HTMLDivElement>(null);
  const x=useSpring(0,SP),y=useSpring(0,SP);
  return(
    <motion.div ref={ref} style={{x,y}} className={className}
      onMouseMove={e=>{
        if(!ref.current)return;
        const r=ref.current.getBoundingClientRect();
        x.set((e.clientX-r.left-r.width/2)*0.2);
        y.set((e.clientY-r.top-r.height/2)*0.2);
      }}
      onMouseLeave={()=>{x.set(0);y.set(0);}}>
      {children}
    </motion.div>
  );
}

const WORDS=["AMD","IDR","USD","GBP","EUR","CHF","CNY","RUB","anything"];
function Typewriter({accent}:{accent:string}){
  const [idx,setIdx]=useState(0);
  const [text,setText]=useState("AMD");
  const [del,setDel]=useState(false);
  const [pause,setPause]=useState(false);
  useEffect(()=>{
    if(pause){const t=setTimeout(()=>{setPause(false);setDel(true);},1500);return()=>clearTimeout(t);}
    const w=WORDS[idx];
    if(!del){
      if(text.length<w.length){const t=setTimeout(()=>setText(w.slice(0,text.length+1)),90);return()=>clearTimeout(t);}
      setPause(true);
    }else{
      if(text.length>0){const t=setTimeout(()=>setText(text.slice(0,-1)),55);return()=>clearTimeout(t);}
      setDel(false);setIdx((idx+1)%WORDS.length);
    }
  },[text,del,pause,idx]);
  return(
    <span style={{background:`linear-gradient(90deg,${accent},${accent}cc,${accent})`,backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"grad 2.8s linear infinite",minWidth:"3ch",display:"inline-block"}}>
      {text}<span style={{display:"inline-block",width:3,height:"0.8em",background:accent,marginLeft:3,verticalAlign:"middle",borderRadius:2,animation:"blink 1s step-end infinite",WebkitTextFillColor:"initial"}}/>
    </span>
  );
}

function Noise(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const ctx=c.getContext("2d");if(!ctx)return;
    let raf:number;
    const draw=()=>{
      c.width=window.innerWidth;c.height=window.innerHeight;
      const img=ctx.createImageData(c.width,c.height);
      for(let i=0;i<img.data.length;i+=4){const v=Math.random()*255;img.data[i]=img.data[i+1]=img.data[i+2]=v;img.data[i+3]=13;}
      ctx.putImageData(img,0,0);raf=requestAnimationFrame(draw);
    };
    draw();return()=>cancelAnimationFrame(raf);
  },[]);
  return<canvas ref={ref} style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:1,opacity:0.28}}/>;
}

function Counter({to,suffix=""}:{to:number;suffix?:string}){
  const [val,setVal]=useState(0);
  const ref=useRef<HTMLSpanElement>(null);
  const done=useRef(false);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{
      if(!e.isIntersecting||done.current)return;done.current=true;
      const t0=performance.now();
      const go=(now:number)=>{const p=Math.min((now-t0)/1800,1);setVal((1-Math.pow(1-p,4))*to);if(p<1)requestAnimationFrame(go);};
      requestAnimationFrame(go);
    },{threshold:0.5});
    if(ref.current)obs.observe(ref.current);return()=>obs.disconnect();
  },[to]);
  return<span ref={ref}>{Math.round(val)}{suffix}</span>;
}

function Marquee({items,dark}:{items:string[];dark:boolean}){
  const x=useMotionValue(0),base=useMotionValue(0);
  const ref=useRef<HTMLDivElement>(null);
  const [w,setW]=useState(0);
  useEffect(()=>{if(ref.current)setW(ref.current.scrollWidth/2);},[]);
  useAnimationFrame((_,delta)=>{
    base.set(base.get()-40*(delta/1000));
    if(w&&Math.abs(base.get())>=w)base.set(0);
    x.set(base.get());
  });
  const accent=dark?SAGE_BDR:BLUE_BDR;
  return(
    <div style={{overflow:"hidden",borderTop:`1px solid ${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.07)"}`,borderBottom:`1px solid ${dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.07)"}`,background:dark?"rgba(255,255,255,0.012)":"rgba(0,0,0,0.018)",padding:"13px 0",position:"relative",zIndex:2}}>
      <motion.div ref={ref} style={{x,display:"flex",width:"max-content"}}>
        {[...items,...items].map((t,i)=>(
          <span key={i} style={{fontSize:11.5,fontVariantNumeric:"tabular-nums",color:dark?"rgba(237,237,237,0.33)":"rgba(17,17,17,0.44)",letterSpacing:"0.04em",whiteSpace:"nowrap",fontFamily:'"SF Mono",ui-monospace,monospace',display:"flex",alignItems:"center",padding:"0 28px"}}>
            {t}<span style={{width:3,height:3,borderRadius:"50%",background:accent,marginLeft:28,flexShrink:0}}/>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

const TICKER=["1 USD = \u058F390 AMD","1 USD = Rp 17,417 IDR","1 EUR = $1.09 USD","1 GBP = $1.27 USD","1 USD = Fr 0.88 CHF","1 USD = \u00A57.26 CNY","1 AMD = Rp 44.7 IDR","1 CHF = $1.14 USD","1 USD = \u20BD91.2 RUB","1 EUR = \u058F425 AMD","1 GBP = Rp 22,100 IDR","1 CNY = Rp 2,399 IDR"];
const PERCEPTION=[
  {code:"AMD",sym:"\u058F",amount:"390",label:"Armenian Dram",note:"pocket change vibes"},
  {code:"IDR",sym:"Rp",amount:"17,417",label:"Indonesian Rupiah",note:"17k feels like nothing"},
  {code:"RUB",sym:"\u20BD",amount:"91.2",label:"Russian Ruble",note:""},
  {code:"CNY",sym:"\u00A5",amount:"7.26",label:"Chinese Yuan",note:""},
  {code:"GBP",sym:"\u00A3",amount:"0.79",label:"British Pound",note:"worth more than $1"},
];
const FEATURES=[
  {icon:Globe,title:"8+ currencies",body:"USD, GBP, EUR, CHF, CNY, IDR, AMD, RUB. More on the way. Log in any."},
  {icon:RefreshCw,title:"Live rates",body:"Converts the moment you log. Frankfurter API. No key, always fresh."},
  {icon:Layers,title:"Multiple wallets",body:"AMD salary. USD freelance. IDR spending. Separate streams, one view."},
  {icon:BarChart2,title:"Budget tracking",body:"Monthly limits per category. Turns red before your bank does."},
  {icon:ArrowLeftRight,title:"Recurring transactions",body:"Salary, rent, subs. Set once. Logs itself every cycle."},
  {icon:ShieldCheck,title:"Your data only",body:"Email or Google. Your numbers live in your account. Nowhere else."},
];
const WHO=[
  {n:"01",title:"The expat juggling three currencies",body:"Company pays USD. Landlord wants AMD. Family needs IDR. Perceiva holds all of it."},
  {n:"02",title:"The freelancer with global clients",body:"GBP from London, EUR from Berlin, USD from New York. Everything converts at the moment it lands."},
  {n:"03",title:"The traveler who stops tracking",body:"12,000 AMD on lunch feels fine until you see it is Rp 207,000. Perceiva makes it visible."},
];
const TESTIMONIALS=[
  {initials:"RZ",name:"Ren",role:"Creator",text:"I built this because I kept spending AMD like it was free. Turns out it wasn't. Hence, Perceiva."},
  {initials:"NK",name:"N.",role:"Early user",text:"Finally stopped being shocked at my end-of-month IDR balance. The perception check widget is everything."},
  {initials:"AM",name:"A.",role:"Freelancer",text:"I get paid in three currencies. This is the only tracker that handles that without making me do math."},
];
const FLOATS=[{from:"4,700 AMD",to:"$12.05",d:0.65},{from:"Rp 207,000",to:"$11.89",d:0.78},{from:"\u00A380 GBP",to:"$101.60",d:0.91},{from:"Fr 50 CHF",to:"$57.00",d:1.04}];

export default function LandingPage(){
  const [dark,setDark]=useState(false);
  const [menu,setMenu]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  const [demoOpen,setDemoOpen]=useState(false);
  const rootRef=useRef<HTMLDivElement>(null);

  const {scrollYProgress}=useScroll({target:rootRef});
  const rawO=useTransform(scrollYProgress,[0,0.1],[1,0]);
  const rawY=useTransform(scrollYProgress,[0,0.12],[0,-48]);
  const rawS=useTransform(scrollYProgress,[0,0.12],[1,0.95]);
  const hO=useSpring(rawO,{stiffness:80,damping:18});
  const hY=useSpring(rawY,{stiffness:80,damping:18});
  const hS=useSpring(rawS,{stiffness:80,damping:18});

  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>44);
    window.addEventListener("scroll",h,{passive:true});
    return()=>window.removeEventListener("scroll",h);
  },[]);

  const accent=dark?SAGE:BLUE;
  const accentDim=dark?SAGE_DIM:BLUE_DIM;
  const accentBdr=dark?SAGE_BDR:BLUE_BDR;
  const bg=dark?"#090909":"#f5f5f0";
  const surface=dark?"#141414":"#ffffff";
  const bdr=dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.08)";
  const fg=dark?"#ededed":"#111111";
  const fgMuted=dark?"rgba(237,237,237,0.5)":"rgba(17,17,17,0.58)";
  const fgSub=dark?"rgba(237,237,237,0.28)":"rgba(17,17,17,0.36)";
  const navBg=scrolled?(dark?"rgba(9,9,9,0.88)":"rgba(245,245,240,0.92)"):"transparent";
  const navBdr=scrolled?bdr:"transparent";

  return(
    <TooltipProvider delayDuration={150}>
      <style>{`
        @keyframes grad{from{background-position:0%}to{background-position:200%}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        *{box-sizing:border-box}html{scroll-behavior:smooth}a{text-decoration:none}
        .lp-pri:hover{filter:brightness(1.1);transform:translateY(-2px)}
        .lp-nav-a:hover{opacity:1!important}
        @media(max-width:900px){.dn900{display:none!important}.db900{display:flex!important}.fg2{grid-template-columns:repeat(2,1fr)!important}.fg1{grid-template-columns:1fr!important}.cg1{grid-template-columns:1fr!important;gap:48px!important}}
        @media(max-width:640px){.float3,.float4{display:none!important}.fp{padding:22px 20px!important}header{padding:0 20px!important}}
      `}</style>
      <div ref={rootRef} style={{minHeight:"100vh",background:bg,color:fg,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",overflowX:"hidden",position:"relative",transition:"background 0.5s ease,color 0.5s ease"}}>
        <Noise/>

        {/* NAV */}
        <motion.header initial={{y:-20,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:0.7,ease:[0.16,1,0.3,1]}}
          style={{position:"fixed",top:0,left:0,right:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 52px",height:58,backdropFilter:"blur(28px) saturate(1.6)",WebkitBackdropFilter:"blur(28px) saturate(1.6)",background:navBg,borderBottom:`1px solid ${navBdr}`,transition:"background 0.4s,border-color 0.4s"}}>
          <span style={{fontSize:17,fontWeight:700,letterSpacing:"-0.025em",color:fg,transition:"color 0.4s",flexShrink:0}}>Perceiva</span>

          {/* desktop nav */}
          <nav className="dn900" style={{display:"flex",gap:36}}>
            {[["What it does","what"],["Who it is for","who"],["Why it exists","perception"]].map(([l,id],i)=>(
              <motion.a key={l} href={`#${id}`} className="lp-nav-a"
                initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{delay:0.08+i*0.07,duration:0.5}}
                style={{fontSize:13,color:fgMuted,textDecoration:"none",transition:"color 0.2s,opacity 0.2s",opacity:0.75}}
                whileHover={{color:fg,opacity:1}}>{l}</motion.a>
            ))}
          </nav>

          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            {/* theme toggle */}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}} style={{display:"flex",alignItems:"center",gap:7}}>
              <Sun size={13} style={{color:!dark?accent:fgSub,transition:"color 0.35s"}}/>
              <Switch checked={dark} onCheckedChange={setDark} style={{transform:"scale(0.82)"}}/>
              <Moon size={13} style={{color:dark?accent:fgSub,transition:"color 0.35s"}}/>
            </motion.div>

            {/* sign in - always visible */}
            <Link href="/login" className="dn900">
              <Button variant="ghost" size="sm" style={{fontSize:13,color:fg,fontWeight:500,opacity:0.7}}>Sign in</Button>
            </Link>

            <Link href="/signup">
              <Button size="sm" className="lp-pri" style={{fontSize:13,borderRadius:980,background:accent,color:"#fff",border:"none",display:"inline-flex",alignItems:"center",gap:6,transition:"filter 0.2s,transform 0.18s,background 0.4s"}}>
                Get started <ArrowRight size={13}/>
              </Button>
            </Link>

            <button className="db900" onClick={()=>setMenu(true)} style={{display:"none",background:"none",border:"none",color:fg,cursor:"pointer",padding:7,borderRadius:8,opacity:0.7}}>
              <Menu size={20}/>
            </button>
          </div>
        </motion.header>

        {/* mobile menu */}
        <AnimatePresence>
          {menu&&(
            <motion.div initial={{opacity:0,x:"100%"}} animate={{opacity:1,x:0}} exit={{opacity:0,x:"100%"}}
              transition={{type:"spring",stiffness:260,damping:28}}
              style={{position:"fixed",inset:0,zIndex:300,backdropFilter:"blur(32px)",background:dark?"rgba(9,9,9,0.97)":"rgba(245,245,240,0.97)",display:"flex",flexDirection:"column",padding:"88px 32px 52px"}}>
              <button onClick={()=>setMenu(false)} style={{position:"absolute",top:16,right:18,background:"rgba(128,128,128,0.12)",border:"none",color:fg,cursor:"pointer",padding:10,borderRadius:"50%"}}><X size={22}/></button>
              <div style={{display:"flex",flexDirection:"column",flex:1}}>
                {[["What it does","what"],["Who it is for","who"],["Why it exists","perception"],["Sign in","/login"]].map(([l,id],i)=>(
                  <motion.a key={l} href={id.startsWith("/")?id:`#${id}`}
                    initial={{opacity:0,x:28}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}}
                    onClick={()=>setMenu(false)}
                    style={{fontSize:24,fontWeight:600,color:fgMuted,textDecoration:"none",padding:"14px 0",borderBottom:`1px solid ${bdr}`}}>{l}</motion.a>
                ))}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:32}}>
                <Link href="/signup" onClick={()=>setMenu(false)}>
                  <Button size="lg" className="w-full" style={{background:accent,color:"#fff",border:"none",transition:"background 0.4s"}}>Get started <ArrowRight size={15}/></Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO */}
        <section style={{position:"relative",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"130px 24px 110px",overflow:"hidden",zIndex:2}}>
          <motion.div style={{opacity:hO,y:hY,scale:hS,position:"relative",zIndex:3,maxWidth:860,width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:22,willChange:"transform,opacity"}}>
            <motion.div initial={{opacity:0,y:14,filter:"blur(6px)"}} animate={{opacity:1,y:0,filter:"blur(0px)"}} transition={{delay:0.25,duration:0.7,ease:[0.16,1,0.3,1]}}>
              <Badge style={{borderColor:accentBdr,background:accentDim,color:accent,fontSize:12,gap:6,borderRadius:980,padding:"5px 14px",display:"inline-flex",alignItems:"center",transition:"all 0.4s"}}>
                <Zap size={11}/> Live rates. 8+ currencies. Always free.
              </Badge>
            </motion.div>

            <motion.h1 initial={{opacity:0,y:28,filter:"blur(8px)"}} animate={{opacity:1,y:0,filter:"blur(0px)"}} transition={{delay:0.36,duration:0.85,ease:[0.16,1,0.3,1]}}
              style={{fontSize:"clamp(50px,8.5vw,108px)",fontWeight:700,letterSpacing:"-0.045em",lineHeight:1.01,color:fg,margin:0,transition:"color 0.4s"}}>
              Log in <Typewriter accent={accent}/><br/>
              <span style={{color:fgSub,transition:"color 0.4s"}}>get the real number.</span>
            </motion.h1>

            <motion.p initial={{opacity:0,y:18,filter:"blur(4px)"}} animate={{opacity:1,y:0,filter:"blur(0px)"}} transition={{delay:0.50,duration:0.7,ease:[0.16,1,0.3,1]}}
              style={{fontSize:"clamp(15px,2vw,19px)",lineHeight:1.7,color:fgMuted,maxWidth:500,margin:0,transition:"color 0.4s"}}>
              Your AMD salary hits different when you realize what it actually is in IDR.
              Perceiva converts everything, live so you always know what you are working with.
            </motion.p>

            <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.62,duration:0.6,ease:[0.16,1,0.3,1]}}
              style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",justifyContent:"center",marginTop:6}}>
              <Magnetic>
                <Link href="/signup" className="lp-pri" style={{display:"inline-flex",alignItems:"center",gap:8,background:accent,color:"#fff",fontSize:15,fontWeight:500,borderRadius:980,padding:"13px 26px",transition:"filter 0.2s,transform 0.18s,background 0.4s"}}>
                  Start for free <ArrowRight size={15}/>
                </Link>
              </Magnetic>
              <Magnetic>
                <button onClick={()=>setDemoOpen(true)} style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:15,fontWeight:500,color:fgMuted,background:"none",border:`1px solid ${bdr}`,borderRadius:980,padding:"12px 20px",cursor:"pointer",transition:"color 0.2s,border-color 0.2s,background 0.4s"}}>
                  <Sparkles size={14}/> See how it works
                </button>
              </Magnetic>
            </motion.div>

            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.3}} style={{color:fgSub,marginTop:14}}>
              <motion.div animate={{y:[0,6,0]}} transition={{repeat:Infinity,duration:2.2,ease:[0.45,0,0.55,1]}}><ChevronDown size={17}/></motion.div>
            </motion.div>
          </motion.div>

          {/* floats */}
          <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center",marginTop:12,position:"relative",zIndex:3}}>
            {FLOATS.map((f,i)=>(
              <motion.div key={i} className={i>=2?`float${i+1}`:""} initial={{opacity:0,y:20,scale:0.92}} animate={{opacity:1,y:0,scale:1}} transition={{delay:f.d,duration:0.65,ease:[0.16,1,0.3,1]}} whileHover={{scale:1.06,y:-3}}
                style={{display:"inline-flex",alignItems:"center",gap:8,background:dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)",border:`1px solid ${bdr}`,borderRadius:980,padding:"9px 18px",fontSize:13,backdropFilter:"blur(12px)",cursor:"default",transition:"background 0.4s,border-color 0.4s"}}>
                <span style={{color:fgSub,fontVariantNumeric:"tabular-nums"}}>{f.from}</span>
                <motion.span animate={{x:[0,4,0]}} transition={{repeat:Infinity,duration:2.4,delay:i*0.4,ease:"easeInOut"}}><ArrowRight size={11} style={{color:accent,transition:"color 0.4s"}}/></motion.span>
                <span style={{color:fg,fontWeight:600,fontVariantNumeric:"tabular-nums",transition:"color 0.4s"}}>{f.to}</span>
              </motion.div>
            ))}
          </div>

          <div style={{position:"absolute",top:"16%",left:"50%",transform:"translateX(-50%)",width:800,height:500,background:`radial-gradient(ellipse,${accentDim} 0%,transparent 68%)`,pointerEvents:"none",zIndex:0,transition:"background 0.5s"}}/>
          <div style={{position:"absolute",bottom:0,left:"18%",width:400,height:400,background:"radial-gradient(ellipse,rgba(94,92,230,0.05) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
        </section>

        <Marquee items={TICKER} dark={dark}/>

        {/* PERCEPTION */}
        <section style={{padding:"120px 24px",position:"relative",zIndex:2}} id="perception">
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <FadeUp>
              <p style={{fontSize:11.5,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:accent,marginBottom:16,transition:"color 0.4s"}}>Why it exists</p>
              <h2 style={{fontSize:"clamp(32px,5vw,64px)",fontWeight:700,letterSpacing:"-0.038em",lineHeight:1.06,color:fg,marginBottom:20,transition:"color 0.4s"}}>$1 hits different<br/>everywhere you go.</h2>
              <p style={{fontSize:17,lineHeight:1.72,color:fgMuted,maxWidth:480,marginBottom:56,transition:"color 0.4s"}}>Numbers lie. 4,700 AMD sounds cheap until you do the math. Perceiva does it for you instantly, every time, no calculator needed.</p>
            </FadeUp>
            <div className="perc-grid" style={{display:"grid",gridTemplateColumns:"160px repeat(5,1fr)",gap:2,borderRadius:22,overflow:"hidden",border:`1px solid ${bdr}`,background:bdr,transition:"border-color 0.4s,background 0.4s"}}>
              <FadeUp delay={0.06}>
                <div style={{display:"flex",flexDirection:"column",justifyContent:"center",padding:"44px 24px",background:accentDim,gap:4,height:"100%",transition:"background 0.4s"}}>
                  <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:accent,transition:"color 0.4s"}}>anchor</span>
                  <span style={{fontSize:44,fontWeight:700,letterSpacing:"-0.04em",color:fg,fontVariantNumeric:"tabular-nums",transition:"color 0.4s"}}>$1.00</span>
                  <span style={{fontSize:11,fontWeight:600,letterSpacing:"0.08em",color:fgSub,transition:"color 0.4s"}}>USD</span>
                </div>
              </FadeUp>
              {PERCEPTION.map((p,i)=>(
                <FadeUp key={p.code} delay={0.06+i*0.08}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div whileHover={{scale:1.03,y:-3}} transition={{type:"spring",...SPF}}
                        style={{display:"flex",flexDirection:"column",justifyContent:"center",padding:"44px 20px",background:dark?"rgba(255,255,255,0.018)":surface,gap:5,cursor:"default",height:"100%",transition:"background 0.25s"}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                          <Badge variant="outline" style={{fontSize:9,padding:"2px 7px",fontWeight:700,letterSpacing:"0.07em",borderColor:bdr,color:fgSub,background:"transparent"}}>{p.code}</Badge>
                          <span style={{fontSize:10,color:fgSub,transition:"color 0.4s"}}>{p.label}</span>
                        </div>
                        <span style={{fontSize:28,fontWeight:700,letterSpacing:"-0.03em",color:fg,fontVariantNumeric:"tabular-nums",transition:"color 0.4s"}}>{p.sym}{p.amount}</span>
                        {p.note&&<span style={{fontSize:11,color:fgSub,fontStyle:"italic",transition:"color 0.4s"}}>{p.note}</span>}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs font-medium">1 USD = {p.sym}{p.amount} {p.code}</p></TooltipContent>
                  </Tooltip>
                </FadeUp>
              ))}
            </div>
            <FadeUp delay={0.3}><p style={{marginTop:14,fontSize:11.5,color:fgSub,transition:"color 0.4s"}}>Rates updated live via Frankfurter API. Reference: xe.com — 1 USD = Rp 17,417 IDR (May 2026).</p></FadeUp>
          </div>
        </section>

        <div style={{height:1,background:bdr,transition:"background 0.4s"}}/>

        {/* FEATURES */}
        <section style={{padding:"120px 24px",position:"relative",zIndex:2}} id="what">
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <FadeUp>
              <p style={{fontSize:11.5,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:accent,marginBottom:16,transition:"color 0.4s"}}>What it does</p>
              <h2 style={{fontSize:"clamp(32px,5vw,64px)",fontWeight:700,letterSpacing:"-0.038em",lineHeight:1.06,color:fg,marginBottom:48,transition:"color 0.4s"}}>Every currency.<br/>One dashboard.</h2>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div className="fg2" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:2,borderRadius:22,overflow:"hidden",border:`1px solid ${bdr}`,background:bdr,transition:"border-color 0.4s,background 0.4s"}}>
                {FEATURES.map((f,i)=>{
                  const Icon=f.icon;
                  return(
                    <motion.div key={i} whileHover={{y:-5,scale:1.01}} transition={{type:"spring",...SPF}}
                      style={{padding:"38px 32px",background:dark?"rgba(255,255,255,0.014)":surface,display:"flex",flexDirection:"column",gap:12,cursor:"default",transition:"background 0.25s"}}>
                      <motion.div whileHover={{rotate:10,scale:1.14}} transition={{type:"spring",stiffness:300,damping:14}}
                        style={{width:42,height:42,borderRadius:13,background:accentDim,border:`1px solid ${accentBdr}`,display:"flex",alignItems:"center",justifyContent:"center",color:accent,transition:"background 0.4s,border-color 0.4s,color 0.4s"}}>
                        <Icon size={18}/>
                      </motion.div>
                      <h3 style={{fontSize:15,fontWeight:600,letterSpacing:"-0.02em",color:fg,lineHeight:1.3,margin:0,transition:"color 0.4s"}}>{f.title}</h3>
                      <p style={{fontSize:13.5,lineHeight:1.65,color:fgMuted,margin:0,transition:"color 0.4s"}}>{f.body}</p>
                    </motion.div>
                  );
                })}
              </div>
            </FadeUp>
          </div>
        </section>

        <div style={{height:1,background:bdr,transition:"background 0.4s"}}/>

        {/* WHO */}
        <section style={{padding:"120px 24px",position:"relative",zIndex:2}} id="who">
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <FadeUp>
              <p style={{fontSize:11.5,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:accent,marginBottom:16,transition:"color 0.4s"}}>Who it is for</p>
              <h2 style={{fontSize:"clamp(32px,5vw,64px)",fontWeight:700,letterSpacing:"-0.038em",lineHeight:1.06,color:fg,marginBottom:52,transition:"color 0.4s"}}>For anyone who earns in one world<br/>and lives in another.</h2>
            </FadeUp>
            <div className="fg2" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
              {WHO.map((w,i)=>(
                <FadeUp key={i} delay={i*0.09}>
                  <motion.div whileHover={{y:-8}} transition={{type:"spring",...SPF}}
                    style={{padding:"38px 30px",background:dark?"rgba(255,255,255,0.025)":surface,border:`1px solid ${bdr}`,borderRadius:22,display:"flex",flexDirection:"column",gap:12,cursor:"default",position:"relative",overflow:"hidden",transition:"background 0.25s,border-color 0.4s"}}>
                    <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.12em",color:accent,fontFamily:'"SF Mono",ui-monospace,monospace',transition:"color 0.4s"}}>{w.n}</span>
                    <h3 style={{fontSize:17,fontWeight:600,letterSpacing:"-0.025em",color:fg,lineHeight:1.28,margin:0,transition:"color 0.4s"}}>{w.title}</h3>
                    <p style={{fontSize:14,lineHeight:1.72,color:fgMuted,margin:0,transition:"color 0.4s"}}>{w.body}</p>
                    <motion.div initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}}
                      transition={{delay:0.35+i*0.1,duration:0.7,ease:[0.16,1,0.3,1]}}
                      style={{position:"absolute",bottom:0,left:0,height:2,width:"100%",background:`linear-gradient(90deg,${accent},transparent)`,transformOrigin:"left",transition:"background 0.4s"}}/>
                  </motion.div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <div style={{height:1,background:bdr,transition:"background 0.4s"}}/>
        <section style={{padding:"100px 24px",position:"relative",zIndex:2}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <FadeUp>
              <p style={{fontSize:11.5,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:accent,marginBottom:16,transition:"color 0.4s"}}>Heard it from</p>
              <h2 style={{fontSize:"clamp(28px,4vw,52px)",fontWeight:700,letterSpacing:"-0.035em",lineHeight:1.08,color:fg,marginBottom:48,transition:"color 0.4s"}}>People who stopped<br/>doing currency math.</h2>
            </FadeUp>
            <div className="fg2" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
              {TESTIMONIALS.map((t,i)=>(
                <FadeUp key={i} delay={i*0.08}>
                  <motion.div whileHover={{y:-5}} transition={{type:"spring",...SPF}}>
                    <Card style={{background:dark?"rgba(255,255,255,0.025)":surface,border:`1px solid ${bdr}`,borderRadius:20,overflow:"hidden",transition:"background 0.25s,border-color 0.4s"}}>
                      <CardHeader style={{paddingBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          <Avatar>
                            <AvatarFallback style={{background:accentDim,color:accent,fontWeight:700,fontSize:13,transition:"background 0.4s,color 0.4s"}}>{t.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle style={{fontSize:14,color:fg,transition:"color 0.4s"}}>{t.name}</CardTitle>
                            <CardDescription style={{fontSize:12,color:fgSub,transition:"color 0.4s"}}>{t.role}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p style={{fontSize:14,lineHeight:1.7,color:fgMuted,margin:0,transition:"color 0.4s"}}>"{t.text}"</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <div style={{padding:"72px 24px",borderTop:`1px solid ${bdr}`,borderBottom:`1px solid ${bdr}`,background:dark?"rgba(255,255,255,0.01)":"rgba(0,0,0,0.018)",position:"relative",zIndex:2,transition:"background 0.4s,border-color 0.4s"}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <div className="stats-g" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:2,borderRadius:22,overflow:"hidden",border:`1px solid ${bdr}`,background:bdr,transition:"border-color 0.4s,background 0.4s"}}>
              {[{v:8,s:"+",l:"Currencies, more coming"},{v:100,s:"%",l:"Free, no credit card"},{v:5,s:" min",l:"To set up and log your first transaction"},{v:0,s:"",l:"Mental math required"}].map((s,i)=>(
                <FadeIn key={i} delay={i*0.07}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,padding:"50px 20px",background:dark?"rgba(255,255,255,0.014)":surface,textAlign:"center",transition:"background 0.4s"}}>
                    <span style={{fontSize:54,fontWeight:700,letterSpacing:"-0.045em",color:fg,fontVariantNumeric:"tabular-nums",lineHeight:1,transition:"color 0.4s"}}><Counter to={s.v} suffix={s.s}/></span>
                    <span style={{fontSize:13,color:fgMuted,maxWidth:110,lineHeight:1.45,transition:"color 0.4s"}}>{s.l}</span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>

        {/* CHECKLIST + PROGRESS */}
        <section style={{padding:"100px 24px",position:"relative",zIndex:2}}>
          <div className="cg1" style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center"}}>
            <FadeUp>
              <p style={{fontSize:11.5,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:accent,marginBottom:16,transition:"color 0.4s"}}>What you get</p>
              <h2 style={{fontSize:"clamp(28px,4vw,52px)",fontWeight:700,letterSpacing:"-0.035em",lineHeight:1.08,color:fg,marginBottom:32,transition:"color 0.4s"}}>Everything you need.<br/>Nothing you don't.</h2>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {["Live multi-currency conversion on every log","Skeuomorphic wallet cards you can customize","Budget limits with real-time spend tracking","Recurring transaction scheduling","Perception check — see what $1 actually looks like","Google + email auth, your data stays yours","More currencies being added regularly"].map((item,i)=>(
                  <motion.div key={i} initial={{opacity:0,x:-12}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{delay:i*0.06,duration:0.5}}
                    style={{display:"flex",alignItems:"flex-start",gap:12}}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:accentDim,border:`1px solid ${accentBdr}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2,transition:"background 0.4s,border-color 0.4s"}}>
                      <Check size={11} style={{color:accent,transition:"color 0.4s"}}/>
                    </div>
                    <span style={{fontSize:14,color:fgMuted,lineHeight:1.55,transition:"color 0.4s"}}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </FadeUp>
            <FadeUp delay={0.15}>
              <div style={{display:"flex",flexDirection:"column",gap:20}}>
                <p style={{fontSize:13,fontWeight:600,color:fgSub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4,transition:"color 0.4s"}}>Currency support</p>
                {[{label:"USD / GBP / EUR / CHF",pct:100},{label:"CNY / AMD / RUB / IDR",pct:100},{label:"JPY / KRW / AED",pct:60},{label:"BRL / MXN / INR",pct:30}].map((row,i)=>(
                  <div key={i} style={{display:"flex",flexDirection:"column",gap:6}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:13,color:fgMuted,fontFamily:'"SF Mono",ui-monospace,monospace',transition:"color 0.4s"}}>{row.label}</span>
                      <span style={{fontSize:12,color:row.pct===100?accent:fgSub,fontWeight:600,transition:"color 0.4s"}}>{row.pct===100?"Live":"Coming soon"}</span>
                    </div>
                    <Progress value={row.pct} style={{height:4,background:dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.08)",borderRadius:9999}}
                      indicatorClassName="" />
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </section>

        {/* CTA */}
        <section style={{padding:"140px 24px 120px",textAlign:"center",position:"relative",overflow:"hidden",zIndex:2}}>
          <div style={{maxWidth:1100,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",gap:20,position:"relative",zIndex:2}}>
            <FadeUp><h2 style={{fontSize:"clamp(38px,7vw,84px)",fontWeight:700,letterSpacing:"-0.045em",lineHeight:1.02,color:fg,margin:0,transition:"color 0.4s"}}>Stop guessing.<br/>Start perceiving.</h2></FadeUp>
            <FadeUp delay={0.1}><p style={{fontSize:17,color:fgMuted,maxWidth:360,lineHeight:1.65,margin:0,transition:"color 0.4s"}}>Takes five minutes. Saves you from a lot of "wait, how much is that actually?"</p></FadeUp>
            <FadeUp delay={0.2}>
              <Magnetic>
                <Link href="/signup" className="lp-pri" style={{display:"inline-flex",alignItems:"center",gap:8,background:accent,color:"#fff",fontSize:17,fontWeight:500,borderRadius:980,padding:"16px 34px",transition:"filter 0.2s,transform 0.18s,background 0.4s"}}>
                  Create your account <ArrowRight size={17}/>
                </Link>
              </Magnetic>
            </FadeUp>
            <FadeUp delay={0.28}><Link href="/login" style={{fontSize:13,color:fgSub,textDecoration:"none",transition:"color 0.2s"}}>Already have an account? Sign in</Link></FadeUp>
          </div>
          <div style={{position:"absolute",top:"25%",left:"50%",transform:"translateX(-50%)",width:680,height:380,background:`radial-gradient(ellipse,${accentDim} 0%,transparent 66%)`,pointerEvents:"none",transition:"background 0.5s"}}/>
        </section>

        {/* FOOTER */}
        <footer style={{position:"relative",zIndex:2}}>
          <div style={{height:1,background:bdr,transition:"background 0.4s"}}/>
          <div className="fp" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"26px 52px"}}>
            <span style={{fontSize:14,fontWeight:600,letterSpacing:"-0.02em",color:fgSub,transition:"color 0.4s"}}>Perceiva</span>
            <span style={{display:"flex",alignItems:"center",gap:5,fontSize:13,color:fgSub,transition:"color 0.4s"}}>
              made with
              <motion.span animate={{scale:[1,1.35,1]}} transition={{repeat:Infinity,duration:1.8,ease:[0.45,0,0.55,1]}} style={{display:"inline-flex",alignItems:"center"}}>
                <Heart size={12} fill="#ff453a" color="#ff453a"/>
              </motion.span>
              by ren
            </span>
          </div>
        </footer>

        {/* HOW IT WORKS dialog */}
        <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
          <DialogContent style={{maxWidth:520,background:surface,borderColor:bdr,borderRadius:24,transition:"background 0.4s"}}>
            <DialogHeader>
              <DialogTitle style={{color:fg,fontSize:20,transition:"color 0.4s"}}>How Perceiva works</DialogTitle>
              <DialogDescription style={{color:fgMuted,fontSize:14,transition:"color 0.4s"}}>Three steps from chaos to clarity.</DialogDescription>
            </DialogHeader>
            <div style={{display:"flex",flexDirection:"column",gap:20,marginTop:8}}>
              {[{n:"01",title:"Connect your wallets",body:"Create wallets for AMD, USD, IDR. Name them, pick a card style."},
                {n:"02",title:"Log any transaction",body:"Type the amount in whatever currency you have. We convert it to USD instantly using live rates."},
                {n:"03",title:"See the real picture",body:"Your dashboard shows everything unified. No mental math. No surprises at month end."}].map((s,i)=>(
                <motion.div key={i} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:i*0.1}}
                  style={{display:"flex",gap:16,alignItems:"flex-start"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:accentDim,border:`1px solid ${accentBdr}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,fontWeight:700,color:accent,fontFamily:'"SF Mono",ui-monospace,monospace',transition:"background 0.4s,border-color 0.4s,color 0.4s"}}>{s.n}</div>
                  <div>
                    <p style={{fontSize:14,fontWeight:600,color:fg,margin:"0 0 4px",transition:"color 0.4s"}}>{s.title}</p>
                    <p style={{fontSize:13,lineHeight:1.65,color:fgMuted,margin:0,transition:"color 0.4s"}}>{s.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div style={{marginTop:8}}>
              <Link href="/signup" onClick={()=>setDemoOpen(false)}>
                <Button className="w-full" style={{background:accent,color:"#fff",border:"none",borderRadius:12,transition:"background 0.4s"}}>Get started now <ArrowRight size={15}/></Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>

        <style>{`
          @media(max-width:900px){
            .fg2{grid-template-columns:repeat(2,1fr)!important}
            .cg1{grid-template-columns:1fr!important;gap:48px!important}
            .stats-g{grid-template-columns:repeat(2,1fr)!important}
            .perc-grid{grid-template-columns:repeat(2,1fr)!important}
          }
          @media(max-width:640px){
            .fg2{grid-template-columns:1fr!important}
            .float3,.float4{display:none!important}
          }
        `}</style>
      </div>
    </TooltipProvider>
  );
}
