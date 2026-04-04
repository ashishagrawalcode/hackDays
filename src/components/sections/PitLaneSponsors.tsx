"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { SPONSORS } from "@/lib/constants";
import { SectionTitle } from "@/components/ui/SectionTitle";

// ── Individual sponsor card ──────────────────────────────────
function SponsorCard({
  name,
  desc,
  logo,
  index,
}: {
  name: string;
  desc: string;
  logo: string;
  index: number;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: (index % 6) * 0.07,
        ease: "easeOut",
      }}
      className="group relative overflow-hidden cursor-pointer"
      style={{
        background:
          "radial-gradient(circle at 20% 0%, rgba(57,255,20,0.06), transparent 50%), #111111",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-200"
        style={{
          background:
            "linear-gradient(180deg, var(--phosphor), rgba(57,255,20,0.3), transparent)",
          opacity: 0.4,
        }}
      />

      {/* Hover shimmer sweep */}
      <div
        className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 transition-all duration-700 group-hover:left-[120%]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
        }}
      />

      {/* Top glow on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--phosphor), transparent)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-5 flex flex-col gap-3">
        {/* Logo area */}
        <div
          className="flex items-center justify-center h-16 overflow-hidden"
          style={{
            clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            alt={`${name} logo`}
            className="max-h-10 max-w-full object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
            style={{ filter: "grayscale(30%)" }}
            onError={(e) => {
              // Fallback to text if logo not found
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <span
            className="hidden font-display text-lg tracking-widest text-white/30"
          >
            {name}
          </span>
        </div>

        {/* Name */}
        <h3
          className="font-display text-base tracking-[0.1em] uppercase text-white text-center transition-colors duration-150 group-hover:text-phosphor"
          style={{ fontSize: "clamp(12px, 1.5vw, 16px)" }}
        >
          {name}
        </h3>

        {/* Description */}
        <p
          className="font-mono text-[11px] leading-relaxed text-center"
          style={{ color: "#555" }}
        >
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

// ── Marquee strip ─────────────────────────────────────────────
function MarqueeStrip() {
  const names = SPONSORS.list.map((s) => s.name);
  const doubled = [...names, ...names]; // for infinite loop

  return (
    <div
      className="relative overflow-hidden py-3 border-t border-b my-12"
      style={{ borderColor: "rgba(255,255,255,0.04)" }}
    >
      {/* Fade edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, var(--void), transparent)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(270deg, var(--void), transparent)" }}
      />

      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((name, i) => (
          <span
            key={i}
            className="font-mono text-[9px] tracking-[0.3em] uppercase mx-6"
            style={{ color: "#2a2a2a" }}
          >
            {name}
            <span className="ml-6" style={{ color: "rgba(57,255,20,0.2)" }}>×</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function PitLaneSponsors() {
  return (
    <section
      id="sponsors"
      className="relative w-full py-20 sm:py-28 overflow-hidden"
      style={{ background: "var(--void)" }}
    >
      {/* Faint circuit traces decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute top-0 right-0 opacity-[0.04] w-[500px] h-[400px]"
          viewBox="0 0 500 400"
          fill="none"
        >
          <path
            d="M480 20 L480 80 Q480 100 460 100 L100 100 Q80 100 80 120 L80 200 Q80 220 100 220 L400 220 Q420 220 420 240 L420 380"
            stroke="#39FF14"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M500 60 L380 60 Q360 60 360 80 L360 160 Q360 180 340 180 L60 180 Q40 180 40 200 L40 380"
            stroke="#FFB800"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="480" cy="100" r="4" fill="#39FF14" />
          <circle cx="80" cy="220" r="4" fill="#39FF14" />
          <circle cx="420" cy="240" r="4" fill="#FFB800" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionTitle
          num={SPONSORS.sectionNum}
          label={SPONSORS.sectionLabel}
          title={SPONSORS.title}
          subtitle={SPONSORS.subtitle}
        />

        {/* Sponsor grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Marquee strip */}
        <MarqueeStrip />
      </div>
    </section>
  );
}