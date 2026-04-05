"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { HERO, SITE_META } from "@/lib/constants";
import gsap from "gsap";

function pad2(n: number) { return String(n).padStart(2, "0"); }

/* ─── Countdown ──────────────────────────────────────────────── */
function useCountdown(iso: string) {
  const target = new Date(iso).getTime();
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useAnimationFrame(() => {
    const d = target - Date.now();
    if (d > 0) setT({
      days:    Math.floor(d / 86400000),
      hours:   Math.floor((d % 86400000) / 3600000),
      minutes: Math.floor((d % 3600000)  / 60000),
      seconds: Math.floor((d % 60000)    / 1000),
    });
  });
  return t;
}

/* ─── Digit ──────────────────────────────────────────────────── */
function Digit({ val, label }: { val: number; label: string }) {
  const prev    = useRef(val);
  const changed = prev.current !== val;
  prev.current  = val;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "clamp(42px,8vw,68px)" }}>
      <div style={{ overflow: "hidden" }}>
        <motion.span
          key={val}
          initial={changed ? { y: "-100%", opacity: 0 } : false}
          animate={{ y: "0%", opacity: 1 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "block",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(32px,7vw,66px)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: "#F5F2EE",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {pad2(val)}
        </motion.span>
      </div>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "clamp(7px,1.2vw,9px)",
        fontWeight: 500,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "#3a3a3a",
        marginTop: 4,
      }}>{label}</span>
    </div>
  );
}

function Sep({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      animate={{ opacity: [1, 0.1, 1] }}
      transition={{ duration: 1, repeat: Infinity, delay, ease: "easeInOut" }}
      style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: "clamp(20px,4.5vw,46px)",
        fontWeight: 300,
        color: "rgba(232,0,45,0.45)",
        paddingBottom: "clamp(12px,2vw,20px)",
        lineHeight: 1,
        flexShrink: 0,
      }}
    >:</motion.span>
  );
}

/* ─── Canvas background: cosmos + garage floor ───────────────── */
function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function resize() {
      if (!canvas) return;
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 180 }, () => ({
      x:   Math.random(),
      y:   Math.random() * 0.62,
      r:   0.4 + Math.random() * 1.4,
      base:0.07 + Math.random() * 0.38,
      sp:  0.3 + Math.random() * 0.8,
      ph:  Math.random() * Math.PI * 2,
      red: Math.random() > 0.8,
    }));

    const nebulae = [
      { x: 0.15, y: 0.18, rx: 200, ry: 100, a: 0.028 },
      { x: 0.75, y: 0.15, rx: 160, ry: 80,  a: 0.022 },
      { x: 0.50, y: 0.07, rx: 240, ry: 55,  a: 0.018 },
      { x: 0.88, y: 0.38, rx: 110, ry: 60,  a: 0.016 },
    ];

    let raf: number, t = 0;

    function draw() {
      t += 0.004;
      const W = canvas!.width, H = canvas!.height;
      ctx.clearRect(0, 0, W, H);

      /* Nebula blobs */
      nebulae.forEach((n) => {
        const cx = n.x * W, cy = n.y * H;
        ctx.save();
        ctx.scale(1, n.ry / n.rx);
        const grad = ctx.createRadialGradient(cx, cy * (n.rx / n.ry), 0, cx, cy * (n.rx / n.ry), n.rx);
        grad.addColorStop(0, `rgba(232,0,45,${n.a})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy * (n.rx / n.ry), n.rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      /* Stars */
      stars.forEach((s) => {
        const osc = 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.red
          ? `rgba(232,0,45,${s.base * osc})`
          : `rgba(255,255,255,${s.base * osc})`;
        ctx.fill();
      });

      /* Garage floor — perspective grid */
      const floorY = H * 0.58;

      // Floor fill
      const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
      floorGrad.addColorStop(0,   "transparent");
      floorGrad.addColorStop(0.25,"rgba(6,4,4,0.5)");
      floorGrad.addColorStop(1,   "#030303");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, floorY, W, H - floorY);

      // Vanishing-point grid lines
      const vp = { x: W / 2, y: floorY };
      ctx.strokeStyle = "rgba(232,0,45,0.04)";
      ctx.lineWidth = 1;

      // Radial spokes
      for (let i = -10; i <= 10; i++) {
        const endX = W / 2 + i * (W / 9);
        ctx.beginPath();
        ctx.moveTo(vp.x, vp.y);
        ctx.lineTo(endX, H + 30);
        ctx.stroke();
      }
      // Horizontal bands
      for (let r = 0; r <= 7; r++) {
        const ratio = r / 7;
        const y = floorY + (H - floorY) * Math.pow(ratio, 1.6);
        ctx.globalAlpha = 0.5 + ratio * 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
    />
  );
}

/* ─── Steering Crew Bar ──────────────────────────────────────── */
const CREW_STATIONS = [
  { role: "CHASSIS", status: "NOMINAL",  col: "#4ade80" },
  { role: "AERO",    status: "NOMINAL",  col: "#4ade80" },
  { role: "ENGINE",  status: "HOT",      col: "#FF1801" },
  { role: "TYRES",   status: "WARMING",  col: "#FFD700" },
  { role: "DRS",     status: "ENABLED",  col: "#4ade80" },
  { role: "ERS",     status: "CHARGING", col: "#60a5fa" },
];

function SteeringCrewBar() {
  return (
    <div style={{
      position: "absolute",
      bottom: "clamp(38px,6.5vh,60px)",
      left: 0, right: 0,
      zIndex: 6,
      padding: "0 clamp(12px,4vw,24px)",
      display: "flex",
      alignItems: "center",
      gap: "clamp(6px,1.5vw,14px)",
      overflowX: "auto",
      msOverflowStyle: "none",
      scrollbarWidth: "none",
    }}>
      {/* Live indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <motion.div
          animate={{ scale: [1, 1.7, 1], opacity: [1, 0.25, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
          style={{ width: 5, height: 5, borderRadius: "50%", background: "#E8002D", boxShadow: "0 0 8px rgba(232,0,45,0.9)" }}
        />
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "clamp(6px,1.1vw,8px)",
          letterSpacing: "0.38em",
          textTransform: "uppercase",
          color: "rgba(232,0,45,0.55)",
          whiteSpace: "nowrap",
        }}>CREW ONLINE</span>
      </div>

      <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />

      {CREW_STATIONS.map((s, i) => (
        <motion.div
          key={s.role}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 + i * 0.07, duration: 0.35 }}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, flexShrink: 0,
            padding: "5px 10px",
            background: "rgba(3,3,3,0.72)",
            border: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "clamp(5px,0.9vw,7px)",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.18)",
          }}>{s.role}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <motion.div
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.4 + i * 0.18, repeat: Infinity }}
              style={{ width: 4, height: 4, borderRadius: "50%", background: s.col, boxShadow: `0 0 5px ${s.col}` }}
            />
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "clamp(5px,0.9vw,7px)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: s.col,
              whiteSpace: "nowrap",
            }}>{s.status}</span>
          </div>
        </motion.div>
      ))}

      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "clamp(6px,1vw,7px)",
        letterSpacing: "0.22em",
        color: "rgba(255,255,255,0.08)",
        marginLeft: "auto",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}>HACKDAYS_2026 · ACM</span>
    </div>
  );
}

/* ─── Speed Lines ────────────────────────────────────────────── */
function SpeedLines() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      {[8, 22, 38, 54, 68, 82, 91].map((top, i) => (
        <div
          key={i}
          className="hero-speed-line"
          style={{
            top: `${top}%`,
            animationDelay: `${i * 0.65}s`,
            animationDuration: `${2.8 + i * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────── */
export function HeroGrid() {
  const t       = useCountdown(HERO.targetDate);
  const heroRef = useRef<HTMLElement>(null);
  const inkRef  = useRef<HTMLDivElement>(null);

  /* Desktop ink blobs on mousemove */
  useEffect(() => {
    const hero = heroRef.current;
    const ink  = inkRef.current;
    if (!hero || !ink) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let last = 0, ci = 0;
    const COLORS = ["rgba(232,0,45,0.1)", "rgba(255,60,0,0.07)", "rgba(232,0,45,0.08)"];

    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - last < 700) return;
      last = now;
      const rect = hero.getBoundingClientRect();
      const blob = document.createElement("div");
      blob.style.cssText = `
        position:absolute;left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px;
        width:260px;height:260px;border-radius:50%;
        background:radial-gradient(circle,${COLORS[ci++ % COLORS.length]} 0%,transparent 70%);
        transform:translate(-50%,-50%) scale(0);
        pointer-events:none;filter:blur(40px);z-index:0;
      `;
      ink.appendChild(blob);
      gsap.timeline()
        .to(blob, { scale: 1, opacity: 1, duration: 0.45, ease: "power2.out" })
        .to(blob, { scale: 1.7, opacity: 0, duration: 0.9, ease: "power1.in" })
        .call(() => blob.remove());
    };

    hero.addEventListener("mousemove", onMove, { passive: true });
    return () => hero.removeEventListener("mousemove", onMove);
  }, []);

  /* Entrance stagger */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>(".h-enter");
    gsap.fromTo(items,
      { y: 38, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.95, stagger: 0.1, ease: "power3.out", delay: 0.15 }
    );
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        paddingTop: "clamp(72px,12vw,88px)",
        paddingBottom: "clamp(100px,14vw,120px)",
        background: "transparent",
      }}
    >
      <HeroBackground />

      <div ref={inkRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }} />
      <SpeedLines />

      {/* Red grid */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        backgroundImage:
          "linear-gradient(rgba(232,0,45,0.02) 1px,transparent 1px)," +
          "linear-gradient(90deg,rgba(232,0,45,0.02) 1px,transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      {/* Radial vignette */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none",
        background:
          "radial-gradient(ellipse 88% 72% at 50% 40%, transparent 20%, rgba(3,3,3,0.65) 58%, rgba(3,3,3,0.97) 100%)",
      }} />

      {/* Bottom fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 4, pointerEvents: "none",
        height: "clamp(120px,22vh,220px)",
        background: "linear-gradient(transparent, #030303)",
      }} />

      {/* ── Content ── */}
      <div style={{
        position: "relative", zIndex: 5,
        display: "flex", flexDirection: "column",
        alignItems: "center", textAlign: "center",
        padding: "0 clamp(14px,5vw,28px)",
        width: "100%", maxWidth: 1020,
      }}>

        {/* ACM badge */}
        <div className="h-enter" style={{ opacity: 0, marginBottom: "clamp(14px,2.5vw,22px)" }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "clamp(7px,1.3vw,9px)",
            fontWeight: 500,
            letterSpacing: "clamp(0.28em,0.6vw,0.48em)",
            textTransform: "uppercase",
            color: "rgba(232,0,45,0.7)",
          }}>{HERO.label}</span>
        </div>

        {/* Welcome to */}
        <div className="h-enter" style={{ opacity: 0, marginBottom: "1px" }}>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 300,
            fontSize: "clamp(11px,2.6vw,24px)",
            letterSpacing: "clamp(0.28em,0.8vw,0.52em)",
            color: "rgba(245,242,238,0.18)",
            textTransform: "uppercase",
          }}>Welcome to</span>
        </div>

        {/* HACK */}
        <div className="h-enter" style={{ opacity: 0, overflow: "hidden" }}>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(66px,18vw,218px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.87,
            color: "#F5F2EE",
            display: "block",
            textShadow: "0 0 80px rgba(232,0,45,0.1)",
          }}>HACK</h1>
        </div>

        {/* DAYS */}
        <div className="h-enter" style={{ opacity: 0, overflow: "hidden", marginBottom: "clamp(10px,2vw,16px)" }}>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(66px,18vw,218px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.87,
            WebkitTextStroke: "clamp(2px,0.32vw,3px) #E8002D",
            color: "transparent",
            display: "block",
            filter: "drop-shadow(0 0 32px rgba(232,0,45,0.22))",
          }}>DAYS</h1>
        </div>

        {/* Year + tagline */}
        <div className="h-enter" style={{
          opacity: 0,
          display: "flex", alignItems: "center",
          gap: "clamp(8px,2vw,14px)",
          marginBottom: "clamp(26px,5vw,44px)",
          flexWrap: "wrap", justifyContent: "center",
        }}>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(18px,3.2vw,34px)",
            color: "#FFD700",
            letterSpacing: "0.07em",
          }}>2026</span>
          <div style={{ width: 1, height: "clamp(14px,2.2vw,20px)", background: "rgba(245,242,238,0.08)", flexShrink: 0 }} />
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "clamp(8px,1.3vw,10px)",
            fontWeight: 400,
            letterSpacing: "0.18em",
            color: "#404040",
            textTransform: "uppercase",
            maxWidth: "clamp(160px,36vw,260px)",
          }}>{SITE_META.tagline}</span>
        </div>

        {/* ── Timer ── */}
        <div className="h-enter" style={{ opacity: 0, marginBottom: "clamp(26px,5vw,44px)", width: "100%" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, marginBottom: "clamp(12px,2vw,18px)",
          }}>
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              style={{ width: 5, height: 5, borderRadius: "50%", background: "#E8002D", boxShadow: "0 0 8px rgba(232,0,45,0.8)", flexShrink: 0 }}
            />
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "clamp(7px,1.2vw,9px)",
              fontWeight: 500,
              letterSpacing: "0.34em",
              textTransform: "uppercase",
              color: "#3a3a3a",
            }}>{HERO.timerLabel}</span>
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: 0.55 }}
              style={{ width: 5, height: 5, borderRadius: "50%", background: "#E8002D", boxShadow: "0 0 8px rgba(232,0,45,0.8)", flexShrink: 0 }}
            />
          </div>

          <div style={{
            display: "inline-flex",
            alignItems: "flex-end",
            gap: "clamp(4px,1.4vw,10px)",
            padding: "clamp(12px,2vw,20px) clamp(16px,3vw,36px)",
            background: "rgba(3,3,3,0.84)",
            border: "1px solid rgba(232,0,45,0.1)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            position: "relative",
            maxWidth: "100%",
          }}>
            {/* Corner marks */}
            {[
              { top: 0,    left:  0   },
              { top: 0,    right: 0   },
              { bottom: 0, left:  0   },
              { bottom: 0, right: 0   },
            ].map((pos, i) => (
              <div key={i} style={{
                position: "absolute", width: 10, height: 10,
                borderTop:    i < 2  ? "1px solid rgba(232,0,45,0.38)" : undefined,
                borderBottom: i >= 2 ? "1px solid rgba(232,0,45,0.38)" : undefined,
                borderLeft:   i % 2 === 0 ? "1px solid rgba(232,0,45,0.38)" : undefined,
                borderRight:  i % 2 !== 0 ? "1px solid rgba(232,0,45,0.38)" : undefined,
                ...pos,
              }} />
            ))}
            <Digit val={t.days}    label="Days" />
            <Sep  delay={0} />
            <Digit val={t.hours}   label="Hrs" />
            <Sep  delay={0.33} />
            <Digit val={t.minutes} label="Min" />
            <Sep  delay={0.66} />
            <Digit val={t.seconds} label="Sec" />
          </div>
        </div>

        {/* CTAs */}
        <div className="h-enter" style={{
          opacity: 0,
          display: "flex", gap: "clamp(10px,2vw,14px)",
          flexWrap: "wrap", justifyContent: "center",
        }}>
          <a href="https://unstop.com" target="_blank" rel="noopener noreferrer"
            data-hover className="btn-primary"
            style={{ fontSize: "clamp(10px,1.7vw,12px)", padding: "clamp(12px,2vw,15px) clamp(24px,4vw,36px)" }}
          >
            Register Now <ArrowUpRight size={12} />
          </a>
          <a href="#about" data-hover className="btn-ghost"
            style={{ fontSize: "clamp(10px,1.7vw,12px)", padding: "clamp(11px,1.9vw,14px) clamp(24px,4vw,36px)" }}
          >
            Learn More
          </a>
        </div>
      </div>

      <SteeringCrewBar />

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        style={{
          position: "absolute",
          bottom: "clamp(14px,3vw,22px)",
          left: "50%", transform: "translateX(-50%)",
          zIndex: 6,
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 4,
        }}
      >
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "clamp(6px,1vw,8px)",
          fontWeight: 500,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "#1e1e1e",
        }}>Scroll</span>
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 1.7, ease: "easeInOut" }}>
          <ChevronDown size={10} style={{ color: "#1e1e1e" }} />
        </motion.div>
      </motion.div>
    </section>
  );
}