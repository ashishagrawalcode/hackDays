"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  num: string;
  label: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export function SectionTitle({
  num,
  label,
  title,
  subtitle,
  right,
  className,
  titleClassName,
}: SectionTitleProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <div ref={ref} className={cn("relative mb-12 sm:mb-16", className)}>
      {/* Top label row */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center gap-3 mb-4"
      >
        <span
          className="font-mono text-[9px] tracking-[0.4em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          {num}
        </span>
        <span
          className="w-8 h-px"
          style={{ background: "var(--phosphor)", opacity: 0.6 }}
        />
        <span
          className="font-mono text-[9px] tracking-[0.3em] uppercase"
          style={{ color: "var(--phosphor)", opacity: 0.8 }}
        >
          {label}
        </span>
      </motion.div>

      {/* Title + optional right content */}
      <div className="flex items-end justify-between gap-4 border-b pb-5"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className={cn(
            "font-display text-4xl sm:text-5xl md:text-6xl leading-none tracking-wide text-white uppercase",
            titleClassName
          )}
        >
          {title}
        </motion.h2>

        {(subtitle || right) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0"
          >
            {subtitle && (
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase"
                style={{ color: "var(--text-muted)" }}>
                {subtitle}
              </span>
            )}
            {right}
          </motion.div>
        )}
      </div>
    </div>
  );
}