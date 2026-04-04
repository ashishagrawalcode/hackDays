"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SPONSORS } from "@/lib/constants";

/* ─────────────────────────────────────────────────────────────
   SPONSOR CARD
───────────────────────────────────────────────────────────── */
function SponsorCard({
  name, desc, logo, index,
}: {
  name: string; desc: string; logo: string; index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 6) * 0.07, ease: "easeOut" }}
      className="sponsor-card"
      style={{
        position: "relative",
        overflow: "hidden",
        background: "radial-gradient(circle at 20% 0%, rgba(232,0,45,0.05), transparent 55%), #0f0f0f",
        border: "1px solid rgba(255,255,255,0.07)",
        cursor: "default",
      }}
      whileHover={{ scale: 1.02, transition: { duration: 0.18 } }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
        background: "linear-gradient(180deg, #E8002D, rgba(232,0,45,0.3), transparent)",
        opacity: 0.5,
      }} />

      {/* Shimmer on hover */}
      <motion.div
        className="shimmer-sweep"
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)",
          transform: "translateX(-100%)",
        }}
        whileHover={{ transform: "translateX(200%)", transition: { duration: 0.65 } }}
      />

      {/* Top glow on hover */}
      <motion.div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, #E8002D, transparent)",
          opacity: 0,
        }}
        whileHover={{ opacity: 1, transition: { duration: 0.2 } }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Logo area */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 64,
          background: "rgba(255,255,255,0.02)",
          clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)",
          overflow: "hidden",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            alt={`${name} logo`}
            style={{
              maxHeight: 40,
              maxWidth: "100%",
              objectFit: "contain",
              opacity: 0.65,
              filter: "grayscale(20%)",
              transition: "opacity 0.25s, filter 0.25s, transform 0.25s",
            }}
            onMouseEnter={e => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.opacity = "1";
              img.style.filter = "none";
              img.style.transform = "scale(1.06)";
            }}
            onMouseLeave={e => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.opacity = "0.65";
              img.style.filter = "grayscale(20%)";
              img.style.transform = "scale(1)";
            }}
            onError={e => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.display = "none";
              const fallback = img.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "block";
            }}
          />
          <span style={{
            display: "none",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 18,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.1em",
          }}>{name}</span>
        </div>

        {/* Name */}
        <h3 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(13px, 1.5vw, 16px)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#F0EDE8",
          textAlign: "center",
          transition: "color 0.15s",
        }}>
          {name}
        </h3>

        {/* Description */}
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          lineHeight: 1.65,
          color: "rgba(255,255,255,0.3)",
          textAlign: "center",
        }}>
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MARQUEE
───────────────────────────────────────────────────────────── */
function MarqueeStrip() {
  const names = SPONSORS.list.map(s => s.name);
  const doubled = [...names, ...names];

  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      padding: "12px 0",
      borderTop: "1px solid rgba(255,255,255,0.04)",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      margin: "48px 0 0",
    }}>
      {/* Fade edges */}
      {["left", "right"].map(side => (
        <div key={side} style={{
          position: "absolute",
          top: 0, bottom: 0,
          [side]: 0,
          width: 80,
          zIndex: 10,
          pointerEvents: "none",
          background: `linear-gradient(${side === "left" ? "90deg" : "270deg"}, #0a0a0a, transparent)`,
        }} />
      ))}

      <motion.div
        style={{ display: "flex", whiteSpace: "nowrap" }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((name, i) => (
          <span key={i} style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#1e1e1e",
            marginRight: "2.5rem",
          }}>
            {name}
            <span style={{ marginLeft: "2.5rem", color: "rgba(232,0,45,0.2)" }}>×</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CIRCUIT TRACES DECORATION
───────────────────────────────────────────────────────────── */
function CircuitDecor() {
  return (
    <svg
      style={{
        position: "absolute", top: 0, right: 0,
        width: 420, height: 340,
        opacity: 0.04, pointerEvents: "none",
      }}
      viewBox="0 0 500 400" fill="none"
    >
      <path d="M480 20 L480 80 Q480 100 460 100 L100 100 Q80 100 80 120 L80 200 Q80 220 100 220 L400 220 Q420 220 420 240 L420 380"
        stroke="#E8002D" strokeWidth="2" />
      <path d="M500 60 L380 60 Q360 60 360 80 L360 160 Q360 180 340 180 L60 180 Q40 180 40 200 L40 380"
        stroke="#FFF200" strokeWidth="1.5" />
      <circle cx="480" cy="100" r="4" fill="#E8002D" />
      <circle cx="80"  cy="220" r="4" fill="#E8002D" />
      <circle cx="420" cy="240" r="4" fill="#FFF200" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION
───────────────────────────────────────────────────────────── */
export function PitLaneSponsors() {
  return (
    <section
      id="sponsors"
      style={{
        position: "relative",
        padding: "100px 0",
        /* Opaque — intentionally covers the 3D car during this section */
        background: "linear-gradient(180deg, #080808 0%, #050505 100%)",
        overflow: "hidden",
      }}
    >
      <CircuitDecor />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <div className="section-eyebrow">
            {SPONSORS.sectionNum} // {SPONSORS.sectionLabel}
          </div>
          <h2 className="section-title" style={{ fontSize: "clamp(48px, 7vw, 88px)" }}>
            {SPONSORS.title}
          </h2>
          {SPONSORS.subtitle && (
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              marginTop: 8,
            }}>
              {SPONSORS.subtitle}
            </p>
          )}
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
        }}>
          {SPONSORS.list.map((sponsor, i) => (
            <SponsorCard
              key={sponsor.name}
              name={sponsor.name}
              desc={sponsor.desc}
              logo={sponsor.logo}
              index={i}
            />
          ))}
        </div>

        <MarqueeStrip />
      </div>
    </section>
  );
}