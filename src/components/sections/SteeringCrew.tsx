"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { TEAM } from "@/lib/constants";

const ACCENTS = ["#E8002D", "#FFF200", "#00D2FF", "#FF6B00", "#E8002D", "#FFF200"];

/* ─────────────────────────────────────────────────────────────
   PHOTO AVATAR — real photo with geometric overlay
───────────────────────────────────────────────────────────── */
function Avatar({ photo, name, accent }: { photo: string; name: string; accent: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div style={{
      position: "relative",
      width: "100%",
      aspectRatio: "1",
      overflow: "hidden",
      background: `radial-gradient(ellipse at 30% 30%, ${accent}18, #080808)`,
    }}>
      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.08,
        backgroundImage: `linear-gradient(${accent}60 1px, transparent 1px), linear-gradient(90deg, ${accent}60 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }} />

      {/* SVG decorations */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="100" y2="100" stroke={accent} strokeWidth="0.3" opacity="0.2" />
        <circle cx="50" cy="50" r="34" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.18" />
        <circle cx="50" cy="50" r="20" stroke={accent} strokeWidth="0.4" fill="none" opacity="0.1" />
      </svg>

      {/* Photo or initials */}
      {photo && !imgFailed ? (
        <img
          src={photo}
          alt={name}
          onError={() => setImgFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 52,
            color: accent,
            textShadow: `0 0 30px ${accent}80`,
            letterSpacing: "0.1em",
          }}>{initials}</span>
        </div>
      )}

      {/* Corner brackets */}
      {[
        { top: 0, left: 0, borderTop: `2px solid ${accent}60`, borderLeft: `2px solid ${accent}60` },
        { top: 0, right: 0, borderTop: `2px solid ${accent}60`, borderRight: `2px solid ${accent}60` },
        { bottom: 0, left: 0, borderBottom: `2px solid ${accent}60`, borderLeft: `2px solid ${accent}60` },
        { bottom: 0, right: 0, borderBottom: `2px solid ${accent}60`, borderRight: `2px solid ${accent}60` },
      ].map((s, i) => (
        <div key={i} style={{ position: "absolute", width: 20, height: 20, ...s }} />
      ))}

      {/* Scan line */}
      <motion.div
        style={{
          position: "absolute", left: 0, right: 0, height: "40%",
          background: `linear-gradient(180deg, transparent, ${accent}0a, transparent)`,
          pointerEvents: "none",
        }}
        animate={{ y: ["-100%", "300%"] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CREW CARD — 3D flip
───────────────────────────────────────────────────────────── */
function CrewCard({ member, index, accent }: {
  member: { name: string; role: string; photo: string };
  index: number;
  accent: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      style={{ perspective: "1000px" }}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        style={{ transformStyle: "preserve-3d", cursor: "pointer", position: "relative", width: "100%" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        onClick={() => setFlipped(f => !f)}
      >
        {/* FRONT */}
        <div style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          border: "1px solid rgba(255,255,255,0.07)",
          overflow: "hidden",
          clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)",
        }}>
          <Avatar photo={member.photo} name={member.name} accent={accent} />
          <div style={{ background: "#0d0d0d", padding: "16px 18px", position: "relative" }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, ${accent}, transparent)`,
            }} />
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#F0EDE8", letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1.1 }}>
              {member.name}
            </h3>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: accent, marginTop: 4 }}>
              {member.role}
            </p>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.2)", marginTop: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              TAP FOR PROFILE →
            </p>
            {/* Index */}
            <div style={{
              position: "absolute", top: 14, right: 16,
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
              color: `${accent}40`, letterSpacing: "0.15em",
            }}>
              #{String(index + 1).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* BACK */}
        <div style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          position: "absolute", inset: 0,
          border: `1px solid ${accent}35`,
          background: "linear-gradient(135deg, #0e0e0e, #161616)",
          clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ height: 2, background: accent }} />
          <div style={{ flex: 1, padding: "20px 18px", display: "flex", flexDirection: "column" }}>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: accent, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>
              CREW FILE
            </p>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "#F0EDE8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {member.name}
            </h3>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
              {member.role}
            </p>
            <div style={{ height: 1, margin: "16px 0", background: `linear-gradient(90deg, ${accent}50, transparent)` }} />
            {/* Geometric accent */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <polygon points="32,4 60,20 60,44 32,60 4,44 4,20" stroke={accent} strokeWidth="1" fill={`${accent}08`} />
                <polygon points="32,14 50,24 50,40 32,50 14,40 14,24" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.5" />
                <text x="32" y="36" textAnchor="middle"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, fill: accent, letterSpacing: "0.05em" }}>
                  {member.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </text>
              </svg>
            </div>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.18)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 12 }}>
              ← TAP TO FLIP BACK
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION EXPORT — id="team" matches NAV_LINKS
───────────────────────────────────────────────────────────── */
export function SteeringCrew() {
  return (
    <section
      id="team"         // ← must match NAV_LINKS href="#team"
      style={{
        position: "relative",
        padding: "100px 0",
        background: "#030303",
        overflow: "hidden",
      }}
    >
      {/* Diagonal stripe accents */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: 220, height: 220,
        background: "repeating-linear-gradient(-45deg, rgba(232,0,45,0.04), rgba(232,0,45,0.04) 1px, transparent 1px, transparent 14px)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, width: 160, height: 160,
        background: "repeating-linear-gradient(-45deg, rgba(255,242,0,0.03), rgba(255,242,0,0.03) 1px, transparent 1px, transparent 14px)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <div className="section-eyebrow">
            {TEAM.sectionNum} // {TEAM.sectionLabel}
          </div>
          <h2 className="section-title" style={{ fontSize: "clamp(48px, 7vw, 88px)" }}>
            {TEAM.title}
          </h2>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            color: "var(--ghost, #555)",
            marginTop: 14,
            maxWidth: 420,
            lineHeight: 1.75,
          }}>
            {TEAM.subtitle}
          </p>
        </div>

        {/* Cards grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(TEAM.members.length, 3)}, 1fr)`,
          gap: 24,
          maxWidth: TEAM.members.length <= 3 ? 800 : "100%",
        }}>
          {TEAM.members.map((member, i) => (
            <CrewCard key={member.name} member={member} index={i} accent={ACCENTS[i % ACCENTS.length]} />
          ))}
        </div>

        {/* Stat strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            border: "1px solid rgba(255,255,255,0.06)",
            background: "#080808",
            overflow: "hidden",
          }}
        >
          {[
            { label: "Organizers",  value: String(TEAM.members.length), accent: "#E8002D" },
            { label: "Combined Roles", value: String(new Set(TEAM.members.map(m => m.role)).size), accent: "#FFF200" },
            { label: "Event Hours", value: "24+",                        accent: "#00D2FF" },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: "24px 20px",
              textAlign: "center",
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.05)" : undefined,
            }}>
              <p style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 44,
                color: stat.accent,
                textShadow: `0 0 18px ${stat.accent}60`,
                letterSpacing: "0.05em",
              }}>{stat.value}</p>
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                color: "rgba(255,255,255,0.25)",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                marginTop: 4,
              }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}