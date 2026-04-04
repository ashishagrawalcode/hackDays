"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SITE_DATA } from "@/lib/constants";

/* ─────────────────────────────────────────────
   TIMELINE DATA — pulled from constants or defined here
   as a fallback until you add it to constants.ts
───────────────────────────────────────────── */
const TIMELINE_ITEMS = (SITE_DATA as any).timeline ?? [
  {
    id: "01",
    phase: "QUALI",
    time: "Day 0 — April 17",
    title: "Registration & Grid Formation",
    desc: "Teams lock in, submit their domains, and receive their pit garage assignments. Check-in opens at 18:00. Opening ceremony at 20:00.",
    tag: "PRE-RACE",
    accent: "#39FF14",
  },
  {
    id: "02",
    phase: "LAP 1",
    time: "Day 1 — April 18, 10:00",
    title: "Lights Out — Hack Begins",
    desc: "The green flag drops. 24 hours on the clock. Teams sprint to their first prototype. Mentor pit-stops open at 12:00.",
    tag: "RACE START",
    accent: "#FFB800",
  },
  {
    id: "03",
    phase: "LAP 12",
    time: "Day 1 — April 18, 22:00",
    title: "Midnight Strategy Debrief",
    desc: "Mid-race check-in with mentors. Progress review, pivot decisions, technical deep-dives. Fuel stations (food) open all night.",
    tag: "PIT WINDOW",
    accent: "#00E5FF",
  },
  {
    id: "04",
    phase: "LAP 23",
    time: "Day 2 — April 19, 08:00",
    title: "Final Lap — Polish Sprint",
    desc: "Last 2 hours. Freeze features, harden your demo, prepare your pitch deck. Submission portal opens at 09:30.",
    tag: "FINAL STINT",
    accent: "#FF3B00",
  },
  {
    id: "05",
    phase: "FINISH",
    time: "Day 2 — April 19, 11:00",
    title: "Checkered Flag — Judging & Awards",
    desc: "Live presentations to judges. Best-in-class awards. Prize distribution. Top 3 teams take the podium for ₹60,000 in total prizes.",
    tag: "PODIUM",
    accent: "#39FF14",
  },
];

/* ─────────────────────────────────────────────
   CONNECTOR LINE between cards
───────────────────────────────────────────── */
function ConnectorLine({ accent }: { accent: string }) {
  return (
    <div className="hidden lg:flex flex-col items-center w-px mx-auto" style={{ height: 64 }}>
      <motion.div
        className="w-px flex-1"
        style={{ background: `linear-gradient(to bottom, ${accent}88, transparent)` }}
        initial={{ scaleY: 0, originY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   INDIVIDUAL TIMELINE CARD
───────────────────────────────────────────── */
interface TimelineItem {
  id: string;
  phase: string;
  time: string;
  title: string;
  desc: string;
  tag: string;
  accent: string;
}

function TimelineCard({ item, index }: { item: TimelineItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      className="relative grid lg:grid-cols-[1fr_auto_1fr] gap-0 items-center"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      {/* LEFT CONTENT — even items show card, odd items show nothing */}
      <div className={`hidden lg:block ${isEven ? "" : ""}`}>
        {isEven ? (
          <CardContent item={item} align="right" isInView={isInView} index={index} />
        ) : (
          <div />
        )}
      </div>

      {/* CENTER — phase badge + vertical track */}
      <div className="flex flex-col items-center relative z-10">
        {/* Phase badge */}
        <motion.div
          className="relative flex items-center justify-center w-16 h-16 border-2 font-mono text-xs font-bold tracking-widest"
          style={{
            borderColor: item.accent,
            color: item.accent,
            clipPath: "polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)",
            background: "#0a0a0a",
            boxShadow: `0 0 20px ${item.accent}40, inset 0 0 20px ${item.accent}10`,
          }}
          initial={{ scale: 0, rotate: -20 }}
          animate={isInView ? { scale: 1, rotate: 0 } : {}}
          transition={{ delay: index * 0.1 + 0.15, type: "spring", stiffness: 200 }}
        >
          <span className="text-[10px]">{item.phase}</span>

          {/* Pulsing glow ring */}
          <motion.div
            className="absolute inset-0"
            style={{ borderColor: item.accent, border: `1px solid ${item.accent}` }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
          />
        </motion.div>
      </div>

      {/* RIGHT CONTENT — odd items show card, even items show nothing */}
      <div className={`hidden lg:block`}>
        {!isEven ? (
          <CardContent item={item} align="left" isInView={isInView} index={index} />
        ) : (
          <div />
        )}
      </div>

      {/* MOBILE — always show card below badge */}
      <div className="lg:hidden col-span-full mt-4 ml-8">
        <CardContent item={item} align="left" isInView={isInView} index={index} />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   CARD CONTENT
───────────────────────────────────────────── */
function CardContent({
  item,
  align,
  isInView,
  index,
}: {
  item: TimelineItem;
  align: "left" | "right";
  isInView: boolean;
  index: number;
}) {
  return (
    <motion.div
      className={`group relative border border-white/8 bg-[#0f0f0f] overflow-hidden cursor-default
        ${align === "right" ? "ml-auto mr-8" : "ml-8 mr-auto"} max-w-sm w-full`}
      style={{
        clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
      }}
      initial={{ x: align === "right" ? 60 : -60, opacity: 0 }}
      animate={isInView ? { x: 0, opacity: 1 } : {}}
      transition={{ delay: index * 0.1 + 0.2, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ borderColor: item.accent + "60" }}
    >
      {/* Left accent bar */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: item.accent }}
        initial={{ scaleY: 0 }}
        animate={isInView ? { scaleY: 1 } : {}}
        transition={{ delay: index * 0.1 + 0.35, duration: 0.4 }}
      />

      {/* Hover glow sweep */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${item.accent}08 0%, transparent 60%)`,
        }}
      />

      <div className="p-5 pl-6">
        {/* Tag + ID row */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="font-mono text-[10px] font-bold tracking-[0.2em] px-2 py-1"
            style={{
              color: item.accent,
              background: `${item.accent}15`,
              border: `1px solid ${item.accent}30`,
            }}
          >
            {item.tag}
          </span>
          <span className="font-mono text-[11px] text-white/25 tracking-widest">#{item.id}</span>
        </div>

        {/* Time */}
        <p className="font-mono text-[11px] text-white/40 tracking-wider mb-2 uppercase">
          {item.time}
        </p>

        {/* Title */}
        <h3 className="font-display text-xl text-white mb-2 leading-tight tracking-wide uppercase">
          {item.title}
        </h3>

        {/* Divider */}
        <div
          className="w-8 h-px mb-3"
          style={{ background: `linear-gradient(to right, ${item.accent}, transparent)` }}
        />

        {/* Description */}
        <p className="font-mono text-[12px] text-white/55 leading-relaxed">{item.desc}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   VERTICAL TRACK LINE (desktop center spine)
───────────────────────────────────────────── */
function TrackSpine() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start center", "end center"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      ref={ref}
      className="absolute hidden lg:block left-1/2 -translate-x-1/2 top-0 bottom-0 w-px"
      style={{ background: "rgba(255,255,255,0.06)" }}
    >
      <motion.div
        className="absolute top-0 left-0 right-0 origin-top"
        style={{
          scaleY,
          background: "linear-gradient(to bottom, #39FF14, #FFB800, #00E5FF, #FF3B00)",
          height: "100%",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION EXPORT
───────────────────────────────────────────── */
export function RaceTimeline() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="timeline"
      className="relative py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #050505 0%, #0a0a0a 50%, #050505 100%)" }}
    >
      {/* Background grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(57,255,20,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(57,255,20,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(57,255,20,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <SectionTitle label="Race Schedule" num="04" title="THE RACE TIMELINE" />
          <p className="font-mono text-sm text-white/40 mt-4 max-w-lg mx-auto leading-relaxed">
            24 hours. 5 phases. Zero shortcuts. Here&apos;s every lap of the race from lights-out to podium.
          </p>
        </div>

        {/* Timeline track */}
        <div className="relative">
          <TrackSpine />

          <div className="flex flex-col gap-0">
            {TIMELINE_ITEMS.map((item: any, i: number) => (
              <div key={item?.id || `timeline-item-${i}`}>
                <TimelineCard item={item} index={i} />
                {i < TIMELINE_ITEMS.length - 1 && (
                  <div className="hidden lg:flex justify-center py-4">
                    <ConnectorLine accent={TIMELINE_ITEMS[i + 1].accent} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA strip */}
        <motion.div
          className="mt-20 border border-white/8 p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            background: "linear-gradient(135deg, #0f0f0f, #161616)",
            clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <p className="font-mono text-xs text-white/40 uppercase tracking-widest mb-1">Full Schedule</p>
            <p className="font-display text-2xl text-white tracking-widest">ALL TIMES ARE IST (UTC +5:30)</p>
          </div>
          <div className="flex items-center gap-2">
            {["#39FF14", "#FFB800", "#00E5FF", "#FF3B00"].map((c) => (
              <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
            ))}
            <span className="font-mono text-xs text-white/30 ml-2 tracking-widest">APRIL 17–19</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}