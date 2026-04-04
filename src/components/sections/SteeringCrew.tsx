"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SITE_DATA } from "@/lib/constants";

/* ─────────────────────────────────────────────
   CREW DATA — pulled from constants or defined here
───────────────────────────────────────────── */
const CREW_MEMBERS = (SITE_DATA as any).crew ?? [
  {
    id: "01",
    name: "Arjun Mehta",
    role: "Race Director",
    dept: "Core Org",
    bio: "Oversees the full event, track conditions, and final jury decisions. Five years running hackathons at national level.",
    socials: { linkedin: "#", twitter: "#" },
    accent: "#39FF14",
    initials: "AM",
  },
  {
    id: "02",
    name: "Priya Sharma",
    role: "Pit Lane Lead",
    dept: "Logistics",
    bio: "Manages team check-ins, resource allocation, and pit-stop mentorship scheduling. The operational backbone.",
    socials: { linkedin: "#", twitter: "#" },
    accent: "#FFB800",
    initials: "PS",
  },
  {
    id: "03",
    name: "Rahul Verma",
    role: "Tech Steward",
    dept: "Engineering",
    bio: "Runs infra, APIs, and judging systems. Built the submission portal and real-time leaderboard from scratch.",
    socials: { linkedin: "#", twitter: "#" },
    accent: "#00E5FF",
    initials: "RV",
  },
  {
    id: "04",
    name: "Sneha Kapoor",
    role: "Design Parc Fermé",
    dept: "Creative",
    bio: "Owns visual identity, sponsor decks, and UI/UX workshops during the hack. Previously at a top D2C brand.",
    socials: { linkedin: "#", twitter: "#" },
    accent: "#FF3B00",
    initials: "SK",
  },
  {
    id: "05",
    name: "Dev Anand",
    role: "Sponsor Liaison",
    dept: "Partnerships",
    bio: "Manages all sponsor relationships and ensures partner integrations are built into challenges properly.",
    socials: { linkedin: "#", twitter: "#" },
    accent: "#39FF14",
    initials: "DA",
  },
  {
    id: "06",
    name: "Aisha Khan",
    role: "Media & Comms",
    dept: "Marketing",
    bio: "Runs social coverage, live documentation, and post-event recaps. If it happened, Aisha captured it.",
    socials: { linkedin: "#", twitter: "#" },
    accent: "#FFB800",
    initials: "AK",
  },
];

/* ─────────────────────────────────────────────
   AVATAR COMPONENT — geometric placeholder
───────────────────────────────────────────── */
function CrewAvatar({ initials, accent }: { initials: string; accent: string }) {
  return (
    <div
      className="relative w-full aspect-square flex items-center justify-center overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 30% 30%, ${accent}18, #0a0a0a)`,
      }}
    >
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(${accent}40 1px, transparent 1px),
            linear-gradient(90deg, ${accent}40 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Diagonal accent lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="100" y2="100" stroke={accent} strokeWidth="0.3" strokeOpacity="0.3" />
        <line x1="100" y1="0" x2="0" y2="100" stroke={accent} strokeWidth="0.3" strokeOpacity="0.15" />
        <circle cx="50" cy="50" r="35" stroke={accent} strokeWidth="0.5" fill="none" strokeOpacity="0.25" />
        <circle cx="50" cy="50" r="20" stroke={accent} strokeWidth="0.5" fill="none" strokeOpacity="0.15" />
      </svg>

      {/* Initials */}
      <span
        className="relative z-10 font-display text-5xl tracking-widest"
        style={{ color: accent, textShadow: `0 0 30px ${accent}80` }}
      >
        {initials}
      </span>

      {/* Corner accents */}
      {[
        "top-0 left-0 border-t-2 border-l-2",
        "top-0 right-0 border-t-2 border-r-2",
        "bottom-0 left-0 border-b-2 border-l-2",
        "bottom-0 right-0 border-b-2 border-r-2",
      ].map((cls, i) => (
        <div
          key={i}
          className={`absolute w-5 h-5 ${cls}`}
          style={{ borderColor: `${accent}70` }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CREW CARD
───────────────────────────────────────────── */
interface CrewMember {
  id: string;
  name: string;
  role: string;
  dept: string;
  bio: string;
  socials?: { linkedin?: string; twitter?: string };
  accent: string;
  initials: string;
}

function CrewCard({ member, index }: { member: CrewMember; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="relative"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="relative w-full cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        onClick={() => setFlipped((f) => !f)}
      >
        {/* FRONT */}
        <div
          className="relative border border-white/8 overflow-hidden group"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)",
          }}
        >
          {/* Avatar */}
          <CrewAvatar initials={member.initials} accent={member.accent} />

          {/* Bottom info bar */}
          <div
            className="relative p-4 border-t border-white/8"
            style={{ background: "#0f0f0f" }}
          >
            {/* Accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, ${member.accent}, transparent)` }}
            />

            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg text-white tracking-wide uppercase leading-tight">
                  {member.name}
                </h3>
                <p className="font-mono text-[11px] mt-0.5" style={{ color: member.accent }}>
                  {member.role}
                </p>
              </div>
              <span
                className="font-mono text-[9px] tracking-widest px-2 py-1 self-start"
                style={{
                  color: member.accent,
                  border: `1px solid ${member.accent}30`,
                  background: `${member.accent}10`,
                }}
              >
                {member.dept}
              </span>
            </div>

            {/* Flip hint */}
            <p className="font-mono text-[9px] text-white/20 mt-3 tracking-widest uppercase">
              CLICK FOR BIO →
            </p>
          </div>

          {/* ID watermark */}
          <div
            className="absolute top-3 left-3 font-mono text-[10px] tracking-widest"
            style={{ color: `${member.accent}50` }}
          >
            #{member.id}
          </div>

          {/* Hover scan line */}
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${member.accent}08 50%, transparent 100%)`,
            }}
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 border overflow-hidden flex flex-col"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderColor: `${member.accent}40`,
            background: `linear-gradient(135deg, #0f0f0f, #161616)`,
            clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)",
          }}
        >
          {/* Top strip */}
          <div
            className="h-1 w-full"
            style={{ background: member.accent }}
          />

          <div className="flex-1 p-5 flex flex-col justify-between">
            {/* Header */}
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase mb-1" style={{ color: member.accent }}>
                CREW FILE / {member.dept}
              </p>
              <h3 className="font-display text-xl text-white tracking-widest uppercase">{member.name}</h3>
              <p className="font-mono text-[11px] text-white/50 mt-1">{member.role}</p>
            </div>

            {/* Divider */}
            <div className="h-px my-4" style={{ background: `linear-gradient(90deg, ${member.accent}50, transparent)` }} />

            {/* Bio */}
            <p className="font-mono text-[12px] text-white/60 leading-relaxed flex-1">{member.bio}</p>

            {/* Socials */}
            <div className="mt-4 flex gap-3">
              <a
                href={member.socials?.linkedin || "#"}
                onClick={(e) => e.stopPropagation()}
                className="font-mono text-[10px] tracking-widest px-3 py-1.5 border transition-colors duration-200"
                style={{
                  borderColor: `${member.accent}40`,
                  color: member.accent,
                }}
              >
                LINKEDIN
              </a>
              <a
                href={member.socials?.twitter || "#"}
                onClick={(e) => e.stopPropagation()}
                className="font-mono text-[10px] tracking-widest px-3 py-1.5 border transition-colors duration-200"
                style={{
                  borderColor: `${member.accent}40`,
                  color: member.accent,
                }}
              >
                TWITTER
              </a>
            </div>

            <p className="font-mono text-[9px] text-white/20 mt-3 tracking-widest uppercase">
              ← CLICK TO FLIP BACK
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   DEPT FILTER BAR
───────────────────────────────────────────── */
const DEPTS: string[] = ["ALL", ...Array.from(new Set(CREW_MEMBERS.map((m: any) => m.dept))) as string[]];


function DeptFilter({
  active,
  onChange,
}: {
  active: string;
  onChange: (d: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-12">
      {DEPTS.map((dept: string, index: number) => (
        <button
          key={dept || `dept-${index}`}
          onClick={() => onChange(dept)}
          className="font-mono text-[10px] tracking-[0.2em] px-4 py-2 border transition-all duration-200 uppercase"
          style={{
            borderColor: active === dept ? "#39FF14" : "rgba(255,255,255,0.1)",
            color: active === dept ? "#39FF14" : "rgba(255,255,255,0.4)",
            background: active === dept ? "rgba(57,255,20,0.08)" : "transparent",
          }}
        >
          {dept}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION EXPORT
───────────────────────────────────────────── */
export function SteeringCrew() {
  const [activeDept, setActiveDept] = useState("ALL");

  const filtered =
    activeDept === "ALL"
      ? CREW_MEMBERS
      : CREW_MEMBERS.filter((m: any) => m.dept === activeDept);

  return (
    <section
      id="crew"
      className="relative py-32 overflow-hidden"
      style={{ background: "#050505" }}
    >
      {/* Diagonal stripe accent — top-right */}
      <div
        className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-5"
        style={{
          background: "repeating-linear-gradient(-45deg, #39FF14, #39FF14 1px, transparent 1px, transparent 16px)",
        }}
      />

      {/* Diagonal stripe accent — bottom-left */}
      <div
        className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none opacity-5"
        style={{
          background: "repeating-linear-gradient(-45deg, #FFB800, #FFB800 1px, transparent 1px, transparent 16px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <SectionTitle label="Organizers" num="05" title="STEERING CREW" />
          <p className="font-mono text-sm text-white/40 mt-4 max-w-md mx-auto leading-relaxed">
            The engineers behind the race. Click any card to reveal their full driver profile.
          </p>
        </div>

        {/* Dept filter */}
        <DeptFilter active={activeDept} onChange={setActiveDept} />

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDept}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {filtered.map((member: any, i: number) => (
              <CrewCard key={member.id || i} member={member} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom stat strip */}
        <motion.div
          className="mt-20 grid grid-cols-3 border border-white/8 overflow-hidden"
          style={{
            background: "#0a0a0a",
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {[
            { label: "Organizers", value: String(CREW_MEMBERS.length), accent: "#39FF14" },
            { label: "Departments", value: String(DEPTS.length - 1), accent: "#FFB800" },
            { label: "Combined Hours", value: "200+", accent: "#00E5FF" },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-6 text-center border-r last:border-r-0 border-white/8"
            >
              <p
                className="font-display text-4xl"
                style={{ color: stat.accent, textShadow: `0 0 20px ${stat.accent}60` }}
              >
                {stat.value}
              </p>
              <p className="font-mono text-[10px] text-white/30 tracking-widest uppercase mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}