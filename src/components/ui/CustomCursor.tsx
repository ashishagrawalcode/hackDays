"use client";

/**
 * CustomCursor v4 — F1 Car Cursor · Maximum fidelity
 *
 * Components:
 *   1. SVG F1 car top-down — instant position, rotates in direction of travel
 *   2. Canvas speed lines — velocity-length trail with HDR glow
 *   3. Outer lagging ring — lerp with squish/stretch physics
 *   4. Click burst — 16 red particles, radial explosion
 *   5. Magnetic snap — data-magnetic elements attract the car
 *   6. Hover state — car glows yellow, ring expands cyan
 *   7. DRS boost lines — extra long streaks when cursor is fast
 *   8. Mobile — nothing rendered (hover:none media query)
 */

import { useEffect, useRef } from "react";

const RED    = [232, 0, 45]   as const;
const CYAN   = [0, 210, 255]  as const;

const TRAIL_LEN = 32;

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    const canvas = canvasRef.current;
    const car    = document.getElementById("f1-cur-car");
    const ring   = document.getElementById("f1-cur-ring");
    if (!canvas || !car || !ring) return;

    // Resize canvas to always fill viewport
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive:true });
    const ctx = canvas.getContext("2d")!;

    // State
    let mx = -600, my = -600;
    let rx = -600, ry = -600;
    let pmx = -600, pmy = -600;
    let raf: number;
    let lastAng = 90; // default car angle pointing down

    const trail: [number,number][] = [];

    // Particles
    type P = { x:number; y:number; vx:number; vy:number; life:number; r:[number,number,number] };
    const particles: P[] = [];

    const burst = (x:number, y:number, isHover:boolean) => {
      const count = isHover ? 10 : 16;
      const col   = (isHover ? CYAN : RED) as [number, number, number];
      for (let i=0; i<count; i++) {
        const a = (Math.PI*2*i)/count + (Math.random()-0.5)*0.4;
        const s = 2 + Math.random() * 5;
        particles.push({ x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, life:1, r:col });
      }
    };

    // Magnetic
    let magTarget: {cx:number;cy:number} | null = null;

    const onMove = (e:MouseEvent) => {
      pmx = mx; pmy = my;
      mx = e.clientX; my = e.clientY;
      const el  = document.elementFromPoint(mx, my) as HTMLElement|null;
      const mag = el?.closest("[data-magnetic]") as HTMLElement|null;
      magTarget = mag ? (() => {
        const r = mag.getBoundingClientRect();
        return { cx:r.left+r.width/2, cy:r.top+r.height/2 };
      })() : null;
      const isHov = !!el?.closest("a,button,[data-hover],[data-magnetic]");
      ring.classList.toggle("ring-hov", isHov);
      car.classList.toggle("car-hov",  isHov);
    };

    const onDown = (e:MouseEvent) => {
      burst(e.clientX, e.clientY, ring.classList.contains("ring-hov"));
      car.classList.add("car-click");
      ring.classList.add("ring-click");
    };
    const onUp = () => {
      car.classList.remove("car-click");
      ring.classList.remove("ring-click");
    };

    const tick = () => {
      const tx = magTarget ? magTarget.cx : mx;
      const ty = magTarget ? magTarget.cy : my;

      // Lerp ring
      rx += (tx - rx) * 0.1;
      ry += (ty - ry) * 0.1;

      const vx   = mx - pmx;
      const vy   = my - pmy;
      const spd  = Math.sqrt(vx*vx + vy*vy);

      // Ring squish
      const sx = Math.min(1 + spd * 0.018, 2.6);
      const sy = 1 / sx;
      const ra = spd > 0.8 ? Math.atan2(vy, vx) * (180/Math.PI) : 0;

      ring.style.transform =
        `translate(${rx}px,${ry}px) translate(-50%,-50%) ` +
        `rotate(${ra}deg) scaleX(${sx.toFixed(3)}) scaleY(${sy.toFixed(3)})`;

      // Car position & rotation
      const carX = magTarget ? magTarget.cx : mx;
      const carY = magTarget ? magTarget.cy : my;
      if (spd > 1) lastAng = Math.atan2(vy, vx) * (180/Math.PI);
      car.style.transform =
        `translate(${carX}px,${carY}px) translate(-50%,-50%) rotate(${lastAng + 90}deg)`;

      // Trail
      trail.push([mx, my]);
      if (trail.length > TRAIL_LEN) trail.shift();

      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Speed lines
      if (trail.length >= 2 && spd > 0.4) {
        for (let i=1; i<trail.length; i++) {
          const t  = i / (trail.length-1);
          const [x0,y0] = trail[i-1];
          const [x1,y1] = trail[i];
          const alpha = t * 0.65;
          const lw    = t * 2.8;

          // HDR boost when very fast
          const isDRS = spd > 18;
          const col   = isDRS ? CYAN : RED;

          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha.toFixed(2)})`;
          ctx.lineWidth   = isDRS ? lw * 1.6 : lw;
          ctx.lineCap = "round";
          if (t > 0.65) {
            ctx.shadowColor = `rgba(${col[0]},${col[1]},${col[2]},0.9)`;
            ctx.shadowBlur  = isDRS ? 14 + t*10 : 5 + t*8;
          } else { ctx.shadowBlur = 0; }
          ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // DRS extra streaks (double lines beside trail)
        if (spd > 14 && trail.length > 4) {
          const off = 3;
          for (let i=Math.max(1,trail.length-8); i<trail.length; i++) {
            const t = i / (trail.length-1);
            const [x0,y0] = trail[i-1];
            const [x1,y1] = trail[i];
            const perp = Math.atan2(y1-y0, x1-x0) + Math.PI/2;
            const px = Math.cos(perp)*off, py = Math.sin(perp)*off;

            ctx.beginPath();
            ctx.moveTo(x0+px,y0+py); ctx.lineTo(x1+px,y1+py);
            ctx.strokeStyle = `rgba(0,210,255,${(t*0.35).toFixed(2)})`;
            ctx.lineWidth = t * 1.2;
            ctx.shadowColor = "rgba(0,210,255,0.7)"; ctx.shadowBlur = 4;
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.beginPath();
            ctx.moveTo(x0-px,y0-py); ctx.lineTo(x1-px,y1-py);
            ctx.strokeStyle = `rgba(0,210,255,${(t*0.25).toFixed(2)})`;
            ctx.lineWidth = t * 1.0;
            ctx.stroke();
          }
        }
      }

      // Burst particles
      for (let i=particles.length-1; i>=0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.86; p.vy *= 0.86;
        p.life -= 0.05;
        if (p.life <= 0) { particles.splice(i,1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2*p.life, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${p.r[0]},${p.r[1]},${p.r[2]},${p.life.toFixed(2)})`;
        ctx.shadowColor = `rgba(${p.r[0]},${p.r[1]},${p.r[2]},0.85)`;
        ctx.shadowBlur  = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive:true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",    resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
    };
  }, []);

  return (
    <>
      {/* Speed lines + particles */}
      <canvas ref={canvasRef} style={{
        position:"fixed", inset:0, zIndex:99994,
        pointerEvents:"none", mixBlendMode:"screen",
        display:"none",
      }} />

      {/* F1 Car SVG */}
      <div id="f1-cur-car" style={{
        position:"fixed", top:0, left:0, zIndex:99997, pointerEvents:"none",
        width:28, height:48, display:"none",
      }}>
        <svg viewBox="0 0 28 48" width="28" height="48" style={{ overflow:"visible" }}>
          <defs>
            <radialGradient id="carGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E8002D" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#E8002D" stopOpacity="0" />
            </radialGradient>
          </defs>
          <style>{`
            #f1-cur-car .cb { fill: #E8002D; transition: fill 0.12s; }
            #f1-cur-car .cd { fill: #C0001A; }
            #f1-cur-car .ct { fill: #141414; stroke: #252525; stroke-width: 0.5; }
            #f1-cur-car .cc { fill: #080808; }
            #f1-cur-car .cg { fill: url(#carGlow); }
            #f1-cur-car.car-hov  .cb { fill: #FFD700; filter: drop-shadow(0 0 5px #FFD700); }
            #f1-cur-car.car-hov  .cd { fill: #CC9900; }
            #f1-cur-car.car-click .cb { fill: #00D2FF; filter: drop-shadow(0 0 6px #00D2FF); }
          `}</style>
          {/* Glow halo */}
          <ellipse cx="14" cy="24" rx="10" ry="18" className="cg" />
          {/* Body */}
          <ellipse cx="14" cy="24" rx="5" ry="17" className="cb" />
          {/* Nose cone */}
          <polygon points="14,4 12,8 16,8" className="cb" />
          {/* Cockpit */}
          <ellipse cx="14" cy="22" rx="3" ry="4.5" className="cc" />
          {/* Halo arch */}
          <path d="M 11.5,20.5 Q 14,17.5 16.5,20.5" fill="none" stroke="#333" strokeWidth="1" />
          {/* Front wing */}
          <rect x="6" y="7" width="16" height="2.5" rx="0.5" className="cb" opacity="0.85" />
          {/* Rear wing */}
          <rect x="5.5" y="37" width="17" height="3" rx="0.5" className="cb" />
          {/* Rear wing end plates */}
          <rect x="5.5" y="36" width="1.5" height="5" rx="0.4" className="cd" />
          <rect x="21" y="36" width="1.5" height="5" rx="0.4" className="cd" />
          {/* Barge boards */}
          <rect x="9" y="18" width="1.5" height="8" rx="0.3" className="cd" opacity="0.7" />
          <rect x="17.5" y="18" width="1.5" height="8" rx="0.3" className="cd" opacity="0.7" />
          {/* FL tyre */}
          <ellipse cx="7.5" cy="11" rx="2.8" ry="4.5" className="ct" />
          {/* FR tyre */}
          <ellipse cx="20.5" cy="11" rx="2.8" ry="4.5" className="ct" />
          {/* RL tyre */}
          <ellipse cx="7.5" cy="34.5" rx="3.2" ry="5" className="ct" />
          {/* RR tyre */}
          <ellipse cx="20.5" cy="34.5" rx="3.2" ry="5" className="ct" />
          {/* Wheel rim detail */}
          <ellipse cx="7.5"  cy="11"   rx="1.4" ry="2.2" fill="#222" />
          <ellipse cx="20.5" cy="11"   rx="1.4" ry="2.2" fill="#222" />
          <ellipse cx="7.5"  cy="34.5" rx="1.6" ry="2.5" fill="#222" />
          <ellipse cx="20.5" cy="34.5" rx="1.6" ry="2.5" fill="#222" />
          {/* Exhaust (rear) */}
          <rect x="12" y="40" width="4" height="2.5" rx="0.5" fill="#0a0a0a" opacity="0.8" />
        </svg>
      </div>

      {/* Lagging ring */}
      <div id="f1-cur-ring" style={{
        position:"fixed", top:0, left:0, zIndex:99996,
        pointerEvents:"none", width:38, height:38,
        border:"1px solid rgba(232,0,45,0.5)",
        borderRadius:"50%", display:"none",
        transition:"width 0.18s, height 0.18s, border-color 0.18s, background 0.18s",
      }}>
        <style>{`
          #f1-cur-ring.ring-hov {
            width: 55px !important; height: 55px !important;
            border-color: rgba(0,210,255,0.8) !important;
            background: rgba(0,210,255,0.04);
          }
          #f1-cur-ring.ring-click {
            width: 26px !important; height: 26px !important;
            border-color: rgba(245,200,66,0.9) !important;
            background: rgba(245,200,66,0.06);
          }
        `}</style>
      </div>

      <style>{`
        @media (hover: hover) and (pointer: fine) {
          #f1-cur-car, #f1-cur-ring, canvas[style*="99994"] { display: block !important; }
        }
      `}</style>
    </>
  );
}