"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { NAV_LINKS, SITE_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [activeHref,  setActiveHref]  = useState("home");

  // Scroll shrink
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section tracking
  useEffect(() => {
    const sectionIds = NAV_LINKS.map(l => l.href.replace("#", ""));
    const els = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveHref(e.target.id); });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed",
          top: scrolled ? 12 : 0,
          left: 0, right: 0,
          zIndex: 1000,
          transition: "top 0.3s",
        }}
      >
        <div style={{
          margin: scrolled ? "0 auto" : 0,
          maxWidth: scrolled ? 980 : "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 60,
          padding: "0 24px",
          background: scrolled
            ? "rgba(3,3,3,0.92)"
            : "rgba(3,3,3,0.7)",
          borderBottom: scrolled ? "none" : "1px solid rgba(255,255,255,0.04)",
          border: scrolled ? "1px solid rgba(255,255,255,0.07)" : undefined,
          backdropFilter: "blur(16px)",
          transition: "all 0.3s ease",
        }}>

          {/* Logo */}
          <a
            href="#home"
            data-hover
            onClick={e => { e.preventDefault(); scrollTo("#home"); }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              textDecoration: "none",
            }}
          >
            {/* F1-style geometric mark */}
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <polygon
                points="13,1 25,7 25,19 13,25 1,19 1,7"
                stroke="var(--f1red)"
                strokeWidth="1.5"
                fill="rgba(232,0,45,0.08)"
              />
              <text
                x="13" y="17.5"
                textAnchor="middle"
                style={{
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: 11,
                  fill: "var(--f1red)",
                  letterSpacing: "0.05em",
                }}
              >HD</text>
            </svg>
            <span style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: 22,
              letterSpacing: "0.12em",
              color: "var(--white)",
            }}>
              HACKDAYS
            </span>
            <span style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 10,
              color: "var(--amber)",
              letterSpacing: "0.2em",
              marginTop: 2,
            }}>'26</span>
          </a>

          {/* Desktop nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {NAV_LINKS.map(link => {
              const isActive = activeHref === link.href.replace("#", "");
              return (
                <button
                  key={link.href}
                  data-hover
                  onClick={() => scrollTo(link.href)}
                  style={{
                    fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 9,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: isActive ? "var(--white)" : "rgba(240,237,232,0.35)",
                    background: "none",
                    border: "none",
                    cursor: "none",
                    padding: "4px 0",
                    position: "relative",
                    transition: "color 0.2s",
                  }}
                  className="hidden lg:inline-block"
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      style={{
                        position: "absolute",
                        bottom: -2, left: 0, right: 0,
                        height: 1,
                        background: "var(--f1red)",
                        boxShadow: "0 0 6px var(--f1red)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Register CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a
              href="https://unstop.com"
              target="_blank"
              rel="noopener noreferrer"
              data-hover
              className="hidden lg:inline-flex"
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 9,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#000",
                background: "var(--f1red)",
                padding: "9px 20px",
                clipPath: "polygon(7px 0%,100% 0%,calc(100% - 7px) 100%,0% 100%)",
                textDecoration: "none",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--f1red)")}
            >
              Register <ArrowUpRight size={11} />
            </a>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden"
              data-hover
              onClick={() => setMobileOpen(v => !v)}
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--white)",
                padding: 8,
                cursor: "none",
                display: "flex", alignItems: "center",
              }}
            >
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed",
              top: 72, left: 0, right: 0,
              zIndex: 999,
              background: "rgba(3,3,3,0.97)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
              padding: "16px 24px 24px",
            }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.button
                key={link.href}
                data-hover
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => scrollTo(link.href)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "14px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: "none",
                  border: "none",
                  cursor: "none",
                  textAlign: "left",
                }}
              >
                <span style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 9,
                  color: "var(--f1red)",
                  opacity: 0.5,
                  letterSpacing: "0.3em",
                }}>
                  0{i + 1}
                </span>
                <span style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 12,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(240,237,232,0.7)",
                }}>
                  {link.label}
                </span>
              </motion.button>
            ))}
            <a
              href="https://unstop.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 16,
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 10,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#000",
                background: "var(--f1red)",
                padding: "12px 24px",
                clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Register Now ↗
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}