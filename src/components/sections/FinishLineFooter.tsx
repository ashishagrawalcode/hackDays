"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { SITE_DATA } from "@/lib/constants";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Timeline", href: "#timeline" },
  { label: "Sponsors", href: "#sponsors" },
  { label: "Crew", href: "#crew" },
  { label: "FAQ", href: "#faq" },
];

const SOCIAL_LINKS = [
  { label: "Twitter", href: "#", icon: "𝕏" },
  { label: "Instagram", href: "#", icon: "⬡" },
  { label: "LinkedIn", href: "#", icon: "in" },
  { label: "Discord", href: "#", icon: "◈" },
];

/* ─────────────────────────────────────────────
   CHECKERED FLAG HEADER
───────────────────────────────────────────── */
function CheckeredStrip() {
  const COLS = 32;
  const ROWS = 2;

  return (
    <div className="w-full overflow-hidden">
      <div
        className="grid h-8"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      >
        {Array.from({ length: COLS * ROWS }).map((_, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const isWhite = (col + row) % 2 === 0;
          return (
            <motion.div
              key={i}
              className="h-4"
              style={{ background: isWhite ? "rgba(255,255,255,0.08)" : "transparent" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (col * 0.015) + (row * 0.05), duration: 0.3 }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LIVE COUNTDOWN MINI
───────────────────────────────────────────── */
function MiniCountdown() {
  const target = new Date((SITE_DATA as any).timer?.targetDate ?? "2026-04-18T10:00:00").getTime();

  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { label: "D", value: timeLeft.d },
    { label: "H", value: timeLeft.h },
    { label: "M", value: timeLeft.m },
    { label: "S", value: timeLeft.s },
  ];

  return (
    <div className="flex items-center gap-3">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-1">
          <div
            className="font-display text-2xl leading-none tabular-nums"
            style={{ color: "#39FF14", textShadow: "0 0 12px rgba(57,255,20,0.6)" }}
          >
            {String(value).padStart(2, "0")}
          </div>
          <span className="font-mono text-[9px] text-white/30 tracking-widest self-end mb-0.5">
            {label}
          </span>
          {i < 3 && (
            <motion.span
              className="font-mono text-white/30 text-lg leading-none self-center"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              :
            </motion.span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LARGE TITLE MARQUEE
───────────────────────────────────────────── */
function FooterMarquee() {
  return (
    <div className="relative overflow-hidden border-y border-white/6 py-4 my-12">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="font-display text-5xl tracking-[0.3em] uppercase"
            style={{
              color: i % 2 === 0 ? "rgba(255,255,255,0.06)" : "rgba(57,255,20,0.1)",
            }}
          >
            HACKDAYS 2026 ✦ BUILD FAST ✦ RACE HARD ✦
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCROLL TO TOP BUTTON
───────────────────────────────────────────── */
function ScrollToTop() {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={handleClick}
      className="group relative w-12 h-12 border border-white/15 flex items-center justify-center transition-all duration-200 hover:border-[#39FF14] overflow-hidden"
      style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
      aria-label="Scroll to top"
    >
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "rgba(57,255,20,0.08)" }}
      />
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="relative z-10">
        <path
          d="M6 10V2M2 6L6 2L10 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:stroke-[#39FF14] transition-colors duration-200"
        />
      </svg>
    </button>
  );
}

/* ─────────────────────────────────────────────
   SECTION EXPORT
───────────────────────────────────────────── */
export function FinishLineFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["20px", "0px"]);

  return (
    <footer
      ref={footerRef}
      id="footer"
      className="relative overflow-hidden"
      style={{ background: "#040404" }}
    >
      {/* Checkered top strip */}
      <CheckeredStrip />

      {/* Parallax background element */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: bgY }}
      >
        {/* Large ghost text */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 font-display text-[clamp(100px,18vw,200px)] leading-none tracking-widest select-none pointer-events-none whitespace-nowrap"
          style={{
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.03)",
            bottom: "-0.1em",
          }}
        >
          FINISH
        </div>
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* TOP SECTION — Brand + countdown + socials */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
          {/* Brand block */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-5">
              {/* Logo mark */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 border-2 border-[#39FF14] flex items-center justify-center"
                  style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
                >
                  <span className="font-display text-sm text-[#39FF14]">HD</span>
                </div>
                <div>
                  <p className="font-display text-xl tracking-widest text-white uppercase">HackDays</p>
                  <p className="font-mono text-[9px] text-white/30 tracking-[0.3em] uppercase">2026 Edition</p>
                </div>
              </div>

              <p className="font-mono text-[12px] text-white/40 leading-relaxed max-w-xs">
                A 24-hour Formula-style hackathon by ACM Student Chapter. Build fast. Race hard. Ship bold.
              </p>
            </div>

            {/* Organizer badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-2 border border-white/8"
              style={{ background: "#0a0a0a" }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#39FF14" }} />
              <span className="font-mono text-[10px] text-white/40 tracking-widest uppercase">
                ACM Student Chapter
              </span>
            </div>
          </motion.div>

          {/* Nav links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase mb-5">
              Navigation
            </p>
            <ul className="space-y-3">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.05 }}
                >
                  <a
                    href={link.href}
                    className="group flex items-center gap-3 font-mono text-[13px] text-white/50 hover:text-white transition-colors duration-200"
                  >
                    <span
                      className="w-0 h-px transition-all duration-200 group-hover:w-4"
                      style={{ background: "#39FF14" }}
                    />
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Countdown + socials */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Countdown */}
            <div
              className="border border-white/8 p-4 mb-6"
              style={{
                background: "#0a0a0a",
                clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
              }}
            >
              <p className="font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase mb-3">
                Time to Lights Out
              </p>
              <MiniCountdown />
              <p className="font-mono text-[9px] text-white/20 mt-2">April 18, 2026 — 10:00 IST</p>
            </div>

            {/* Socials */}
            <p className="font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase mb-3">
              Follow the Race
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((s, i) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-10 h-10 border border-white/12 flex items-center justify-center font-mono text-xs text-white/40 hover:text-[#39FF14] hover:border-[#39FF14] transition-all duration-200"
                  style={{ clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)" }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* MARQUEE */}
        <FooterMarquee />

        {/* BOTTOM BAR */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {/* Left — copyright */}
          <div className="flex items-center gap-4">
            <p className="font-mono text-[10px] text-white/25 tracking-wider">
              © 2026 ACM Student Chapter — HackDays
            </p>
            <span className="text-white/10">|</span>
            <a href="#" className="font-mono text-[10px] text-white/25 hover:text-white/50 transition-colors duration-200 tracking-wider">
              Code of Conduct
            </a>
            <a href="#" className="font-mono text-[10px] text-white/25 hover:text-white/50 transition-colors duration-200 tracking-wider">
              Privacy
            </a>
          </div>

          {/* Right — scroll to top + status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#39FF14" }}
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="font-mono text-[9px] text-white/25 tracking-widest uppercase">
                Systems Nominal
              </span>
            </div>
            <ScrollToTop />
          </div>
        </motion.div>
      </div>

      {/* Absolute bottom line — subtle phosphor glow */}
      <div
        className="w-full h-px"
        style={{
          background: "linear-gradient(90deg, transparent, #39FF14, transparent)",
          opacity: 0.3,
        }}
      />
    </footer>
  );
}