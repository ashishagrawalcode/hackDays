"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { TEAM } from "@/lib/constants";

/* ── colour palette — one per card slot ─────────────────────── */
const ACCENTS = ["#E8002D", "#FFF200", "#00D2FF", "#FF6B00", "#C084FC", "#4ade80"];

/* ── Telemetry line — animated SVG bar ──────────────────────── */
/* ─────────────────────────────────────────────────────────────
   HYDRATION-SAFE TELEMETRY BAR
───────────────────────────────────────────────────────────── */
// Deterministic pseudo-random number generator
// Always outputs the exact same "random" number for the same seed
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed * 10000) * 10000;
  return x - Math.floor(x);
};

function TelemetryBar({ accent, delay = 0 }: { accent: string; delay?: number }) {
  const segs = 18;
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 20 }}>
      {Array.from({ length: segs }).map((_, i) => {
        // Generate consistent random numbers using different seeds per property
        const r1 = pseudoRandom(i + 1);
        const r2 = pseudoRandom(i + 100);
        const r3 = pseudoRandom(i + 200);
        const r4 = pseudoRandom(i + 300);

        const h = 4 + r1 * 16;
        
        return (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, 0.6, 1] }}
            transition={{
              delay: delay + i * 0.03,
              duration: 0.6 + r2 * 0.4,
              repeat: Infinity,
              repeatDelay: 1.5 + r3,
              ease: "easeOut",
            }}
            style={{
              width: 3,
              height: h,
              background: accent,
              transformOrigin: "bottom",
              opacity: 0.55 + r4 * 0.45,
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Scan stripe that sweeps across the avatar ───────────────── */
function ScanStripe({ accent }: { accent: string }) {
  return (
    <motion.div
      style={{
        position: "absolute", left: 0, right: 0, height: "38%",
        background: `linear-gradient(180deg, transparent, ${accent}14, transparent)`,
        pointerEvents: "none",
      }}
      animate={{ y: ["-100%", "320%"] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
    />
  );
}

/* ── Avatar ──────────────────────────────────────────────────── */
function Avatar({
  photo, name, accent,
}: { photo: string; name: string; accent: string }) {
  const initials  = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const [failed, setFailed] = useState(false);

  return (
    <div style={{
      position: "relative",
      width: "100%",
      aspectRatio: "1",
      overflow: "hidden",
      background: `radial-gradient(ellipse at 30% 25%, ${accent}1a, #070707 70%)`,
    }}>
      {/* Fine grid overlay */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.07,
        backgroundImage:
          `linear-gradient(${accent}80 1px, transparent 1px),` +
          `linear-gradient(90deg, ${accent}80 1px, transparent 1px)`,
        backgroundSize: "22px 22px",
      }} />

      {/* SVG geometry */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <circle cx="50" cy="50" r="35" stroke={accent} strokeWidth="0.4" fill="none" opacity="0.18" />
        <circle cx="50" cy="50" r="20" stroke={accent} strokeWidth="0.3" fill="none" opacity="0.1" />
        <line x1="0"  y1="0"   x2="100" y2="100" stroke={accent} strokeWidth="0.25" opacity="0.15" />
        <line x1="100" y1="0"  x2="0"   y2="100" stroke={accent} strokeWidth="0.25" opacity="0.08" />
        <polygon points="50,8 92,32 92,68 50,92 8,68 8,32"
          stroke={accent} strokeWidth="0.35" fill="none" opacity="0.12" />
      </svg>

      {/* Photo or monogram */}
      {photo && !failed ? (
        <img
          src={photo}
          alt={name}
          onError={() => setFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            fontSize: 52,
            color: accent,
            textShadow: `0 0 30px ${accent}80`,
            letterSpacing: "0.08em",
          }}>{initials}</span>
        </div>
      )}

      {/* Corner brackets */}
      {[
        { top: 0,    left:  0,   borderTop:    `2px solid ${accent}55`, borderLeft:   `2px solid ${accent}55` },
        { top: 0,    right: 0,   borderTop:    `2px solid ${accent}55`, borderRight:  `2px solid ${accent}55` },
        { bottom: 0, left:  0,   borderBottom: `2px solid ${accent}55`, borderLeft:   `2px solid ${accent}55` },
        { bottom: 0, right: 0,   borderBottom: `2px solid ${accent}55`, borderRight:  `2px solid ${accent}55` },
      ].map((s, i) => (
        <div key={i} style={{ position: "absolute", width: 18, height: 18, ...s }} />
      ))}

      <ScanStripe accent={accent} />
    </div>
  );
}

/* ── Crew Card — front/back flip ─────────────────────────────── */
function CrewCard({
  member, index, accent,
}: {
  member: { name: string; role: string; photo: string };
  index: number;
  accent: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      style={{ perspective: 1000 }}
      initial={{ opacity: 0, y: 44, rotateX: 8 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Flip container */}
      <motion.div
        style={{ transformStyle: "preserve-3d", cursor: "pointer", position: "relative", width: "100%" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
        onClick={() => setFlipped((f) => !f)}
        whileHover={{ y: -4 }}
      >
        {/* ── FRONT ── */}
        <div style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          border: "1px solid rgba(255,255,255,0.07)",
          overflow: "hidden",
          clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
        }}>
          <Avatar photo={member.photo} name={member.name} accent={accent} />

          {/* Card info */}
          <div style={{ background: "#0c0c0c", padding: "14px 16px 16px", position: "relative" }}>
            {/* Top accent bar */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, ${accent}, transparent)`,
            }} />

            {/* Telemetry bar */}
            <div style={{ marginBottom: 10 }}>
              <TelemetryBar accent={accent} delay={index * 0.15} />
            </div>

            <h3 style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(17px,2.2vw,22px)",
              color: "#F0EDE8",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              lineHeight: 1.1,
              margin: 0,
            }}>{member.name}</h3>

            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "clamp(9px,1.1vw,11px)",
              color: accent,
              marginTop: 5,
              letterSpacing: "0.06em",
            }}>{member.role}</p>

            {/* Status row */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              marginTop: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <motion.div
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.1 + index * 0.1, repeat: Infinity }}
                  style={{ width: 4, height: 4, borderRadius: "50%", background: accent, boxShadow: `0 0 6px ${accent}` }}
                />
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 7,
                  color: "rgba(255,255,255,0.22)",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                }}>ACTIVE</span>
              </div>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 7,
                color: `${accent}50`,
                letterSpacing: "0.15em",
              }}>#{String(index + 1).padStart(2, "0")}</span>
            </div>

            {/* Flip hint */}
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 7,
              color: "rgba(255,255,255,0.14)",
              marginTop: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}>TAP FOR PROFILE →</p>
          </div>
        </div>

        {/* ── BACK ── */}
        <div style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          position: "absolute", inset: 0,
          border: `1px solid ${accent}30`,
          background: "linear-gradient(140deg, #0d0d0d, #141414)",
          clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ height: 2, background: accent }} />

          <div style={{ flex: 1, padding: "18px 16px", display: "flex", flexDirection: "column" }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 7,
              color: accent,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              marginBottom: 5,
            }}>CREW FILE · {String(index + 1).padStart(2, "0")}</span>

            <h3 style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(18px,2.4vw,24px)",
              color: "#F0EDE8",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              margin: "0 0 4px",
            }}>{member.name}</h3>

            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "clamp(9px,1.1vw,11px)",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 0,
            }}>{member.role}</p>

            <div style={{ height: 1, margin: "14px 0", background: `linear-gradient(90deg, ${accent}45, transparent)` }} />

            {/* Animated hex badge */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <motion.svg
                width="80" height="80"
                viewBox="0 0 80 80"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              >
                <polygon points="40,5 72,22 72,58 40,75 8,58 8,22"
                  stroke={accent} strokeWidth="1" fill={`${accent}0a`} />
                <polygon points="40,16 62,28 62,52 40,64 18,52 18,28"
                  stroke={accent} strokeWidth="0.5" fill="none" opacity="0.5" />
              </motion.svg>
              <div style={{ position: "absolute" }}>
                <span style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 900,
                  fontSize: 20,
                  color: accent,
                  textShadow: `0 0 16px ${accent}`,
                  letterSpacing: "0.05em",
                }}>
                  {member.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Back telemetry */}
            <div style={{ marginTop: 10 }}>
              <TelemetryBar accent={accent} delay={0.3 + index * 0.1} />
            </div>

            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 7,
              color: "rgba(255,255,255,0.14)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginTop: 10,
            }}>← FLIP BACK</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Pit-wall stat strip ─────────────────────────────────────── */
function StatStrip() {
  const uniqueRoles = new Set(TEAM.members.map((m) => m.role)).size;
  const stats = [
    { label: "Organizers",     value: String(TEAM.members.length), accent: "#E8002D" },
    { label: "Combined Roles", value: String(uniqueRoles),         accent: "#FFF200" },
    { label: "Event Hours",    value: "24+",                        accent: "#00D2FF" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{
        marginTop: 48,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        border: "1px solid rgba(255,255,255,0.06)",
        background: "#080808",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Animated scan line across the strip */}
      <motion.div
        style={{
          position: "absolute", top: 0, bottom: 0, width: 2,
          background: "linear-gradient(180deg, transparent, rgba(232,0,45,0.3), transparent)",
          pointerEvents: "none",
        }}
        animate={{ left: ["-2%", "102%"] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
      />

      {stats.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.12, duration: 0.5 }}
          style={{
            padding: "clamp(18px,3vw,28px) 16px",
            textAlign: "center",
            borderRight: i < 2 ? "1px solid rgba(255,255,255,0.05)" : undefined,
            position: "relative",
          }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.12 }}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(36px,5.5vw,56px)",
              color: s.accent,
              textShadow: `0 0 20px ${s.accent}55`,
              letterSpacing: "0.04em",
              margin: 0,
              lineHeight: 1,
            }}
          >{s.value}</motion.p>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "clamp(7px,1.1vw,9px)",
            color: "rgba(255,255,255,0.22)",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginTop: 6,
          }}>{s.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ── Pitlane status ticker ───────────────────────────────────── */
function PitlaneTicker() {
  const items = [
    "REGISTRATION OPEN",
    "24H HACKATHON",
    "PRIZES TBA",
    "TEAM SIZE: 1–4",
    "ALL BRANCHES WELCOME",
    "SPEED · CODE · INNOVATE",
  ];
  const doubled = [...items, ...items];

  return (
    <div style={{
      overflow: "hidden",
      background: "#E8002D",
      padding: "7px 0",
      position: "relative",
    }}>
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        style={{ display: "flex", gap: 0, whiteSpace: "nowrap" }}
      >
        {doubled.map((item, i) => (
          <span key={i} style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "clamp(8px,1.2vw,10px)",
            fontWeight: 500,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#000",
            padding: "0 clamp(20px,3vw,32px)",
            flexShrink: 0,
          }}>
            {item}
            <span style={{ margin: "0 8px", opacity: 0.5 }}>◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── MAIN EXPORT ─────────────────────────────────────────────── */
export function SteeringCrew() {
  return (
    <section
      id="team"
      style={{
        position: "relative",
        background: "#030303",
        overflow: "hidden",
      }}
    >
      {/* Pitlane ticker at top */}
      <PitlaneTicker />

      {/* Diagonal stripe accents */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: 240, height: 240,
        background: "repeating-linear-gradient(-45deg, rgba(232,0,45,0.035), rgba(232,0,45,0.035) 1px, transparent 1px, transparent 14px)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, width: 180, height: 180,
        background: "repeating-linear-gradient(-45deg, rgba(255,242,0,0.025), rgba(255,242,0,0.025) 1px, transparent 1px, transparent 14px)",
        pointerEvents: "none",
      }} />

      {/* Faint radial */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(232,0,45,0.04), transparent 70%)",
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(56px,8vw,100px) clamp(16px,5vw,24px) clamp(56px,8vw,100px)" }}>

        {/* ── Section header ── */}
        <div style={{ marginBottom: "clamp(36px,5vw,56px)" }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 12 }}
          >
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "clamp(8px,1.2vw,10px)",
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "rgba(232,0,45,0.6)",
            }}>
              {/* Safely use sectionNum/sectionLabel if they exist, or fallback */}
              {(TEAM as any).sectionNum ?? "03"} // {(TEAM as any).sectionLabel ?? "TEAM"}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(40px,7vw,84px)",
              letterSpacing: "-0.03em",
              lineHeight: 0.92,
              color: "#F0EDE8",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            {(TEAM as any).title ?? "Steering\nCrew"}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "clamp(10px,1.3vw,12px)",
              color: "rgba(255,255,255,0.28)",
              marginTop: 16,
              maxWidth: 400,
              lineHeight: 1.75,
            }}
          >
            {(TEAM as any).subtitle ?? "The minds behind the machine — meet the organizers making HackDays 2026 happen."}
          </motion.p>
        </div>

        {/* ── Cards grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, minmax(clamp(200px, 28vw, 280px), 1fr))`,
          gap: "clamp(14px,2.5vw,24px)",
        }}>
          {TEAM.members.map((member, i) => (
            <CrewCard
              key={member.name}
              member={member}
              index={i}
              accent={ACCENTS[i % ACCENTS.length]}
            />
          ))}
        </div>

        <StatStrip />
      </div>

      {/* Bottom ticker */}
      <PitlaneTicker />
    </section>
  );
}