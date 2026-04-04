"use client";

import { useState, useRef, Suspense, lazy } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { HERO, SITE_META } from "@/lib/constants";
import { pad2 } from "@/lib/utils";

const CircuitCanvas = lazy(() =>
  import("@/components/three/CircuitCanvas").then(m => ({ default: m.CircuitCanvas }))
);

/* ── Countdown ─────────────────────────── */
function useCountdown(iso: string) {
  const target = new Date(iso).getTime();
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, ms: 0 });
  useAnimationFrame(() => {
    const d = target - Date.now();
    if (d > 0) setT({
      days:    Math.floor(d / 86400000),
      hours:   Math.floor((d % 86400000) / 3600000),
      minutes: Math.floor((d % 3600000)  / 60000),
      seconds: Math.floor((d % 60000)    / 1000),
      ms:      Math.floor((d % 1000)     / 10),
    });
  });
  return t;
}

/* ── Timer digit block ─────────────────── */
function Digit({ val, label, red }: { val: number; label: string; red?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 56 }}>
      <span style={{
        fontFamily: "'IBM Plex Mono',monospace",
        fontWeight: 700,
        fontSize: "clamp(30px,5vw,56px)",
        letterSpacing: "-0.04em",
        lineHeight: 1,
        color: red ? "var(--f1red)" : "var(--white)",
        textShadow: red ? "var(--glow-red)" : undefined,
        fontVariantNumeric: "tabular-nums",
      }}>
        {pad2(val)}
      </span>
      <span style={{
        fontFamily: "'IBM Plex Mono',monospace",
        fontSize: 8,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "var(--muted)",
        marginTop: 6,
      }}>
        {label}
      </span>
    </div>
  );
}

/* ── Separator ─────────────────────────── */
function Sep() {
  return (
    <span style={{
      fontFamily: "'IBM Plex Mono',monospace",
      fontSize: 28,
      color: "rgba(232,0,45,0.35)",
      paddingBottom: 18,
      animation: "f1-pulse 1s ease-in-out infinite",
    }}>:</span>
  );
}

/* ── Main ──────────────────────────────── */
export function HeroGrid() {
  const t  = useCountdown(HERO.targetDate);

  return (
    <section
      id="home"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        paddingTop: 80,
      }}
    >
      {/* ── 3D Canvas ───────────────────── */}
      <Suspense fallback={null}>
        <CircuitCanvas />
      </Suspense>

      {/* ── Grid lines ──────────────────── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(232,0,45,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(232,0,45,0.03) 1px,transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      {/* ── Radial dark vignette ─────────── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 50% 40%, transparent 20%, rgba(3,3,3,0.65) 65%, rgba(3,3,3,0.98) 100%)",
      }} />

      {/* ── Bottom fade ─────────────────── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 200,
        background: "linear-gradient(transparent, var(--void))",
        pointerEvents: "none",
      }} />

      {/* ── Content ─────────────────────── */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column",
        alignItems: "center", textAlign: "center",
        padding: "0 20px", width: "100%", maxWidth: 1100,
      }}>

        {/* ACM label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 10,
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            color: "var(--f1red)",
            opacity: 0.75,
            marginBottom: 24,
          }}
        >
          {HERO.label}
        </motion.p>

        {/* ── WELCOME TO ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: "clamp(14px,2.5vw,28px)",
            letterSpacing: "0.55em",
            color: "rgba(240,237,232,0.4)",
            marginBottom: 4,
          }}
        >
          WELCOME TO
        </motion.div>

        {/* ── HACK ────────────────────────── */}
        <div style={{ overflow: "hidden", lineHeight: 0.9 }}>
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: "clamp(88px,18vw,220px)",
              letterSpacing: "0.02em",
              color: "var(--white)",
              lineHeight: 0.9,
              display: "block",
            }}
          >
            HACK
          </motion.h1>
        </div>

        {/* ── DAYS — red stroke ───────────── */}
        <div style={{ overflow: "hidden", lineHeight: 0.9, marginBottom: 8 }}>
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: "clamp(88px,18vw,220px)",
              letterSpacing: "0.02em",
              lineHeight: 0.9,
              display: "block",
              WebkitTextStroke: "3px var(--f1red)",
              color: "transparent",
              filter: "drop-shadow(0 0 40px rgba(232,0,45,0.25))",
            }}
          >
            DAYS
          </motion.h1>
        </div>

        {/* Year + tagline row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          style={{
            display: "flex", alignItems: "center", gap: 16,
            marginBottom: 32,
          }}
        >
          <span style={{
            fontFamily: "'Bebas Neue',sans-serif",
            fontSize: "clamp(20px,3vw,36px)",
            color: "var(--amber)",
            letterSpacing: "0.15em",
          }}>2026</span>
          <span style={{ width: 1, height: 24, background: "rgba(240,237,232,0.15)" }} />
          <span style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: "clamp(9px,1.2vw,12px)",
            letterSpacing: "0.25em",
            color: "var(--ghost)",
            textTransform: "uppercase",
          }}>
            {SITE_META.tagline}
          </span>
        </motion.div>

        {/* ── Countdown timer ─────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          style={{ marginBottom: 36 }}
        >
          {/* Timer label */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, marginBottom: 14,
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 9,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "var(--ghost)",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--f1red)",
              boxShadow: "var(--glow-red)",
              animation: "f1-pulse 1s ease-in-out infinite",
            }} />
            {HERO.timerLabel}
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--f1red)",
              boxShadow: "var(--glow-red)",
              animation: "f1-pulse 1s ease-in-out infinite",
              animationDelay: "0.5s",
            }} />
          </div>

          {/* Digits */}
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 8,
            padding: "18px 28px",
            background: "rgba(3,3,3,0.7)",
            border: "1px solid rgba(232,0,45,0.12)",
            backdropFilter: "blur(12px)",
            position: "relative",
          }}>
            {/* Corner brackets */}
            {[
              { top: 0, left: 0, borderTop: "1px solid", borderLeft: "1px solid" },
              { top: 0, right: 0, borderTop: "1px solid", borderRight: "1px solid" },
              { bottom: 0, left: 0, borderBottom: "1px solid", borderLeft: "1px solid" },
              { bottom: 0, right: 0, borderBottom: "1px solid", borderRight: "1px solid" },
            ].map((s, i) => (
              <div key={i} style={{
                position: "absolute", width: 12, height: 12,
                borderColor: "rgba(232,0,45,0.4)", ...s,
              }} />
            ))}

            <Digit val={t.days}    label="DAYS" />
            <Sep />
            <Digit val={t.hours}   label="HRS" />
            <Sep />
            <Digit val={t.minutes} label="MIN" />
            <Sep />
            <Digit val={t.seconds} label="SEC" />
            <span style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 20, color: "rgba(232,0,45,0.25)",
              paddingBottom: 18,
            }}>.</span>
            <Digit val={t.ms} label="MS" red />
          </div>
        </motion.div>

        {/* ── CTA buttons ─────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.05 }}
          style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}
        >
          <a
            href="https://unstop.com"
            target="_blank"
            rel="noopener noreferrer"
            data-hover
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#000",
              background: "var(--f1red)",
              padding: "14px 32px",
              clipPath: "polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              fontWeight: 700,
              transition: "background 0.2s, transform 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--f1red)")}
          >
            Register Now <ArrowUpRight size={13} />
          </a>

          <a
            href="#about"
            data-hover
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--white)",
              border: "1px solid rgba(240,237,232,0.2)",
              padding: "14px 32px",
              clipPath: "polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(240,237,232,0.5)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(240,237,232,0.2)";
              e.currentTarget.style.color = "var(--white)";
            }}
          >
            Learn More
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        style={{
          position: "absolute", bottom: 28,
          left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 6,
        }}
      >
        <span style={{
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 8, letterSpacing: "0.35em",
          textTransform: "uppercase", color: "#2a2a2a",
        }}>Scroll</span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown size={12} style={{ color: "#2a2a2a" }} />
        </motion.div>
      </motion.div>
    </section>
  );
}