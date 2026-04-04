"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const LIGHT_COUNT = 5;

export function Preloader() {
  const overlayRef   = useRef<HTMLDivElement>(null);
  const revBarRef    = useRef<HTMLDivElement>(null);
  const lightsRef    = useRef<(HTMLDivElement | null)[]>([]);
  const rpmRef       = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    // Prevent scroll during preloader
    document.body.style.overflow = "hidden";

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        setDone(true);
      },
    });

    // 1. Initial hold
    tl.to({}, { duration: 0.4 });

    // 2. Rev bar climbs to 80%
    tl.to(revBarRef.current, {
      width: "80%",
      duration: 1.0,
      ease: "power3.out",
    });

    // 3. Light 1 on
    tl.to(lightsRef.current[0], {
      backgroundColor: "#FF1801",
      boxShadow: "0 0 8px #FF1801, 0 0 24px rgba(255,24,1,0.7), 0 0 60px rgba(255,24,1,0.35), inset 0 0 12px rgba(255,100,50,0.5)",
      duration: 0.12,
    }, "+=0.1");

    // 4. Lights 2-5 in sequence
    for (let i = 1; i < LIGHT_COUNT; i++) {
      tl.to(lightsRef.current[i], {
        backgroundColor: "#FF1801",
        boxShadow: "0 0 8px #FF1801, 0 0 24px rgba(255,24,1,0.7), 0 0 60px rgba(255,24,1,0.35), inset 0 0 12px rgba(255,100,50,0.5)",
        duration: 0.12,
      }, `+=0.52`);
    }

    // 5. Rev bar slams to 100%
    tl.to(revBarRef.current, {
      width: "100%",
      duration: 0.18,
      ease: "power4.in",
    }, "+=0.25");

    // 6. RPM counter flashes
    tl.to(rpmRef.current, {
      innerHTML: "18,000",
      duration: 0,
    });

    // 7. All lights extinguish instantly — GO
    tl.to(lightsRef.current, {
      backgroundColor: "transparent",
      boxShadow: "none",
      border: "1px solid transparent",
      opacity: 0,
      duration: 0.08,
      stagger: 0.04,
    }, "+=0.15");

    // 8. Rev bar drain
    tl.to(revBarRef.current, {
      opacity: 0,
      duration: 0.3,
    }, "-=0.1");

    // 9. Overlay slides UP off screen — race start gate lifting
    tl.to(overlay, {
      yPercent: -100,
      duration: 0.85,
      ease: "power4.inOut",
    }, "+=0.05");

    return () => { tl.kill(); };
  }, [done]);

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "var(--void, #030303)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Scanlines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)",
      }} />

      {/* F1 track-style corner marks */}
      {[
        { top: 24, left: 24 },
        { top: 24, right: 24 },
        { bottom: 24, left: 24 },
        { bottom: 24, right: 24 },
      ].map((pos, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 20, height: 20,
          borderTop: i < 2 ? "1px solid rgba(232,0,45,0.3)" : undefined,
          borderBottom: i >= 2 ? "1px solid rgba(232,0,45,0.3)" : undefined,
          borderLeft: i % 2 === 0 ? "1px solid rgba(232,0,45,0.3)" : undefined,
          borderRight: i % 2 !== 0 ? "1px solid rgba(232,0,45,0.3)" : undefined,
          ...pos,
        }} />
      ))}

      {/* Event label */}
      <p style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9,
        letterSpacing: "0.5em",
        textTransform: "uppercase",
        color: "rgba(232,0,45,0.5)",
        marginBottom: 48,
      }}>
        ACM Student Chapter · HackDays 2026
      </p>

      {/* Light gantry */}
      <div style={{
        display: "flex",
        gap: 16,
        marginBottom: 52,
        padding: "24px 40px",
        background: "rgba(15,15,15,0.9)",
        border: "1px solid rgba(255,255,255,0.05)",
        position: "relative",
      }}>
        {/* Gantry top bar */}
        <div style={{
          position: "absolute", top: 0, left: "10%", right: "10%", height: 2,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
        }} />

        {Array.from({ length: LIGHT_COUNT }).map((_, i) => (
          <div
            key={i}
            ref={(el) => { lightsRef.current[i] = el; }}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#0d0202",
              border: "1.5px solid #1a0808",
              transition: "none",
            }}
          />
        ))}
      </div>

      {/* RPM rev bar */}
      <div style={{
        width: 280,
        marginBottom: 20,
        position: "relative",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
        }}>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>ENGINE RPM</span>
          <span ref={rpmRef} style={{ color: "rgba(232,0,45,0.7)" }}>0</span>
        </div>
        <div style={{
          width: "100%",
          height: 3,
          background: "#1a1a1a",
          overflow: "hidden",
        }}>
          <div
            ref={revBarRef}
            style={{
              width: "0%",
              height: "100%",
              background: "linear-gradient(90deg, #E8002D, #FF6600, #FFF200)",
              boxShadow: "0 0 10px rgba(232,0,45,0.8)",
            }}
          />
        </div>
        {/* RPM scale markers */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 7,
          color: "rgba(255,255,255,0.1)",
          letterSpacing: "0.15em",
        }}>
          {["0", "3K", "6K", "9K", "12K", "15K", "18K"].map(v => (
            <span key={v}>{v}</span>
          ))}
        </div>
      </div>

      {/* Bottom status */}
      <p style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9,
        letterSpacing: "0.4em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.12)",
        marginTop: 16,
      }}>
        Preparing Grid
      </p>
    </div>
  );
}