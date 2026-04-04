"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { FAQ } from "@/lib/constants";

/* ─────────────────────────────────────────────────────────────
   TERMINAL CURSOR
───────────────────────────────────────────────────────────── */
function Cursor({ active }: { active: boolean }) {
  return (
    <motion.span
      style={{
        display: "inline-block",
        width: 7, height: 14,
        background: active ? "#E8002D" : "transparent",
        marginLeft: 4,
        verticalAlign: "middle",
      }}
      animate={active ? { opacity: [1, 0, 1] } : { opacity: 0 }}
      transition={{ duration: 0.75, repeat: Infinity }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   ACCORDION ITEM
───────────────────────────────────────────────────────────── */
function Item({
  item, isOpen, onToggle, index,
}: {
  item: typeof FAQ.items[0];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", position: "relative" }}
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.07, duration: 0.4 }}
    >
      {/* Active left bar */}
      {isOpen && (
        <motion.div
          layoutId="faq-bar"
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
            background: "#E8002D",
            boxShadow: "0 0 10px rgba(232,0,45,0.6)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      {/* Question button */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "18px 20px 18px 24px",
          background: isOpen ? "rgba(232,0,45,0.03)" : "transparent",
          border: "none",
          cursor: "none",
          textAlign: "left",
          transition: "background 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: isOpen ? "#E8002D" : "rgba(255,255,255,0.2)",
            letterSpacing: "0.2em",
            flexShrink: 0,
          }}>
            {item.id}
          </span>
          <div style={{
            width: 1, height: 18, flexShrink: 0,
            background: isOpen ? "#E8002D" : "rgba(255,255,255,0.1)",
          }} />
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 22,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: isOpen ? "#F0EDE8" : "rgba(240,237,232,0.6)",
            transition: "color 0.2s",
          }}>
            {item.question}
          </span>
        </div>

        {/* Toggle icon */}
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.22 }}
          style={{
            flexShrink: 0,
            width: 28, height: 28,
            border: `1px solid ${isOpen ? "#E8002D" : "rgba(255,255,255,0.12)"}`,
            background: isOpen ? "rgba(232,0,45,0.1)" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
            transition: "border-color 0.2s, background 0.2s",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <line x1="5" y1="0" x2="5" y2="10" stroke={isOpen ? "#E8002D" : "white"} strokeWidth="1.5" />
            <line x1="0" y1="5" x2="10" y2="5" stroke={isOpen ? "#E8002D" : "white"} strokeWidth="1.5" />
          </svg>
        </motion.div>
      </button>

      {/* Answer panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 20px 20px 24px" }}>
              <div style={{
                background: "#080808",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "16px 18px",
                clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
              }}>
                {/* Terminal header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  paddingBottom: 10, marginBottom: 10,
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#E8002D" }}>race-control</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.2)" }}>@faq:~$</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.2)" }}>query --id={item.id}</span>
                  <Cursor active={true} />
                </div>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "rgba(240,237,232,0.55)", lineHeight: 1.75 }}>
                  <span style={{ color: "rgba(255,255,255,0.2)", marginRight: 8 }}>&gt;</span>
                  {item.answer}
                </p>
                <div style={{
                  marginTop: 12, paddingTop: 10,
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.15)", letterSpacing: "0.25em", textTransform: "uppercase" }}>
                    STATUS: RESOLVED
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION EXPORT
───────────────────────────────────────────────────────────── */
export function RaceControlFAQ() {
  const [openId, setOpenId] = useState<string>("01");

  return (
    <section
      id="faq"
      style={{
        position: "relative",
        padding: "100px 0",
        background: "linear-gradient(180deg, #070707 0%, #030303 100%)",
        overflow: "hidden",
      }}
    >
      {/* CRT scanlines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.02,
        backgroundImage: "repeating-linear-gradient(0deg, rgba(232,0,45,0.5) 0px, transparent 1px, transparent 3px)",
        backgroundSize: "100% 4px",
      }} />

      {/* Side vertical text */}
      <div style={{
        position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      }}
        className="hidden-mobile"
      >
        <div style={{ width: 1, height: 80, background: "linear-gradient(to bottom, transparent, rgba(232,0,45,0.3))" }} />
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 8,
          color: "rgba(232,0,45,0.3)", letterSpacing: "0.4em", textTransform: "uppercase",
          writingMode: "vertical-rl", transform: "rotate(180deg)",
        }}>RACE CONTROL CHANNEL</span>
        <div style={{ width: 1, height: 80, background: "linear-gradient(to top, transparent, rgba(232,0,45,0.3))" }} />
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 52 }}>
          <div className="section-eyebrow">
            {FAQ.sectionNum} // {FAQ.sectionLabel}
          </div>
          <h2 className="section-title" style={{ fontSize: "clamp(44px, 6.5vw, 82px)" }}>
            {FAQ.title}
          </h2>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
            color: "var(--ghost, #555)", marginTop: 14, lineHeight: 1.75,
          }}>
            Tap any channel to open the frequency.
          </p>
        </div>

        {/* FAQ terminal container */}
        <div style={{
          border: "1px solid rgba(255,255,255,0.07)",
          background: "#0a0a0a",
          overflow: "hidden",
          clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))",
        }}>
          {/* Terminal top bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 18px",
            background: "#111",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {["#FF3B00", "#FFF200", "#22c55e"].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }} />
              ))}
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
                color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", marginLeft: 8,
              }}>race-control.faq — terminal</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.25em", textTransform: "uppercase" }}>
                LIVE
              </span>
            </div>
          </div>

          {/* Items */}
          {FAQ.items.map((item, i) => (
            <Item
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => setOpenId(prev => prev === item.id ? "" : item.id)}
              index={i}
            />
          ))}

          {/* Bottom prompt */}
          <div style={{
            padding: "10px 18px",
            background: "#0d0d0d",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#E8002D" }}>race-control</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.2)" }}>@faq:~$</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.15)" }}>
              {FAQ.items.length} queries indexed — {FAQ.items.length} resolved
            </span>
            <Cursor active={true} />
          </div>
        </div>

        {/* Help CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            marginTop: 24,
            padding: "18px 22px",
            border: "1px solid rgba(232,0,45,0.15)",
            background: "rgba(232,0,45,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#F0EDE8", letterSpacing: "0.07em" }}>
              Still have questions?
            </p>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>
              Open a direct comms channel with the race director.
            </p>
          </div>
          <a
            href="mailto:hackdays@acm.org"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#000",
              background: "#E8002D",
              padding: "11px 24px",
              textDecoration: "none",
              fontWeight: 700,
              display: "inline-block",
              clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
              flexShrink: 0,
            }}
          >
            RADIO IN →
          </a>
        </motion.div>
      </div>
    </section>
  );
}