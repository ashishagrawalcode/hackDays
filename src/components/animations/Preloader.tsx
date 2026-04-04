"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LIGHT_COUNT = 5;
const LIGHT_ON_INTERVAL = 600; // ms

export function Preloader() {
  const [phase, setPhase] = useState<"idle" | "lighting" | "out" | "done">("idle");
  const [litCount, setLitCount] = useState(0);

  // 1. The Bulletproof Async Sequence
  useEffect(() => {
    let isMounted = true; // Protects against React Strict Mode double-mounting

    const runSequence = async () => {
      // Initial delay
      await new Promise((r) => setTimeout(r, 400));
      if (!isMounted) return;
      setPhase("lighting");

      // Turn on lights one by one
      for (let i = 1; i <= LIGHT_COUNT; i++) {
        await new Promise((r) => setTimeout(r, LIGHT_ON_INTERVAL));
        if (!isMounted) return;
        setLitCount(i);
      }

      // Hold for a moment, then LIGHTS OUT
      await new Promise((r) => setTimeout(r, 400));
      if (!isMounted) return;
      setPhase("out");

      // Hold in the dark for a split second, then dismiss
      await new Promise((r) => setTimeout(r, 300));
      if (!isMounted) return;
      setPhase("done");
    };

    runSequence();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    // AnimatePresence automatically handles the deletion of the component
    // We removed the 'if (!visible) return null;' so this actually works!
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(57,255,20,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(57,255,20,0.03) 1px,transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />

          {/* Logo / Title */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p
              className="font-mono text-[9px] tracking-[0.5em] uppercase mb-3"
              style={{ color: "var(--phosphor)", opacity: 0.6 }}
            >
              ACM Student Chapter
            </p>
            <h1 className="preloader__title">
              HACK<span>DAYS</span>
              <br />
              <span
                className="font-mono font-bold"
                style={{ fontSize: "0.28em", letterSpacing: "0.4em", color: "#444", verticalAlign: "middle" }}
              >
                2026
              </span>
            </h1>
          </motion.div>

          {/* 5 Start Lights */}
          <div className="flex flex-col items-center gap-6 mt-8">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.3 }}
              className="font-mono text-[9px] tracking-[0.35em] uppercase"
              style={{ color: "#555" }}
            >
              Preparing Grid
            </motion.p>

            <div className="preloader__lights">
              {Array.from({ length: LIGHT_COUNT }).map((_, i) => {
                const isLit = litCount > i;
                const isOut = phase === "out";
                return (
                  <motion.div
                    key={i}
                    className={`preloader__light ${isLit && !isOut ? "on" : ""} ${isOut ? "out" : ""}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                  />
                );
              })}
            </div>

            {/* Framer Motion Progress bar — Replaces the manual tick logic! */}
            <div className="preloader__bar">
              <motion.div
                className="preloader__bar-fill"
                initial={{ width: "0%" }}
                animate={{ width: phase === "lighting" || phase === "out" ? "100%" : "0%" }}
                transition={{ duration: (LIGHT_COUNT * LIGHT_ON_INTERVAL) / 1000, ease: "linear" }}
              />
            </div>

            <motion.p
              animate={{ opacity: phase === "out" ? 1 : 0 }}
              className="font-mono text-[8px] tracking-[0.4em] uppercase"
              style={{ color: "var(--phosphor)" }}
            >
              Lights Out — GO!
            </motion.p>
          </div>

          {/* Corner decoration */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t border-l" style={{ borderColor: "rgba(57,255,20,0.15)" }} />
          <div className="absolute top-4 right-4 w-8 h-8 border-t border-r" style={{ borderColor: "rgba(57,255,20,0.15)" }} />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l" style={{ borderColor: "rgba(57,255,20,0.15)" }} />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r" style={{ borderColor: "rgba(57,255,20,0.15)" }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}