"use client";

/**
 * Preloader v4 — Cinematic F1 Start Sequence
 *
 * TIMELINE:
 *   0.2s  → HACKDAYS title clips up from bottom
 *   0.7s  → gantry fades in
 *   0.9s  → RPM crawls as lights fire 1-by-1 every 0.55s
 *   3.65s → all 5 lights lit
 *   4.0s  → suspense hold (0.35s)
 *   4.35s → LIGHTS OUT — stagger extinguish (50ms)
 *   4.35s → RPM slams to 100%
 *   4.55s → "LIGHTS OUT — GO!" flash
 *   4.65s → red bloom splash
 *   4.85s → overlay GATE-LIFTS (yPercent -105) in 0.7s
 *
 * MOBILE:
 *   Same sequence but layout is compact — title smaller,
 *   lights house smaller, telemetry hidden.
 *
 * All fonts: Outfit (display) + Inter (mono)
 */

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const N = 5;

export function Preloader() {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);
  const gantryRef  = useRef<HTMLDivElement>(null);
  const fillRef    = useRef<HTMLDivElement>(null);
  const rpmNumRef  = useRef<HTMLSpanElement>(null);
  const goRef      = useRef<HTMLDivElement>(null);
  const splashRef  = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    document.body.style.overflow = "hidden";

    const wrap    = wrapRef.current;
    const title   = titleRef.current;
    const gantry  = gantryRef.current;
    const fill    = fillRef.current;
    const goEl    = goRef.current;
    const splash  = splashRef.current;
    const lights  = Array.from(gantryRef.current?.querySelectorAll<HTMLElement>(".pl-light") ?? []);

    if (!wrap || !title || !gantry || !fill || !goEl || !splash) return;

    // RPM counter
    let rpmVal = 0;
    const RPM_MAX = 18000;
    const flushRPM = () => {
      if (rpmNumRef.current) rpmNumRef.current.textContent = rpmVal.toLocaleString();
    };

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        setDone(true);
      },
    });

    // 1. Title reveal — clip from bottom
    tl.fromTo(title,
      { clipPath:"inset(100% 0 0 0)", y:24 },
      { clipPath:"inset(0% 0 0 0)", y:0, duration:0.65, ease:"power3.out" },
      0.2
    );

    // 2. Gantry fades in
    tl.fromTo(gantry,
      { opacity:0, y:20 },
      { opacity:1, y:0, duration:0.4, ease:"power2.out" },
      0.72
    );

    // 3. RPM rises during light sequence
    tl.to(fill,
      { width:"72%", duration: N*0.55+0.2, ease:"power1.inOut" },
      0.9
    );

    // 4. Lights on, one per 0.55s
    lights.forEach((l, i) => {
      tl.call(() => {
        l.classList.add("pl-lit");
        const from = rpmVal;
        const to   = Math.round(RPM_MAX * ((i+1)/N) * 0.82);
        gsap.to({ v:from }, { v:to, duration:0.5, ease:"power2.out",
          onUpdate() { rpmVal = Math.round((this as any).targets()[0].v); flushRPM(); }
        });
      }, [], 0.9 + i*0.55);
    });

    // 5. Hold
    tl.to({}, { duration:0.35 }, ">=");

    // 6. Lights OUT — stagger 50ms
    lights.forEach((l, i) => {
      tl.call(() => {
        l.classList.remove("pl-lit");
        l.classList.add("pl-out");
      }, [], `>+${i*0.048}`);
    });

    // 7. RPM slams
    tl.to(fill, { width:"100%", duration:0.15, ease:"expo.in" }, "<");

    // 8. RPM number to max
    tl.call(() => {
      gsap.to({ v:rpmVal }, { v:RPM_MAX, duration:0.13, ease:"none",
        onUpdate() { rpmVal = Math.round((this as any).targets()[0].v); flushRPM(); }
      });
    });

    // 9. GO text
    tl.to(goEl, { opacity:1, y:0, scale:1, duration:0.22, ease:"back.out(2.5)" }, ">");

    // 10. Bloom
    tl.to(splash, { scale:16, opacity:0.7, duration:0.38, ease:"power2.in" }, "+=0.14");

    // 11. Gate lift
    tl.to(wrap, { yPercent:-105, duration:0.72, ease:"power4.inOut" }, "-=0.15");

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  return (
    <>
      <style>{`
        #pl-wrap {
          position: fixed; inset: 0; z-index: 99999;
          background: #030303;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: clamp(24px,4.5vh,50px);
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        /* Scan line sweep */
        #pl-wrap::before {
          content: '';
          position: absolute; left:0; right:0; height:1px; top:0;
          background: linear-gradient(90deg,transparent,rgba(232,0,45,0.55),transparent);
          animation: plScan 2.4s linear infinite;
          pointer-events: none; z-index: 1;
        }
        @keyframes plScan {
          0%   { top:0%; opacity:1; }
          95%  { opacity:1; }
          100% { top:100%; opacity:0; }
        }

        /* Grid */
        #pl-grid {
          position: absolute; inset:0; pointer-events:none;
          background-image:
            linear-gradient(rgba(232,0,45,0.02) 1px,transparent 1px),
            linear-gradient(90deg,rgba(232,0,45,0.02) 1px,transparent 1px);
          background-size: 80px 80px;
        }
        /* Vignette */
        #pl-vig {
          position:absolute; inset:0; pointer-events:none;
          background:radial-gradient(ellipse at center,transparent 28%,rgba(3,3,3,0.9) 100%);
        }

        /* Start lights */
        .pl-light {
          width: clamp(20px,4.2vw,30px);
          height: clamp(20px,4.2vw,30px);
          border-radius: 50%;
          background: #0e0505;
          border: 1px solid #1c0808;
          flex-shrink: 0;
          transition: none;
        }
        .pl-light.pl-lit {
          background: #FF1801;
          border-color: #FF2A00;
          box-shadow:
            0 0 8px #FF1801,
            0 0 22px rgba(255,24,1,0.75),
            0 0 55px rgba(255,24,1,0.45),
            inset 0 0 12px rgba(255,100,50,0.6);
        }
        .pl-light.pl-out {
          background: transparent !important;
          border-color: transparent !important;
          box-shadow: none !important;
          opacity: 0;
          transition: opacity 0.06s ease;
        }

        /* Corners */
        .pl-corner { position:absolute; width:18px; height:18px; }
        .pl-tl { top:18px; left:18px; border-top:1px solid rgba(232,0,45,0.2); border-left:1px solid rgba(232,0,45,0.2); }
        .pl-tr { top:18px; right:18px; border-top:1px solid rgba(232,0,45,0.2); border-right:1px solid rgba(232,0,45,0.2); }
        .pl-bl { bottom:18px; left:18px; border-bottom:1px solid rgba(232,0,45,0.2); border-left:1px solid rgba(232,0,45,0.2); }
        .pl-br { bottom:18px; right:18px; border-bottom:1px solid rgba(232,0,45,0.2); border-right:1px solid rgba(232,0,45,0.2); }
      `}</style>

      <div ref={wrapRef} id="pl-wrap">
        <div id="pl-grid" />
        <div id="pl-vig" />
        <div className="pl-corner pl-tl" />
        <div className="pl-corner pl-tr" />
        <div className="pl-corner pl-bl" />
        <div className="pl-corner pl-br" />

        {/* Title */}
        <div ref={titleRef} style={{ textAlign:"center", overflow:"hidden" }}>
          <p style={{ fontFamily:"'Inter',sans-serif", fontWeight:600,
            fontSize:"clamp(8px,1.5vw,10px)", letterSpacing:"0.5em",
            textTransform:"uppercase", color:"rgba(232,0,45,0.65)", marginBottom:14 }}>
            ACM Student Chapter
          </p>

          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900,
            fontSize:"clamp(52px,12.5vw,128px)", letterSpacing:"-0.035em",
            lineHeight:0.88, color:"#F5F3EE" }}>
            HACK<span style={{ color:"#E8002D" }}>DAYS</span>
          </h1>

          <p style={{ fontFamily:"'Inter',sans-serif", fontWeight:400,
            fontSize:"clamp(7px,1.3vw,9px)", letterSpacing:"0.4em",
            textTransform:"uppercase", color:"rgba(255,255,255,0.14)", marginTop:10 }}>
            2026 · BML MUNJAL UNIVERSITY
          </p>
        </div>

        {/* Gantry */}
        <div ref={gantryRef} style={{ display:"flex", flexDirection:"column",
          alignItems:"center", gap:"clamp(10px,2.2vh,16px)", opacity:0 }}>

          <p style={{ fontFamily:"'Inter',sans-serif", fontWeight:500,
            fontSize:"clamp(7px,1.3vw,9px)", letterSpacing:"0.4em",
            textTransform:"uppercase", color:"#242424" }}>
            Preparing Grid
          </p>

          {/* Light housing */}
          <div style={{ position:"relative", display:"flex",
            gap:"clamp(7px,1.8vw,13px)", background:"#080808",
            border:"1px solid #161616",
            padding:"clamp(10px,2.2vw,18px) clamp(16px,3.5vw,28px)" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"#0f0f0f" }} />
            <div style={{ position:"absolute", top:0, left:"9%", width:1, height:"100%", background:"#0f0f0f" }} />
            <div style={{ position:"absolute", top:0, right:"9%", width:1, height:"100%", background:"#0f0f0f" }} />
            {Array.from({length:N}).map((_,i)=>(
              <div key={i} className="pl-light" />
            ))}
          </div>

          {/* RPM bar */}
          <div style={{ width:"clamp(140px,28vw,210px)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5,
              fontFamily:"'Inter',sans-serif", fontSize:"clamp(7px,1.1vw,8px)", fontWeight:500,
              letterSpacing:"0.22em", textTransform:"uppercase" }}>
              <span style={{ color:"#1e1e1e" }}>ENGINE RPM</span>
              <span ref={rpmNumRef} style={{ color:"rgba(232,0,45,0.65)", fontFamily:"'Outfit',sans-serif", fontWeight:700 }}>0</span>
            </div>

            <div style={{ width:"100%", height:3, background:"#0d0d0d", overflow:"hidden", position:"relative" }}>
              <div ref={fillRef} style={{ width:"0%", height:"100%",
                background:"linear-gradient(90deg,#E8002D 0%,#FF6B00 55%,#FFD700 100%)",
                boxShadow:"0 0 10px rgba(232,0,45,0.9), 0 0 22px rgba(232,0,45,0.4)" }} />
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", marginTop:4,
              fontFamily:"'Inter',sans-serif", fontSize:"clamp(6px,1vw,7px)",
              color:"#141414", letterSpacing:"0.06em" }}>
              {["0","3K","6K","9K","12K","15K","18K"].map(v=><span key={v}>{v}</span>)}
            </div>
          </div>

          {/* GO text */}
          <div ref={goRef} style={{ opacity:0, transform:"translateY(10px) scale(0.85)" }}>
            <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800,
              fontSize:"clamp(9px,1.8vw,12px)", letterSpacing:"0.45em",
              textTransform:"uppercase", color:"#E8002D", margin:0 }}>
              Lights Out — GO!
            </p>
          </div>
        </div>

        {/* Telemetry footer — hidden on small screens */}
        <div className="pl-telem" style={{ position:"absolute", bottom:"clamp(10px,2.5vw,20px)",
          display:"flex", gap:"clamp(8px,2.5vw,22px)", flexWrap:"wrap", justifyContent:"center",
          padding:"0 16px", fontFamily:"'Inter',sans-serif",
          fontSize:"clamp(6px,1vw,7px)", fontWeight:500, letterSpacing:"0.22em",
          textTransform:"uppercase", color:"#181818" }}>
          {["TYRE: SOFT","FUEL: 100%","DRS: ARMED","ERS: CHARGED"].map(s=>(
            <span key={s}>{s}</span>
          ))}
        </div>

        {/* Bloom */}
        <div ref={splashRef} style={{ position:"absolute", top:"50%", left:"50%",
          width:80, height:80, transform:"translate(-50%,-50%) scale(0)",
          borderRadius:"50%", pointerEvents:"none",
          background:"radial-gradient(circle,rgba(232,0,45,0.55) 0%,transparent 70%)",
          filter:"blur(22px)" }} />

        <style>{`
          @media (max-width: 480px) {
            .pl-telem { display: none !important; }
          }
        `}</style>
      </div>
    </>
  );
}