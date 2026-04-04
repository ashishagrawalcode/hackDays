"use client";

import { useEffect } from "react";

export function CustomCursor() {
  useEffect(() => {
    const dot  = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let pvx = 0, pvy = 0; // previous velocity
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    };

    const onDown = () => ring.classList.add("is-clicking");
    const onUp   = () => ring.classList.remove("is-clicking");

    // Attach hover listeners via delegation
    const checkHover = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const interactive = el.closest("a, button, [data-hover]");
      if (interactive) ring.classList.add("is-hovering");
      else ring.classList.remove("is-hovering");
    };

    const animate = () => {
      // Smooth lag on the ring
      const lerpFactor = 0.10;
      rx += (mx - rx) * lerpFactor;
      ry += (my - ry) * lerpFactor;

      // Velocity for squish
      const vx = mx - (rx + (mx - rx) * (1 - lerpFactor));
      const vy = my - (ry + (my - ry) * (1 - lerpFactor));
      const speed = Math.sqrt(vx * vx + vy * vy);

      // Squish ring in direction of movement
      const scaleX = 1 + speed * 0.018;
      const scaleY = 1 / scaleX;
      const angle  = speed > 0.5 ? Math.atan2(vy, vx) * (180 / Math.PI) : 0;

      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%) rotate(${angle}deg) scaleX(${scaleX}) scaleY(${scaleY})`;

      pvx = vx; pvy = vy;
      raf = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousemove", checkHover, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousemove", checkHover);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
    };
  }, []);

  return (
    <>
      <div id="cursor-dot" />
      <div id="cursor-ring" />
    </>
  );
}