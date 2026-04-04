"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FOOTER, NAV_LINKS, HERO, SITE_META } from "@/lib/constants";

/* ─────────────────────────────────────────────────────────────
   CHECKERED STRIP
───────────────────────────────────────────────────────────── */
function CheckeredStrip() {
  const COLS = 36;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS}, 1fr)`, width: "100%", height: 32, overflow: "hidden" }}>
      {Array.from({ length: COLS * 2 }).map((_, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        return (
          <motion.div
            key={i}
            style={{
              height: 16,
              background: (col + row) % 2 === 0 ? "rgba(255,255,255,0.07)" : "transparent",
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: col * 0.012, duration: 0.25 }}
          />
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MINI COUNTDOWN
───────────────────────────────────────────────────────────── */
function MiniCountdown() {
  const target = new Date(HERO.targetDate).getTime();
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return;
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000)  / 60000),
        s: Math.floor((diff % 60000)    / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { v: t.d, l: "D" },
    { v: t.h, l: "H" },
    { v: t.m, l: "M" },
    { v: t.s, l: "S" },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {units.map(({ v, l }, i) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ textAlign: "center" }}>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 28,
              color: "#E8002D",
              textShadow: "0 0 12px rgba(232,0,45,0.6)",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.02em",
            }}>
              {String(v).padStart(2, "0")}
            </span>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, color: "rgba(255,255,255,0.25)", letterSpacing: "0.25em", textTransform: "uppercase", lineHeight: 1 }}>
              {l}
            </p>
          </div>
          {i < 3 && (
            <motion.span
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, color: "rgba(232,0,45,0.3)", paddingBottom: 12 }}
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >:</motion.span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SCROLL TO TOP
───────────────────────────────────────────────────────────── */
function ScrollTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        width: 40, height: 40,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "none",
        cursor: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        clipPath: "polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)",
        transition: "border-color 0.2s",
        color: "rgba(255,255,255,0.4)",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(232,0,45,0.6)"; (e.currentTarget as HTMLButtonElement).style.color = "#E8002D"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"; }}
      aria-label="Scroll to top"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 10V2M2 6L6 2L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   MARQUEE
───────────────────────────────────────────────────────────── */
function FooterMarquee() {
  return (
    <div style={{
      overflow: "hidden",
      borderTop: "1px solid rgba(255,255,255,0.04)",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      padding: "14px 0",
      margin: "48px 0",
    }}>
      <motion.div
        style={{ display: "flex", gap: 0, whiteSpace: "nowrap" }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 48,
            letterSpacing: "0.25em",
            paddingRight: "2em",
            color: i % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(232,0,45,0.08)",
          }}>
            HACKDAYS 2026 ✦ BUILD FAST ✦ RACE HARD ✦
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION EXPORT
───────────────────────────────────────────────────────────── */
export function FinishLineFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const inView    = useInView(footerRef, { once: true, margin: "-80px" });

  const scrollTo = (href: string) => {
    document.getElementById(href.replace("#", ""))?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      ref={footerRef}
      id="footer"
      style={{ position: "relative", background: "#020202", overflow: "hidden" }}
    >
      <CheckeredStrip />

      {/* Ghost FINISH text */}
      <div style={{
        position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "clamp(80px, 16vw, 180px)",
        letterSpacing: "0.08em",
        color: "transparent",
        WebkitTextStroke: "1px rgba(255,255,255,0.025)",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        lineHeight: 1,
        bottom: "-0.08em",
      } as React.CSSProperties}>
        FINISH
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 32px", position: "relative" }}>

        {/* TOP: 3 columns */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 40,
          marginBottom: 0,
        }}
          className="footer-grid"
        >
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" stroke="#E8002D" strokeWidth="1.5" fill="rgba(232,0,45,0.08)" />
                <text x="14" y="18" textAnchor="middle" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 10, fill: "#E8002D", letterSpacing: "0.05em" }}>HD</text>
              </svg>
              <div>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.1em", color: "#F0EDE8" }}>HACKDAYS</p>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "#FFF200", letterSpacing: "0.3em", lineHeight: 1 }}>'26 EDITION</p>
              </div>
            </div>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.8, maxWidth: 220, marginBottom: 16 }}>
              {FOOTER.ctaHeading}
            </p>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "rgba(232,0,45,0.6)", lineHeight: 1.8, maxWidth: 220 }}>
              {FOOTER.ctaAccent}
            </p>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              marginTop: 16, padding: "6px 12px",
              border: "1px solid rgba(255,255,255,0.06)",
              background: "#0a0a0a",
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#E8002D" }} />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                {SITE_META.organizer}
              </span>
            </div>
          </motion.div>

          {/* Nav */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 20 }}>
              Navigation
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {NAV_LINKS.map((link, i) => (
                <motion.li key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <button
                    onClick={() => scrollTo(link.href)}
                    style={{
                      background: "none", border: "none", cursor: "none",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      color: "rgba(240,237,232,0.4)",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      display: "flex", alignItems: "center", gap: 10,
                      transition: "color 0.2s",
                      padding: 0,
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "#F0EDE8"}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(240,237,232,0.4)"}
                  >
                    <span style={{ width: 0, height: 1, background: "#E8002D", transition: "width 0.2s", display: "inline-block" }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.width = "16px"; }}
                    />
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Countdown + links */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 14 }}>
              Time to Lights Out
            </p>
            <div style={{
              padding: "14px 16px",
              border: "1px solid rgba(255,255,255,0.06)",
              background: "#080808",
              marginBottom: 24,
              clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
            }}>
              <MiniCountdown />
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 6, letterSpacing: "0.1em" }}>
                April 18, 2026 · 09:30 IST
              </p>
            </div>

            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 12 }}>
              Links
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FOOTER.links.map(link => (
                <a key={link.name} href={link.url}
                  target={link.url.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: "rgba(240,237,232,0.35)",
                    letterSpacing: "0.15em",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#F0EDE8"}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,237,232,0.35)"}
                >
                  {link.name} →
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Marquee */}
        <FooterMarquee />

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.05)",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.18)", letterSpacing: "0.15em" }}>
            © 2026 {FOOTER.credit}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <motion.div
                style={{ width: 5, height: 5, borderRadius: "50%", background: "#E8002D" }}
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.25em", textTransform: "uppercase" }}>
                Systems Nominal
              </span>
            </div>
            <ScrollTop />
          </div>
        </motion.div>
      </div>

      {/* Bottom glow line */}
      <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg, transparent, rgba(232,0,45,0.35), transparent)" }} />

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}