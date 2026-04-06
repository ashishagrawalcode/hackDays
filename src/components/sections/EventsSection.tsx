"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";

/* ══════════════════════════════════════════
   EVENTS DATA  — all 6 Glitch 2.0 events
══════════════════════════════════════════ */
const EVENTS = [
  {
    id: "01",
    name: "HackBMU 8.0",
    short: "Hackathon",
    tagline: "24-hour flagship hackathon",
    desc: "The seventh edition of BMU's marquee hackathon. Build game-changing solutions from scratch. Brightest minds, wildest ideas, zero sleep.",
    color: "#E8002D",
    accent: "rgba(232,0,45,0.12)",
    prize: "₹1,00,000",
    daysLeft: 8,
    link: "https://unstop.com",
    icon: "⚡",
  },
  {
    id: "02",
    name: "Duality Extended",
    short: "DSA Battle",
    tagline: "Year-long DSA showdown finale",
    desc: "The ultimate algorithmic gladiator arena. Top performers from our year-long Duality series converge for the final reckoning. Prove your DSA mastery.",
    color: "#FFD000",
    accent: "rgba(255,208,0,0.1)",
    prize: "₹50,000",
    daysLeft: 10,
    link: "https://unstop.com",
    icon: "⚔",
  },
  {
    id: "03",
    name: "Tech Trap",
    short: "Technical Quiz",
    tagline: "Rapid-fire tech quiz battle",
    desc: "Questions designed to trap even the sharpest engineers. CS fundamentals, current events, lateral thinking — all fair game. One wrong move and you're out.",
    color: "#3b9eff",
    accent: "rgba(59,158,255,0.1)",
    prize: "₹25,000",
    daysLeft: 10,
    link: "https://unstop.com",
    icon: "🎯",
  },
  {
    id: "04",
    name: "Bit by Bit 2.0",
    short: "CTF",
    tagline: "Decode the Unknown",
    desc: "Capture The Flag challenge spanning cryptography, reverse engineering, web exploitation and OSINT. Multi-tier difficulty — rookies welcome, legends expected.",
    color: "#22d35e",
    accent: "rgba(34,211,94,0.1)",
    prize: "₹30,000",
    daysLeft: 5,
    link: "https://unstop.com",
    icon: "🔐",
  },
  {
    id: "05",
    name: "Emoji Explorer",
    short: "Campus Hunt",
    tagline: "Hunt, gather, conquer",
    desc: "Decode emoji clues and race across campus collecting points. Part scavenger hunt, part puzzle game, part social chaos. Bring your crew.",
    color: "#d35cff",
    accent: "rgba(211,92,255,0.1)",
    prize: "₹15,000",
    daysLeft: 9,
    link: "https://unstop.com",
    icon: "🗺",
  },
  {
    id: "06",
    name: "Horizon Talks",
    short: "Speaker Series",
    tagline: "Industry leaders, real insights",
    desc: "Deep-dive sessions with engineers, researchers and founders who are shaping the future. Not another panel — these are raw, unfiltered conversations.",
    color: "#ff6b35",
    accent: "rgba(255,107,53,0.1)",
    prize: "Free",
    daysLeft: 10,
    link: "https://unstop.com",
    icon: "🎙",
  },
];

/* ══════════════════════════════════════════
   TRACK GEOMETRY
   F1-style circuit — 800×500 SVG coords
══════════════════════════════════════════ */
const RAW_PTS = [
  // S/F straight → right
  {x:120,y:420},{x:300,y:420},{x:500,y:420},
  // Turn 1 — wide right hairpin
  {x:660,y:410},{x:720,y:370},{x:740,y:310},
  // Kink right
  {x:730,y:240},{x:700,y:190},
  // Back straight → left
  {x:640,y:140},{x:540,y:110},{x:430,y:95},
  // Left chicane
  {x:330,y:88},{x:240,y:105},
  // Turn last — tight left hairpin
  {x:140,y:160},{x:75,y:240},{x:68,y:330},
  {x:90,y:390},{x:120,y:420},
];

function catmullRom(pts:{x:number;y:number}[], t:number):{x:number;y:number;angle:number} {
  const n = pts.length-1;
  const raw = t * n;
  const seg = Math.min(Math.floor(raw), n-1);
  const lt  = raw - seg;
  const p0  = pts[Math.max(0,seg-1)];
  const p1  = pts[seg];
  const p2  = pts[Math.min(n,seg+1)];
  const p3  = pts[Math.min(n,seg+2)];
  const t2=lt*lt, t3=t2*lt;
  const x=0.5*((2*p1.x)+(-p0.x+p2.x)*lt+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3);
  const y=0.5*((2*p1.y)+(-p0.y+p2.y)*lt+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3);
  const dx=0.5*((-p0.x+p2.x)+2*(2*p0.x-5*p1.x+4*p2.x-p3.x)*lt+3*(-p0.x+3*p1.x-3*p2.x+p3.x)*t2);
  const dy=0.5*((-p0.y+p2.y)+2*(2*p0.y-5*p1.y+4*p2.y-p3.y)*lt+3*(-p0.y+3*p1.y-3*p2.y+p3.y)*t2);
  return {x, y, angle: Math.atan2(dy,dx)*(180/Math.PI)};
}

function buildPath(pts:{x:number;y:number}[]):string {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for(let i=1;i<pts.length;i++){
    const p0=pts[Math.max(0,i-2)];
    const p1=pts[i-1];
    const p2=pts[i];
    const p3=pts[Math.min(pts.length-1,i+1)];
    const cp1x=p1.x+(p2.x-p0.x)/6, cp1y=p1.y+(p2.y-p0.y)/6;
    const cp2x=p2.x-(p3.x-p1.x)/6, cp2y=p2.y-(p3.y-p1.y)/6;
    d+=` C ${cp1x} ${cp1y},${cp2x} ${cp2y},${p2.x} ${p2.y}`;
  }
  return d;
}

// Event trigger positions along track 0→1
const TRIGGERS = EVENTS.map((_,i)=>(i+0.5)/EVENTS.length);
const TRACK_PATH = buildPath(RAW_PTS);
const DASH_LEN = 2600;

/* ══════════════════════════════════════════
   WEBGL car glow renderer
══════════════════════════════════════════ */
const VERT_SRC = `
  attribute vec2 a_pos;
  attribute float a_alpha;
  varying float v_alpha;
  uniform vec2 u_res;
  void main(){
    vec2 clip=(a_pos/u_res)*2.0-1.0;
    gl_Position=vec4(clip.x,-clip.y,0,1);
    gl_PointSize=3.0;
    v_alpha=a_alpha;
  }
`;
const FRAG_SRC = `
  precision mediump float;
  varying float v_alpha;
  uniform vec4 u_col;
  void main(){ gl_FragColor=vec4(u_col.rgb,u_col.a*v_alpha); }
`;

function hexToRgb(hex:string):[number,number,number]{
  const h=hex.replace("#","");
  return [parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255];
}

function useWebGL(
  canvas:HTMLCanvasElement|null,
  pos:{x:number;y:number}|null,
  color:string
){
  const state = useRef<{
    gl:WebGLRenderingContext;
    prog:WebGLProgram;
    trail:{x:number;y:number}[];
  }|null>(null);

  useEffect(()=>{
    if(!canvas) return;
    const gl = canvas.getContext("webgl",{alpha:true,premultipliedAlpha:false});
    if(!gl) return;

    const compile=(type:number,src:string)=>{
      const s=gl.createShader(type)!;
      gl.shaderSource(s,src); gl.compileShader(s); return s;
    };
    const prog=gl.createProgram()!;
    gl.attachShader(prog,compile(gl.VERTEX_SHADER,VERT_SRC));
    gl.attachShader(prog,compile(gl.FRAGMENT_SHADER,FRAG_SRC));
    gl.linkProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    state.current={gl,prog,trail:[]};
    return ()=>{ state.current=null; };
  },[canvas]);

  useEffect(()=>{
    const s=state.current;
    if(!s||!pos||!canvas) return;
    const {gl,prog,trail}=s;

    trail.push({x:pos.x,y:pos.y});
    if(trail.length>50) trail.shift();

    const W=canvas.width, H=canvas.height;
    gl.viewport(0,0,W,H);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);

    const uRes=gl.getUniformLocation(prog,"u_res");
    const uCol=gl.getUniformLocation(prog,"u_col");
    const aPos=gl.getAttribLocation(prog,"a_pos");
    const aAlpha=gl.getAttribLocation(prog,"a_alpha");
    gl.uniform2f(uRes,W,H);
    const [r,g,b]=hexToRgb(color);

    // Trail
    if(trail.length>1){
      const posArr=new Float32Array(trail.flatMap(p=>[p.x,p.y]));
      const alpArr=new Float32Array(trail.map((_,i)=>i/trail.length));
      const vb=gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER,vb);
      gl.bufferData(gl.ARRAY_BUFFER,posArr,gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);
      const ab=gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER,ab);
      gl.bufferData(gl.ARRAY_BUFFER,alpArr,gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aAlpha);
      gl.vertexAttribPointer(aAlpha,1,gl.FLOAT,false,0,0);
      gl.uniform4f(uCol,r,g,b,0.75);
      gl.lineWidth(4);
      gl.drawArrays(gl.LINE_STRIP,0,trail.length);
    }

    // Glow halo
    const RINGS=7;
    const hPts:number[]=[], hAlp:number[]=[];
    for(let ring=0;ring<RINGS;ring++){
      const rad=(ring+1)*5;
      const a=Math.max(0,0.55-ring*0.07);
      for(let θ=0;θ<Math.PI*2;θ+=Math.PI/10){
        hPts.push(pos.x+Math.cos(θ)*rad,pos.y+Math.sin(θ)*rad);
        hAlp.push(a);
      }
    }
    hPts.push(pos.x,pos.y); hAlp.push(1);

    const vb2=gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER,vb2);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(hPts),gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);
    const ab2=gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER,ab2);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(hAlp),gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aAlpha);
    gl.vertexAttribPointer(aAlpha,1,gl.FLOAT,false,0,0);
    gl.uniform4f(uCol,r,g,b,1);
    gl.drawArrays(gl.POINTS,0,hAlp.length);
  },[pos,color,canvas]);
}

/* ══════════════════════════════════════════
   TRACK SVG COMPONENT
══════════════════════════════════════════ */
function TrackSVG({progress,activeIdx}:{progress:number;activeIdx:number}){
  const offset = DASH_LEN*(1-progress);

  return (
    <svg viewBox="0 0 800 500" style={{
      position:"absolute",inset:0,width:"100%",height:"100%",overflow:"visible",
    }} preserveAspectRatio="xMidYMid meet">
      <defs>
        {/* Track glow filter */}
        <filter id="ev-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="ev-glow-sm" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Progress gradient */}
        <linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={activeIdx>=0 ? EVENTS[activeIdx].color : "#E8002D"} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={activeIdx>=0 ? EVENTS[activeIdx].color : "#E8002D"} stopOpacity="0.3"/>
        </linearGradient>
      </defs>

      {/* ── outer kerb shadow ── */}
      <path d={TRACK_PATH} fill="none" stroke="rgba(0,0,0,0.7)"
        strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>

      {/* ── kerb stripes (red/white, tight) ── */}
      <path d={TRACK_PATH} fill="none"
        stroke="rgba(232,0,45,0.15)"
        strokeWidth="42" strokeLinecap="butt" strokeLinejoin="round"
        strokeDasharray="8 8"/>

      {/* ── tarmac surface ── */}
      <path d={TRACK_PATH} fill="none"
        stroke="#141414" strokeWidth="30"
        strokeLinecap="round" strokeLinejoin="round"/>

      {/* ── subtle track texture ── */}
      <path d={TRACK_PATH} fill="none"
        stroke="rgba(255,255,255,0.025)"
        strokeWidth="30" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="2 14"/>

      {/* ── centre line ── */}
      <path d={TRACK_PATH} fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1" strokeDasharray="18 18"/>

      {/* ── track edge glow ── */}
      <path d={TRACK_PATH} fill="none"
        stroke="rgba(50,50,50,0.6)"
        strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"/>

      {/* ── DRIVEN PORTION — animating progress ── */}
      <path d={TRACK_PATH} fill="none"
        stroke={activeIdx>=0 ? EVENTS[activeIdx].color : "#E8002D"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={DASH_LEN}
        strokeDashoffset={offset}
        opacity="0.6"
        filter="url(#ev-glow)"
        style={{transition:"stroke 0.4s"}}
      />

      {/* S/F line */}
      <line x1="120" y1="405" x2="120" y2="435"
        stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"/>
      <line x1="120" y1="405" x2="165" y2="405"
        stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" strokeDasharray="3 2"/>
      <text x="128" y="448"
        fontFamily="'JetBrains Mono',monospace" fontSize="8"
        fill="rgba(255,255,255,0.2)" letterSpacing="1.5">S/F</text>

      {/* ── Event markers ── */}
      {TRIGGERS.map((trigger,i)=>{
        const pt = catmullRom(RAW_PTS, trigger);
        const unlocked = progress >= trigger;
        const active = i === activeIdx;
        const ev = EVENTS[i];

        // Position label on the outer side of the track
        const offDir = pt.x < 400 ? -1 : 1;
        const lx = pt.x + offDir*48;
        const ly = pt.y + (pt.y < 250 ? -16 : 16);
        const anchorEnd = offDir < 0 ? "end" : "start";

        return (
          <g key={i}>
            {/* Connector line */}
            {unlocked && (
              <line
                x1={pt.x} y1={pt.y}
                x2={lx+(offDir>0?0:0)} y2={ly}
                stroke={ev.color} strokeWidth="0.5" strokeDasharray="2 3"
                opacity="0.4"
              />
            )}

            {/* Outer ring (unlocked animation) */}
            {active && (
              <motion.circle
                cx={pt.x} cy={pt.y}
                initial={{r:12,opacity:0.7}}
                animate={{r:22,opacity:0}}
                transition={{duration:0.8,repeat:Infinity,ease:"easeOut"}}
                fill="none"
                stroke={ev.color}
                strokeWidth="1"
              />
            )}

            {/* Marker ring */}
            <circle cx={pt.x} cy={pt.y}
              r={active ? 9 : unlocked ? 7 : 5}
              fill="none"
              stroke={unlocked ? ev.color : "rgba(255,255,255,0.08)"}
              strokeWidth={active ? 2 : 1}
              filter={active ? "url(#ev-glow-sm)" : undefined}
              style={{transition:"all 0.35s"}}
            />

            {/* Centre dot */}
            <circle cx={pt.x} cy={pt.y}
              r={active ? 4 : unlocked ? 3 : 2}
              fill={unlocked ? ev.color : "rgba(255,255,255,0.08)"}
              style={{transition:"all 0.35s"}}
            />

            {/* Labelling */}
            {unlocked && (
              <>
                <text x={lx} y={ly-2}
                  fontFamily="'JetBrains Mono',monospace" fontSize="7"
                  fill={ev.color} textAnchor={anchorEnd} opacity="0.7"
                  letterSpacing="1">
                  {ev.id}
                </text>
                <text x={lx} y={ly+9}
                  fontFamily="'Outfit',monospace" fontSize="9" fontWeight="700"
                  fill={active ? ev.color : "rgba(255,255,255,0.35)"}
                  textAnchor={anchorEnd}
                  style={{transition:"fill 0.3s"}}>
                  {ev.short}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════
   CAR SILHOUETTE (SVG overlay)
══════════════════════════════════════════ */
function CarOverlay({progress,color}:{progress:number;color:string}){
  const p = Math.min(progress, 0.9999);
  const pt = catmullRom(RAW_PTS, p);
  return (
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}
      viewBox="0 0 800 500">
      <g transform={`translate(${pt.x},${pt.y}) rotate(${pt.angle})`}>
        {/* Body */}
        <ellipse cx="0" cy="0" rx="13" ry="4.5" fill={color} opacity="0.92"/>
        {/* Nose */}
        <polygon points="13,-1.2 19,0 13,1.2" fill={color} opacity="0.88"/>
        {/* Front wing */}
        <rect x="15" y="-7" width="5.5" height="2" rx="0.5" fill={color} opacity="0.65"/>
        <rect x="15" y="5" width="5.5" height="2" rx="0.5" fill={color} opacity="0.65"/>
        {/* Rear wing */}
        <rect x="-17" y="-7.5" width="5" height="1.8" rx="0.5" fill={color} opacity="0.7"/>
        <rect x="-17" y="5.7" width="5" height="1.8" rx="0.5" fill={color} opacity="0.7"/>
        {/* Rear wing post */}
        <rect x="-16" y="-5.7" width="2.5" height="11.4" rx="0.4" fill={color} opacity="0.3"/>
        {/* Halo */}
        <ellipse cx="3" cy="0" rx="4.5" ry="2" fill="none" stroke={color} strokeWidth="1.1" opacity="0.45"/>
        {/* Wheels */}
        <circle cx="7"  cy="-5.8" r="2.8" fill="#0c0c0c" stroke={color} strokeWidth="0.7" opacity="0.85"/>
        <circle cx="7"  cy="5.8"  r="2.8" fill="#0c0c0c" stroke={color} strokeWidth="0.7" opacity="0.85"/>
        <circle cx="-7" cy="-5.8" r="3.2" fill="#0c0c0c" stroke={color} strokeWidth="0.7" opacity="0.85"/>
        <circle cx="-7" cy="5.8"  r="3.2" fill="#0c0c0c" stroke={color} strokeWidth="0.7" opacity="0.85"/>
        {/* Cockpit glint */}
        <ellipse cx="1" cy="0" rx="6" ry="2.2" fill="white" opacity="0.04"/>
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════
   EVENT CARD — detailed unlock card
══════════════════════════════════════════ */
function EventCard({ev}:{ev:typeof EVENTS[0]}){
  return (
    <motion.div
      key={ev.id}
      initial={{opacity:0,y:20,scale:0.97}}
      animate={{opacity:1,y:0,scale:1}}
      exit={{opacity:0,y:-16,scale:0.96}}
      transition={{duration:0.45,ease:[0.22,1,0.36,1]}}
      style={{
        position:"relative",
        background:"rgba(6,6,6,0.97)",
        border:`1px solid ${ev.color}20`,
        borderLeft:`2px solid ${ev.color}`,
        padding:"clamp(16px,3vw,26px) clamp(18px,3.5vw,28px)",
        overflow:"hidden",
        flexShrink:0,
      }}
    >
      {/* BG radial tint */}
      <div style={{
        position:"absolute",inset:0,pointerEvents:"none",
        background:`radial-gradient(ellipse 90% 70% at 0% 50%, ${ev.color}0a, transparent 70%)`,
      }} />

      {/* ID + badges row */}
      <div style={{
        display:"flex",alignItems:"center",gap:8,marginBottom:10,
        position:"relative",
      }}>
        <span style={{
          fontFamily:"'JetBrains Mono',monospace",
          fontSize:"clamp(7px,1.4vw,9px)",
          letterSpacing:"0.28em",
          color:ev.color,
          opacity:0.65,
        }}>EVENT {ev.id}</span>
        <div style={{
          padding:"2px 8px",
          background:ev.color+"1a",
          border:`1px solid ${ev.color}33`,
          fontFamily:"'JetBrains Mono',monospace",
          fontSize:"clamp(6px,1.1vw,7.5px)",
          letterSpacing:"0.2em",
          color:ev.color,
        }}>{ev.daysLeft} DAYS LEFT</div>
      </div>

      {/* Name + prize row */}
      <div style={{
        display:"flex",alignItems:"flex-start",justifyContent:"space-between",
        gap:12,marginBottom:"clamp(8px,1.5vw,12px)",position:"relative",
      }}>
        <div>
          <h3 style={{
            fontFamily:"'Outfit',sans-serif",fontWeight:900,
            fontSize:"clamp(22px,5vw,36px)",
            letterSpacing:"-0.035em",lineHeight:0.95,
            color:"#F0EDE8",margin:0,
          }}>{ev.name}</h3>
          <p style={{
            fontFamily:"'JetBrains Mono',monospace",
            fontSize:"clamp(8px,1.4vw,10px)",
            letterSpacing:"0.16em",textTransform:"uppercase",
            color:"rgba(255,255,255,0.28)",margin:"6px 0 0",
          }}>{ev.tagline}</p>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{
            fontFamily:"'JetBrains Mono',monospace",
            fontSize:"clamp(6px,1.1vw,8px)",
            letterSpacing:"0.2em",color:"rgba(255,255,255,0.18)",marginBottom:2,
          }}>PRIZE POOL</div>
          <div style={{
            fontFamily:"'Outfit',sans-serif",fontWeight:900,
            fontSize:"clamp(18px,3.5vw,28px)",
            letterSpacing:"-0.03em",color:ev.color,
          }}>{ev.prize}</div>
        </div>
      </div>

      <p style={{
        fontFamily:"'Inter',sans-serif",
        fontSize:"clamp(12px,1.8vw,13.5px)",
        color:"rgba(240,237,232,0.42)",lineHeight:1.65,
        margin:"0 0 14px",position:"relative",
      }}>{ev.desc}</p>

      {/* Register CTA */}
      <a href={ev.link} target="_blank" rel="noopener noreferrer" style={{
        display:"inline-flex",alignItems:"center",gap:6,
        fontFamily:"'JetBrains Mono',monospace",
        fontSize:"clamp(7px,1.3vw,9px)",
        letterSpacing:"0.24em",textTransform:"uppercase",
        color:ev.color,textDecoration:"none",
        padding:"7px 16px",
        border:`1px solid ${ev.color}33`,
        background:ev.color+"0d",
        transition:"background 0.2s,border-color 0.2s",
        position:"relative",
      }}>
        Register →
      </a>
    </motion.div>
  );
}

/* ══════════════════════════════════════════
   MAIN EVENTS SECTION
══════════════════════════════════════════ */
export function EventsSection() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef<number>(0);
  const progRef     = useRef(0);
  const targetRef   = useRef(0);

  const [prog,     setProg]     = useState(0);
  const [carPos,   setCarPos]   = useState<{x:number;y:number}|null>(null);
  const [unlocked, setUnlocked] = useState<boolean[]>(EVENTS.map(()=>false));
  const [activeIdx,setActiveIdx]= useState(-1);

  const {scrollYProgress} = useScroll({
    target: sectionRef,
    offset: ["start start","end end"],
  });

  // Resize WebGL canvas
  useEffect(()=>{
    const c=canvasRef.current;
    if(!c) return;
    const ro=new ResizeObserver(()=>{
      c.width=c.offsetWidth; c.height=c.offsetHeight;
    });
    ro.observe(c);
    c.width=c.offsetWidth; c.height=c.offsetHeight;
    return ()=>ro.disconnect();
  },[]);

  // Animation loop — smooth lerp + event unlock logic
  useEffect(()=>{
    const unsub=scrollYProgress.on("change",v=>{
      targetRef.current=Math.max(0,Math.min(1,v));
    });

    const tick=()=>{
      progRef.current += (targetRef.current - progRef.current) * 0.055;
      const p = progRef.current;
      setProg(p);

      // Map SVG coords to canvas coords
      const c=canvasRef.current;
      if(c){
        const svgW=800, svgH=500;
        const scX=c.offsetWidth/svgW;
        const scY=c.offsetHeight/svgH;
        const pt=catmullRom(RAW_PTS,Math.min(p,0.9999));
        setCarPos({x:pt.x*scX, y:pt.y*scY});
      }

      // Unlock events + set active
      TRIGGERS.forEach((trigger,i)=>{
        if(p>=trigger){
          setUnlocked(prev=>{
            if(prev[i]) return prev;
            const next=[...prev]; next[i]=true; return next;
          });
          setActiveIdx(i);
        }
      });

      rafRef.current=requestAnimationFrame(tick);
    };
    rafRef.current=requestAnimationFrame(tick);
    return ()=>{ cancelAnimationFrame(rafRef.current); unsub(); };
  },[scrollYProgress]);

  const activeColor = activeIdx>=0 ? EVENTS[activeIdx].color : "#E8002D";

  // WebGL
  useWebGL(canvasRef.current, carPos, activeColor);

  return (
    <div
      id="events"
      ref={sectionRef}
      style={{
        position:"relative",
        height:`${EVENTS.length*115+80}vh`,
        background:"#030303",
      }}
    >
      <div style={{
        position:"sticky",top:0,height:"100vh",overflow:"hidden",
        display:"flex",flexDirection:"column",
      }}>
        {/* Header */}
        <div style={{
          padding:"clamp(22px,4vw,36px) clamp(16px,5vw,32px) 0",
          display:"flex",alignItems:"flex-end",justifyContent:"space-between",
          gap:16,flexShrink:0,
        }}>
          <div>
            <div style={{
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:"clamp(7px,1.2vw,9px)",
              letterSpacing:"0.32em",textTransform:"uppercase",
              color:"rgba(232,0,45,0.5)",marginBottom:6,
            }}>— Race Programme</div>
            <h2 style={{
              fontFamily:"'Outfit',sans-serif",fontWeight:900,
              fontSize:"clamp(26px,5.5vw,56px)",
              letterSpacing:"-0.04em",lineHeight:0.9,
              color:"#F0EDE8",margin:0,
            }}>Events</h2>
          </div>

          {/* Lap counter */}
          <div style={{display:"flex",alignItems:"baseline",gap:6,paddingBottom:2}}>
            <span style={{
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:"clamp(7px,1.1vw,8px)",
              letterSpacing:"0.2em",color:"rgba(255,255,255,0.18)",
            }}>LAP</span>
            <motion.span
              key={activeIdx}
              initial={{y:-10,opacity:0}} animate={{y:0,opacity:1}}
              style={{
                fontFamily:"'Outfit',sans-serif",fontWeight:900,
                fontSize:"clamp(24px,4.5vw,40px)",
                letterSpacing:"-0.04em",
                color:activeColor,minWidth:"2ch",
                transition:"color 0.4s",
              }}
            >
              {activeIdx>=0?activeIdx+1:0}
            </motion.span>
            <span style={{
              fontFamily:"'JetBrains Mono',monospace",
              fontSize:"clamp(7px,1.1vw,8px)",
              color:"rgba(255,255,255,0.1)",
            }}>/ {EVENTS.length}</span>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div style={{
          flex:1,
          display:"grid",
          gridTemplateColumns:"1fr clamp(280px,40vw,460px)",
          overflow:"hidden",
          minHeight:0,
        }}>
          {/* TRACK PANEL */}
          <div style={{position:"relative",overflow:"hidden",minHeight:0}}>
            {/* Faint ambient glow */}
            <div style={{
              position:"absolute",inset:0,
              background:`radial-gradient(ellipse 60% 55% at 45% 52%, ${activeColor}06, transparent 70%)`,
              transition:"background 0.5s",pointerEvents:"none",
            }} />

            {/* SVG track */}
            <TrackSVG progress={prog} activeIdx={activeIdx} />

            {/* WebGL glow canvas */}
            <canvas ref={canvasRef} style={{
              position:"absolute",inset:0,width:"100%",height:"100%",
              pointerEvents:"none",
            }} />

            {/* Car silhouette */}
            <CarOverlay progress={prog} color={activeColor} />

            {/* Scroll hint */}
            {prog<0.04 && (
              <motion.div
                initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}}
                style={{
                  position:"absolute",bottom:"clamp(20px,4vw,32px)",
                  left:"50%",transform:"translateX(-50%)",
                  display:"flex",flexDirection:"column",alignItems:"center",gap:6,
                  pointerEvents:"none",
                }}
              >
                <span style={{
                  fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",
                  letterSpacing:"0.28em",textTransform:"uppercase",
                  color:"rgba(255,255,255,0.15)",whiteSpace:"nowrap",
                }}>Scroll to race</span>
                <motion.div
                  animate={{y:[0,8,0]}} transition={{repeat:Infinity,duration:1.6}}
                  style={{width:1,height:22,background:"linear-gradient(transparent,rgba(232,0,45,0.45))"}}
                />
              </motion.div>
            )}
          </div>

          {/* EVENTS PANEL */}
          <div style={{
            borderLeft:"1px solid rgba(255,255,255,0.04)",
            display:"flex",flexDirection:"column",
            overflow:"hidden",minHeight:0,
          }}>
            {/* Active event card */}
            <div style={{
              flex:1,overflow:"hidden",
              display:"flex",flexDirection:"column",justifyContent:"center",
              padding:"clamp(16px,3vw,28px) clamp(14px,3vw,24px)",
              gap:"clamp(6px,1.5vw,10px)",
            }}>
              {/* Big card for active event */}
              <AnimatePresence mode="wait">
                {activeIdx>=0 && (
                  <EventCard key={activeIdx} ev={EVENTS[activeIdx]} />
                )}
              </AnimatePresence>

              {/* Mini rows — completed + locked */}
              {EVENTS.length>0 && (
                <div style={{
                  display:"flex",flexDirection:"column",
                  gap:"clamp(4px,1vw,6px)",marginTop:"clamp(8px,1.5vw,12px)",
                }}>
                  {EVENTS.map((ev,i)=>{
                    if(i===activeIdx) return null;
                    const done = unlocked[i];
                    return (
                      <motion.div
                        key={ev.id}
                        initial={{opacity:0,x:10}} animate={{opacity:done?1:0.35,x:0}}
                        style={{
                          display:"flex",alignItems:"center",gap:10,
                          padding:"6px 12px",
                          borderLeft:`1.5px solid ${done?ev.color+"60":"rgba(255,255,255,0.04)"}`,
                          background: done ? ev.color+"06" : "transparent",
                        }}
                      >
                        <span style={{
                          fontFamily:"'JetBrains Mono',monospace",
                          fontSize:"clamp(6px,1vw,8px)",
                          color:done?ev.color:"rgba(255,255,255,0.1)",
                          letterSpacing:"0.2em",
                        }}>{ev.id}</span>
                        <span style={{
                          fontFamily:"'Outfit',sans-serif",fontWeight:700,
                          fontSize:"clamp(11px,2vw,15px)",
                          color:done?"rgba(240,237,232,0.6)":"rgba(255,255,255,0.08)",
                        }}>{ev.name}</span>
                        {done && (
                          <span style={{
                            fontFamily:"'JetBrains Mono',monospace",
                            fontSize:"clamp(6px,1vw,8px)",
                            color:ev.color,marginLeft:"auto",opacity:0.55,
                          }}>{ev.prize}</span>
                        )}
                        {!done && (
                          <span style={{
                            fontFamily:"'JetBrains Mono',monospace",
                            fontSize:"clamp(6px,1vw,7px)",
                            color:"rgba(255,255,255,0.06)",marginLeft:"auto",
                            letterSpacing:"0.15em",
                          }}>LOCKED</span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div style={{
              padding:"clamp(10px,2vw,16px) clamp(14px,3vw,24px)",
              borderTop:"1px solid rgba(255,255,255,0.03)",flexShrink:0,
            }}>
              <div style={{
                display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,
              }}>
                <span style={{
                  fontFamily:"'JetBrains Mono',monospace",
                  fontSize:"clamp(6px,1.1vw,8px)",
                  letterSpacing:"0.2em",color:"rgba(255,255,255,0.12)",
                }}>RACE PROGRESS</span>
                <span style={{
                  fontFamily:"'Outfit',sans-serif",fontWeight:700,
                  fontSize:"clamp(11px,2vw,15px)",
                  color:activeColor,transition:"color 0.4s",
                }}>{Math.round(prog*100)}%</span>
              </div>
              <div style={{height:2,background:"rgba(255,255,255,0.05)",overflow:"hidden"}}>
                <div style={{
                  height:"100%",
                  width:`${prog*100}%`,
                  background:activeColor,
                  transition:"background 0.4s",
                }} />
              </div>
              {/* Event dots */}
              <div style={{
                display:"flex",justifyContent:"space-between",
                marginTop:5,
              }}>
                {EVENTS.map((ev,i)=>(
                  <motion.div
                    key={ev.id}
                    animate={{scale:i===activeIdx?1.4:1}}
                    style={{
                      width:"clamp(4px,0.8vw,6px)",
                      height:"clamp(4px,0.8vw,6px)",
                      borderRadius:"50%",
                      background:unlocked[i]?ev.color:"rgba(255,255,255,0.06)",
                      transition:"background 0.3s",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}