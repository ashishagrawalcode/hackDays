"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  className?: string;
  once?: boolean;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  direction = "up",
  distance = 24,
  className,
  once = true,
}: FadeInProps) {
  const { ref, inView } = useInView({ triggerOnce: once, threshold: 0.12 });

  const initial: Record<string, number> = { opacity: 0 };
  if (direction === "up")    { initial.y =  distance; }
  if (direction === "down")  { initial.y = -distance; }
  if (direction === "left")  { initial.x =  distance; }
  if (direction === "right") { initial.x = -distance; }

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={initial}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}