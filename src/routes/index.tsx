import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteNav } from "@/components/SiteNav";
import { ProjectCard, type ProjectRow } from "@/components/ProjectCard";
import { UrlSubmit } from "@/components/UrlSubmit";
import { supabase } from "@/integrations/supabase/client";
import { Search, Globe, BarChart3, Layers, Loader2 } from "lucide-react";

const CATEGORIES = ["All", "Productivity", "AI", "Developer Tools", "Finance", "Marketing", "Other"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProjectAtlas — One link for all your work" },
      { name: "description", content: "The link-in-bio for builders. Freelancers, developers, designers, and creators — showcase every project, skill, and qualification from a single link." },
      { property: "og:title", content: "ProjectAtlas — One link for all your work" },
      { property: "og:description", content: "Freelancers, developers, and creators — showcase every project and skill from a single link." },
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

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* Hero */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-6 pb-20 pt-20 text-center md:pt-28">
          <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl">
            One link.<br />
            <span className="text-[#ff6600]">All your work.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-gray-500 md:text-lg">
            For freelancers, developers, designers, and creators. ProjectAtlas turns every
            project, skill, and qualification you've built into a single shareable profile.
          </p>

          <div className="mt-8 flex justify-center">
            <UrlSubmit />
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

      {/* How it works */}
      <section id="how" className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-5xl px-6 py-16">
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
                body: "Paste a URL for any project, case study, repo, demo, or portfolio piece.",
              },
              {
                icon: Layers,
                title: "2. Get your profile link",
                body: "Get a public page showcasing your projects, skills, and qualifications.",
              },
              {
                icon: BarChart3,
                title: "3. Share one link",
                body: "Drop it in your bio, resume, or proposals — track views and clicks.",
              },
            ].map((s) => (
              <div
                key={s.title}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
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

      {/* Discover */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">
              Discover work
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              A growing catalogue of projects, portfolios, and side-builds from builders worldwide.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, tags…"
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
                <p className="text-base font-medium text-gray-900">No projects yet — be the first.</p>
                <Link
                  to="/submit"
                  className="mt-4 inline-flex rounded-full bg-[#ff6600] px-5 py-2 text-sm font-medium text-white hover:bg-[#e55a00]"
                >
                  Add your project
                </Link>
              </>
            ) : (
              <p className="text-gray-500">No projects match that search.</p>
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

      <footer className="border-t border-gray-100 py-10 text-center text-sm text-gray-400">
        ProjectAtlas · One link for every project, skill, and qualification you've built.
      </footer>
    </div>
  );
}
