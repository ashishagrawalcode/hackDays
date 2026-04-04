"use client";

import { useRef } from "react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

interface SectionDividerProps {
  label: string;
  index: number;
  className?: string;
}

const STRIPE_COLORS = [
  "#39FF14", // phosphor
  "#2a2a2a",
  "#FFB800", // amber
  "#2a2a2a",
  "#FF3B00", // pitred
  "#2a2a2a",
  "#00E5FF", // drs
  "#2a2a2a",
];

export function SectionDivider({ label, index, className }: SectionDividerProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex items-center w-full h-12 overflow-hidden",
        "border-t border-b",
        "transition-opacity duration-700",
        inView ? "opacity-100" : "opacity-0",
        className
      )}
      style={{ borderColor: "rgba(255,255,255,0.05)" }}
    >
      {/* Left stripes */}
      <div className="flex gap-[3px] flex-shrink-0 pl-4">
        {STRIPE_COLORS.map((color, i) => (
          <div
            key={i}
            className="w-[10px] h-12 -skew-x-12 transition-all duration-500"
            style={{
              background: color,
              opacity: inView ? 0.6 : 0,
              transitionDelay: `${i * 40}ms`,
            }}
          />
        ))}
      </div>

      {/* Left line */}
      <div
        className="flex-1 h-px ml-4 transition-all duration-700"
        style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)",
          transitionDelay: "200ms",
        }}
      />

      {/* Center label */}
      <div className="flex items-center gap-3 px-6 flex-shrink-0">
        <span
          className="font-mono text-[9px] tracking-[0.4em] uppercase"
          style={{ color: "#333" }}
        >
          {String(index).padStart(2, "0")}
        </span>
        <span
          className="font-mono text-[9px] tracking-[0.3em] uppercase"
          style={{ color: "#444" }}
        >
          {label}
        </span>
      </div>

      {/* Right line */}
      <div
        className="flex-1 h-px mr-4"
        style={{
          background: "linear-gradient(270deg, rgba(255,255,255,0.08), transparent)",
        }}
      />

      {/* Right stripes — reversed */}
      <div className="flex gap-[3px] flex-shrink-0 pr-4">
        {[...STRIPE_COLORS].reverse().map((color, i) => (
          <div
            key={i}
            className="w-[10px] h-12 -skew-x-12"
            style={{
              background: color,
              opacity: inView ? 0.6 : 0,
              transition: "opacity 0.5s ease",
              transitionDelay: `${i * 40 + 100}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}