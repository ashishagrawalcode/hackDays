import { Navbar }           from "@/components/sections/Navbar";
import { HeroGrid }          from "@/components/sections/HeroGrid";
import { SectionDivider }    from "@/components/ui/SectionDivider";
import { AboutBrief }        from "@/components/sections/AboutBrief";
import { PitLaneSponsors }   from "@/components/sections/PitLaneSponsors";
import { RaceTimeline }      from "@/components/sections/RaceTimeline";
import { SteeringCrew }      from "@/components/sections/SteeringCrew";
import { RaceControlFAQ }    from "@/components/sections/RaceControlFAQ";
import { FinishLineFooter }  from "@/components/sections/FinishLineFooter";
import { GlobalCarScene }    from "@/components/three/GlobalCarScene";
import { EventsSection } from "@/components/sections/EventsSection";

/*
  ARCHITECTURE NOTE:
  ─────────────────
  GlobalCarScene is a fixed-position canvas that sits behind all content (z-0).
  The Preloader (in layout.tsx) overlays at z-99999 and slides away when done.
  NO opacity-0 / siteReady gate here — that was causing the whole page to be
  invisible. The Preloader already controls what the user sees during load.

  Section backgrounds use semi-transparent or gradient overlays so the 3D car
  bleeds through where desired (hero, timeline). Sections with opaque backgrounds
  (sponsors, FAQ) sit above the canvas but cover it intentionally.
*/

export default function Home() {
  return (
    <>
      {/* Fixed 3D background — always rendered, always behind HTML */}
      <GlobalCarScene />

      {/* Page content — z-10 so it sits above the canvas */}
      <main className="relative z-10">
        <Navbar />

        {/* Hero: transparent background → 3D car fully visible */}
        <HeroGrid />

        <SectionDivider label="About" index={1} />
        {/* About: semi-transparent → car partially visible */}
        <AboutBrief />

        <SectionDivider label="Sponsors" index={2} />
        {/* Sponsors: opaque → covers car intentionally */}
        <PitLaneSponsors />

        <SectionDivider label="Timeline" index={3} />
        {/* {Events Section:} */}
        <EventsSection />

        <SectionDivider label="Timeline" index={3} />
        {/* Timeline: semi-transparent → car drifts through */}
        <RaceTimeline />

        <SectionDivider label="Team" index={4} />
        <SteeringCrew />

        <SectionDivider label="FAQ" index={5} />
        <RaceControlFAQ />

        <FinishLineFooter />
      </main>
    </>
  );
}