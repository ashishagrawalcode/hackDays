"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { HERO, SITE_META } from "@/lib/constants";

function pad2(n: number) { return String(n).padStart(2, "0"); }

function useCountdown(iso: string) {
  const target = new Date(iso).getTime();
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useAnimationFrame(() => {
    const d = target - Date.now();
    if (d > 0) setT({
      days:    Math.floor(d / 86400000),
      hours:   Math.floor((d % 86400000) / 3600000),
      minutes: Math.floor((d % 3600000) / 60000),
      seconds: Math.floor((d % 60000) / 1000),
    });
  });
  return t;
}

/* ─── Mechanical split-flap digit ───────────────────────────── */
function Digit({ val, label }: { val: number; label: string }) {
  const prev = useRef(val);
  const [cur, setCur] = useState(val);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (prev.current !== val) {
      setFlipping(true);
      const t = setTimeout(() => { setCur(val); setFlipping(false); }, 130);
      prev.current = val;
      return () => clearTimeout(t);
    }
  }, [val]);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"clamp(5px,1vw,8px)" }}>
      <div style={{
        position:"relative",
        width:"clamp(54px,12vw,80px)",
        height:"clamp(64px,14vw,92px)",
      }}>
        {/* Digit card */}
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(180deg,#131212 0%,#0c0c0c 49.5%,#0e0e0e 50.5%,#131212 100%)",
          border:"1px solid rgba(232,0,45,0.1)",
          overflow:"hidden",
          boxShadow:"0 4px 24px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}>
          {/* Equator line */}
          <div style={{
            position:"absolute", top:"50%", left:0, right:0, height:1,
            background:"rgba(0,0,0,0.95)", zIndex:3,
          }} />
          {/* Top sheen */}
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:"45%",
            background:"linear-gradient(180deg,rgba(255,255,255,0.025) 0%,transparent 100%)",
            zIndex:2,
          }} />
          {/* Red top-edge glow */}
          <div style={{
            position:"absolute", top:0, left:0, right:0, height:1,
            background:"rgba(232,0,45,0.25)", zIndex:4,
          }} />

          <div style={{
            position:"absolute", inset:0, display:"flex",
            alignItems:"center", justifyContent:"center", zIndex:2,
          }}>
            <motion.span
              key={cur}
              initial={{ rotateX: flipping ? -80 : 0, opacity: flipping ? 0.2 : 1, y: flipping ? -6 : 0 }}
              animate={{ rotateX: 0, opacity: 1, y: 0 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              style={{
                fontFamily:"'Outfit',sans-serif",
                fontWeight:900,
                fontSize:"clamp(26px,7vw,50px)",
                letterSpacing:"-0.05em",
                lineHeight:1,
                color:"#F0EDE8",
                fontVariantNumeric:"tabular-nums",
                display:"block",
                transformOrigin:"50% 50%",
              }}
            >
              {pad2(cur)}
            </motion.span>
          </div>

          {/* Corner rivets */}
          {[{top:3,left:3},{top:3,right:3},{bottom:3,left:3},{bottom:3,right:3}].map((pos,i) => (
            <div key={i} style={{
              position:"absolute", width:3, height:3, borderRadius:"50%",
              background:"rgba(255,255,255,0.05)",
              boxShadow:"inset 0 0.5px 0 rgba(255,255,255,0.03)",
              ...pos,
            }} />
          ))}
        </div>
      </div>

      <span style={{
        fontFamily:"'JetBrains Mono',monospace",
        fontSize:"clamp(7px,1.3vw,9px)",
        letterSpacing:"0.25em",
        textTransform:"uppercase",
        color:"rgba(255,255,255,0.2)",
      }}>{label}</span>
    </div>
  );
}

function TimerDot() {
  return (
    <motion.div
      animate={{ opacity:[1,0.08,1] }}
      transition={{ duration:1.05, repeat:Infinity, ease:"easeInOut" }}
      style={{
        display:"flex", flexDirection:"column", gap:"clamp(5px,1.2vw,9px)",
        paddingBottom:"clamp(16px,3vw,24px)",
      }}
    >
      {[0,1].map(i => (
        <div key={i} style={{
          width:"clamp(3px,0.7vw,5px)", height:"clamp(3px,0.7vw,5px)",
          borderRadius:"50%",
          background:"rgba(232,0,45,0.55)",
        }} />
      ))}
    </motion.div>
  );
}

/* ─── Animated canvas background ────────────────────────────── */
function HeroBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random(), y: Math.random() * 0.73,
      r: 0.3 + Math.random() * 1.15,
      a: 0.04 + Math.random() * 0.26,
      sp: 0.3 + Math.random() * 0.9,
      ph: Math.random() * Math.PI * 2,
      red: Math.random() > 0.82,
    }));

    let raf: number, t = 0;

    const draw = () => {
      t += 0.003;
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = "#030303";
      ctx.fillRect(0, 0, W, H);

      // Faint red corona at top
      const corona = ctx.createRadialGradient(W*.5,0,0,W*.5,0,W*.58);
      corona.addColorStop(0,"rgba(232,0,45,0.032)");
      corona.addColorStop(1,"transparent");
      ctx.fillStyle = corona;
      ctx.fillRect(0,0,W,H);

      stars.forEach(s => {
        const osc = 0.5 + 0.5*Math.sin(t*s.sp+s.ph);
        ctx.beginPath();
        ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2);
        ctx.fillStyle = s.red
          ? `rgba(232,0,45,${(s.a*osc).toFixed(3)})`
          : `rgba(240,237,232,${(s.a*osc).toFixed(3)})`;
        ctx.fill();
      });

      const fy = H * 0.62;

      // Floor fill
      const fg = ctx.createLinearGradient(0,fy,0,H);
      fg.addColorStop(0,"transparent");
      fg.addColorStop(0.22,"rgba(5,3,3,0.55)");
      fg.addColorStop(1,"#030303");
      ctx.fillStyle = fg;
      ctx.fillRect(0,fy,W,H-fy);

      // Perspective grid
      ctx.save();
      ctx.beginPath();
      ctx.rect(0,fy,W,H-fy);
      ctx.clip();
      ctx.strokeStyle = "rgba(232,0,45,0.04)";
      ctx.lineWidth = 1;

      for (let i=-14;i<=14;i++) {
        const ex = W/2 + i*(W/9.5);
        ctx.beginPath();
        ctx.moveTo(W/2,fy);
        ctx.lineTo(ex,H+60);
        ctx.stroke();
      }
      for (let r=0;r<=9;r++) {
        const ratio = r/9;
        const y = fy + (H-fy)*Math.pow(ratio,1.45);
        ctx.globalAlpha = 0.3 + ratio*0.7;
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  },[]);

  return (
    <canvas ref={ref} style={{
      position:"absolute",inset:0,width:"100%",height:"100%",
      zIndex:0,pointerEvents:"none",
    }} />
  );
}

/* ─── Speed lines ────────────────────────────────────────────── */
function SpeedLines() {
  return (
    <div style={{position:"absolute",inset:0,zIndex:1,pointerEvents:"none",overflow:"hidden"}}>
      {[5,18,33,49,63,78,91].map((top,i)=>(
        <div key={i} className="hero-speed-line" style={{
          top:`${top}%`,
          animationDelay:`${i*0.72}s`,
          animationDuration:`${3.1+i*0.5}s`,
        }} />
      ))}
    </div>
  );
}

/* ─── Telemetry bar ──────────────────────────────────────────── */
const TELE = [
  {k:"ENGINE",v:"HOT",c:"#E8002D"},
  {k:"TYRES",v:"WARM",c:"#FFD000"},
  {k:"DRS",v:"ON",c:"#22c55e"},
  {k:"ERS",v:"CHG",c:"#38bdf8"},
  {k:"AERO",v:"OK",c:"#22c55e"},
];

function TelemetryBar() {
  return (
    <div style={{
      position:"absolute",bottom:0,left:0,right:0,zIndex:6,
      padding:"clamp(8px,1.8vw,14px) clamp(14px,4vw,28px)",
      background:"linear-gradient(transparent,rgba(3,3,3,0.98))",
      display:"flex",alignItems:"center",
      gap:"clamp(10px,2.5vw,22px)",overflowX:"auto",scrollbarWidth:"none",
    }}>
      <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
        <motion.div
          animate={{scale:[1,2.2,1],opacity:[1,0.1,1]}}
          transition={{duration:0.95,repeat:Infinity}}
          style={{width:5,height:5,borderRadius:"50%",background:"#E8002D"}}
        />
        <span style={{
          fontFamily:"'JetBrains Mono',monospace",
          fontSize:"clamp(6px,1vw,8px)",letterSpacing:"0.3em",
          color:"rgba(232,0,45,0.5)",whiteSpace:"nowrap",
        }}>LIVE</span>
      </div>
      <div style={{width:1,height:14,background:"rgba(255,255,255,0.06)",flexShrink:0}} />
      {TELE.map((s,i)=>(
        <motion.div key={s.k}
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.3+i*0.09}}
          style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}
        >
          <motion.div
            animate={{opacity:[1,0.15,1]}}
            transition={{duration:1.5+i*0.3,repeat:Infinity}}
            style={{width:3,height:3,borderRadius:"50%",background:s.c}}
          />
          <span style={{
            fontFamily:"'JetBrains Mono',monospace",
            fontSize:"clamp(6px,0.95vw,7.5px)",letterSpacing:"0.1em",
            color:"rgba(255,255,255,0.16)",
          }}>
            {s.k}<span style={{color:s.c,marginLeft:4}}>{s.v}</span>
          </span>
        </motion.div>
      ))}
      <span style={{
        fontFamily:"'JetBrains Mono',monospace",
        fontSize:"clamp(6px,0.85vw,7px)",letterSpacing:"0.16em",
        color:"rgba(255,255,255,0.04)",marginLeft:"auto",
        flexShrink:0,whiteSpace:"nowrap",
      }}>GLITCH_2.0 · BMU · ACM</span>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────── */
export function HeroGrid() {
  const timer   = useCountdown(HERO.targetDate);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>(".h-enter");
    items.forEach((item,i) => {
      item.style.cssText += [
        "opacity:0",
        "transform:translateY(30px)",
        `transition:opacity 0.85s cubic-bezier(0.22,1,0.36,1) ${0.06+i*0.095}s,`,
        `transform 0.85s cubic-bezier(0.22,1,0.36,1) ${0.06+i*0.095}s`,
      ].join(";");
    });
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      items.forEach(item=>{
        item.style.opacity="1";
        item.style.transform="translateY(0)";
      });
    }));
  },[]);

  return (
    <section id="home" ref={heroRef} style={{
      position:"relative",width:"100%",minHeight:"100svh",
      display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      overflow:"hidden",
      paddingTop:"clamp(72px,10vw,96px)",
      paddingBottom:"clamp(80px,14vw,110px)",
      background:"#030303",
    }}>
      <HeroBackground />
      <SpeedLines />

      {/* Grid overlay */}
      <div style={{
        position:"absolute",inset:0,zIndex:2,pointerEvents:"none",
        backgroundImage:
          "linear-gradient(rgba(232,0,45,0.016) 1px,transparent 1px),"+
          "linear-gradient(90deg,rgba(232,0,45,0.016) 1px,transparent 1px)",
        backgroundSize:"clamp(44px,7vw,72px) clamp(44px,7vw,72px)",
      }} />

      {/* Vignette */}
      <div style={{
        position:"absolute",inset:0,zIndex:3,pointerEvents:"none",
        background:"radial-gradient(ellipse 88% 82% at 50% 42%,transparent 16%,rgba(3,3,3,0.52) 52%,rgba(3,3,3,0.95) 100%)",
      }} />

      {/* Bottom fade */}
      <div style={{
        position:"absolute",bottom:0,left:0,right:0,zIndex:4,pointerEvents:"none",
        height:"clamp(100px,20vh,180px)",
        background:"linear-gradient(transparent,#030303)",
      }} />

      {/* CONTENT */}
      <div style={{
        position:"relative",zIndex:5,
        display:"flex",flexDirection:"column",alignItems:"center",
        textAlign:"center",
        padding:"0 clamp(16px,5vw,32px)",
        width:"100%",maxWidth:960,
      }}>

        {/* ACM badge */}
        <div className="h-enter" style={{marginBottom:"clamp(14px,2.5vw,22px)"}}>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:0,
            border:"1px solid rgba(232,0,45,0.16)",
            overflow:"hidden",
          }}>
            <div style={{
              background:"#E8002D",
              padding:"4px 10px",
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:"clamp(6px,1.1vw,8px)",
              fontWeight:500,letterSpacing:"0.24em",
              color:"#fff",
            }}>ACM</div>
            <span style={{
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:"clamp(6px,1.1vw,8px)",
              letterSpacing:"0.25em",
              color:"rgba(232,0,45,0.6)",
              padding:"4px 12px",
            }}>BML MUNJAL UNIVERSITY</span>
          </div>
        </div>

        {/* Welcome to */}
        <div className="h-enter" style={{marginBottom:2}}>
          <span style={{
            fontFamily:"'Outfit',sans-serif",fontWeight:300,
            fontSize:"clamp(10px,2.2vw,20px)",
            letterSpacing:"clamp(0.38em,0.9vw,0.62em)",
            color:"rgba(240,237,232,0.1)",textTransform:"uppercase",
          }}>Welcome to</span>
        </div>

        {/* GLITCH */}
        <div className="h-enter" style={{overflow:"hidden"}}>
          <h1 style={{
            fontFamily:"'Outfit',sans-serif",fontWeight:900,
            fontSize:"clamp(68px,18vw,210px)",
            letterSpacing:"-0.046em",lineHeight:0.84,
            color:"#F0EDE8",margin:0,
          }}>GLITCH</h1>
        </div>

        {/* 2.0 outlined */}
        <div className="h-enter" style={{overflow:"hidden",marginBottom:"clamp(8px,2vw,14px)"}}>
          <h1 style={{
            fontFamily:"'Outfit',sans-serif",fontWeight:900,
            fontSize:"clamp(68px,18vw,210px)",
            letterSpacing:"-0.046em",lineHeight:0.84,
            WebkitTextStroke:"clamp(1.5px,0.28vw,2.5px) #E8002D",
            color:"transparent",margin:0,
            filter:"drop-shadow(0 0 40px rgba(232,0,45,0.16))",
          }}>2.0</h1>
        </div>

        {/* Meta row */}
        <div className="h-enter" style={{
          display:"flex",alignItems:"center",
          gap:"clamp(8px,2vw,16px)",
          marginBottom:"clamp(24px,5vw,44px)",
          flexWrap:"wrap",justifyContent:"center",
        }}>
          {[
            {label:"APR 18–19, 2026",highlight:true},
            {label:"BML MUNJAL UNIVERSITY",highlight:false},
            {label:"6 EVENTS",highlight:false},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:"clamp(8px,2vw,16px)"}}>
              {i>0 && <div style={{width:1,height:"clamp(12px,2vw,18px)",background:"rgba(240,237,232,0.07)"}} />}
              <span style={{
                fontFamily:"'JetBrains Mono',monospace",
                fontSize:"clamp(7px,1.2vw,9px)",
                letterSpacing:"0.16em",
                color: item.highlight ? "rgba(255,208,0,0.75)" : "rgba(255,255,255,0.22)",
                whiteSpace:"nowrap",
              }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Countdown */}
        <div className="h-enter" style={{marginBottom:"clamp(28px,5.5vw,50px)",width:"100%"}}>
          <div style={{
            display:"flex",alignItems:"center",justifyContent:"center",
            gap:12,marginBottom:"clamp(12px,2.5vw,20px)",
          }}>
            <div style={{flex:1,maxWidth:"clamp(40px,8vw,90px)",height:1,background:"linear-gradient(90deg,transparent,rgba(232,0,45,0.28))"}} />
            <span style={{
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:"clamp(7px,1.1vw,8.5px)",
              letterSpacing:"0.3em",textTransform:"uppercase",
              color:"rgba(255,255,255,0.18)",whiteSpace:"nowrap",
            }}>{HERO?.timerLabel ?? "Race starts in"}</span>
            <div style={{flex:1,maxWidth:"clamp(40px,8vw,90px)",height:1,background:"linear-gradient(90deg,rgba(232,0,45,0.28),transparent)"}} />
          </div>

          <div style={{display:"inline-flex",alignItems:"flex-end",gap:"clamp(8px,2vw,16px)"}}>
            <Digit val={timer.days}    label="Days" />
            <TimerDot />
            <Digit val={timer.hours}   label="Hours" />
            <TimerDot />
            <Digit val={timer.minutes} label="Mins" />
            <TimerDot />
            <Digit val={timer.seconds} label="Secs" />
          </div>
        </div>

        {/* CTAs */}
        <div className="h-enter" style={{
          display:"flex",gap:"clamp(10px,2.5vw,16px)",
          flexWrap:"wrap",justifyContent:"center",width:"100%",
        }}>
          <a
            href="https://unstop.com/college-fests/glitch-20-bml-munjal-university-bmu-gurgaon-452532"
            target="_blank" rel="noopener noreferrer"
            className="btn-primary"
          >
            Register Now <ArrowUpRight size={11} />
          </a>
          <a href="#events" className="btn-ghost">View Events</a>
          <a href="#about"  className="btn-ghost">About</a>
        </div>
      </div>

      <TelemetryBar />

      {/* Scroll cue */}
      <motion.div
        initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.9}}
        style={{
          position:"absolute",bottom:"clamp(28px,5vw,44px)",
          left:"50%",transform:"translateX(-50%)",
          zIndex:6,display:"flex",flexDirection:"column",alignItems:"center",gap:4,
        }}
      >
        <motion.div
          animate={{y:[0,10,0]}} transition={{repeat:Infinity,duration:1.8,ease:"easeInOut"}}
          style={{width:1,height:"clamp(28px,4vw,42px)",background:"linear-gradient(transparent,rgba(232,0,45,0.42))"}}
        />
        <div style={{
          width:5,height:5,
          borderRight:"1px solid rgba(232,0,45,0.38)",
          borderBottom:"1px solid rgba(232,0,45,0.38)",
          transform:"rotate(45deg)",marginTop:-3,
        }} />
      </motion.div>
    </section>
  );
}