"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { TIMELINE, TIMELINE_COLORS } from "@/lib/constants";
import type { TimelineEventType } from "@/lib/constants";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

/* ─────────────────────────────────────────────────────────────
   TRACK SVG PATH — F1-style circuit layout
   ViewBox: 0 0 520 420
───────────────────────────────────────────────────────────── */
const TRACK_D =
  "M 100,70 C 180,40 290,38 340,85 C 380,120 400,160 440,200 C 470,230 478,265 460,300 C 442,335 400,348 360,348 C 310,348 265,355 220,358 C 175,361 140,355 118,338 C 96,320 92,290 96,265 C 102,235 114,210 118,185 C 124,155 112,118 100,70 Z";

/* Map TIMELINE days+events onto track positions */
const TRACK_NODES = [
  { cx: 100,  cy: 70,  label: "CHECK IN",       accent: "#00D2FF" },
  { cx: 340,  cy: 85,  label: "HACK BEGINS",    accent: "#E8002D" },
  { cx: 460,  cy: 300, label: "MIDNIGHT",        accent: "#FFF200" },
  { cx: 220,  cy: 358, label: "FINAL SPRINT",   accent: "#FF6B00" },
  { cx: 100,  cy: 265, label: "JUDGING",         accent: "#E8002D" },
];

/* ─────────────────────────────────────────────────────────────
   LEGEND
───────────────────────────────────────────────────────────── */
function Legend() {
  const types: TimelineEventType[] = ["ceremony", "coding", "evaluation", "break"];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 48 }}>
      {types.map((type) => {
        const c = TIMELINE_COLORS[type];
        return (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: c.dot,
              boxShadow: `0 0 6px ${c.dot}`,
            }} />
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: "rgba(240,237,232,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}>{type}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SINGLE EVENT ROW
───────────────────────────────────────────────────────────── */
function EventRow({
  time, title, type, index,
}: {
  time: string; title: string; type: TimelineEventType; index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const c = TIMELINE_COLORS[type];

  return (
    <motion.div
      ref={ref}
      className="event-row-item"
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        paddingBottom: 14,
        marginBottom: 14,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Type dot */}
      <div style={{
        width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 5,
        background: c.dot,
        boxShadow: `0 0 6px ${c.dot}80`,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            color: c.dot,
            background: c.tag,
            border: `1px solid ${c.dot}30`,
            padding: "2px 7px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}>{type}</span>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
          }}>{time}</span>
        </div>
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: "rgba(240,237,232,0.7)",
          lineHeight: 1.5,
        }}>{title}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DAY CARD
───────────────────────────────────────────────────────────── */
function DayCard({ day, index }: { day: typeof TIMELINE.days[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        border: "1px solid rgba(255,255,255,0.07)",
        background: "#0d0d0d",
        overflow: "hidden",
        position: "relative",
        clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
      }}
    >
      {/* Top rainbow bar */}
      <div style={{ height: 3, background: "linear-gradient(90deg, #E8002D, #FFF200, #00D2FF, #E8002D)" }} />

      {/* Header */}
      <div style={{
        padding: "16px 20px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            letterSpacing: "0.35em",
            color: "rgba(255,255,255,0.25)",
            textTransform: "uppercase",
            marginBottom: 3,
          }}>{day.date}</p>
          <h3 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 28,
            letterSpacing: "0.1em",
            color: "#F0EDE8",
          }}>{day.day}</h3>
        </div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9,
          color: "rgba(232,0,45,0.6)",
          border: "1px solid rgba(232,0,45,0.2)",
          padding: "5px 12px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          clipPath: "polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)",
        }}>
          {day.events.length} EVENTS
        </div>
      </div>

      {/* Events */}
      <div style={{ padding: "16px 20px" }}>
        {day.events.map((ev, i) => (
          <EventRow key={i} time={ev.time} title={ev.title} type={ev.type} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SVG CIRCUIT MAP with GSAP car
───────────────────────────────────────────────────────────── */
function CircuitMap() {
  const svgRef      = useRef<SVGSVGElement>(null);
  const carRef      = useRef<SVGGElement>(null);
  const progressRef = useRef<SVGPathElement>(null);
  const sectionRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const car      = carRef.current;
    const progress = progressRef.current;
    const section  = sectionRef.current;
    const svg      = svgRef.current;
    if (!car || !progress || !section || !svg) return;

    // Get the track path for measurements
    const trackPath = svg.querySelector(".track-main") as SVGPathElement | null;
    if (!trackPath) return;

    const len = trackPath.getTotalLength();

    gsap.set(progress, {
      strokeDasharray: len,
      strokeDashoffset: len,
    });

    // Position car at start before animation
    const startPt = trackPath.getPointAtLength(0);
    gsap.set(car, { x: startPt.x - 14, y: startPt.y - 6 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 55%",
        end: "bottom 25%",
        scrub: 1.4,
      },
    });

    // Draw the progress trail
    tl.to(progress, { strokeDashoffset: 0, ease: "none" }, 0);

    // Drive the car along the path
    tl.to(car, {
      motionPath: {
        path: ".track-main",
        align: ".track-main",
        alignOrigin: [0.5, 0.5],
        autoRotate: 90,
      },
      ease: "none",
    }, 0);

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={sectionRef} style={{ position: "sticky", top: 80 }}>
      {/* Track label */}
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9,
        letterSpacing: "0.35em",
        textTransform: "uppercase",
        color: "rgba(232,0,45,0.5)",
        textAlign: "center",
        marginBottom: 12,
      }}>
        ◈ HACKDAYS CIRCUIT · APRIL 18–19
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 520 420"
        style={{ width: "100%", maxWidth: 380, display: "block", margin: "0 auto" }}
      >
        {/* Asphalt base — thick grey road */}
        <path
          className="track-main"
          d={TRACK_D}
          fill="none"
          stroke="#1c1c1c"
          strokeWidth="34"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Road surface — slightly lighter */}
        <path
          d={TRACK_D}
          fill="none"
          stroke="#131313"
          strokeWidth="28"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Centre dashed line */}
        <path
          d={TRACK_D}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
          strokeDasharray="10 14"
          strokeLinecap="round"
        />

        {/* Kerb / rumble strips — red/white alternating dashes on outside */}
        <path
          d={TRACK_D}
          fill="none"
          stroke="rgba(232,0,45,0.15)"
          strokeWidth="36"
          strokeDasharray="6 20"
          strokeLinecap="butt"
        />

        {/* GSAP-animated red progress trail */}
        <path
          ref={progressRef}
          d={TRACK_D}
          fill="none"
          stroke="#E8002D"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            filter: "drop-shadow(0 0 5px rgba(232,0,45,0.9)) drop-shadow(0 0 12px rgba(232,0,45,0.5))",
          }}
        />

        {/* DRS zone */}
        <path
          d="M 170,52 L 290,62"
          stroke="rgba(0,210,255,0.35)"
          strokeWidth="2.5"
          strokeDasharray="5 4"
        />
        <text x="195" y="46" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, fill: "rgba(0,210,255,0.45)", letterSpacing: "0.2em" }}>DRS</text>

        {/* Track name */}
        <text x="260" y="218" textAnchor="middle"
          style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, fill: "rgba(255,255,255,0.06)", letterSpacing: "0.25em", textTransform: "uppercase" }}>
          HACKDAYS CIRCUIT
        </text>

        {/* Event nodes */}
        {TRACK_NODES.map((node, i) => (
          <g key={i}>
            {/* Outer ring pulse */}
            <circle cx={node.cx} cy={node.cy} r={14} fill="none"
              stroke={node.accent} strokeWidth="0.8" opacity="0.25" />
            {/* Node circle */}
            <circle cx={node.cx} cy={node.cy} r={9}
              fill="#0d0d0d" stroke={node.accent} strokeWidth="1.5"
              style={{ filter: `drop-shadow(0 0 5px ${node.accent})` }}
            />
            {/* Inner dot */}
            <circle cx={node.cx} cy={node.cy} r={3.5} fill={node.accent} />
            {/* Label */}
            <text x={node.cx} y={node.cy + 22} textAnchor="middle"
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, fill: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>
              {node.label}
            </text>
          </g>
        ))}

        {/* START/FINISH checkers */}
        <g transform={`translate(${TRACK_NODES[0].cx - 14}, ${TRACK_NODES[0].cy - 32})`}>
          {[0,1,2,3,4,5].flatMap(col =>
            [0,1].map(row => (
              <rect key={`${col}-${row}`}
                x={col * 5} y={row * 5}
                width={5} height={5}
                fill={(col + row) % 2 === 0 ? "#fff" : "#000"}
                opacity={0.55}
              />
            ))
          )}
          <text x={14} y={20} textAnchor="middle"
            style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 7, fill: "rgba(255,255,255,0.4)", letterSpacing: "0.2em" }}>
            S/F
          </text>
        </g>

        {/* F1 CAR SVG — GSAP moves this */}
        <g ref={carRef}>
          <g transform="translate(-14, -6)">
            {/* Body */}
            <ellipse cx={14} cy={6} rx={13} ry={4.5} fill="#E8002D" />
            {/* Nose cone */}
            <polygon points="27,6 33,5.5 33,6.5" fill="#CC001A" />
            {/* Cockpit */}
            <ellipse cx={12} cy={4.5} rx={4} ry={2.2} fill="#111" />
            {/* Halo */}
            <path d="M 9,4.5 Q 14,2 19,4.5" fill="none" stroke="#444" strokeWidth="0.8" />
            {/* Front wing */}
            <rect x={26} y={8.5} width={7} height={1.5} rx={0.4} fill="#CC001A" />
            {/* Rear wing */}
            <rect x={1} y={3} width={5} height={1.5} rx={0.4} fill="#CC001A" />
            {/* Wheels */}
            <ellipse cx={6}  cy={9.5} rx={3}   ry={1.8} fill="#1a1a1a" stroke="#333" strokeWidth={0.4} />
            <ellipse cx={22} cy={9.5} rx={3}   ry={1.8} fill="#1a1a1a" stroke="#333" strokeWidth={0.4} />
            <ellipse cx={6}  cy={2.5} rx={3}   ry={1.8} fill="#1a1a1a" stroke="#333" strokeWidth={0.4} />
            <ellipse cx={22} cy={2.5} rx={3}   ry={1.8} fill="#1a1a1a" stroke="#333" strokeWidth={0.4} />
            {/* Engine glow */}
            <ellipse cx={14} cy={6} rx={18} ry={10} fill="rgba(232,0,45,0.08)" style={{ filter: "blur(4px)" }} />
          </g>
        </g>
      </svg>

      {/* Track stats */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 28,
        marginTop: 16,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 9,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.2)",
      }}>
        {["24H RACE", "5 PHASES", "APR 18–19"].map(t => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECTION EXPORT
───────────────────────────────────────────────────────────── */
export function RaceTimeline() {
  return (
    <section
      id="timeline"
      style={{
        position: "relative",
        padding: "100px 0 120px",
        background: "linear-gradient(180deg, #030303 0%, #070707 50%, #030303 100%)",
        overflow: "hidden",
      }}
    >
      {/* Faint grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(232,0,45,1) 1px, transparent 1px), linear-gradient(90deg, rgba(232,0,45,1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <div className="section-eyebrow">
            {TIMELINE.sectionNum} // {TIMELINE.sectionLabel}
          </div>
          <h2 className="section-title" style={{ fontSize: "clamp(52px, 8vw, 96px)" }}>
            THE RACE<br />TIMELINE
          </h2>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            color: "var(--ghost, #555)",
            lineHeight: 1.75,
            marginTop: 16,
            maxWidth: 380,
          }}>
            24 hours. Every phase from lights-out to podium.
          </p>
        </div>

        <Legend />

        {/* 3-column: cards | circuit | cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px 1fr",
          gap: 40,
          alignItems: "start",
        }}
          className="timeline-grid"
        >
          {/* LEFT: Day 1 */}
          <div>
            <DayCard day={TIMELINE.days[0]} index={0} />
          </div>

          {/* CENTER: Circuit map */}
          <CircuitMap />

          {/* RIGHT: Day 2 */}
          <div>
            <DayCard day={TIMELINE.days[1]} index={1} />
          </div>
        </div>

        {/* Mobile: stacked */}
        <div className="timeline-mobile" style={{ display: "none", flexDirection: "column", gap: 16, marginTop: 48 }}>
          {TIMELINE.days.map((day, i) => (
            <DayCard key={day.day} day={day} index={i} />
          ))}
        </div>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            marginTop: 64,
            padding: "20px 28px",
            border: "1px solid rgba(255,255,255,0.06)",
            background: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
          }}
        >
          <div>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 4 }}>
              Full Schedule
            </p>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#F0EDE8", letterSpacing: "0.1em" }}>
              ALL TIMES ARE IST (UTC +5:30)
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {["#E8002D", "#FFF200", "#00D2FF", "#FF6B00"].map(c => (
              <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
            ))}
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", marginLeft: 8 }}>
              APRIL 18–19
            </span>
          </div>
        </motion.div>
      </div>

      {/* Mobile responsive override — inline style can't do media queries so use a style tag */}
      <style>{`
        @media (max-width: 900px) {
          .timeline-grid { display: none !important; }
          .timeline-mobile { display: flex !important; }
        }
      `}</style>
    </section>
  );
}