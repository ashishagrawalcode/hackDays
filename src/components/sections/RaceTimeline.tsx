"use client";

/**
 * RaceTimeline v4 — COMPLETE REWRITE
 * Mobile: track strip at top (contained), events scroll below — ZERO overlap
 * Desktop: sticky center track, Day 1 left, Day 2 right — clear separation
 * Car driven by GSAP MotionPath + canvas particle trail
 * DRS flash, sector fills, telemetry bar, hype architecture
 */

import {
  useEffect, useRef, useState, useCallback
} from "react";
import {
  motion, AnimatePresence, useReducedMotion
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

/* ─────────────────────────────────────
   DATA
───────────────────────────────────── */
type EType = "ceremony" | "coding" | "eval" | "break";

interface Evt {
  id: string; type: EType; time: string;
  title: string; detail: string; lap: string; nodeIdx: number;
}
interface Day { day: string; date: string; color: string; events: Evt[]; }

const META: Record<EType, { color: string; bg: string; label: string }> = {
  ceremony: { color: "#00D2FF", bg: "rgba(0,210,255,0.09)",  label: "CEREMONY"   },
  coding:   { color: "#39FF14", bg: "rgba(57,255,20,0.09)",  label: "CODING"     },
  eval:     { color: "#E8002D", bg: "rgba(232,0,45,0.09)",   label: "EVALUATION" },
  break:    { color: "#F5C842", bg: "rgba(245,200,66,0.09)", label: "BREAK"      },
};

const DAYS: Day[] = [
  {
    day: "DAY 1", date: "April 18", color: "#E8002D",
    events: [
      { id:"d1-1", type:"ceremony", time:"9:30–12:00",  title:"Check In",                 detail:"Teams arrive. Credentials distributed. Pit assignments confirmed.",                    lap:"GRID",   nodeIdx:0 },
      { id:"d1-2", type:"ceremony", time:"12:00–12:30", title:"Opening Ceremony",          detail:"Official race start. Welcome address, keynote, and first-lap briefing.",              lap:"S/F",    nodeIdx:0 },
      { id:"d1-3", type:"coding",   time:"12:00–15:15", title:"Hacking Begins",            detail:"Engines ignite. 24 hours on the clock. Sprint to first working prototype.",           lap:"LAP 1",  nodeIdx:1 },
      { id:"d1-4", type:"break",    time:"12:30–14:00", title:"Lunch Break",               detail:"Pit stop. Refuel. Re-strategise. Mentors open for consultations.",                    lap:"PIT",    nodeIdx:1 },
      { id:"d1-5", type:"ceremony", time:"15:30–16:15", title:"Plenary Talk",              detail:"Industry expert on-stage. Live Q&A follows. Attendance strongly encouraged.",         lap:"LAP 4",  nodeIdx:2 },
      { id:"d1-6", type:"coding",   time:"16:15–18:00", title:"Hacking Continues",         detail:"Mid-stint push. Teams lock in their core architecture.",                              lap:"LAP 6",  nodeIdx:2 },
      { id:"d1-7", type:"eval",     time:"18:00–19:00", title:"Eval Round 1",              detail:"Judges review architecture, scalability, and code quality live.",                     lap:"LAP 8",  nodeIdx:3 },
      { id:"d1-8", type:"coding",   time:"19:00–21:00", title:"Evening Sprint",            detail:"Second wind. Implement feedback from Round 1.",                                       lap:"LAP 10", nodeIdx:3 },
      { id:"d1-9", type:"break",    time:"20:30–22:00", title:"Dinner Break",              detail:"Night pit stop. Fuel for the graveyard shift.",                                       lap:"PIT",    nodeIdx:3 },
      { id:"d1-10",type:"eval",     time:"22:30",       title:"Eval Round 2 — Spin Wheel", detail:"Random technical challenge thrown at each team. Adapt or break.",                     lap:"LAP 12", nodeIdx:4 },
    ],
  },
  {
    day: "DAY 2", date: "April 19", color: "#00D2FF",
    events: [
      { id:"d2-1", type:"break",    time:"0:30–1:30",   title:"Recreational Activities",   detail:"Midnight recharge. Games and activities to reset the brain.",                         lap:"LAP 14", nodeIdx:0 },
      { id:"d2-2", type:"coding",   time:"1:45–4:00",   title:"Hacking Continues",         detail:"The graveyard shift. Endurance tested. True hackathon spirit.",                       lap:"LAP 16", nodeIdx:1 },
      { id:"d2-3", type:"eval",     time:"4:00–6:00",   title:"The Duel — Round 3",        detail:"Head-to-head technical challenge between paired teams.",                              lap:"LAP 20", nodeIdx:2 },
      { id:"d2-4", type:"break",    time:"8:30–9:30",   title:"Breakfast Break",           detail:"Sunrise pit. Last fuel before the final sprint to the flag.",                         lap:"PIT",    nodeIdx:2 },
      { id:"d2-5", type:"coding",   time:"6:00–12:30",  title:"Final Sprint",              detail:"Last laps. Feature freeze. Demo hardening. Pitch preparation.",                       lap:"LAP 22", nodeIdx:3 },
      { id:"d2-6", type:"break",    time:"11:30–11:45", title:"Hi-Tea",                    detail:"A moment to breathe before the judges arrive.",                                       lap:"PIT",    nodeIdx:3 },
      { id:"d2-7", type:"eval",     time:"12:30",       title:"Final Judging Round",       detail:"Live pitches to all judges. This is the podium moment.",                             lap:"FINAL",  nodeIdx:4 },
      { id:"d2-8", type:"ceremony", time:"16:00–17:30", title:"Closing Ceremony",          detail:"Checkered flag. Prize ceremony. Top 3 teams claim ₹60,000.",                         lap:"PODIUM", nodeIdx:4 },
    ],
  },
];

const ALL_EVENTS = DAYS.flatMap(d => d.events);

/* ─────────────────────────────────────
   TRACK PATHS
   Desktop: tall elegant oval 460×450
   Mobile:  wide flat oval 380×170 (no overlap risk)
───────────────────────────────────── */
const DT_PATH =
  "M 230,25 C 310,25 385,48 405,110 C 425,172 410,235 400,295 " +
  "C 388,358 350,400 280,412 C 208,424 138,422 85,398 " +
  "C 32,374 20,330 32,270 C 44,210 85,182 95,136 " +
  "C 110,76 148,25 230,25 Z";

const DT_NODES = [
  { cx:230, cy:25,  label:"S/F",   below:false },
  { cx:406, cy:200, label:"T3",    below:false },
  { cx:280, cy:414, label:"T9",    below:true  },
  { cx:33,  cy:270, label:"T15",   below:false },
  { cx:92,  cy:88,  label:"FINAL", below:false },
];

const MB_PATH =
  "M 55,42 C 95,16 196,12 270,28 C 334,42 360,72 355,104 " +
  "C 350,134 315,150 270,154 C 218,158 136,158 74,144 " +
  "C 28,134 14,110 20,82 C 26,58 36,52 55,42 Z";

const MB_NODES = [
  { cx:55,  cy:42,  label:"S/F" },
  { cx:272, cy:28,  label:"T3"  },
  { cx:355, cy:104, label:"T9"  },
  { cx:74,  cy:144, label:"T15" },
  { cx:20,  cy:82,  label:"FIN" },
];

/* ─────────────────────────────────────
   CANVAS TRAIL
───────────────────────────────────── */
function useTrail(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  posRef:    React.RefObject<{ x: number; y: number }>,
  active:    boolean,
) {
  const hist = useRef<{ x: number; y: number }[]>([]);
  const raf  = useRef(0);

  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;

    const loop = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      if (active && posRef.current) {
        hist.current.push({ ...posRef.current });
        if (hist.current.length > 44) hist.current.shift();
      }
      hist.current.forEach((p, i) => {
        const t = i / hist.current.length;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5 * t, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,0,45,${(t * 0.85).toFixed(2)})`;
        if (t > 0.65) { ctx.shadowColor = "#E8002D"; ctx.shadowBlur = 9; }
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [active, canvasRef, posRef]);
}

/* ─────────────────────────────────────
   DESKTOP CIRCUIT MAP
───────────────────────────────────── */
function DesktopMap({
  progress, activeNode, onNodeClick,
}: { progress: number; activeNode: number; onNodeClick: (n: number) => void }) {
  const svgRef    = useRef<SVGSVGElement>(null);
  const carRef    = useRef<SVGGElement>(null);
  const progRef   = useRef<SVGPathElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posRef    = useRef({ x: 230, y: 25 });
  const proxy     = useRef({ p: 0 });
  const tween     = useRef<gsap.core.Tween | null>(null);

  useTrail(canvasRef, posRef, progress > 0.01);

  useEffect(() => {
    const svg  = svgRef.current;
    const car  = carRef.current;
    const prog = progRef.current;
    if (!svg || !car || !prog) return;
    const road = svg.querySelector(".dt-road") as SVGPathElement;
    if (!road) return;
    const len = road.getTotalLength();
    gsap.set(prog, { strokeDasharray: len, strokeDashoffset: len });

    tween.current = gsap.to(proxy.current, {
      p: 1, paused: true, ease: "none",
      onUpdate() {
        const v   = proxy.current.p;
        const pt  = road.getPointAtLength(v * len);
        const pt2 = road.getPointAtLength(Math.min((v + 0.009) * len, len));
        const ang = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI);
        posRef.current = { x: pt.x, y: pt.y };
        gsap.set(prog, { strokeDashoffset: len * (1 - v) });
        gsap.set(car, { x: pt.x - 6, y: pt.y - 10, rotation: ang + 90, transformOrigin: "6px 10px" });
      },
    });
    return () => { tween.current?.kill(); };
  }, []);

  useEffect(() => { tween.current?.progress(progress); }, [progress]);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <canvas ref={canvasRef} width={460} height={450}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }} />
      <svg ref={svgRef} viewBox="0 0 460 450"
        style={{ display: "block", width: "100%", position: "relative", zIndex: 1, overflow: "visible" }}>
        {/* Kerb outer glow */}
        <path d={DT_PATH} fill="none" stroke="rgba(232,0,45,0.06)" strokeWidth="54" strokeLinecap="round" strokeLinejoin="round" />
        {/* Kerb */}
        <path d={DT_PATH} fill="none" stroke="#180a0a" strokeWidth="44" strokeLinecap="round" strokeLinejoin="round" />
        <path d={DT_PATH} fill="none" stroke="rgba(232,0,45,0.08)" strokeWidth="44" strokeDasharray="5 18" strokeLinecap="butt" />
        {/* Road */}
        <path className="dt-road" d={DT_PATH} fill="none" stroke="#0c0c0c" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
        {/* Centre line */}
        <path d={DT_PATH} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="8 12" strokeLinecap="round" />
        {/* Progress trail */}
        <path ref={progRef} d={DT_PATH} fill="none" stroke="#E8002D" strokeWidth="3" strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 7px #E8002D) drop-shadow(0 0 16px rgba(232,0,45,0.55))" }} />
        {/* DRS zone label */}
        <path d="M 255,25 L 400,65" stroke="rgba(0,210,255,0.18)" strokeWidth="2" strokeDasharray="4 4" />
        <text x="282" y="18" style={{ fontFamily:"'Inter',sans-serif", fontSize:7, fill:"rgba(0,210,255,0.32)", letterSpacing:"0.15em" }}>DRS</text>
        {/* S/F checker */}
        {[0,1,2,3,4,5].flatMap(c => [0,1].map(r => (
          <rect key={`sf-${c}-${r}`} x={219+c*4} y={12+r*4} width={4} height={4}
            fill={(c+r)%2===0?"white":"#000"} opacity={0.5} />
        )))}
        {/* Circuit watermark */}
        <text x="225" y="228" textAnchor="middle"
          style={{ fontFamily:"'Outfit',sans-serif", fontSize:9, fontWeight:900, fill:"rgba(255,255,255,0.025)", letterSpacing:"0.5em" }}>
          HACKDAYS CIRCUIT
        </text>
        {/* Nodes */}
        {DT_NODES.map((n, i) => {
          const isA = i === activeNode;
          return (
            <g key={i} style={{ cursor: "pointer" }} onClick={() => onNodeClick(i)}>
              <circle cx={n.cx} cy={n.cy} r={24} fill="transparent" />
              {isA && (
                <motion.circle cx={n.cx} cy={n.cy} r={14} fill="none" stroke="#E8002D" strokeWidth="1"
                  initial={{ scale: 1, opacity: 0.85 }} animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 1.25, repeat: Infinity, ease: "easeOut" }} />
              )}
              <circle cx={n.cx} cy={n.cy} r={9}
                fill="none" stroke={isA ? "#E8002D" : "rgba(255,255,255,0.1)"}
                strokeWidth={isA ? "1.5" : "0.8"} style={{ transition: "stroke 0.3s" }} />
              <circle cx={n.cx} cy={n.cy} r={4}
                fill={isA ? "#E8002D" : "#181818"}
                style={{ filter: isA ? "drop-shadow(0 0 6px #E8002D)" : "none", transition: "fill 0.3s, filter 0.3s" }} />
              <text
                x={n.cx} y={n.cy + (n.below ? 22 : -14)}
                textAnchor="middle"
                style={{ fontFamily:"'Inter',monospace", fontSize:7,
                  fill: isA ? "rgba(232,0,45,0.9)" : "rgba(255,255,255,0.2)",
                  letterSpacing:"0.12em", transition:"fill 0.3s" }}>
                {n.label}
              </text>
            </g>
          );
        })}
        {/* F1 Car — top-down */}
        <g ref={carRef}>
          <ellipse cx="6" cy="10" rx="14" ry="5" fill="rgba(232,0,45,0.15)" style={{ filter:"blur(4px)" }} />
          <ellipse cx="6" cy="10" rx="3.8" ry="12" fill="#E8002D" />
          <polygon points="6,0 4.2,4 7.8,4" fill="#C0001A" />
          <rect x="1.5" y="17" width="9" height="2" rx="0.5" fill="#C0001A" opacity="0.85" />
          <rect x="2" y="2.5" width="8" height="1.8" rx="0.4" fill="#C0001A" opacity="0.65" />
          <ellipse cx="6" cy="9.5" rx="2.2" ry="3.2" fill="#080808" />
          <path d="M 4.2,9 Q 6,7 7.8,9" fill="none" stroke="#333" strokeWidth="0.8" />
          {[[-1.4,5],[13.4,5],[-1.4,15],[13.4,15]].map(([cx,cy],i)=>(
            <ellipse key={i} cx={cx as number} cy={cy as number} rx="2" ry="3.2" fill="#141414" stroke="#252525" strokeWidth="0.5" />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────
   MOBILE CIRCUIT STRIP
   Contained in 380×170, no overflow
───────────────────────────────────── */
function MobileStrip({
  progress, activeNode, onNodeClick,
}: { progress: number; activeNode: number; onNodeClick: (n: number) => void }) {
  const svgRef    = useRef<SVGSVGElement>(null);
  const carRef    = useRef<SVGGElement>(null);
  const progRef   = useRef<SVGPathElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posRef    = useRef({ x: 55, y: 42 });
  const proxy     = useRef({ p: 0 });
  const tween     = useRef<gsap.core.Tween | null>(null);

  useTrail(canvasRef, posRef, progress > 0.01);

  useEffect(() => {
    const svg  = svgRef.current;
    const car  = carRef.current;
    const prog = progRef.current;
    if (!svg || !car || !prog) return;
    const road = svg.querySelector(".mb-road") as SVGPathElement;
    if (!road) return;
    const len = road.getTotalLength();
    gsap.set(prog, { strokeDasharray: len, strokeDashoffset: len });

    tween.current = gsap.to(proxy.current, {
      p: 1, paused: true, ease: "none",
      onUpdate() {
        const v   = proxy.current.p;
        const pt  = road.getPointAtLength(v * len);
        const pt2 = road.getPointAtLength(Math.min((v + 0.015) * len, len));
        const ang = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI);
        posRef.current = { x: pt.x, y: pt.y };
        gsap.set(prog, { strokeDashoffset: len * (1 - v) });
        gsap.set(car, { x: pt.x - 4, y: pt.y - 7.5, rotation: ang + 90, transformOrigin: "4px 7.5px" });
      },
    });
    return () => { tween.current?.kill(); };
  }, []);

  useEffect(() => { tween.current?.progress(progress); }, [progress]);

  return (
    <div style={{ position: "relative", width: "100%", height: 160 }}>
      <canvas ref={canvasRef} width={380} height={160}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }} />
      <svg ref={svgRef} viewBox="0 0 380 160" preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", width: "100%", height: "100%", position: "relative", zIndex: 1, overflow: "visible" }}>
        {/* Kerb glow */}
        <path d={MB_PATH} fill="none" stroke="rgba(232,0,45,0.05)" strokeWidth="38" strokeLinecap="round" strokeLinejoin="round" />
        {/* Kerb */}
        <path d={MB_PATH} fill="none" stroke="#150808" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
        <path d={MB_PATH} fill="none" stroke="rgba(232,0,45,0.07)" strokeWidth="30" strokeDasharray="4 14" strokeLinecap="butt" />
        {/* Road */}
        <path className="mb-road" d={MB_PATH} fill="none" stroke="#0c0c0c" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
        <path d={MB_PATH} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="5 10" strokeLinecap="round" />
        {/* Progress */}
        <path ref={progRef} d={MB_PATH} fill="none" stroke="#E8002D" strokeWidth="2.5" strokeLinecap="round"
          style={{ filter:"drop-shadow(0 0 5px #E8002D) drop-shadow(0 0 10px rgba(232,0,45,0.5))" }} />
        {/* S/F */}
        {[0,1,2].flatMap(c=>[0,1].map(r=>(
          <rect key={`mbs-${c}-${r}`} x={51+c*3.5} y={35+r*3.5} width={3.5} height={3.5}
            fill={(c+r)%2===0?"white":"#000"} opacity={0.55} />
        )))}
        {/* Nodes */}
        {MB_NODES.map((n, i) => {
          const isA = i === activeNode;
          return (
            <g key={i} onClick={() => onNodeClick(i)} style={{ cursor: "pointer" }}>
              <circle cx={n.cx} cy={n.cy} r={16} fill="transparent" />
              {isA && (
                <motion.circle cx={n.cx} cy={n.cy} r={9} fill="none" stroke="#E8002D" strokeWidth="1"
                  initial={{ scale: 1, opacity: 0.85 }} animate={{ scale: 2.1, opacity: 0 }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }} />
              )}
              <circle cx={n.cx} cy={n.cy} r={5.5}
                fill="none" stroke={isA ? "#E8002D" : "rgba(255,255,255,0.14)"}
                strokeWidth={isA ? "1.5" : "0.8"} style={{ transition:"stroke 0.3s" }} />
              <circle cx={n.cx} cy={n.cy} r={2.8}
                fill={isA ? "#E8002D" : "#1a1a1a"}
                style={{ filter: isA ? "drop-shadow(0 0 5px #E8002D)" : "none", transition: "fill 0.3s" }} />
            </g>
          );
        })}
        {/* Car */}
        <g ref={carRef}>
          <ellipse cx="4" cy="7.5" rx="9" ry="4" fill="rgba(232,0,45,0.12)" style={{ filter:"blur(3px)" }} />
          <ellipse cx="4" cy="7.5" rx="3" ry="8.5" fill="#E8002D" />
          <polygon points="4,0 2.5,3.2 5.5,3.2" fill="#C0001A" />
          <rect x="0" y="12" width="8" height="1.8" rx="0.4" fill="#C0001A" opacity="0.8" />
          <ellipse cx="4" cy="7.5" rx="1.8" ry="2.8" fill="#080808" />
          {[[-1.2,3.8],[9.2,3.8],[-1.2,11.5],[9.2,11.5]].map(([cx,cy],i)=>(
            <ellipse key={i} cx={cx as number} cy={cy as number} rx="1.6" ry="2.6" fill="#141414" stroke="#222" strokeWidth="0.4" />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────
   TELEMETRY BAR
───────────────────────────────────── */
function TelemetryBar({ ev, progress, dayColor }: { ev: Evt|null; progress: number; dayColor: string }) {
  return (
    <div style={{ display:"flex", height:40, border:"1px solid rgba(255,255,255,0.07)",
      overflow:"hidden", marginBottom:14, background:"#080808" }}>
      <div style={{ width:3, background:dayColor, flexShrink:0, transition:"background 0.4s" }} />
      <div style={{ padding:"0 11px", background:"#0a0a0a", display:"flex", alignItems:"center",
        gap:5, borderRight:"1px solid rgba(255,255,255,0.05)", minWidth:68 }}>
        <span style={{ fontFamily:"'Inter',monospace", fontSize:8, color:"rgba(255,255,255,0.22)", letterSpacing:"0.2em" }}>LAP</span>
        <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:20, color:"#F5F3EE", lineHeight:1, letterSpacing:"0.04em" }}>
          {ev?.lap ?? "—"}
        </span>
      </div>
      <div style={{ flex:1, padding:"0 12px", display:"flex", alignItems:"center", overflow:"hidden" }}>
        <AnimatePresence mode="wait">
          <motion.span key={ev?.id}
            initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
            transition={{ duration:0.2 }}
            style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600, color:"#F5F3EE",
              letterSpacing:"0.08em", textTransform:"uppercase", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {ev?.title ?? "STANDBY..."}
          </motion.span>
        </AnimatePresence>
      </div>
      <div style={{ padding:"0 12px", background:"#0a0a0a", display:"flex", alignItems:"center",
        gap:6, borderLeft:"1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:12, color:"#E8002D", fontVariantNumeric:"tabular-nums" }}>
          {Math.round(progress*100)}%
        </span>
        <motion.div animate={{ opacity:[1,0.15,1] }} transition={{ duration:0.9, repeat:Infinity }}
          style={{ width:5, height:5, borderRadius:"50%", background:"#E8002D" }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   SECTOR BAR
───────────────────────────────────── */
function SectorBar({ progress }: { progress: number }) {
  const s1 = Math.min(progress / 0.37, 1);
  const s2 = progress > 0.37 ? Math.min((progress-0.37)/0.35, 1) : 0;
  const s3 = progress > 0.72 ? Math.min((progress-0.72)/0.28, 1) : 0;
  const col = (f: number) => f >= 1 ? "#39FF14" : f > 0 ? "#F5C842" : "#1a1a1a";
  return (
    <div style={{ display:"flex", gap:5, marginBottom:18 }}>
      {[{l:"S1",f:s1},{l:"S2",f:s2},{l:"S3",f:s3}].map(({l,f})=>(
        <div key={l} style={{ flex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
            <span style={{ fontFamily:"'Inter',monospace", fontSize:8, color:"rgba(255,255,255,0.22)", letterSpacing:"0.2em" }}>{l}</span>
            {f>=1 && <motion.span initial={{opacity:0}} animate={{opacity:1}} style={{ fontSize:8, color:"#39FF14" }}>✓</motion.span>}
          </div>
          <div style={{ height:3, background:"#181818", overflow:"hidden", borderRadius:2 }}>
            <motion.div animate={{ width:`${f*100}%` }} transition={{ duration:0.25 }}
              style={{ height:"100%", background:col(f), borderRadius:2 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────
   DESKTOP EVENT ROW
───────────────────────────────────── */
function EventRow({ ev, active, hovered, onHover }: {
  ev:Evt; active:boolean; hovered:boolean; onHover:(id:string|null)=>void;
}) {
  const m  = META[ev.type];
  const on = active || hovered;
  return (
    <motion.div layout
      onMouseEnter={() => onHover(ev.id)} onMouseLeave={() => onHover(null)}
      style={{ padding:"11px 12px", marginBottom:3,
        background: on ? "rgba(232,0,45,0.035)" : "transparent",
        border: `1px solid ${on ? "rgba(232,0,45,0.18)" : "transparent"}`,
        position:"relative", cursor:"default", transition:"background 0.2s, border-color 0.2s" }}>
      <motion.div animate={{ scaleY:on?1:0, opacity:on?1:0 }}
        style={{ position:"absolute", left:0, top:0, bottom:0, width:2, background:"#E8002D",
          transformOrigin:"top", boxShadow:"0 0 8px rgba(232,0,45,0.55)" }} />
      <div style={{ display:"flex", gap:10 }}>
        <div style={{ minWidth:44, paddingTop:1 }}>
          <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:12,
            color:on?m.color:"rgba(255,255,255,0.18)", letterSpacing:"0.04em", transition:"color 0.25s", lineHeight:1 }}>{ev.lap}</span>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5, flexWrap:"wrap" }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:8, fontWeight:600, letterSpacing:"0.2em",
              textTransform:"uppercase", color:m.color, background:m.bg, border:`1px solid ${m.color}25`,
              padding:"2px 7px", flexShrink:0 }}>{m.label}</span>
            <span style={{ fontFamily:"'Inter',monospace", fontSize:9, color:"rgba(255,255,255,0.25)", letterSpacing:"0.08em" }}>{ev.time}</span>
          </div>
          <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:14,
            color:on?"#F5F3EE":"rgba(245,243,238,0.58)", letterSpacing:"0.03em", textTransform:"uppercase",
            lineHeight:1.1, marginBottom:on?5:0, transition:"color 0.2s" }}>{ev.title}</p>
          <AnimatePresence>
            {on && <motion.p initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
              exit={{opacity:0,height:0}} transition={{duration:0.2}}
              style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:"rgba(255,255,255,0.4)", lineHeight:1.65, overflow:"hidden" }}>
              {ev.detail}
            </motion.p>}
          </AnimatePresence>
        </div>
        <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0, marginTop:4,
          background:on?m.color:"#222", boxShadow:on?`0 0 8px ${m.color}`:"none",
          transition:"background 0.25s, box-shadow 0.25s" }} />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────
   DESKTOP DAY COLUMN
───────────────────────────────────── */
function DayColumn({ day, activeId, hoveredId, onHover, isCurrent }: {
  day:Day; activeId:string|null; hoveredId:string|null;
  onHover:(id:string|null)=>void; isCurrent:boolean;
}) {
  return (
    <motion.div initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}}
      viewport={{once:true,margin:"-60px"}} transition={{duration:0.55,ease:[0.22,1,0.36,1]}}>
      <div style={{ padding:"10px 12px", marginBottom:5,
        background: isCurrent ? `${day.color}08` : "#0a0a0a",
        border:`1px solid ${isCurrent?day.color+"28":"rgba(255,255,255,0.06)"}`,
        position:"relative", overflow:"hidden", transition:"background 0.4s, border-color 0.4s" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
          background:isCurrent?`linear-gradient(90deg,${day.color},transparent)`:"transparent",
          transition:"background 0.4s" }} />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <p style={{ fontFamily:"'Inter',monospace", fontSize:9, fontWeight:500, letterSpacing:"0.25em",
              color:"rgba(255,255,255,0.22)", textTransform:"uppercase", marginBottom:2 }}>{day.date}</p>
            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:26,
              letterSpacing:"0.03em", color:isCurrent?"#F5F3EE":"rgba(245,243,238,0.38)",
              transition:"color 0.4s", lineHeight:1 }}>{day.day}</h3>
          </div>
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:8, fontWeight:600,
            letterSpacing:"0.14em", textTransform:"uppercase", color:day.color,
            background:`${day.color}12`, border:`1px solid ${day.color}22`,
            padding:"4px 8px", clipPath:"polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)" }}>
            {day.events.length} EVT
          </div>
        </div>
      </div>
      {day.events.map(ev=>(
        <EventRow key={ev.id} ev={ev}
          active={activeId===ev.id} hovered={hoveredId===ev.id} onHover={onHover} />
      ))}
    </motion.div>
  );
}

/* ─────────────────────────────────────
   MOBILE EVENT CARD
───────────────────────────────────── */
function MobileCard({ ev, idx, expanded, onTap }: {
  ev:Evt; idx:number; expanded:boolean; onTap:()=>void;
}) {
  const m   = META[ev.type];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.style.opacity="1"; el.style.transform="translateY(0)"; }
    }, { threshold:0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} onClick={onTap}
      style={{ opacity:0, transform:"translateY(22px)",
        transition:`opacity 0.42s ${idx*0.055}s ease, transform 0.42s ${idx*0.055}s ease`,
        marginBottom:8, cursor:"pointer",
        border:expanded?`1px solid ${m.color}35`:"1px solid rgba(255,255,255,0.07)",
        background:expanded?`${m.color}06`:"#0c0c0c",
        position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:m.color,
        boxShadow:expanded?`0 0 10px ${m.color}60`:"none", transition:"box-shadow 0.22s" }} />
      <div style={{ padding:"13px 14px 13px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:8, fontWeight:600, letterSpacing:"0.2em",
              textTransform:"uppercase", color:m.color, background:m.bg, border:`1px solid ${m.color}28`, padding:"2px 8px" }}>
              {m.label}
            </span>
            <span style={{ fontFamily:"'Inter',monospace", fontSize:9, color:"rgba(255,255,255,0.3)" }}>{ev.time}</span>
          </div>
          <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:11,
            color:expanded?m.color:"rgba(255,255,255,0.18)", letterSpacing:"0.06em",
            transition:"color 0.2s", flexShrink:0, marginLeft:8 }}>{ev.lap}</span>
        </div>
        <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:16,
          color:expanded?"#F5F3EE":"rgba(245,243,238,0.72)", letterSpacing:"0.03em",
          textTransform:"uppercase", lineHeight:1.1, marginBottom:expanded?8:0,
          transition:"color 0.2s" }}>{ev.title}</p>
        <AnimatePresence>
          {expanded && <motion.p initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
            exit={{opacity:0,height:0}} transition={{duration:0.25}}
            style={{ fontFamily:"'Inter',sans-serif", fontSize:12,
              color:"rgba(255,255,255,0.45)", lineHeight:1.65, overflow:"hidden" }}>
            {ev.detail}
          </motion.p>}
        </AnimatePresence>
      </div>
      <div style={{ position:"absolute", bottom:9, right:11, fontSize:10,
        color:expanded?m.color:"rgba(255,255,255,0.15)", transition:"color 0.2s, transform 0.2s",
        transform:expanded?"rotate(180deg)":"rotate(0deg)" }}>▾</div>
    </div>
  );
}

/* ─────────────────────────────────────
   MOBILE TIMELINE LAYOUT
───────────────────────────────────── */
function MobileTimeline() {
  const [activeDay, setActiveDay]     = useState(0);
  const [expandedId, setExpandedId]   = useState<string|null>(null);
  const [progress, setProgress]       = useState(0);
  const [drsFlash, setDrsFlash]       = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const prevProg   = useRef(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect  = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p     = Math.max(0, Math.min(1, -rect.top / Math.max(total, 1)));
      setProgress(p);
      if ((prevProg.current<0.37&&p>=0.37)||(prevProg.current<0.72&&p>=0.72)) {
        setDrsFlash(true); setTimeout(()=>setDrsFlash(false),1200);
      }
      prevProg.current = p;
    };
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeNode   = Math.min(Math.floor(progress * MB_NODES.length), MB_NODES.length-1);
  const allE         = DAYS.flatMap(d=>d.events);
  const activeEvt    = allE[Math.min(Math.floor(progress*allE.length), allE.length-1)] ?? null;
  const day          = DAYS[activeDay];

  return (
    <div ref={sectionRef}>
      {/* Live indicator */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, flexWrap:"wrap" }}>
        <motion.div animate={{ opacity:[1,0.2,1] }} transition={{ duration:0.9, repeat:Infinity }}
          style={{ width:5, height:5, borderRadius:"50%", background:"#E8002D", flexShrink:0 }} />
        <span style={{ fontFamily:"'Inter',sans-serif", fontSize:8, fontWeight:500,
          letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(232,0,45,0.6)" }}>
          HACKDAYS CIRCUIT · LIVE
        </span>
        <AnimatePresence>
          {drsFlash && (
            <motion.span initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
              style={{ fontFamily:"'Inter',sans-serif", fontSize:8, fontWeight:700,
                letterSpacing:"0.22em", color:"#00D2FF", background:"rgba(0,210,255,0.1)",
                border:"1px solid rgba(0,210,255,0.3)", padding:"2px 8px" }}>
              DRS OPEN
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Track strip — contained box, no overflow */}
      <div style={{ marginBottom:14, background:"#0a0a0a",
        border:"1px solid rgba(255,255,255,0.06)", padding:"10px 8px 6px" }}>
        <MobileStrip progress={progress} activeNode={activeNode}
          onNodeClick={(n)=>{ setProgress((n+0.1)/MB_NODES.length); setActiveDay(n>=3?1:0); }} />
        <div style={{ display:"flex", justifyContent:"space-around", paddingTop:4 }}>
          {MB_NODES.map((n,i)=>(
            <span key={i} style={{ fontFamily:"'Inter',monospace", fontSize:7, fontWeight:500,
              color:i===activeNode?"rgba(232,0,45,0.85)":"rgba(255,255,255,0.18)",
              letterSpacing:"0.1em", transition:"color 0.3s" }}>{n.label}</span>
          ))}
        </div>
      </div>

      {/* Mini telemetry */}
      <div style={{ display:"flex", height:36, border:"1px solid rgba(255,255,255,0.07)",
        overflow:"hidden", marginBottom:12, background:"#080808" }}>
        <div style={{ width:3, background:day.color, flexShrink:0 }} />
        <div style={{ padding:"0 10px", display:"flex", alignItems:"center", gap:5,
          borderRight:"1px solid rgba(255,255,255,0.05)", minWidth:60 }}>
          <span style={{ fontFamily:"'Inter',monospace", fontSize:7, color:"rgba(255,255,255,0.2)", letterSpacing:"0.2em" }}>LAP</span>
          <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:18, color:"#F5F3EE", lineHeight:1 }}>{activeEvt?.lap??"—"}</span>
        </div>
        <div style={{ flex:1, padding:"0 10px", display:"flex", alignItems:"center", overflow:"hidden" }}>
          <AnimatePresence mode="wait">
            <motion.span key={activeEvt?.id}
              initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:0.18}}
              style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600, color:"#F5F3EE",
                letterSpacing:"0.06em", textTransform:"uppercase", whiteSpace:"nowrap",
                overflow:"hidden", textOverflow:"ellipsis", display:"block" }}>
              {activeEvt?.title??"STANDBY..."}
            </motion.span>
          </AnimatePresence>
        </div>
        <div style={{ padding:"0 10px", display:"flex", alignItems:"center",
          borderLeft:"1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:11, color:"#E8002D" }}>
            {Math.round(progress*100)}%
          </span>
        </div>
      </div>

      <SectorBar progress={progress} />

      {/* Day tabs */}
      <div style={{ display:"flex", marginBottom:14, border:"1px solid rgba(255,255,255,0.07)" }}>
        {DAYS.map((d,i)=>(
          <button key={d.day} onClick={()=>setActiveDay(i)}
            style={{ flex:1, padding:"12px 8px", background:activeDay===i?"#0e0e0e":"transparent",
              border:"none", borderBottom:`2px solid ${activeDay===i?d.color:"transparent"}`,
              cursor:"pointer", transition:"all 0.22s" }}>
            <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:18,
              letterSpacing:"0.04em", color:activeDay===i?"#F5F3EE":"rgba(255,255,255,0.25)",
              display:"block", lineHeight:1.1 }}>{d.day}</span>
            <span style={{ fontFamily:"'Inter',monospace", fontSize:8, fontWeight:500,
              letterSpacing:"0.18em", color:activeDay===i?d.color:"rgba(255,255,255,0.18)" }}>{d.date}</span>
          </button>
        ))}
      </div>

      {/* Day header */}
      <div style={{ display:"flex", alignItems:"center", padding:"8px 12px", marginBottom:12,
        background:"#0a0a0a", border:`1px solid ${day.color}22`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
          background:`linear-gradient(90deg,${day.color},transparent)` }} />
        <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:20,
          color:day.color, letterSpacing:"0.05em", marginRight:10 }}>{day.day}</span>
        <span style={{ fontFamily:"'Inter',monospace", fontSize:9, fontWeight:500,
          color:"rgba(255,255,255,0.28)", letterSpacing:"0.18em" }}>
          {day.date} · {day.events.length} EVENTS
        </span>
      </div>

      {/* Events */}
      <AnimatePresence mode="wait">
        <motion.div key={activeDay}
          initial={{opacity:0,x:16}} animate={{opacity:1,x:0}}
          exit={{opacity:0,x:-16}} transition={{duration:0.25}}>
          {day.events.map((ev,i)=>(
            <MobileCard key={ev.id} ev={ev} idx={i}
              expanded={expandedId===ev.id}
              onTap={()=>setExpandedId(expandedId===ev.id?null:ev.id)} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────── */
export function RaceTimeline() {
  const sectionRef     = useRef<HTMLElement>(null);
  const [progress, setProgress]   = useState(0);
  const [hoveredId, setHoveredId] = useState<string|null>(null);
  const [drsFlash, setDrsFlash]   = useState(false);
  const prevProg       = useRef(0);
  const prefersReduced = useReducedMotion();

  const activeNode   = Math.min(Math.floor(progress*DT_NODES.length), DT_NODES.length-1);
  const activeDayIdx = progress < 0.5 ? 0 : 1;
  const activeEvtIdx = Math.min(Math.floor(progress*ALL_EVENTS.length), ALL_EVENTS.length-1);
  const activeEvt    = ALL_EVENTS[activeEvtIdx] ?? null;

  const handleNodeClick = useCallback((n: number) => {
    setProgress((n+0.1)/DT_NODES.length);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReduced) return;
    const trigger = ScrollTrigger.create({
      trigger: section, start:"top 60%", end:"bottom 20%",
      onUpdate(self) {
        const p = Math.max(0, Math.min(1, self.progress));
        setProgress(p);
        if ((prevProg.current<0.37&&p>=0.37)||(prevProg.current<0.72&&p>=0.72)) {
          setDrsFlash(true); setTimeout(()=>setDrsFlash(false),1400);
        }
        prevProg.current = p;
      },
    });
    return () => { trigger.kill(); };
  }, [prefersReduced]);

  return (
    <section ref={sectionRef} id="timeline" style={{
      position:"relative", padding:"90px 0 130px",
      background:"#050508", overflow:"hidden" }}>

      {/* Grid bg */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(232,0,45,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(232,0,45,0.022) 1px,transparent 1px)",
        backgroundSize:"64px 64px" }} />
      <div style={{ position:"absolute", top:"20%", left:"-6%", width:480, height:480, pointerEvents:"none",
        background:"radial-gradient(ellipse,rgba(232,0,45,0.05) 0%,transparent 65%)" }} />
      <div style={{ position:"absolute", bottom:"15%", right:"-6%", width:380, height:380, pointerEvents:"none",
        background:"radial-gradient(ellipse,rgba(0,210,255,0.03) 0%,transparent 65%)" }} />

      {/* DRS Flash banner */}
      <AnimatePresence>
        {drsFlash && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:"fixed", top:0, left:0, right:0, zIndex:9999,
              padding:"7px 0", background:"rgba(0,210,255,0.07)",
              borderBottom:"1px solid rgba(0,210,255,0.28)",
              display:"flex", alignItems:"center", justifyContent:"center",
              gap:12, pointerEvents:"none" }}>
            <motion.div animate={{ opacity:[1,0.3,1] }} transition={{ duration:0.4, repeat:3 }}
              style={{ width:8, height:8, borderRadius:"50%", background:"#00D2FF" }} />
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700,
              letterSpacing:"0.4em", textTransform:"uppercase", color:"#00D2FF" }}>DRS OPEN</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 clamp(14px,4vw,40px)" }}>

        {/* Header */}
        <motion.div initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}}
          viewport={{once:true,margin:"-60px"}} transition={{duration:0.65,ease:[0.22,1,0.36,1]}}
          style={{ marginBottom:36 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{ width:18, height:1, background:"#E8002D", opacity:0.7 }} />
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600,
              letterSpacing:"0.4em", textTransform:"uppercase", color:"#E8002D", opacity:0.8 }}>
              03 // Race Schedule
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", flexWrap:"wrap", gap:"8px 28px" }}>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900,
              fontSize:"clamp(48px,7vw,96px)", color:"#F2F2F8", letterSpacing:"-0.02em", lineHeight:0.94 }}>
              THE RACE<br />TIMELINE
            </h2>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:"rgba(255,255,255,0.28)",
              lineHeight:1.75, maxWidth:320, paddingBottom:5 }}>
              24 hours. Every phase from lights-out to podium.<br />
              <span style={{ color:"rgba(232,0,45,0.6)" }}>Scroll to drive the circuit.</span>
            </p>
          </div>
        </motion.div>

        {/* DESKTOP */}
        <div className="tl-desktop">
          <TelemetryBar ev={hoveredId?ALL_EVENTS.find(e=>e.id===hoveredId)??activeEvt:activeEvt}
            progress={progress} dayColor={DAYS[activeDayIdx].color} />
          <SectorBar progress={progress} />

          {/* Day legend */}
          <div style={{ display:"flex", gap:16, marginBottom:16 }}>
            {DAYS.map(d=>(
              <div key={d.day} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:d.color }} />
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:600,
                  letterSpacing:"0.18em", textTransform:"uppercase", color:d.color }}>
                  {d.day} — {d.date}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr clamp(260px,32%,420px) 1fr",
            gap:"clamp(16px,2.5vw,40px)", alignItems:"start" }}>
            <DayColumn day={DAYS[0]} activeId={activeEvt?.id??null}
              hoveredId={hoveredId} onHover={setHoveredId} isCurrent={activeDayIdx===0} />

            {/* Sticky track */}
            <div style={{ position:"sticky", top:80, zIndex:10 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:7, marginBottom:10 }}>
                <motion.div animate={{ opacity:[1,0.2,1] }} transition={{ duration:1.1, repeat:Infinity }}
                  style={{ width:5, height:5, borderRadius:"50%", background:"#E8002D" }} />
                <span style={{ fontFamily:"'Inter',monospace", fontSize:8, fontWeight:500,
                  letterSpacing:"0.32em", textTransform:"uppercase", color:"rgba(232,0,45,0.55)" }}>
                  HACKDAYS CIRCUIT · LIVE
                </span>
              </div>
              <DesktopMap progress={progress} activeNode={activeNode} onNodeClick={handleNodeClick} />
              <div style={{ display:"flex", justifyContent:"space-around", padding:"12px 0",
                borderTop:"1px solid rgba(255,255,255,0.05)", marginTop:10 }}>
                {[{l:"RACE",v:"24H"},{l:"PHASES",v:"5"},{l:"PRIZE",v:"₹60K"}].map(s=>(
                  <div key={s.l} style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:22,
                      color:"#F5F3EE", letterSpacing:"0.04em", lineHeight:1 }}>{s.v}</div>
                    <div style={{ fontFamily:"'Inter',monospace", fontSize:8, fontWeight:500,
                      color:"rgba(255,255,255,0.18)", letterSpacing:"0.22em", textTransform:"uppercase", marginTop:3 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <DayColumn day={DAYS[1]} activeId={activeEvt?.id??null}
              hoveredId={hoveredId} onHover={setHoveredId} isCurrent={activeDayIdx===1} />
          </div>
        </div>

        {/* MOBILE */}
        <div className="tl-mobile">
          <MobileTimeline />
        </div>

        {/* Footer */}
        <motion.div initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}}
          viewport={{once:true}} transition={{duration:0.5}}
          style={{ marginTop:52, padding:"16px 20px",
            border:"1px solid rgba(255,255,255,0.06)", background:"#080808",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            flexWrap:"wrap", gap:"10px 20px",
            clipPath:"polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px))" }}>
          <div>
            <p style={{ fontFamily:"'Inter',monospace", fontSize:8, fontWeight:500,
              color:"rgba(255,255,255,0.18)", letterSpacing:"0.3em", textTransform:"uppercase", marginBottom:3 }}>
              All times IST (UTC +5:30)
            </p>
            <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:18,
              color:"#F5F3EE", letterSpacing:"0.04em" }}>
              APRIL 18–19 · BML MUNJAL UNIVERSITY
            </p>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"8px 14px" }}>
            {Object.values(META).map(m=>(
              <div key={m.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:m.color }} />
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:8, fontWeight:500,
                  color:"rgba(255,255,255,0.22)", letterSpacing:"0.14em", textTransform:"uppercase" }}>{m.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width:767px) { .tl-desktop{display:none!important} .tl-mobile{display:block!important} }
        @media (min-width:768px) { .tl-desktop{display:block!important} .tl-mobile{display:none!important} }
      `}</style>
    </section>
  );
}