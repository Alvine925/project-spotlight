import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteNav } from "@/components/SiteNav";
import { ProjectCard, type ProjectRow } from "@/components/ProjectCard";

import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

const CATEGORIES = ["All", "App", "Website", "AI Tool", "Design", "Photography", "Branding", "Writing", "Architecture", "Video", "Marketing", "Other"];

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
  const [demoTab, setDemoTab] = useState<"Projects" | "Services" | "Skills" | "About">("Projects");

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

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* ─── Hero ─── */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24 md:pt-32">
          <p className="mb-5 text-sm font-medium text-[#ff6600]">
            For developers, designers, freelancers &amp; creatives
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl md:text-7xl">
            Show your projects,<br />
            <span className="text-[#ff6600]">not just your links.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base text-gray-500 md:text-lg leading-relaxed">
            ProjectAtlas gives every creative professional a beautiful, shareable profile —
            rich project pages, proof metrics, skills, services, and qualifications.
            All from one link.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff6600] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#e55a00]"
            >
              Create free page <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard"
              search={{ add: "1" }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              Add a project
            </Link>

          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-400">
            <span>Your own profile page</span>
            <span>Projects, skills &amp; qualifications</span>
            <span>Built-in click analytics</span>
          </div>
        </div>
      </section>

      {/* ─── Demo Preview ─── */}
      <section className="border-b border-gray-100 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 sm:mb-12">
            <h2 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
              A portfolio that actually shows your work
            </h2>
            <p className="mt-3 max-w-xl text-gray-500">
              Not just a list of links — rich project pages with everything a client or recruiter needs.
            </p>
          </div>

          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
            {/* Profile header */}
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff6600] to-[#ff9500] font-display text-base font-black text-white">
                  J
                </div>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-gray-900">Jordan Kim</p>
                  <p className="truncate text-xs text-gray-400">Full-Stack Developer · San Francisco</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-[#ff6600]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#ff6600]">Developer</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-5 overflow-x-auto border-b border-gray-100 px-4 text-sm sm:px-6">
              {(["Projects", "Services", "Skills", "About"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setDemoTab(t)}
                  className={`relative shrink-0 pb-2.5 pt-3 font-semibold transition-colors ${demoTab === t ? "text-[#ff6600]" : "text-gray-400 hover:text-gray-700"}`}
                >
                  {t}
                  {demoTab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#ff6600]" />}
                </button>
              ))}
            </div>

            {/* Projects tab */}
            {demoTab === "Projects" && (
              <div className="space-y-px p-4">
                {[
                  { name: "RepoRadar", slug: "reporadar", tag: "AI Tool", status: "Live", desc: "AI-powered GitHub analytics — commit trends, PR heatmaps & contributor insights.", img: "/demo-reporadar.png", views: "2.4k views" },
                  { name: "ShipFast CLI", slug: "shipfast-cli", tag: "App", status: "Live", desc: "Zero-config deployment CLI. One command from local to production in under 60s.", img: "/demo-shipfast.png", views: "1.1k views" },
                  { name: "AnalyticsPro", slug: "analyticspro", tag: "App", status: "WIP", desc: "Product analytics for indie SaaS — funnels, retention cohorts & revenue dashboards.", img: "/demo-analyticspro.png", views: "874 views" },
                ].map((p) => (
                  <Link key={p.name} to="/demo/$slug" params={{ slug: p.slug }}
                    className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50 sm:gap-4">
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:w-20">
                      <img src={p.img} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-bold text-gray-900">{p.name}</p>
                      <p className="mt-0.5 text-[11px] text-gray-400 line-clamp-1">{p.desc}</p>
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

            {/* Services tab */}
            {demoTab === "Services" && (
              <div className="divide-y divide-gray-50 p-4">
                {[
                  { name: "Full-Stack Web Development", rate: "$150 / hr", desc: "End-to-end web apps using React, Node.js, and PostgreSQL. From MVP to production.", tags: ["React", "TypeScript", "Node.js"], avail: "Open" },
                  { name: "API Design & Integration", rate: "$120 / hr", desc: "REST and GraphQL API design, third-party integrations, and webhook systems.", tags: ["REST", "GraphQL", "OpenAI"], avail: "Open" },
                  { name: "Technical Code Review", rate: "$100 / hr", desc: "Architecture review, performance audits, and security checks for existing codebases.", tags: ["Consulting", "Security"], avail: "Limited" },
                ].map((s) => (
                  <div key={s.name} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-display text-sm font-bold text-gray-900">{s.name}</p>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${s.avail === "Open" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{s.avail}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-gray-400">{s.desc}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {s.tags.map((t) => <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">{t}</span>)}
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-[#ff6600]">{s.rate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills tab */}
            {demoTab === "Skills" && (
              <div className="p-4 space-y-5">
                {[
                  { category: "Languages", items: [{ name: "TypeScript", level: 95 }, { name: "Python", level: 85 }, { name: "Go", level: 70 }] },
                  { category: "Frontend", items: [{ name: "React", level: 98 }, { name: "Tailwind CSS", level: 92 }, { name: "Next.js", level: 88 }] },
                  { category: "Backend & Infra", items: [{ name: "Node.js", level: 90 }, { name: "PostgreSQL", level: 87 }, { name: "Docker", level: 80 }, { name: "AWS", level: 75 }] },
                ].map((group) => (
                  <div key={group.category}>
                    <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{group.category}</p>
                    <div className="space-y-2.5">
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

            {/* About tab */}
            {demoTab === "About" && (
              <div className="p-4 space-y-4">
                <p className="text-sm leading-relaxed text-gray-600">
                  Hey — I'm Jordan. I'm a full-stack developer based in San Francisco, building AI-powered tools for developers. I started coding at 16, spent 3 years at a fintech startup, then went indie in 2022. I currently run three SaaS products generating $8k MRR.
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  I'm obsessed with developer experience, fast iteration loops, and shipping things that actually get used.
                </p>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {[{ label: "Years exp.", value: "5+" }, { label: "Products live", value: "3" }, { label: "MRR", value: "$8k" }].map((m) => (
                    <div key={m.label} className="text-center">
                      <p className="font-display text-2xl font-black text-gray-900">{m.value}</p>
                      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">{m.label}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-1">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Education</p>
                  <p className="text-sm font-semibold text-gray-800">B.Sc. Computer Science — UC Berkeley</p>
                  <p className="text-xs text-gray-400">Graduated 2020 · GPA 3.8</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="border-b border-gray-100 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14">
            <h2 className="font-display text-3xl font-bold text-gray-900 md:text-4xl">
              Everything Linktree doesn't have
            </h2>
            <p className="mt-3 text-gray-500">Real project pages. Not just links.</p>
          </div>

          <div className="grid gap-x-16 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Project-based profiles", body: "Every item gets its own detail page — description, images, tech stack, proof metrics. Not just a link." },
              { title: "Clean portfolio pages", body: "A beautiful public profile URL you can drop in your bio, resume, or pitch deck." },
              { title: "One shareable link", body: "One link. All your work, services, skills, and qualifications — in one place." },
              { title: "Image & proof support", body: "Add cover images, screenshots, galleries, and proof metrics like users, revenue, and downloads." },
              { title: "Built-in analytics", body: "See who's viewing your profile and which items get the most clicks — no third-party tools needed." },
              { title: "Services & skills", body: "List your services with rates, skill proficiency bars, certifications, and qualifications alongside your work." },
            ].map((f) => (
              <div key={f.title}>
                <h3 className="font-display text-base font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Who it's for ─── */}
      <section className="border-b border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12">
            <h2 className="font-display text-3xl font-bold text-gray-900 md:text-4xl">
              Built for every creative professional
            </h2>
            <p className="mt-3 text-gray-500">Whatever you make, ProjectAtlas helps you share it.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {[
              { label: "Developers", desc: "Side-projects, SaaS apps, open-source libraries, and CLI tools." },
              { label: "Designers", desc: "UI/UX work, brand systems, illustration portfolios, and case studies." },
              { label: "Freelancers", desc: "Services, client work, testimonials, and availability status." },
              { label: "Photographers", desc: "Shoot galleries, client portfolios, and licensing information." },
              { label: "Writers", desc: "Articles, books, content campaigns, and ghostwriting work." },
              { label: "Creatives", desc: "Architects, marketers, video creators — any skill, any medium." },
            ].map(({ label, desc }) => (
              <div key={label}>
                <h3 className="font-display text-sm font-bold text-gray-900">{label}</h3>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how" className="border-b border-gray-100 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14">
            <h2 className="font-display text-3xl font-bold text-gray-900 md:text-4xl">
              How it works
            </h2>
            <p className="mt-3 text-gray-500">Build your profile in minutes — no portfolio site required.</p>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            {[
              { n: "01", title: "Add your work", body: "Paste a URL for any project, case study, repo, demo, or portfolio piece. AI fills in the details instantly." },
              { n: "02", title: "Get your profile link", body: "A public page showcasing your projects, skills, services, and qualifications — ready to share." },
              { n: "03", title: "Share one link", body: "Drop it in your bio, resume, or proposals — track views and clicks per item with built-in analytics." },
            ].map((s) => (
              <div key={s.n}>
                <p className="font-display text-4xl font-black text-[#ff6600]/20">{s.n}</p>
                <h3 className="mt-3 font-display text-base font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Example Profiles ─── */}
      <section id="examples" className="border-b border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-14">
            <h2 className="font-display text-3xl font-bold text-gray-900 md:text-4xl">
              See how others use it
            </h2>
            <p className="mt-3 text-gray-500">Developers, designers, and freelancers all in one place.</p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {[
              { name: "Jordan Kim", role: "Full-Stack Developer", bio: "Building AI-powered developer tools. 3 SaaS products, $8k MRR.", projects: ["RepoRadar", "ShipFast CLI", "AnalyticsPro"], color: "#3b82f6" },
              { name: "Sofia Laurent", role: "UI/UX & Brand Designer", bio: "Crafting delightful digital experiences for startups and scale-ups.", projects: ["Fintech Rebrand", "iOS App UI Kit", "SaaS Dashboard"], color: "#a855f7" },
              { name: "Marcus Osei", role: "Freelance Web Developer", bio: "10+ years shipping production sites. Available for contract work.", projects: ["E-commerce Platform", "Real Estate App", "SaaS MVP"], color: "#10b981" },
            ].map((ep) => (
              <div key={ep.name}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-display text-sm font-black text-white"
                    style={{ background: ep.color }}
                  >
                    {ep.name[0]}
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-gray-900">{ep.name}</p>
                    <p className="text-xs text-gray-400">{ep.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">{ep.bio}</p>
                <div className="space-y-2">
                  {ep.projects.map((proj) => (
                    <div key={proj} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#ff6600]" />
                      {proj}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Discover ─── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:mb-10 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">Discover work</h2>
            <p className="mt-2 text-gray-500">
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

        <div className="mb-6 flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:mb-8 sm:flex-wrap sm:overflow-visible">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
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
          <div className="py-16 text-center">
            {projects?.length === 0 ? (
              <>
                <p className="text-base font-medium text-gray-900">No work showcased yet — be the first.</p>
                <Link
                  to="/dashboard"
                  search={{ add: "1" }}
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

      {/* ─── Final CTA ─── */}
      <section className="border-t border-gray-100 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="mb-4 text-sm font-medium text-[#ff6600]">Free to get started</p>
          <h2 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl md:text-6xl leading-[1.08]">
            Build your portfolio<br />in minutes.
          </h2>
          <p className="mt-5 max-w-md text-gray-500 leading-relaxed">
            Join developers, designers, freelancers, and creatives who use ProjectAtlas to showcase their work.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff6600] px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-[#e55a00]"
            >
              Create your free page <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard"
              search={{ add: "1" }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 px-7 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
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
