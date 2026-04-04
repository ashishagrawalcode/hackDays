"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SITE_DATA } from "@/lib/constants";

/* ─────────────────────────────────────────────
   FAQ DATA
───────────────────────────────────────────── */
const FAQ_ITEMS = (SITE_DATA as any).faq ?? [
  {
    id: "01",
    question: "Participant Eligibility",
    answer:
      "Open to tech professionals and all students. Multidisciplinary teams are encouraged. Each team must have a minimum of 2 and maximum of 4 members. Solo participants will be assisted in team formation at the venue.",
  },
  {
    id: "02",
    question: "Registration Process",
    answer:
      "Online registration through Unstop. Individual and team submissions accepted. Register your team lead first, then invite team members via the portal. Confirmation email arrives within 24 hours of submission.",
  },
  {
    id: "03",
    question: "Awards & Recognition",
    answer:
      "Comprehensive prize structure including cash awards and other opportunities. Top three teams receive ₹30,000, ₹20,000, and ₹10,000 respectively. Special tracks for best UI/UX, best use of sponsor API, and most innovative concept carry additional prizes.",
  },
  {
    id: "04",
    question: "Evaluation Methodology",
    answer:
      "All evaluation modes will be offline with live demos to the jury. Teams are scored on technical complexity, innovation, real-world viability, and presentation quality. Each category is weighted equally.",
  },
  {
    id: "05",
    question: "Hardware & Infrastructure",
    answer:
      "High-speed Wi-Fi provided throughout the venue. Power strips at every station. Teams may bring their own hardware. Cloud credits from sponsors are available on request through the resource portal.",
  },
  {
    id: "06",
    question: "Food & Accommodation",
    answer:
      "Meals, snacks, and beverages are provided for the full 24-hour duration. Accommodation is not provided — teams are responsible for their own travel and stay. We recommend nearby hostels listed in the participant handbook.",
  },
];

/* ─────────────────────────────────────────────
   TERMINAL PROMPT ANIMATION
───────────────────────────────────────────── */
function TerminalPrompt({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono">
      <span style={{ color: "#39FF14" }}>race-control</span>
      <span className="text-white/30">@</span>
      <span style={{ color: "#FFB800" }}>faq</span>
      <span className="text-white/30">:~$</span>
      <motion.span
        className="inline-block w-[6px] h-[14px] ml-1 align-middle"
        style={{ background: active ? "#39FF14" : "transparent" }}
        animate={active ? { opacity: [1, 0, 1] } : { opacity: 0 }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </span>
  );
}

/* ─────────────────────────────────────────────
   ACCORDION ITEM
───────────────────────────────────────────── */
interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

function AccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      className="border-b border-white/8 last:border-b-0"
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      {/* Question row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 px-6 text-left group transition-colors duration-200"
        style={{
          background: isOpen ? "rgba(57,255,20,0.04)" : "transparent",
        }}
      >
        {/* Left — ID + question */}
        <div className="flex items-center gap-4 min-w-0">
          <span
            className="font-mono text-[10px] tracking-widest flex-shrink-0 w-8"
            style={{ color: isOpen ? "#39FF14" : "rgba(255,255,255,0.25)" }}
          >
            {item.id}
          </span>

          {/* Vertical separator */}
          <div
            className="w-px h-5 flex-shrink-0"
            style={{ background: isOpen ? "#39FF14" : "rgba(255,255,255,0.12)" }}
          />

          <span
            className="font-display text-lg tracking-wide uppercase transition-colors duration-200"
            style={{ color: isOpen ? "#ffffff" : "rgba(255,255,255,0.7)" }}
          >
            {item.question}
          </span>
        </div>

        {/* Right — toggle icon */}
        <motion.div
          className="flex-shrink-0 w-8 h-8 border flex items-center justify-center transition-colors duration-200"
          style={{
            borderColor: isOpen ? "#39FF14" : "rgba(255,255,255,0.15)",
            background: isOpen ? "rgba(57,255,20,0.1)" : "transparent",
            clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
          }}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <line x1="5" y1="0" x2="5" y2="10" stroke={isOpen ? "#39FF14" : "white"} strokeWidth="1.5" />
            <line x1="0" y1="5" x2="10" y2="5" stroke={isOpen ? "#39FF14" : "white"} strokeWidth="1.5" />
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
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 px-6">
              {/* Terminal-style answer block */}
              <div
                className="border border-white/8 p-4 font-mono"
                style={{
                  background: "#0a0a0a",
                  clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
                }}
              >
                {/* Terminal header */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/8">
                  <TerminalPrompt active={isOpen} />
                  <span className="font-mono text-xs text-white/30 ml-1">query --id={item.id}</span>
                </div>

                {/* Answer */}
                <motion.p
                  className="font-mono text-[12px] text-white/60 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <span className="text-white/25 mr-2">&gt;</span>
                  {item.answer}
                </motion.p>

                {/* Status line */}
                <div className="mt-3 pt-3 border-t border-white/8 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="font-mono text-[9px] text-white/20 tracking-widest">STATUS: RESOLVED</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left accent line when open */}
      {isOpen && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: "#39FF14" }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   SECTION EXPORT
───────────────────────────────────────────── */
export function RaceControlFAQ() {
  const [openId, setOpenId] = useState<string | null>("01");

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="relative py-32 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #050505 100%)" }}
    >
      {/* CRT scanline texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(57,255,20,0.5) 2px, rgba(57,255,20,0.5) 3px)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* Side decoration — vertical text */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-3">
        <div className="w-px h-24" style={{ background: "linear-gradient(to bottom, transparent, #39FF14)" }} />
        <span
          className="font-mono text-[9px] tracking-[0.4em] uppercase"
          style={{
            color: "rgba(57,255,20,0.4)",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
          }}
        >
          RACE CONTROL CHANNEL
        </span>
        <div className="w-px h-24" style={{ background: "linear-gradient(to top, transparent, #39FF14)" }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <SectionTitle label="Questions & Answers" num="06" title="RACE CONTROL" />
          <p className="font-mono text-sm text-white/40 mt-4 max-w-lg leading-relaxed">
            All incoming radio comms from teams. Tap any channel to open the frequency.
          </p>
        </div>

        {/* Main FAQ container */}
        <div
          className="border border-white/8 overflow-hidden"
          style={{
            background: "#0d0d0d",
            clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
          }}
        >
          {/* Top bar — like a terminal header */}
          <div
            className="flex items-center justify-between px-6 py-3 border-b border-white/8"
            style={{ background: "#161616" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: "#FF3B00" }} />
              <div className="w-2 h-2 rounded-full" style={{ background: "#FFB800" }} />
              <div className="w-2 h-2 rounded-full" style={{ background: "#39FF14" }} />
              <span className="font-mono text-[10px] text-white/25 ml-3 tracking-widest">
                race-control.faq — bash
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-mono text-[9px] text-white/25 tracking-widest">LIVE</span>
            </div>
          </div>

          {/* FAQ items */}
          <div>
            {FAQ_ITEMS.map((item: FAQItem, i: number) => (
              <div key={item.id} className="relative">
                <AccordionItem
                  item={item}
                  isOpen={openId === item.id}
                  onToggle={() => toggle(item.id)}
                  index={i}
                />
              </div>
            ))}
          </div>

          {/* Bottom prompt bar */}
          <div
            className="px-6 py-3 border-t border-white/8 flex items-center gap-3"
            style={{ background: "#111" }}
          >
            <TerminalPrompt active={true} />
            <span className="font-mono text-[11px] text-white/20">
              {FAQ_ITEMS.length} queries indexed — {FAQ_ITEMS.length} resolved
            </span>
          </div>
        </div>

        {/* Extra help block */}
        <motion.div
          className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border border-white/8"
          style={{
            background: "rgba(57,255,20,0.03)",
            borderColor: "rgba(57,255,20,0.15)",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p className="font-display text-lg text-white tracking-wide">Still have questions?</p>
            <p className="font-mono text-xs text-white/40 mt-1">
              Open a direct comms channel with the race director.
            </p>
          </div>
          <a
            href="mailto:hackdays@acm.org"
            className="font-mono text-xs tracking-widest px-6 py-3 border transition-all duration-200 flex-shrink-0 uppercase"
            style={{
              borderColor: "#39FF14",
              color: "#39FF14",
              background: "rgba(57,255,20,0.08)",
            }}
          >
            RADIO IN →
          </a>
        </motion.div>
      </div>
    </section>
  );
}