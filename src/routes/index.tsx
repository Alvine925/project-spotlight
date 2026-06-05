import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteNav } from "@/components/SiteNav";
import { ProjectCard, type ProjectRow } from "@/components/ProjectCard";
import { UrlSubmit } from "@/components/UrlSubmit";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, Globe, BarChart3, Layers, Loader2,
  Code2, Palette, Briefcase, Camera, PenLine, Trophy,
  Star, Zap, Share2, ImageIcon, ArrowRight, CheckCircle2,
} from "lucide-react";

const CATEGORIES = ["All", "App", "Website", "AI Tool", "Design", "Photography", "Branding", "Writing", "Architecture", "Video", "Marketing", "Other"];

const FEATURES = [
  {
    icon: Layers,
    title: "Project-based profiles",
    body: "Every item gets its own detail page — description, images, tech stack, proof metrics. Not just a link.",
  },
  {
    icon: Globe,
    title: "Clean portfolio pages",
    body: "A beautiful public profile URL you can drop in your bio, resume, or pitch deck.",
  },
  {
    icon: Share2,
    title: "One shareable link",
    body: "One link. All your work, services, skills, and qualifications — in one place.",
  },
  {
    icon: ImageIcon,
    title: "Image & proof support",
    body: "Add cover images, screenshots, galleries, and proof metrics like users, revenue, and downloads.",
  },
  {
    icon: BarChart3,
    title: "Built-in analytics",
    body: "See who's viewing your profile and which items get the most clicks — no third-party tools needed.",
  },
];

const EXAMPLE_PROFILES = [
  {
    type: "Developer",
    name: "Jordan Kim",
    role: "Full-Stack Developer",
    bio: "Building AI-powered developer tools. 3 SaaS products, $8k MRR.",
    projects: ["RepoRadar", "ShipFast CLI", "AnalyticsPro"],
    color: "#3b82f6",
  },
  {
    type: "Designer",
    name: "Sofia Laurent",
    role: "UI/UX & Brand Designer",
    bio: "Crafting delightful digital experiences for startups and scale-ups.",
    projects: ["Fintech Rebrand", "iOS App UI Kit", "SaaS Dashboard"],
    color: "#a855f7",
  },
  {
    type: "Freelancer",
    name: "Marcus Osei",
    role: "Freelance Web Developer",
    bio: "10+ years shipping production sites. Available for contract work.",
    projects: ["E-commerce Platform", "Real Estate App", "SaaS MVP"],
    color: "#10b981",
  },
];

const WHO_ITS_FOR = [
  { icon: Code2, label: "Developers", desc: "Side-projects, SaaS, open-source" },
  { icon: Palette, label: "Designers", desc: "UI/UX, branding, illustration" },
  { icon: Briefcase, label: "Freelancers", desc: "Services, case studies, clients" },
  { icon: Camera, label: "Photographers", desc: "Portfolios, shoots, galleries" },
  { icon: PenLine, label: "Writers", desc: "Articles, books, content work" },
  { icon: Trophy, label: "Creatives", desc: "Any skill, any medium" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProjectAtlas — One link for all your work" },
      { name: "description", content: "The portfolio platform for developers, designers, freelancers, and creatives. Showcase every project, skill, and qualification from a single link." },
    ],
  }),
  component: Home,
});

function Home() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return ((data ?? []) as unknown) as ProjectRow[];
    },
  });

  const filtered = useMemo(() => {
    const list = projects ?? [];
    return list.filter((p) => {
      const matchCat = cat === "All" || p.category === cat;
      const q = query.toLowerCase();
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.tagline ?? "").toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [projects, query, cat]);

  const [demoTab, setDemoTab] = useState<"Projects" | "Services" | "Skills" | "About">("Projects");

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* ── Hero ── */}
      <section id="hero" className="border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-6 pb-20 pt-20 text-center md:pt-28">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-[#ff6600]/20 bg-[#ff6600]/5 px-3 py-1 text-xs font-medium text-[#ff6600]">
            <Star className="h-3.5 w-3.5" /> For developers, designers, freelancers & creatives
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl">
            Show your projects,<br />
            <span className="text-[#ff6600]">not just your links.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-gray-500 md:text-lg">
            ProjectAtlas gives every creative professional a beautiful, shareable profile —
            with rich project pages, proof metrics, skills, services, and qualifications.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <UrlSubmit />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#ff6600] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e55a00]"
            >
              Create free page <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#examples"
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              View examples
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-[#ff6600]" /> Your own profile page
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-[#ff6600]" /> Projects, skills & qualifications
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-[#ff6600]" /> Built-in click analytics
            </span>
          </div>
        </div>
      </section>

      {/* ── Demo Preview ── */}
      <section className="border-b border-gray-100 bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">
              A portfolio page that actually shows your work
            </h2>
            <p className="mt-2 text-sm text-gray-500">Not just a list of links — rich project pages with everything a client or recruiter needs.</p>
          </div>
          {/* Mock profile preview */}
          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
            {/* Profile header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6600] to-[#ff9500] font-display text-lg font-black text-white">
                  J
                </div>
                <div>
                  <p className="font-display text-base font-bold text-gray-900">Jordan Kim</p>
                  <p className="text-xs text-gray-400">Full-Stack Developer · San Francisco</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#ff6600]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#ff6600]">Developer</span>
                <div className="flex gap-1.5">
                  <div className="h-6 w-6 rounded-full bg-gray-100" />
                  <div className="h-6 w-6 rounded-full bg-gray-100" />
                  <div className="h-6 w-6 rounded-full bg-gray-100" />
                </div>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex gap-5 border-b border-gray-100 px-6 text-sm">
              {(["Projects", "Services", "Skills", "About"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setDemoTab(t)}
                  className={`relative pb-2.5 pt-3 font-semibold transition-colors ${demoTab === t ? "text-[#ff6600]" : "text-gray-400 hover:text-gray-700"}`}
                >
                  {t}
                  {demoTab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#ff6600]" />}
                </button>
              ))}
            </div>

            {/* ── Projects tab ── */}
            {demoTab === "Projects" && (
              <div className="space-y-2.5 p-4">
                {[
                  { name: "RepoRadar", slug: "reporadar", tag: "AI Tool", status: "Live", desc: "AI-powered GitHub analytics — commit trends, PR heatmaps & contributor insights.", img: "/demo-reporadar.png", views: "2.4k views" },
                  { name: "ShipFast CLI", slug: "shipfast-cli", tag: "App", status: "Live", desc: "Zero-config deployment CLI. One command from local to production in under 60s.", img: "/demo-shipfast.png", views: "1.1k views" },
                  { name: "AnalyticsPro", slug: "analyticspro", tag: "App", status: "WIP", desc: "Product analytics for indie SaaS — funnels, retention cohorts & revenue dashboards.", img: "/demo-analyticspro.png", views: "874 views" },
                ].map((p) => (
                  <Link key={p.name} to="/demo/$slug" params={{ slug: p.slug }} className="flex items-center gap-4 rounded-xl border border-gray-100 p-3 transition-colors hover:border-[#ff6600]/30 hover:bg-orange-50/30 cursor-pointer">
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <img src={p.img} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-bold text-gray-900">{p.name}</p>
                      <p className="mt-0.5 text-[11px] text-gray-400 leading-snug line-clamp-1">{p.desc}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="rounded-full bg-[#ff6600]/10 px-2 py-0.5 text-[10px] font-semibold text-[#ff6600]">{p.tag}</span>
                        <span className={`flex items-center gap-1 text-[10px] font-semibold ${p.status === "Live" ? "text-green-600" : "text-amber-600"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${p.status === "Live" ? "bg-green-500" : "bg-amber-500"}`} />
                          {p.status}
                        </span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">{p.views}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-gray-300" />
                  </Link>
                ))}
              </div>
            )}

            {/* ── Services tab ── */}
            {demoTab === "Services" && (
              <div className="space-y-2.5 p-4">
                {[
                  { name: "Full-Stack Web Development", rate: "$150 / hr", desc: "End-to-end web apps using React, Node.js, and PostgreSQL. From MVP to production.", tags: ["React", "TypeScript", "Node.js"], avail: "Open" },
                  { name: "API Design & Integration", rate: "$120 / hr", desc: "REST and GraphQL API design, third-party integrations, and webhook systems.", tags: ["REST", "GraphQL", "OpenAI"], avail: "Open" },
                  { name: "Technical Code Review", rate: "$100 / hr", desc: "Architecture review, performance audits, and security checks for existing codebases.", tags: ["Consulting", "Security"], avail: "Limited" },
                ].map((s) => (
                  <div key={s.name} className="rounded-xl border border-gray-100 p-4 transition-colors hover:border-gray-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-display text-sm font-bold text-gray-900">{s.name}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${s.avail === "Open" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{s.avail}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-gray-400 leading-snug">{s.desc}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {s.tags.map((t) => <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">{t}</span>)}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-lg bg-[#ff6600]/10 px-2.5 py-1 text-xs font-bold text-[#ff6600]">{s.rate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Skills tab ── */}
            {demoTab === "Skills" && (
              <div className="p-4 space-y-4">
                {[
                  { category: "Languages", items: [{ name: "TypeScript", level: 95 }, { name: "Python", level: 85 }, { name: "Go", level: 70 }] },
                  { category: "Frontend", items: [{ name: "React", level: 98 }, { name: "Tailwind CSS", level: 92 }, { name: "Next.js", level: 88 }] },
                  { category: "Backend & Infra", items: [{ name: "Node.js", level: 90 }, { name: "PostgreSQL", level: 87 }, { name: "Docker", level: 80 }, { name: "AWS", level: 75 }] },
                ].map((group) => (
                  <div key={group.category}>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{group.category}</p>
                    <div className="space-y-2">
                      {group.items.map((skill) => (
                        <div key={skill.name} className="flex items-center gap-3">
                          <span className="w-24 shrink-0 text-xs font-medium text-gray-700">{skill.name}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-gray-100">
                            <div className="h-1.5 rounded-full bg-[#ff6600]" style={{ width: `${skill.level}%` }} />
                          </div>
                          <span className="w-8 text-right text-[10px] text-gray-400">{skill.level}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── About tab ── */}
            {demoTab === "About" && (
              <div className="p-4 space-y-4">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm leading-relaxed text-gray-600">
                    Hey — I'm Jordan. I'm a full-stack developer based in San Francisco, building AI-powered tools for developers. I started coding at 16, spent 3 years at a fintech startup, then went indie in 2022. I currently run three SaaS products generating $8k MRR.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    I'm obsessed with developer experience, fast iteration loops, and shipping things that actually get used. When I'm not building, I'm writing about indie hacking and AI tooling.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Years exp.", value: "5+" },
                    { label: "Products live", value: "3" },
                    { label: "MRR", value: "$8k" },
                  ].map((m) => (
                    <div key={m.label} className="rounded-lg border border-gray-100 bg-white p-3 text-center">
                      <p className="font-display text-xl font-black text-gray-900">{m.value}</p>
                      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">{m.label}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Education</p>
                  <div className="rounded-lg border border-gray-100 bg-white px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800">B.Sc. Computer Science — UC Berkeley</p>
                    <p className="text-xs text-gray-400">Graduated 2020 · GPA 3.8</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="border-b border-gray-100 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">Built for every creative professional</h2>
            <p className="mt-2 text-sm text-gray-500">Whatever you make, ProjectAtlas helps you share it.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {WHO_ITS_FOR.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm transition-colors hover:border-[#ff6600]/30">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff6600]/10">
                  <Icon className="h-5 w-5 text-[#ff6600]" />
                </div>
                <h3 className="font-display text-sm font-semibold text-gray-900">{label}</h3>
                <p className="mt-1 text-[11px] text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-b border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-gray-900 md:text-4xl">
              Everything Linktree doesn't have
            </h2>
            <p className="mt-3 text-gray-500">Real project pages. Not just links.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-[#ff6600]/20">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff6600]/10">
                  <f.icon className="h-5 w-5 text-[#ff6600]" />
                </div>
                <h3 className="font-display text-base font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="border-b border-gray-100 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center font-display text-2xl font-bold text-gray-900 md:text-3xl">
            How it works
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            Build your profile in minutes — no portfolio site required.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Globe,
                title: "1. Add your work",
                body: "Paste a URL for any project, case study, repo, demo, design, or portfolio piece.",
              },
              {
                icon: Layers,
                title: "2. Get your profile link",
                body: "Get a public page showcasing your projects, skills, services, and qualifications.",
              },
              {
                icon: BarChart3,
                title: "3. Share one link",
                body: "Drop it in your bio, resume, or proposals — track views and clicks per item.",
              },
            ].map((s) => (
              <div key={s.title} className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff6600]/10">
                  <s.icon className="h-5 w-5 text-[#ff6600]" />
                </div>
                <h3 className="font-display text-base font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Example Profiles ── */}
      <section id="examples" className="border-b border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-gray-900 md:text-4xl">
              See how others use it
            </h2>
            <p className="mt-3 text-gray-500">Developers, designers, and freelancers all in one place.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {EXAMPLE_PROFILES.map((ep) => (
              <div key={ep.name} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="h-20 w-full" style={{ background: `linear-gradient(135deg, ${ep.color}22, ${ep.color}08)` }} />
                <div className="-mt-8 px-5 pb-5">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl font-display text-xl font-black text-white shadow-sm"
                    style={{ background: ep.color }}
                  >
                    {ep.name[0]}
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-base font-bold text-gray-900">{ep.name}</h3>
                      <span className="rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{ep.type}</span>
                    </div>
                    <p className="text-xs text-gray-400">{ep.role}</p>
                    <p className="mt-2 text-sm text-gray-600">{ep.bio}</p>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    {ep.projects.map((proj) => (
                      <div key={proj} className="flex items-center gap-2.5 rounded-lg border border-gray-100 px-3 py-2">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#ff6600]" />
                        <span className="text-xs font-medium text-gray-700">{proj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Discover ── */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">
              Discover work
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              A growing catalogue of projects, portfolios, and side-builds from creators worldwide.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search work, tags…"
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600]/20"
            />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                cat === c
                  ? "border-[#ff6600] bg-[#ff6600] text-white"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#ff6600]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
            {projects?.length === 0 ? (
              <>
                <p className="text-base font-medium text-gray-900">No work showcased yet — be the first.</p>
                <Link
                  to="/submit"
                  className="mt-4 inline-flex rounded-full bg-[#ff6600] px-5 py-2 text-sm font-medium text-white hover:bg-[#e55a00]"
                >
                  Add your work
                </Link>
              </>
            ) : (
              <p className="text-gray-500">No work matches that search.</p>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ff6600]/20 bg-[#ff6600]/5 px-3 py-1 text-xs font-medium text-[#ff6600]">
            <Zap className="h-3.5 w-3.5" /> Free to get started
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-900 md:text-5xl">
            Build your portfolio<br />in minutes.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-gray-500">
            Join developers, designers, freelancers, and creatives who use ProjectAtlas to showcase their work.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-[#ff6600] px-7 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#e55a00]"
            >
              Create your free page <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-7 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-white"
            >
              Add your first project
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-10 text-center text-sm text-gray-400">
        ProjectAtlas · One link for every project, skill, and qualification you've built.
      </footer>
    </div>
  );
}
