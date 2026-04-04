"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ABOUT } from "@/lib/constants";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FadeIn } from "@/components/animations/FadeIn";
import { RevealText } from "@/components/animations/RevealText";
import { useInView } from "react-intersection-observer";

// ── Animated stat counter ─────────────────────────────────────
function StatCard({
  value,
  suffix,
  label,
  delay = 0,
}: {
  value: string;
  suffix: string;
  label: string;
  delay?: number;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="relative flex flex-col gap-1 p-5 border"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, var(--phosphor), transparent)",
          opacity: 0.5,
        }}
      />

      <div className="flex items-baseline gap-1">
        <span
          className="font-display leading-none"
          style={{ fontSize: "clamp(36px, 5vw, 56px)", color: "#fff" }}
        >
          {value}
        </span>
        <span
          className="font-display"
          style={{ fontSize: "clamp(18px, 2.5vw, 28px)", color: "var(--phosphor)" }}
        >
          {suffix}
        </span>
      </div>
      <span
        className="font-mono text-[9px] tracking-[0.25em] uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
    </motion.div>
  );
}

export function AboutBrief() {
  return (
    <section
      id="about"
      className="relative w-full py-20 sm:py-28 overflow-hidden"
      style={{ background: "var(--void)" }}
    >
      {/* Background noise pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg,rgba(255,255,255,0.012) 0px,rgba(255,255,255,0.012) 1px,transparent 1px,transparent 8px),repeating-linear-gradient(-45deg,rgba(255,255,255,0.012) 0px,rgba(255,255,255,0.012) 1px,transparent 1px,transparent 8px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionTitle
          num={ABOUT.sectionNum}
          label={ABOUT.sectionLabel}
          title={ABOUT.title}
          right={
            <div className="flex items-center gap-3">
              {ABOUT.links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  className="font-mono text-[9px] tracking-[0.2em] uppercase transition-colors duration-200 flex items-center gap-1"
                  style={{ color: "rgba(57,255,20,0.6)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--phosphor)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(57,255,20,0.6)")
                  }
                >
                  {link.name}
                  <ArrowUpRight size={10} />
                </a>
              ))}
            </div>
          }
        />

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-12 lg:gap-16 items-start">
          {/* Description text */}
          <div>
            <RevealText
              text={ABOUT.description}
              className="font-mono leading-[1.85] text-[13px] sm:text-[14px] lg:text-[15px] text-[#888]"
              stagger={0.012}
            />

            {/* Decorative quote line */}
            <FadeIn delay={0.4} direction="left" className="mt-8">
              <div
                className="flex items-start gap-4 pl-4 border-l-2"
                style={{ borderColor: "var(--phosphor)" }}
              >
                <p
                  className="font-mono text-[12px] leading-relaxed italic"
                  style={{ color: "#555" }}
                >
                  &quot;At the checkered flag, teams don&apos;t just ship projects —<br />
                  they deliver bold, impact-driven solutions.&quot;
                </p>
              </div>
            </FadeIn>
          </div>

          {/* Stats column */}
          <div className="flex flex-col gap-3">
            {ABOUT.stats.map((stat, i) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                delay={0.1 * i}
              />
            ))}

            {/* Register CTA inside stats column */}
            <FadeIn delay={0.4} direction="up">
              <a
                href="https://unstop.com"
                target="_blank"
                rel="noopener noreferrer"
                className="clip-skew flex items-center justify-between gap-4 p-5 mt-2 group transition-all duration-200"
                style={{
                  background: "rgba(57,255,20,0.06)",
                  border: "1px solid rgba(57,255,20,0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(57,255,20,0.12)";
                  e.currentTarget.style.borderColor = "rgba(57,255,20,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(57,255,20,0.06)";
                  e.currentTarget.style.borderColor = "rgba(57,255,20,0.2)";
                }}
              >
                <div>
                  <p
                    className="font-mono text-[9px] tracking-[0.3em] uppercase mb-1"
                    style={{ color: "var(--phosphor)", opacity: 0.6 }}
                  >
                    Join the Race
                  </p>
                  <p className="font-display text-xl text-white tracking-wide">
                    Register Now
                  </p>
                </div>
                <ArrowUpRight
                  size={20}
                  className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  style={{ color: "var(--phosphor)" }}
                />
              </a>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}