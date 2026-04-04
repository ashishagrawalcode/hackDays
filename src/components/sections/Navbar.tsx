"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { NAV_LINKS, SITE_META } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("section[id], div[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled && "top-3"
        )}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 3.8, ease: "easeOut" }}
      >
        <div className={cn(
          "mx-auto flex items-center justify-between h-14 px-5 sm:px-8",
          "transition-all duration-300",
          scrolled
            ? "max-w-5xl rounded-sm border backdrop-blur-xl"
            : "max-w-full border-b",
        )}
          style={{
            background: scrolled
              ? "rgba(5,5,5,0.88)"
              : "rgba(5,5,5,0.72)",
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); handleNavClick("#home"); }}
            className="flex items-center gap-2 group"
          >
            <div
              className="w-6 h-6 relative flex-shrink-0"
              style={{
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                background: "var(--phosphor)",
              }}
            />
            <span
              className="font-display text-xl tracking-widest text-white group-hover:text-phosphor transition-colors duration-200"
            >
              HACKDAYS
            </span>
            <span
              className="font-mono text-[9px] tracking-[0.3em] mt-1"
              style={{ color: "var(--amber)" }}
            >
              '26
            </span>
          </a>

          {/* Desktop links */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={cn(
                    "font-mono text-[9px] tracking-[0.25em] uppercase transition-colors duration-200 relative",
                    isActive ? "text-phosphor" : "text-white/50 hover:text-white/80"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: "var(--phosphor)" }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex">
            <Button
              variant="outline"
              size="sm"
              href="https://unstop.com"
              external
              icon={<ArrowUpRight size={12} />}
            >
              Register
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 border rounded-sm"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen
              ? <X size={18} className="text-phosphor" />
              : <Menu size={18} className="text-white/70" />
            }
          </button>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[72px] left-0 right-0 z-40 border-b"
            style={{
              background: "rgba(5,5,5,0.98)",
              borderColor: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="flex flex-col py-4 px-6 gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleNavClick(link.href)}
                  className="flex items-center gap-3 py-3 border-b text-left"
                  style={{ borderColor: "rgba(255,255,255,0.04)" }}
                >
                  <span className="font-mono text-[9px] tracking-[0.3em]" style={{ color: "var(--phosphor)", opacity: 0.5 }}>
                    0{i + 1}
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/70">
                    {link.label}
                  </span>
                </motion.button>
              ))}
              <div className="pt-4">
                <Button variant="primary" size="sm" href="https://unstop.com" external>
                  Register Now ↗
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}