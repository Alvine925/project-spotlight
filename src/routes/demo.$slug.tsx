import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Globe, ExternalLink, Heart, Share2, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/demo/$slug")({
  head: () => ({ meta: [{ title: "Demo Project — ProjectAtlas" }] }),
  component: DemoProject,
});

const TECH_COLORS: Record<string, string> = {
  typescript: "#3178c6", javascript: "#f7df1e", react: "#61dafb",
  "node.js": "#339933", python: "#3776ab", postgresql: "#4169e1",
  "tailwind css": "#06b6d4", tailwind: "#06b6d4", nextjs: "#000000",
  openai: "#10a37f", docker: "#2496ed", aws: "#ff9900", go: "#00add8",
  redis: "#dc382d", vercel: "#000000", bash: "#4eaa25", rust: "#dea584",
  supabase: "#3ecf8e",
};

function TechBadge({ name }: { name: string }) {
  const color = TECH_COLORS[name.toLowerCase()] ?? "#ff6600";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm">
      <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: color }} />
      {name}
    </span>
  );
}

const DEMOS: Record<string, {
  name: string; tagline: string; description: string; url: string; host: string;
  category: string; status: "Live" | "WIP"; tags: string[];
  tech: string[]; features: string[]; useCases: string[];
  cover: string; views: number; likes: number; stars: number;
  metrics: { label: string; value: string }[];
}> = {
  "reporadar": {
    name: "RepoRadar",
    tagline: "AI-powered GitHub analytics for developers who care about momentum.",
    description: "RepoRadar connects to your GitHub account and uses OpenAI to surface insights you'd normally miss — commit velocity trends, stale PR patterns, contributor burnout signals, and release cadence health. Instead of raw numbers, you get plain-English summaries that tell you whether your project is accelerating or slowing down, and why.",
    url: "https://reporadar.app",
    host: "reporadar.app",
    category: "AI Tool",
    status: "Live",
    tags: ["github", "analytics", "developer tools", "ai"],
    tech: ["TypeScript", "React", "Python", "OpenAI", "PostgreSQL", "Supabase", "Tailwind CSS", "Vercel"],
    features: [
      "Natural-language summaries of repo health and momentum",
      "Commit heatmaps and PR cycle-time tracking",
      "Contributor activity and burnout-risk signals",
      "Stale branch and dead-code detection",
      "Weekly email digests with AI commentary",
      "Team comparison dashboards for orgs",
    ],
    useCases: [
      "Solo founders tracking a side project's growth",
      "Engineering managers monitoring team velocity",
      "Open-source maintainers watching contributor engagement",
      "Investors doing technical due diligence on dev teams",
    ],
    cover: "/demo-reporadar.png",
    views: 2418, likes: 134, stars: 87,
    metrics: [
      { label: "Active users", value: "1.2k" },
      { label: "Repos tracked", value: "8.4k" },
      { label: "MRR", value: "$3,200" },
    ],
  },
  "shipfast-cli": {
    name: "ShipFast CLI",
    tagline: "Zero-config deployments. One command from local to production in under 60 seconds.",
    description: "ShipFast CLI wraps Docker, Nginx, and cloud provider APIs into a single `ship` command. No YAML files. No Kubernetes config. You run `ship deploy` and it builds your container, pushes it to your registry, updates the load balancer, and gives you a live URL — all in under a minute. It supports Node.js, Python, Go, and Rust out of the box.",
    url: "https://shipfast.dev",
    host: "shipfast.dev",
    category: "App",
    status: "Live",
    tags: ["devops", "cli", "deployment", "docker"],
    tech: ["Go", "Bash", "Docker", "AWS", "Rust", "Vercel", "Redis"],
    features: [
      "Zero-config detection for Node, Python, Go, and Rust apps",
      "Automatic HTTPS via Let's Encrypt",
      "Rollback to any previous deploy with `ship rollback`",
      "Environment variable management with `ship env set`",
      "Real-time build logs streamed to your terminal",
      "GitHub Actions integration for CI/CD pipelines",
    ],
    useCases: [
      "Indie hackers who want to skip DevOps entirely",
      "Small teams deploying multiple microservices",
      "Side projects that outgrow Heroku pricing",
      "Freelancers shipping client sites fast",
    ],
    cover: "/demo-shipfast.png",
    views: 1103, likes: 92, stars: 211,
    metrics: [
      { label: "Downloads/month", value: "14k" },
      { label: "Deploys run", value: "230k" },
      { label: "GitHub stars", value: "2.1k" },
    ],
  },
  "analyticspro": {
    name: "AnalyticsPro",
    tagline: "Product analytics for indie SaaS — funnels, retention cohorts, and revenue dashboards in one place.",
    description: "AnalyticsPro is a lightweight alternative to Mixpanel or Amplitude, built specifically for solo founders and small teams. Drop in the JavaScript snippet, and within minutes you get funnel visualisation, cohort retention grids, revenue breakdowns by plan, and churn prediction scoring — all without needing a data engineer. Everything is GDPR-compliant by default.",
    url: "https://analyticspro.co",
    host: "analyticspro.co",
    category: "App",
    status: "WIP",
    tags: ["analytics", "saas", "product", "data"],
    tech: ["TypeScript", "React", "Node.js", "PostgreSQL", "Python", "Tailwind CSS", "Supabase"],
    features: [
      "Conversion funnel builder with drag-and-drop steps",
      "Retention cohort grid with weekly and monthly views",
      "MRR, ARR, churn, and LTV dashboards",
      "User-level event timeline for debugging drop-offs",
      "GDPR-compliant by default — no cookie consent needed",
      "Slack alerts for churn spikes and conversion drops",
    ],
    useCases: [
      "Indie SaaS founders tracking trial-to-paid conversion",
      "Product managers running A/B tests without engineering",
      "Customer success teams identifying at-risk accounts",
      "Investors monitoring portfolio company KPIs",
    ],
    cover: "/demo-analyticspro.png",
    views: 874, likes: 61, stars: 34,
    metrics: [
      { label: "Beta users", value: "240" },
      { label: "Events tracked / day", value: "1.8M" },
      { label: "Target MRR", value: "$5k" },
    ],
  },
};

function DemoProject() {
  const { slug } = Route.useParams();
  const project = DEMOS[slug];

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(project?.likes ?? 0);
  const [copied, setCopied] = useState(false);

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
        <p className="font-display text-xl font-bold text-gray-900">Demo project not found</p>
        <Link to="/" className="rounded-full bg-[#ff6600] px-5 py-2 text-sm font-semibold text-white">
          Back home
        </Link>
      </div>
    );
  }

  const copy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => liked ? prev - 1 : prev + 1);
  };

  const isLive = project.status === "Live";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link to="/" className="font-display text-base font-bold text-[#ff6600]">
              ProjectAtlas
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 sm:inline">
              Demo profile
            </span>
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-[#ff6600]/40 hover:text-[#ff6600]"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#ff6600]" /> : <Copy className="h-3.5 w-3.5" />}
              Copy Link
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-10">

          {/* Main */}
          <main className="min-w-0">
            {/* Identity */}
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isLive ? "bg-green-500" : "bg-amber-400"}`} />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {project.status}
                </span>
                <span className="rounded-full bg-[#ff6600]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#ff6600]">
                  {project.category}
                </span>
              </div>
              <h1 className="font-display text-3xl font-black leading-tight text-gray-900 md:text-4xl">
                {project.name}
              </h1>
              <p className="mt-1.5 text-base text-gray-500">{project.tagline}</p>
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#ff6600] hover:underline"
              >
                <Globe className="h-4 w-4" />
                {project.host}
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.map((t) => (
                  <span key={t} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-500">{t}</span>
                ))}
              </div>
            </div>

            {/* Cover */}
            <div className="mb-6 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
              <img src={project.cover} alt={project.name} className="w-full object-cover" style={{ aspectRatio: "16/9" }} />
            </div>

            {/* Sections */}
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
              <div className="px-5 py-5">
                <h2 className="font-display text-base font-bold text-gray-900">About</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{project.description}</p>
              </div>

              {/* Proof metrics */}
              <div className="px-5 py-5">
                <h2 className="font-display text-base font-bold text-gray-900">Proof metrics</h2>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {project.metrics.map((m) => (
                    <div key={m.label} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
                      <p className="font-display text-xl font-black text-gray-900">{m.value}</p>
                      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 py-5">
                <h2 className="font-display text-base font-bold text-gray-900">Tech Stack</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tech.map((t) => <TechBadge key={t} name={t} />)}
                </div>
              </div>

              <div className="px-5 py-5">
                <h2 className="font-display text-base font-bold text-gray-900">Features</h2>
                <ul className="mt-3 space-y-2">
                  {project.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6600]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-5 py-5">
                <h2 className="font-display text-base font-bold text-gray-900">Use Cases</h2>
                <ul className="mt-3 space-y-2">
                  {project.useCases.map((u) => (
                    <li key={u} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6600]" />
                      {u}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-5 py-5">
                <h2 className="font-display text-base font-bold text-gray-900">Gallery</h2>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="aspect-video overflow-hidden rounded-lg border border-gray-100">
                      <img
                        src={project.cover}
                        alt={`${project.name} screenshot ${i + 1}`}
                        className="h-full w-full object-cover"
                        style={{ objectPosition: i === 0 ? "top" : i === 1 ? "center" : "bottom" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 rounded-xl border border-[#ff6600]/20 bg-[#ff6600]/5 p-5 text-center">
              <p className="text-sm font-semibold text-gray-700">This is a demo project page.</p>
              <p className="mt-1 text-xs text-gray-400">Create your free account to showcase your own work like this.</p>
              <Link
                to="/auth"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#ff6600] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#e55a00]"
              >
                Create your free page →
              </Link>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="mt-6 space-y-4 lg:mt-0 lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Stats</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Views</span>
                  <span className="font-mono font-semibold text-gray-900">{project.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Stars</span>
                  <span className="font-mono font-semibold text-gray-900">{project.stars}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Likes</span>
                  <span className="font-mono font-semibold text-gray-900">{likes}</span>
                </div>
              </div>
              <button
                onClick={toggleLike}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  liked
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                }`}
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                {liked ? "Liked!" : "Like this project"}
              </button>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Links</h3>
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#ff6600]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-green-100">
                    <Globe className="h-3.5 w-3.5 text-green-600" />
                  </span>
                  Live Site
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-gray-300" />
              </a>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Share</h3>
              <button
                onClick={copy}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#ff6600]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100">
                  {copied ? <Check className="h-3.5 w-3.5 text-[#ff6600]" /> : <Share2 className="h-3.5 w-3.5 text-gray-500" />}
                </span>
                {copied ? "Link copied!" : "Copy link"}
              </button>
            </div>

            <div className="rounded-xl border border-[#ff6600]/20 bg-[#ff6600]/5 p-4">
              <p className="text-xs font-semibold text-gray-700">Want a page like this?</p>
              <p className="mt-1 text-[11px] text-gray-400 leading-relaxed">
                ProjectAtlas is free for creators. Showcase your work in minutes.
              </p>
              <Link
                to="/auth"
                className="mt-3 flex items-center justify-center rounded-lg bg-[#ff6600] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#e55a00]"
              >
                Create free page
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
