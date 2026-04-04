"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

type ButtonVariant = "primary" | "outline" | "ghost" | "amber";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  asChild?: boolean;
  href?: string;
  external?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-phosphor text-black hover:bg-white",
  outline: "bg-transparent text-phosphor border border-phosphor/60 hover:bg-phosphor hover:text-black hover:border-phosphor",
  ghost:   "bg-transparent text-amber border border-amber/40 hover:bg-amber hover:text-black hover:border-amber",
  amber:   "bg-amber text-black hover:bg-white",
};

const sizes = {
  sm: "text-[9px] tracking-[0.25em] px-4 py-2",
  md: "text-[10px] tracking-[0.25em] px-6 py-3",
  lg: "text-[11px] tracking-[0.3em] px-8 py-4",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  href,
  external,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center gap-2 font-mono font-medium uppercase",
    "clip-skew transition-all duration-200 relative overflow-hidden",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-phosphor/50",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <motion.a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={classes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        {children}
        {icon && <span className="flex-shrink-0">{icon}</span>}
      </motion.a>
    );
  }

  return (
    <motion.button
      className={classes}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      {...(props as any)}
    >
      {children}
      {icon && <span className="flex-shrink-0">{icon}</span>}
    </motion.button>
  );
}