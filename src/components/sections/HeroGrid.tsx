"use client";

import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { HERO } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { pad2 } from "@/lib/utils";

// Lazy-load the heavy R3F canvas
const CircuitCanvas = lazy(() =>
  import("@/components/three/CircuitCanvas").then((m) => ({ default: m.CircuitCanvas }))
);

// ── Countdown timer ──────────────────────────────────────────
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  ms: number;
}

function useCountdown(targetDate: string): TimeLeft {
  const target = new Date(targetDate).getTime();
  const [t, setT] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, ms: 0 });

  useAnimationFrame(() => {
    const dist = target - Date.now();
    if (dist > 0) {
      setT({
        days:    Math.floor(dist / 86400000),
        hours:   Math.floor((dist % 86400000) / 3600000),
        minutes: Math.floor((dist % 3600000)  / 60000),
        seconds: Math.floor((dist % 60000)    / 1000),
        ms:      Math.floor((dist % 1000)     / 10),
      });
    }
  });

  return t;
}

// ── Timer unit block ─────────────────────────────────────────
function TimeUnit({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center min-w-[52px] sm:min-w-[68px]">
      <span
        className="font-mono font-bold tabular-nums leading-none"
        style={{
          fontSize: "clamp(28px, 5vw, 52px)",
          color: accent ? "var(--phosphor)" : "#fff",
          letterSpacing: "-0.03em",
          textShadow: accent ? "0 0 20px rgba(57,255,20,0.5)" : undefined,
        }}
      >
        {pad2(value)}
      </span>
      <span
        className="font-mono uppercase mt-2"
        style={{ fontSize: "8px", letterSpacing: "0.25em", color: "#444" }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Glitching title letter ────────────────────────────────────
function GlitchLetter({ char, delay = 0 }: { char: string; delay?: number }) {
  return (
    <motion.span
      className="inline-block relative select-none"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {char}
    </motion.span>
  );
}

// ── Main Hero component ───────────────────────────────────────
export function HeroGrid() {
  const t = useCountdown(HERO.targetDate);
  const heroRef = useRef<HTMLElement>(null);

  // Parallax offset on scroll
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onScroll = () => {
      const y = window.scrollY;
      hero.style.setProperty("--scroll-y", `${y}px`);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ paddingTop: "80px" }}
    >
      {/* ── R3F Particle canvas ──────────────────────────────── */}
      <Suspense fallback={null}>
        <CircuitCanvas />
      </Suspense>

      {/* ── Grid overlay ────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(57,255,20,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(57,255,20,0.025) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* ── Radial vignette ─────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(5,5,5,0.7) 70%, rgba(5,5,5,0.97) 100%)",
        }}
      />

      {/* ── Bottom fade ─────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: "linear-gradient(transparent, var(--void))",
        }}
      />

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-6xl">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 3.9 }}
          className="font-mono text-[9px] tracking-[0.55em] uppercase mb-8"
          style={{ color: "var(--phosphor)", opacity: 0.7 }}
        >
          {HERO.label}
        </motion.p>

        {/* Main title — HACK + DAYS */}
        <h1
          className="font-display uppercase leading-none mb-4 w-full"
          style={{
            fontSize: "clamp(72px, 14vw, 180px)",
            letterSpacing: "0.04em",
          }}
        >
          {/* WELCOME TO */}
          <div
            className="flex justify-center gap-[0.15em] mb-1"
            style={{ fontSize: "0.28em", letterSpacing: "0.2em" }}
          >
            {"WELCOME".split("").map((c, i) => (
              <GlitchLetter key={i} char={c} delay={4.0 + i * 0.04} />
            ))}
            <span style={{ width: "0.4em" }} />
            {"TO".split("").map((c, i) => (
              <GlitchLetter
                key={i}
                char={c}
                delay={4.28 + i * 0.04}
              />
            ))}
          </div>

          {/* HACK */}
          <div className="flex justify-center leading-none">
            {"HACK".split("").map((c, i) => (
              <GlitchLetter key={i} char={c} delay={4.4 + i * 0.06} />
            ))}
          </div>

          {/* DAYS — with stroke effect */}
          <div className="flex justify-center leading-none">
            {"DAYS".split("").map((c, i) => (
              <motion.span
                key={i}
                className="inline-block"
                style={{
                  WebkitTextStroke: "2px var(--phosphor)",
                  color: "transparent",
                  textShadow: "0 0 40px rgba(57,255,20,0.2)",
                }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 4.64 + i * 0.06,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              >
                {c}
              </motion.span>
            ))}

            {/* Year */}
            <motion.span
              className="font-mono self-end ml-3 mb-2"
              style={{
                fontSize: "0.2em",
                letterSpacing: "0.15em",
                color: "var(--amber)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4.9 }}
            >
              2026
            </motion.span>
          </div>
        </h1>

        {/* ── Countdown timer ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 5.1 }}
          className="relative flex flex-col items-center gap-4 mt-2 mb-10"
        >
          {/* Timer label */}
          <div
            className="flex items-center gap-2 font-mono text-[9px] tracking-[0.4em] uppercase"
            style={{ color: "var(--phosphor)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-phosphor-pulse"
              style={{ background: "var(--phosphor)", boxShadow: "0 0 6px var(--phosphor)" }}
            />
            {HERO.timerLabel}
            <span
              className="w-1.5 h-1.5 rounded-full animate-phosphor-pulse"
              style={{ background: "var(--phosphor)", boxShadow: "0 0 6px var(--phosphor)", animationDelay: "0.5s" }}
            />
          </div>

          {/* Timer row */}
          <div
            className="relative flex items-end gap-2 sm:gap-4 px-6 py-4 sm:px-8 sm:py-5"
            style={{
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: "rgba(57,255,20,0.3)" }} />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r" style={{ borderColor: "rgba(57,255,20,0.3)" }} />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l" style={{ borderColor: "rgba(57,255,20,0.3)" }} />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r" style={{ borderColor: "rgba(57,255,20,0.3)" }} />

            <TimeUnit value={t.days}    label="DAYS" />
            <span className="font-mono text-2xl pb-5 animate-phosphor-pulse" style={{ color: "rgba(57,255,20,0.3)" }}>:</span>
            <TimeUnit value={t.hours}   label="HRS" />
            <span className="font-mono text-2xl pb-5 animate-phosphor-pulse" style={{ color: "rgba(57,255,20,0.3)" }}>:</span>
            <TimeUnit value={t.minutes} label="MIN" />
            <span className="font-mono text-2xl pb-5 animate-phosphor-pulse" style={{ color: "rgba(57,255,20,0.3)" }}>:</span>
            <TimeUnit value={t.seconds} label="SEC" />
            <span className="font-mono text-xl pb-5" style={{ color: "rgba(57,255,20,0.2)" }}>.</span>
            <TimeUnit value={t.ms}      label="MS" accent />
          </div>
        </motion.div>

        {/* ── CTAs ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 5.3 }}
          className="flex items-center gap-4 flex-wrap justify-center"
        >
          <Button
            variant="primary"
            size="lg"
            href={`https://unstop.com`}
            external
            icon={<ArrowUpRight size={14} />}
          >
            Register Now
          </Button>
          <Button variant="ghost" size="lg" href="#about">
            Learn More
          </Button>
        </motion.div>
      </div>

      {/* ── Scroll indicator ────────────────────────────────── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5.8 }}
      >
        <span
          className="font-mono text-[8px] tracking-[0.35em] uppercase"
          style={{ color: "#333" }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <ChevronDown size={14} style={{ color: "#333" }} />
        </motion.div>
      </motion.div>
    </section>
  );
}