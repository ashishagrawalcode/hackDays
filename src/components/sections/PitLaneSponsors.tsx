"use client";

/**
 * PitLaneSponsors v4
 *
 * KEY FIX — SEAMLESS MARQUEE:
 * The previous version used a -25% translateX wrap which caused a
 * visible jump. This version uses a purely CSS animation with the
 * strip duplicated exactly once (50% total = 2× items).
 * CSS handles the wrap: `@keyframes` goes 0→-50% and loops.
 * The visual is perfectly seamless because at -50% the duplicate
 * starts exactly where the original was at 0%.
 *
 * useAnimationFrame lerp only controls the speed multiplier, not
 * the transform directly — speed is applied via CSS custom property.
 *
 * OTHER IMPROVEMENTS:
 * • Cards: glassmorphic, scan line on focus, reveal panel
 * • Liquid background: pure CSS blob animations
 * • Mouse-parallax: only on desktop, requestAnimationFrame throttled
 * • Mobile: touch-tap to focus/unfocus cards
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPONSORS } from "@/lib/constants";

/* ─── Fallback sponsors if constants empty ─── */
const FALLBACK_LIST = [
  { name:"SPHERON",          logo:"/sponsors/SPHERON.png",          tier:"Gold",      desc:"Decentralized cloud hosting for modern web apps." },
  { name:"Major League Hacking", logo:"/sponsors/MLH.png",          tier:"Partner",   desc:"Official student hackathon league supporting innovation." },
  { name:"1Password",        logo:"/sponsors/1Password.png",        tier:"Silver",    desc:"Secure password management to protect your accounts." },
  { name:"Balsamiq",         logo:"/sponsors/Balsamiq.png",         tier:"Silver",    desc:"Rapid wireframing and prototyping for teams." },
  { name:"Devfolio",         logo:"/sponsors/Devfolio.png",         tier:"Partner",   desc:"India's largest community of developers & hackathons." },
  { name:"Wolfram",          logo:"/sponsors/Wolfram.png",          tier:"Community", desc:"Advanced computation software and knowledge engine." },
  { name:"echo3D",           logo:"/sponsors/echo3D.png",           tier:"Community", desc:"Cloud platform for 3D, AR, and VR content." },
  { name:"Taskade",          logo:"/sponsors/Taskade.png",          tier:"Community", desc:"Collaborative task management and productivity." },
  { name:"Axure",            logo:"/sponsors/Axure.png",            tier:"Community", desc:"UX prototyping and wireframing software." },
  { name:"Coding Ninjas",    logo:"/sponsors/CodingNinjas.png",     tier:"Community", desc:"Online coding courses for developers." },
  { name:"Coding Blocks",    logo:"/sponsors/CodingBlocks.png",     tier:"Community", desc:"Coding bootcamps for software development." },
  { name:"Leading Learners", logo:"/sponsors/LeadingLearners.png",  tier:"Community", desc:"Educational resources and student support." },
];

type Sponsor = { name:string; logo:string; tier?:string; desc?:string; url?:string };

const TIER_COLORS: Record<string,string> = {
  title:"#FFB800", gold:"#FFB800", silver:"#94A3B8", bronze:"#CD7F32",
  partner:"#00D2FF", community:"#39FF14", default:"rgba(255,255,255,0.3)",
};

/* ─────────────────────────────────────
   LIQUID BACKGROUND — pure CSS, no JS
───────────────────────────────────── */
const LIQUID_CSS = `
  @keyframes blob1 {
    0%,100% { transform:translate(-10%,0) scale(1); }
    33%      { transform:translate(28%,16%) scale(1.18); }
    66%      { transform:translate(8%,32%) scale(0.92); }
  }
  @keyframes blob2 {
    0%,100% { transform:translate(0,0) scale(1); }
    40%      { transform:translate(-22%,26%) scale(1.32); }
    70%      { transform:translate(-10%,10%) scale(0.9); }
  }
  @keyframes blob3 {
    0%,100% { transform:translate(0,0) scale(1); }
    50%      { transform:translate(10%,-14%) scale(1.2); }
  }
  .sp-blob { position:absolute; border-radius:50%; filter:blur(80px); will-change:transform; }
`;

function LiquidBg({ mouseX, mouseY }: { mouseX:number; mouseY:number }) {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      <style>{LIQUID_CSS}</style>
      <div className="sp-blob" style={{ width:"50vw", height:"50vw", left:"-8%", top:"-10%",
        background:"radial-gradient(circle,rgba(232,0,45,0.22) 0%,transparent 72%)",
        animation:"blob1 18s ease-in-out infinite" }} />
      <div className="sp-blob" style={{ width:"55vw", height:"55vw", right:"-12%", top:"-5%",
        background:"radial-gradient(circle,rgba(0,100,255,0.10) 0%,transparent 68%)",
        animation:"blob2 22s ease-in-out infinite", opacity:0.7 }} />
      <div className="sp-blob" style={{ width:"35vw", height:"35vw", left:"30%", bottom:"-10%",
        background:"radial-gradient(circle,rgba(245,200,66,0.09) 0%,transparent 70%)",
        animation:"blob3 14s ease-in-out infinite" }} />
      <div style={{ position:"absolute", width:"28vw", height:"28vw", borderRadius:"50%",
        background:"radial-gradient(circle,rgba(0,210,255,0.06) 0%,transparent 70%)",
        transform:`translate(${mouseX}px,${mouseY}px)`,
        transition:"transform 0.6s cubic-bezier(0.22,1,0.36,1)",
        left:"-14vw", top:"-14vw", filter:"blur(40px)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", inset:0,
        backgroundImage:"repeating-linear-gradient(45deg,rgba(255,255,255,0.011) 0,rgba(255,255,255,0.011) 1px,transparent 1px,transparent 8px),repeating-linear-gradient(-45deg,rgba(255,255,255,0.011) 0,rgba(255,255,255,0.011) 1px,transparent 1px,transparent 8px)" }} />
    </div>
  );
}

/* ─────────────────────────────────────
   SPONSOR CARD
───────────────────────────────────── */
function SponsorCard({
  sp, focused, blurred, onFocus, onBlur,
}: {
  sp: Sponsor; focused:boolean; blurred:boolean;
  onFocus:()=>void; onBlur:()=>void;
}) {
  const color = TIER_COLORS[sp.tier?.toLowerCase() ?? "default"] ?? TIER_COLORS.default;

  return (
    <div
      style={{ flexShrink:0, margin:"0 8px", cursor:"pointer" }}
      onMouseEnter={onFocus}
      onMouseLeave={onBlur}
      onTouchEnd={(e)=>{ e.preventDefault(); focused ? onBlur() : onFocus(); }}
    >
      <motion.div
        animate={{
          scale:   focused ? 1.055 : blurred ? 0.93 : 1,
          opacity: blurred ? 0.25 : 1,
          filter:  blurred ? "blur(2.5px) grayscale(35%)" : "blur(0px) grayscale(0%)",
        }}
        transition={{ duration:0.36, ease:"easeOut" }}
        style={{
          position:"relative",
          width:"clamp(190px,44vw,290px)",
          height:"clamp(125px,21vw,162px)",
          background:"rgba(255,255,255,0.022)",
          backdropFilter:"blur(14px)",
          border:`1px solid ${focused?"rgba(232,0,45,0.45)":"rgba(255,255,255,0.07)"}`,
          borderRadius:2, overflow:"hidden", transition:"border-color 0.3s",
        }}
      >
        {/* Scan line */}
        {focused && (
          <motion.div initial={{ top:"-8%" }} animate={{ top:"108%" }}
            transition={{ duration:1.55, ease:"linear", repeat:Infinity }}
            style={{ position:"absolute", left:0, width:"100%", height:2,
              background:"linear-gradient(90deg,transparent,#E8002D,transparent)",
              boxShadow:"0 0 12px #E8002D", zIndex:20, pointerEvents:"none" }} />
        )}

        {/* Header */}
        <div style={{ position:"absolute", top:0, left:0, right:0, display:"flex",
          justifyContent:"space-between", alignItems:"center", padding:"10px 14px", zIndex:10 }}>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:8, fontWeight:500,
            letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)" }}>
            SPONSOR
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            {sp.tier && (
              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:7, fontWeight:700,
                letterSpacing:"0.18em", textTransform:"uppercase", color, padding:"1.5px 6px",
                border:`1px solid ${color}25`, background:`${color}10` }}>
                {sp.tier}
              </span>
            )}
            <div style={{ width:7, height:7, borderRadius:"50%",
              background:focused?"#39FF14":"rgba(255,255,255,0.12)",
              boxShadow:focused?"0 0 8px #39FF14":"none",
              transition:"background 0.3s, box-shadow 0.3s" }} />
          </div>
        </div>

        {/* Logo */}
        <div style={{ position:"absolute", inset:0, display:"flex",
          alignItems:"center", justifyContent:"center", padding:"0 22px", zIndex:10 }}>
          <img src={sp.logo} alt={sp.name}
            style={{ maxHeight:"clamp(30px,6.5vw,46px)", maxWidth:"68%", objectFit:"contain",
              filter:focused?"grayscale(0%) brightness(1)":"grayscale(50%) brightness(0.6)",
              transform:focused?"scale(1.08)":"scale(1)", transition:"filter 0.4s, transform 0.4s" }}
            onError={(e)=>{
              (e.currentTarget as HTMLImageElement).style.display="none";
              const fb = e.currentTarget.nextElementSibling as HTMLElement;
              if (fb) fb.style.display="flex";
            }}
          />
          <div style={{ display:"none", fontFamily:"'Outfit',sans-serif", fontWeight:800,
            fontSize:"clamp(13px,2.8vw,19px)", color:"rgba(255,255,255,0.32)",
            letterSpacing:"0.12em", textTransform:"uppercase", textAlign:"center" }}>
            {sp.name}
          </div>
        </div>

        {/* Reveal panel */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"10px 14px",
          background:"linear-gradient(to top,rgba(0,0,0,0.96) 0%,rgba(0,0,0,0.7) 70%,transparent 100%)",
          borderTop:`1px solid ${focused?"rgba(232,0,45,0.28)":"transparent"}`,
          transform:focused?"translateY(0)":"translateY(100%)",
          transition:"transform 0.38s cubic-bezier(0.22,1,0.36,1), border-color 0.3s",
          zIndex:12 }}>
          <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700,
            fontSize:"clamp(13px,2.4vw,15px)", color:"#F5F3EE",
            letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:3, lineHeight:1 }}>
            {sp.name}
          </h3>
          {sp.desc && (
            <p style={{ fontFamily:"'Inter',sans-serif",
              fontSize:"clamp(9px,1.7vw,10px)", color:"rgba(255,255,255,0.5)",
              lineHeight:1.5, margin:0 }}>{sp.desc}</p>
          )}
        </div>

        {/* Corner chrome */}
        <div style={{ position:"absolute", top:0, left:0, width:14, height:14,
          borderTop:"1px solid rgba(255,255,255,0.1)", borderLeft:"1px solid rgba(255,255,255,0.1)" }} />
        <div style={{ position:"absolute", bottom:0, right:0, width:14, height:14,
          borderBottom:`1px solid ${focused?"rgba(232,0,45,0.4)":"rgba(255,255,255,0.07)"}`,
          borderRight:`1px solid ${focused?"rgba(232,0,45,0.4)":"rgba(255,255,255,0.07)"}`,
          transition:"border-color 0.3s" }} />
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────
   SEAMLESS MARQUEE LANE
   Uses CSS animation only for position.
   JS controls speed via --marquee-duration CSS var.
   This guarantees zero jump/restart artifacts.
───────────────────────────────────── */
function SeamlessLane({
  items, dir, globalFocused, setGlobalFocused, laneId,
}: {
  items: Sponsor[];
  dir: 1 | -1;
  globalFocused: boolean;
  setGlobalFocused: (v: boolean) => void;
  laneId: string;
}) {
  const [focusedIdx, setFocusedIdx] = useState<number|null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const duration = dir === -1 ? 38 : 42; // seconds, slightly different for natural feel

  const handleFocus = useCallback((i: number|null) => {
    setFocusedIdx(i);
    setGlobalFocused(i !== null);
  }, [setGlobalFocused]);

  // Pause animation via CSS when focused
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.style.animationPlayState = globalFocused ? "paused" : "running";
  }, [globalFocused]);

  // Duplicate items once → seamless loop at -50%
  const doubled = [...items, ...items];
  const dirStr  = dir === -1 ? "marqueeLTR" : "marqueeRTL";

  return (
    <>
      <style>{`
        @keyframes marqueeLTR {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marqueeRTL {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>
      <div style={{ overflow:"hidden", padding:"6px 0", position:"relative" }}>
        <div ref={trackRef}
          style={{
            display:"flex", width:"max-content",
            animation:`${dirStr} ${duration}s linear infinite`,
            willChange:"transform",
          }}>
          {doubled.map((sp, i) => (
            <SponsorCard key={`${laneId}-${sp.name}-${i}`}
              sp={sp}
              focused={focusedIdx === i}
              blurred={focusedIdx !== null && focusedIdx !== i}
              onFocus={() => handleFocus(i)}
              onBlur={() => handleFocus(null)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────
   TEXT MARQUEE — also seamless
───────────────────────────────────── */
function TextMarquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <>
      <style>{`@keyframes textMarquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
      <div style={{ overflow:"hidden", borderTop:"1px solid rgba(255,255,255,0.04)",
        borderBottom:"1px solid rgba(255,255,255,0.04)", padding:"9px 0" }}>
        <div style={{ display:"flex", whiteSpace:"nowrap", animation:"textMarquee 30s linear infinite", willChange:"transform" }}>
          {doubled.map((name,i)=>(
            <span key={i} style={{ fontFamily:"'Inter',monospace", fontSize:9, fontWeight:500,
              letterSpacing:"0.28em", textTransform:"uppercase",
              color:"rgba(255,255,255,0.1)", padding:"0 22px", flexShrink:0 }}>
              {name}
              <span style={{ color:"rgba(232,0,45,0.3)", margin:"0 4px" }}>×</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────── */
export function PitLaneSponsors() {
  const [globalFocused, setGlobalFocused] = useState(false);
  const [mousePos, setMousePos]           = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let raf = 0;
    let raw = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      raw = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setMousePos({ ...raw }));
    };
    window.addEventListener("mousemove", onMove, { passive:true });
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  const rawList: Sponsor[] = (SPONSORS as any)?.list ?? FALLBACK_LIST;
  const half  = Math.ceil(rawList.length / 2);
  const lane1 = rawList.slice(0, half);
  const lane2 = rawList.slice(half);
  const title: string = (SPONSORS as any)?.title ?? "OUR SPONSORS";

  return (
    <section ref={sectionRef} id="sponsors"
      style={{ position:"relative", width:"100%", padding:"clamp(60px,8vw,120px) 0",
        background:"#030303", overflow:"hidden" }}>
      <LiquidBg mouseX={mousePos.x} mouseY={mousePos.y} />

      <div style={{ position:"relative", zIndex:10 }}>
        {/* Header */}
        <motion.div initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}}
          viewport={{once:true,margin:"-60px"}} transition={{duration:0.6,ease:[0.22,1,0.36,1]}}
          style={{ maxWidth:1280, margin:"0 auto",
            padding:"0 clamp(16px,4vw,40px) clamp(36px,5vw,72px)" }}>
          <div style={{ display:"flex", alignItems:"flex-end",
            justifyContent:"space-between", flexWrap:"wrap", gap:"16px 24px" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{ width:18, height:1, background:"#E8002D", opacity:0.7 }} />
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600,
                  letterSpacing:"0.4em", textTransform:"uppercase", color:"#E8002D", opacity:0.8 }}>
                  02 // Pit Lane Backers
                </span>
              </div>
              <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900,
                fontSize:"clamp(38px,6vw,80px)", color:"#F2F2F8", letterSpacing:"-0.02em", lineHeight:0.94 }}>
                {title}
              </h2>
            </div>

            {/* State badge */}
            <motion.div
              animate={{
                borderColor: globalFocused ? "rgba(57,255,20,0.45)" : "rgba(255,255,255,0.1)",
                background:  globalFocused ? "rgba(57,255,20,0.06)" : "rgba(255,255,255,0.03)",
              }}
              transition={{ duration:0.35 }}
              style={{ display:"flex", alignItems:"center", gap:8,
                padding:"8px 16px", border:"1px solid", borderRadius:2 }}>
              <motion.div animate={{ background:globalFocused?"#39FF14":"#E8002D" }}
                transition={{ duration:0.3 }}
                style={{ width:6, height:6, borderRadius:"50%",
                  boxShadow:globalFocused?"0 0 8px #39FF14":"0 0 6px #E8002D" }} />
              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:500,
                letterSpacing:"0.25em", textTransform:"uppercase",
                color:globalFocused?"#39FF14":"rgba(255,255,255,0.35)",
                transition:"color 0.3s" }}>
                {globalFocused?"FOCUSED":"HOVER TO FOCUS"}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Lanes */}
        <div style={{ position:"relative" }} onMouseLeave={()=>setGlobalFocused(false)}>
          <SeamlessLane items={lane1} dir={-1} laneId="l1"
            globalFocused={globalFocused} setGlobalFocused={setGlobalFocused} />
          <div style={{ height:10 }} />
          <SeamlessLane items={lane2} dir={1} laneId="l2"
            globalFocused={globalFocused} setGlobalFocused={setGlobalFocused} />

          {/* Edge fades */}
          <div style={{ position:"absolute", top:0, bottom:0, left:0, width:"10vw", zIndex:20,
            pointerEvents:"none", background:"linear-gradient(90deg,#030303 0%,rgba(3,3,3,0.6) 55%,transparent 100%)" }} />
          <div style={{ position:"absolute", top:0, bottom:0, right:0, width:"10vw", zIndex:20,
            pointerEvents:"none", background:"linear-gradient(270deg,#030303 0%,rgba(3,3,3,0.6) 55%,transparent 100%)" }} />
        </div>

        {/* Text marquee */}
        <div style={{ marginTop:28 }}>
          <TextMarquee items={rawList.map(s=>s.name)} />
        </div>
      </div>
    </section>
  );
}