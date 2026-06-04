export type Project = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
  features: string[];
  useCases: string[];
  techStack: string[];
  status: "Live" | "Beta" | "New";
  addedAt: string;
  color: string;
};

export const mockProjects: Project[] = [
  {
    id: "taskflow",
    name: "TaskFlow",
    tagline: "AI-powered task management for distributed teams",
    description:
      "TaskFlow uses AI to automatically organize, prioritize, and assign tasks across your team. It learns from your workflows and helps eliminate the busywork of project management.",
    url: "https://taskflow.example.com",
    category: "Productivity",
    tags: ["SaaS", "AI", "Teams", "Productivity"],
    features: ["Smart task prioritization", "AI assignment", "Slack integration", "Sprint planning"],
    useCases: ["Remote engineering teams", "Agencies juggling client work", "Solo founders staying organized"],
    techStack: ["Next.js", "PostgreSQL", "OpenAI", "Vercel"],
    status: "Live",
    addedAt: "2 days ago",
    color: "from-orange-500 to-amber-400",
  },
  {
    id: "invoicely",
    name: "Invoicely",
    tagline: "Automated invoicing for freelancers",
    description:
      "Generate, send, and track invoices automatically. Invoicely watches your time tracker and creates client-ready invoices on a schedule you set.",
    url: "https://invoicely.example.com",
    category: "Finance",
    tags: ["Invoicing", "Freelancers", "SaaS"],
    features: ["Auto-invoice generation", "Stripe payments", "Recurring billing", "PDF export"],
    useCases: ["Independent contractors", "Small agencies", "Bookkeepers"],
    techStack: ["Remix", "Stripe", "Supabase"],
    status: "Live",
    addedAt: "5 days ago",
    color: "from-amber-500 to-orange-300",
  },
  {
    id: "pixelforge",
    name: "PixelForge",
    tagline: "Design system generator from a single brand color",
    description:
      "Paste a hex code, get a full design system: tokens, components, dark mode, and a Figma kit. PixelForge handles the math so designers can focus on craft.",
    url: "https://pixelforge.example.com",
    category: "Developer Tools",
    tags: ["Design", "Tooling", "Open Source"],
    features: ["Token generation", "Figma export", "Dark mode auto", "Tailwind preset"],
    useCases: ["Indie hackers shipping fast", "Design teams scaling systems"],
    techStack: ["SvelteKit", "TypeScript", "Cloudflare"],
    status: "Beta",
    addedAt: "1 week ago",
    color: "from-orange-600 to-rose-400",
  },
  {
    id: "loopstudio",
    name: "Loop Studio",
    tagline: "Background music for builders",
    description:
      "Generative ambient loops tuned for deep work. Loop Studio composes endless music in real time, matching your focus state.",
    url: "https://loopstudio.example.com",
    category: "AI",
    tags: ["Audio", "AI", "Focus"],
    features: ["Generative loops", "Mood presets", "Pomodoro sync"],
    useCases: ["Deep work sessions", "Creative writing", "Live streams"],
    techStack: ["WebAudio", "React", "Python"],
    status: "New",
    addedAt: "Today",
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "shipdocs",
    name: "ShipDocs",
    tagline: "Docs that update themselves from your codebase",
    description:
      "ShipDocs reads your repo, infers API surfaces, and writes documentation that stays in sync with every PR.",
    url: "https://shipdocs.example.com",
    category: "Developer Tools",
    tags: ["Docs", "DX", "GitHub"],
    features: ["GitHub sync", "AI-written guides", "Custom domains", "Search"],
    useCases: ["OSS maintainers", "Internal platform teams"],
    techStack: ["Astro", "TypeScript", "OpenAI"],
    status: "Live",
    addedAt: "3 days ago",
    color: "from-orange-400 to-red-400",
  },
  {
    id: "harborlist",
    name: "HarborList",
    tagline: "Waitlists that don't feel like waitlists",
    description:
      "Beautiful, branded waitlist pages with referral mechanics and analytics — built in 60 seconds.",
    url: "https://harborlist.example.com",
    category: "Marketing",
    tags: ["Waitlist", "Growth", "SaaS"],
    features: ["Referral leaderboards", "Email automation", "Custom domains"],
    useCases: ["Pre-launch startups", "Product Hunt drops"],
    techStack: ["Next.js", "Resend", "Postgres"],
    status: "Live",
    addedAt: "2 weeks ago",
    color: "from-amber-400 to-orange-600",
  },
];

export const categories = [
  "All",
  "Productivity",
  "AI",
  "Developer Tools",
  "Finance",
  "Marketing",
];
