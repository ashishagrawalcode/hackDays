"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ABOUT } from "@/lib/constants";

/* ─────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────── */
function StatCard({
  value, suffix, label, accent, delay = 0,
}: {
  value: string; suffix: string; label: string; accent: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay }}
      style={{
        position: "relative",
        padding: "20px 22px",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(10,10,10,0.75)",
        backdropFilter: "blur(8px)",
        overflow: "hidden",
        clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
      }}
    >
      {/* Accent top line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${accent}, transparent)`,
      }} />

      {/* Value */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(38px, 5vw, 58px)",
          color: "#F0EDE8",
          lineHeight: 1,
          letterSpacing: "0.02em",
        }}>{value}</span>
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(20px, 2.5vw, 30px)",
          color: accent,
          lineHeight: 1,
        }}>{suffix}</span>
      </div>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.3)",
      }}>{label}</span>

      {/* Ambient glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 0% 0%, ${accent}08, transparent 60%)`,
      }} />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DESCRIPTION — word-by-word reveal
───────────────────────────────────────────────────────────── */
function RevealDescription({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const words = text.split(" ");

  return (
    <p
      ref={ref}
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "clamp(12px, 1.3vw, 14px)",
        lineHeight: 1.9,
        color: "rgba(240,237,232,0.45)",
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.014, duration: 0.3 }}
          style={{ display: "inline-block", marginRight: "0.3em" }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION
───────────────────────────────────────────────────────────── */
export function AboutBrief() {
  const STAT_ACCENTS = ["#E8002D", "#FFF200", "#00D2FF"];

  return (
    <section
      id="about"
      style={{
        position: "relative",
        padding: "100px 0",
        /* Semi-transparent so the 3D car bleeds through */
        background: "linear-gradient(180deg, rgba(3,3,3,0.85) 0%, rgba(5,5,5,0.92) 100%)",
        backdropFilter: "blur(2px)",
        overflow: "hidden",
      }}
    >
      {/* Carbon fiber texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04,
        backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,1) 0px, rgba(255,255,255,1) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(-45deg, rgba(255,255,255,1) 0px, rgba(255,255,255,1) 1px, transparent 1px, transparent 8px)",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        {/* Section header */}
        <div style={{ marginBottom: 56 }}>
          <div className="section-eyebrow">
            {ABOUT.sectionNum} // {ABOUT.sectionLabel}
          </div>
          <h2 className="section-title" style={{ fontSize: "clamp(48px, 7vw, 88px)" }}>
            {ABOUT.title}
          </h2>
        </div>

        {/* Two-column layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: "60px",
          alignItems: "start",
        }}
          className="about-grid"
        >
          {/* LEFT: Description + quote */}
          <div>
            <RevealDescription text={ABOUT.description} />

            {/* Decorative quote */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.55 }}
              style={{
                marginTop: 32,
                paddingLeft: 20,
                borderLeft: "2px solid #E8002D",
              }}
            >
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                lineHeight: 1.9,
                fontStyle: "italic",
                color: "rgba(255,255,255,0.3)",
              }}>
                &ldquo;At the checkered flag, teams don&apos;t just ship projects &mdash;<br />
                they deliver bold, impact-driven solutions.&rdquo;
              </p>
            </motion.div>

            {/* Doc links */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.55, duration: 0.5 }}
              style={{ display: "flex", gap: 16, marginTop: 28, flexWrap: "wrap" }}
            >
              {ABOUT.links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 9,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: "rgba(232,0,45,0.6)",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#E8002D")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(232,0,45,0.6)")}
                >
                  {link.name} <ArrowUpRight size={10} />
                </a>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: Stats + CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ABOUT.stats.map((stat, i) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                accent={STAT_ACCENTS[i % STAT_ACCENTS.length]}
                delay={0.1 + i * 0.1}
              />
            ))}

            {/* Register CTA */}
            <motion.a
              href="https://unstop.com"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45, duration: 0.5 }}
              style={{
                marginTop: 4,
                padding: "18px 22px",
                background: "rgba(232,0,45,0.08)",
                border: "1px solid rgba(232,0,45,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textDecoration: "none",
                clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(232,0,45,0.15)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(232,0,45,0.5)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(232,0,45,0.08)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(232,0,45,0.25)";
              }}
            >
              <div>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(232,0,45,0.55)", marginBottom: 4 }}>
                  Join the Race
                </p>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#F0EDE8", letterSpacing: "0.07em" }}>
                  Register Now
                </p>
              </div>
              <ArrowUpRight size={20} color="#E8002D" />
            </motion.a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}