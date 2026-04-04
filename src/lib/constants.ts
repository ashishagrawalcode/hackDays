// ============================================================
// HACKDAYS 2026 — ALL SITE DATA LIVES HERE
// Zero hardcoding in components. Edit this file only.
// ============================================================

export const SITE_META = {
  name: "HackDays 2026",
  tagline: "24 Hours. Zero Limits. One Finish Line.",
  organizer: "ACM Student Chapter",
  university: "BML Munjal University",
  registerUrl: "https://unstop.com",
  year: "2026",
} as const;

export const HERO = {
  label: "ACM Student Chapter",
  lines: ["WELCOME", "TO", "HACK", "DAYS"],
  version: "2026",
  highlight: "DAYS",
  targetDate: "2026-04-18T09:30:00",
  timerLabel: "Time to Lights Out",
  cta: "Register Now",
  subCta: "View Brochure",
} as const;

export const ABOUT = {
  sectionNum: "01",
  sectionLabel: "About the Event",
  title: "HackDays 2026",
  description:
    "Engines on. Lights out. HackDays 2026 is a 24-hour Formula-style innovation race where builders, designers, and problem-solvers hit the grid to tackle real-world challenges. From pit-lane mentorship to rapid strategy pivots, every lap tests speed, precision, and teamwork as raw ideas evolve into high-performance prototypes. At the checkered flag, teams don't just ship projects — they deliver bold, impact-driven solutions that showcase technical excellence, leadership, and race-day resilience.",
  links: [
    { name: "Brochure", url: "#" },
    { name: "Code of Conduct", url: "#" },
    { name: "Rulebook", url: "#" },
  ],
  stats: [
    { value: "24", suffix: "H", label: "Hours of Coding" },
    { value: "50", suffix: "+", label: "Hackathon Teams" },
    { value: "₹60K", suffix: "", label: "Prize Pool" },
  ],
};

export const SPONSORS = {
  sectionNum: "02",
  sectionLabel: "People who backed our crazy ideas",
  title: "Pit Lane Backers",
  subtitle: "HackDays 2026",
  list: [
    { name: "SPHERON",              desc: "Decentralized cloud hosting for modern web apps.",          logo: "https://hack-bmu8-0.vercel.app/Sponsors/SPHERON.png?v=20260327" },
    { name: "Balsamiq",             desc: "Wireframing tool that helps teams plan UI quickly.",        logo: "https://hack-bmu8-0.vercel.app/Sponsors/Balsamiq.png?v=20260327" },
    { name: "1Password",            desc: "A secure password manager to protect your accounts.",       logo: "https://hack-bmu8-0.vercel.app/Sponsors/1Password.png?v=20260327" },
    { name: "Major League Hacking", desc: "Official student hackathon league supporting innovation.",  logo: "https://hack-bmu8-0.vercel.app/Sponsors/Major%20League%20Hacking%20(MLH).png?v=20260327" },
    { name: "Axure",                desc: "UX prototyping and wireframing software for teams.",        logo: "https://hack-bmu8-0.vercel.app/Sponsors/Axure.svg?v=20260327" },
    { name: "Leading Learners",     desc: "Educational resources and student support programs.",       logo: "https://hack-bmu8-0.vercel.app/Sponsors/Leading%20Learners.webp?v=20260327" },
    { name: "Taskade",              desc: "Collaborative task management and productivity.",           logo: "https://hack-bmu8-0.vercel.app/Sponsors/Taskade.webp?v=20260327" },
    { name: "echo3D",               desc: "Cloud platform for 3D, AR, and VR content.",               logo: "https://hack-bmu8-0.vercel.app/Sponsors/echo3D.png?v=20260327" },
    { name: "Wolfram",              desc: "Advanced computation software and knowledge engine.",       logo: "https://hack-bmu8-0.vercel.app/Sponsors/Wolfram.png?v=20260327" },
    { name: "Devfolio",             desc: "India's largest community of developers & hackathons.",     logo: "https://hack-bmu8-0.vercel.app/Sponsors/Devfolio.png?v=20260327" },
    { name: "Coding Ninjas",        desc: "Online coding courses for developers and learners.",        logo: "https://hack-bmu8-0.vercel.app/Sponsors/Coding%20Ninjas.png?v=20260327" },
    { name: "Coding Blocks",        desc: "Coding bootcamps for software development.",                logo: "https://hack-bmu8-0.vercel.app/Sponsors/Coding%20Blocks.png?v=20260327" },
  ],
};

// ─── TIMELINE ────────────────────────────────────────────────

export type TimelineEventType = "ceremony" | "coding" | "evaluation" | "break";

export interface TimelineEvent {
  type: TimelineEventType;
  time: string;
  title: string;
}

export interface TimelineDay {
  day: string;
  date: string;
  events: TimelineEvent[];
}

export const TIMELINE: {
  sectionNum: string;
  sectionLabel: string;
  title: string;
  days: TimelineDay[];
} = {
  sectionNum: "03",
  sectionLabel: "Race Weekend",
  title: "Schedule",
  days: [
    {
      day: "Day 1",
      date: "18th April",
      events: [
        { type: "ceremony",   time: "9:30 AM — 12:00 PM",  title: "Check In" },
        { type: "ceremony",   time: "12:00 PM — 12:30 PM", title: "Opening Ceremony" },
        { type: "coding",     time: "12:00 PM — 3:15 PM",  title: "Hacking Session Begins" },
        { type: "break",      time: "12:30 PM — 2:00 PM",  title: "Lunch Break" },
        { type: "ceremony",   time: "3:30 PM — 4:15 PM",   title: "Plenary Talk" },
        { type: "coding",     time: "4:15 PM — 6:00 PM",   title: "Hacking Continues" },
        { type: "evaluation", time: "6:00 PM — 7:00 PM",   title: "Evaluation Round 1 — Code Review" },
        { type: "coding",     time: "7:00 PM — 9:00 PM",   title: "Hacking Continues" },
        { type: "break",      time: "8:30 PM — 10:00 PM",  title: "Dinner Break" },
        { type: "evaluation", time: "10:30 PM",             title: "Evaluation Round 2 — Spin the Wheel" },
      ],
    },
    {
      day: "Day 2",
      date: "19th April",
      events: [
        { type: "break",      time: "12:30 AM — 1:30 AM",  title: "Recreational Activities" },
        { type: "coding",     time: "1:45 AM — 4:00 AM",   title: "Hacking Continues" },
        { type: "evaluation", time: "4:00 AM — 6:00 AM",   title: "Evaluation Round 3 — Duel" },
        { type: "break",      time: "8:30 AM — 9:30 AM",   title: "Breakfast Break" },
        { type: "coding",     time: "6:00 AM — 12:30 PM",  title: "Hacking Continues" },
        { type: "break",      time: "11:30 AM — 11:45 AM", title: "Hi-Tea" },
        { type: "evaluation", time: "12:30 PM",             title: "Final Evaluation — Judging Round" },
        { type: "ceremony",   time: "4:00 PM — 5:30 PM",   title: "Closing Ceremony" },
      ],
    },
  ],
};

export const TIMELINE_COLORS: Record<
  TimelineEventType,
  { dot: string; tag: string; bar: string }
> = {
  ceremony:   { dot: "#00E5FF", tag: "rgba(0,229,255,0.15)",  bar: "#00E5FF" },
  coding:     { dot: "#39FF14", tag: "rgba(57,255,20,0.12)",  bar: "#39FF14" },
  evaluation: { dot: "#FF3B00", tag: "rgba(255,59,0,0.15)",   bar: "#FF3B00" },
  break:      { dot: "#FFB800", tag: "rgba(255,184,0,0.12)",  bar: "#FFB800" },
};

// ─── TEAM ─────────────────────────────────────────────────────

export interface TeamMember {
  name: string;
  role: string;
  photo: string;
}

export const TEAM: {
  sectionNum: string;
  sectionLabel: string;
  title: string;
  subtitle: string;
  members: TeamMember[];
} = {
  sectionNum: "04",
  sectionLabel: "Steering Committee",
  title: "The HackDays Crew.",
  subtitle: "Architects of the 2026 HackDays Technical Infrastructure.",
  members: [
    { name: "Vedansh Mathur", role: "Operations Member", photo: "/team/Vedansh.jpeg" },
    { name: "Mehul Vig",      role: "Technical Lead",    photo: "/team/mehul.jpeg"   },
    { name: "Manasvi Bansal", role: "Operations Lead",   photo: "/team/manasvi.jpeg" },
  ],
};

// ─── FAQ ──────────────────────────────────────────────────────

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ: {
  sectionNum: string;
  sectionLabel: string;
  title: string;
  items: FAQItem[];
} = {
  sectionNum: "05",
  sectionLabel: "Race Control",
  title: "Your Questions, Answered",
  items: [
    {
      id: "01",
      question: "Participant Eligibility",
      answer:
        "Open to tech professionals and all students. Multidisciplinary teams are encouraged. Solo participants may also register.",
    },
    {
      id: "02",
      question: "Registration Process",
      answer:
        "Online registration through Unstop. Individual and team submissions accepted. Teams of up to 4 members allowed.",
    },
    {
      id: "03",
      question: "Awards & Recognition",
      answer:
        "Comprehensive prize structure including cash awards and other opportunities. Top three teams receive ₹30,000, ₹20,000, and ₹10,000 respectively.",
    },
    {
      id: "04",
      question: "Evaluation Methodology",
      answer:
        "Three evaluation rounds: Code Review, Spin the Wheel (random challenge), and a final Duel. All evaluation modes are offline.",
    },
  ],
};

// ─── LOCATION ─────────────────────────────────────────────────

export const LOCATION = {
  address: "67th Milestone, National Highway-8,\nSidhrawali, Gurugram, Haryana — 122413, India",
  date: "April 18–19, 2026",
  mapsUrl: "https://maps.app.goo.gl/LyTFJ2Jf233PFxiJA",
  embedUrl:
    "https://www.openstreetmap.org/export/embed.html?bbox=76.8101%2C28.2418%2C76.8201%2C28.2518&layer=mapnik",
} as const;

// ─── FOOTER ───────────────────────────────────────────────────

export const FOOTER = {
  ctaHeading: "HackDays 2026 frees you to focus on what matters most:",
  ctaAccent: "Building the future and reaching the finish line.",
  links: [
    { name: "Guidelines",     url: "#" },
    { name: "Privacy Policy", url: "#" },
    { name: "ACM BMU",        url: "https://www.acmbmu.com/" },
  ],
  credit: "ACM Student Chapter · BML Munjal University",
} as const;

// ─── NAV ──────────────────────────────────────────────────────

export const NAV_LINKS = [
  { label: "Home",     href: "#home"     },
  { label: "About",    href: "#about"    },
  { label: "Sponsors", href: "#sponsors" },
  { label: "Timeline", href: "#timeline" },
  { label: "Team",     href: "#team"     },
  { label: "FAQ",      href: "#faq"      },
] as const;

// ─── LEGACY ALIAS ─────────────────────────────────────────────
// Some components may import SITE_DATA — this keeps them working
// without any changes to those files.
export const SITE_DATA = {
  header: HERO,
  timer:  { label: HERO.timerLabel, targetDate: HERO.targetDate },
  about:  ABOUT,
  sponsors: SPONSORS,
  faq:    FAQ.items,
  stats:  ABOUT.stats,
  timeline: TIMELINE.days,
  crew:   TEAM.members,
  meta:   SITE_META,
  footer: FOOTER,

  steeringCrew: [
    { 
      name: "Vedansh Mathur", 
      role: "Operations Member", 
      image: "/Vedansh.jpeg", // Make sure these images are in your public/ folder!
      linkedin: "https://linkedin.com/in/vedansh" 
    },
    { 
      name: "Mehul Vig", 
      role: "Technical Lead", 
      image: "/mehul.jpeg", 
      linkedin: "https://linkedin.com/in/mehul" 
    },
    { 
      name: "Manasvi Bansal", 
      role: "Operations Lead", 
      image: "/manasvi.jpeg", 
      linkedin: "https://linkedin.com/in/manasvi" 
    }
  ],
};