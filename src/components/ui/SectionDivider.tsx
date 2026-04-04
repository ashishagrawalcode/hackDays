"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STRIPE_SCHEME = [
  "#E8002D", "#0d0d0d", "#fff",    "#0d0d0d",
  "#E8002D", "#0d0d0d", "#FFF200", "#0d0d0d",
  "#E8002D", "#0d0d0d", "#fff",    "#0d0d0d",
];

interface Props {
  label: string;
  index: number;
}

export function SectionDivider({ label, index }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const stripes = el.querySelectorAll<HTMLElement>(".div-stripe");

    gsap.fromTo(
      stripes,
      { scaleX: 0, transformOrigin: "left center" },
      {
        scaleX: 1,
        duration: 0.4,
        stagger: 0.04,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      }
    );

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        height: 44,
        overflow: "hidden",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: "#030303",
        position: "relative",
      }}
    >
      {/* Left stripes */}
      <div style={{ display: "flex", gap: 2, paddingLeft: 20, flexShrink: 0 }}>
        {STRIPE_SCHEME.map((color, i) => (
          <div
            key={i}
            className="div-stripe"
            style={{
              width: 14,
              height: 44,
              background: color,
              transform: "skewX(-12deg)",
              opacity: color === "#0d0d0d" ? 0.6 : 0.8,
            }}
          />
        ))}
      </div>

      {/* Left line */}
      <div style={{
        flex: 1,
        height: 1,
        marginLeft: 16,
        background: "linear-gradient(90deg, rgba(255,255,255,0.07), transparent)",
      }} />

      {/* Center label */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 20px",
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 9,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "rgba(232,0,45,0.45)",
        }}>
          {String(index).padStart(2, "0")}
        </span>
        <span style={{
          width: 3,
          height: 3,
          background: "var(--f1red)",
          transform: "rotate(45deg)",
        }} />
        <span style={{
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 9,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.18)",
        }}>
          {label}
        </span>
      </div>

      {/* Right line */}
      <div style={{
        flex: 1,
        height: 1,
        marginRight: 16,
        background: "linear-gradient(270deg, rgba(255,255,255,0.07), transparent)",
      }} />

      {/* Right stripes reversed */}
      <div style={{ display: "flex", gap: 2, paddingRight: 20, flexShrink: 0 }}>
        {[...STRIPE_SCHEME].reverse().map((color, i) => (
          <div
            key={i}
            className="div-stripe"
            style={{
              width: 14,
              height: 44,
              background: color,
              transform: "skewX(-12deg)",
              opacity: color === "#0d0d0d" ? 0.6 : 0.8,
            }}
          />
        ))}
      </div>
    </div>
  );
}