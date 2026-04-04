import { Navbar }            from "@/components/sections/Navbar";
import { HeroGrid }          from "@/components/sections/HeroGrid";
import { SectionDivider }    from "@/components/ui/SectionDivider";
import { AboutBrief }        from "@/components/sections/AboutBrief";
import { PitLaneSponsors }   from "@/components/sections/PitLaneSponsors";
import { RaceTimeline }      from "@/components/sections/RaceTimeline";
import { SteeringCrew }      from "@/components/sections/SteeringCrew";
import { RaceControlFAQ }    from "@/components/sections/RaceControlFAQ";
import { FinishLineFooter }  from "@/components/sections/FinishLineFooter";

export default function Home() {
  return (
    <>
      <Navbar />

      <HeroGrid />

      <SectionDivider label="About" index={1} />
      <AboutBrief />

      <SectionDivider label="Sponsors" index={2} />
      <PitLaneSponsors />

      <SectionDivider label="Timeline" index={3} />
      <RaceTimeline />

      <SectionDivider label="Team" index={4} />
      <SteeringCrew />

      <SectionDivider label="FAQ" index={5} />
      <RaceControlFAQ />

      <FinishLineFooter />
    </>
  );
}