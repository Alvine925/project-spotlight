import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { pickPalette } from "@/lib/auth";
import {
  Loader2,
  Copy,
  Check,
  ArrowUpRight,
  Compass,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/u/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.id.slice(0, 8)}'s Projects — ProjectAtlas` },
      {
        name: "description",
        content: "All projects from this developer, in one place.",
      },
      {
        property: "og:title",
        content: `@${params.id.slice(0, 8)}'s Projects — ProjectAtlas`,
      },
    ],
  }),
  component: Profile,
});

type PublicProject = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  url: string;
  category: string | null;
  tags: string[];
  status: string;
  color_from: string;
  color_to: string;
  tech_stack: string[];
};

/* ── Project card ── */
function ProjectCard({ project, index }: { project: PublicProject; index: number }) {
  let host = project.url;
  try {
    host = new URL(project.url).hostname.replace("www.", "");
  } catch {}

  return (
    <Link
      to="/project/$slug"
      params={{ slug: project.slug }}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[#111] transition-all duration-300 hover:-translate-y-1 hover:border-[#ff6600]/60 hover:shadow-[0_0_30px_-5px_rgba(255,102,0,0.35)]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Colored top strip */}
      <div
        className="relative flex h-36 w-full shrink-0 items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${project.color_from}, ${project.color_to})`,
        }}
      >
        {/* Subtle shine overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.15),transparent_55%)]" />
        {/* Big letter */}
        <span className="relative select-none font-display text-7xl font-black text-black/20 leading-none">
          {project.name[0]?.toUpperCase()}
        </span>
        {/* Status badge */}
        <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
          {project.status}
        </span>
        {/* Arrow */}
        <span className="absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-full bg-black/30 text-white/70 backdrop-blur-sm transition-all duration-300 group-hover:bg-[#ff6600] group-hover:text-white">
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-lg font-bold leading-tight text-white group-hover:text-[#ff6600] transition-colors duration-200">
            {project.name}
          </h3>
          {project.tagline && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/50">
              {project.tagline}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {project.category && (
              <span className="rounded-full bg-[#ff6600]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#ff6600]">
                {project.category}
              </span>
            )}
            {project.tags.slice(0, 1).map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-white/40"
              >
                {t}
              </span>
            ))}
          </div>
          <span className="shrink-0 font-mono text-[11px] text-white/30 truncate max-w-[40%]">
            {host}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Profile page ── */
function Profile() {
  const { id } = Route.useParams();
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const { data, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const [{ data: profile }, { data: projects }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, avatar_url, created_at")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("projects")
          .select("id, slug, name, tagline, url, category, tags, status, color_from, color_to, tech_stack")
          .eq("owner_id", id)
          .eq("published", true)
          .order("created_at", { ascending: false }),
      ]);
      return { profile, projects: (projects ?? []) as PublicProject[] };
    },
  });

  const name = data?.profile?.display_name || `dev-${id.slice(0, 6)}`;
  const allProjects = data?.projects ?? [];
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const [from, to] = pickPalette(id);

  const profileUrl = typeof window !== "undefined" ? window.location.href : "";

  const copy = () => {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const categories = [
    "All",
    ...Array.from(new Set(allProjects.map((p) => p.category).filter(Boolean) as string[])),
  ];

  const filtered =
    activeCategory === "All"
      ? allProjects
      : allProjects.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── Minimal top bar ── */}
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-[#ff6600]">
            <Compass className="h-4 w-4 text-black" strokeWidth={2.5} />
          </div>
          <span className="font-display text-sm font-semibold tracking-tight">ProjectAtlas</span>
        </Link>

        <button
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 transition-all hover:border-[#ff6600]/50 hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[#ff6600]" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy link"}
        </button>
      </header>

      {/* ── Hero ── */}
      {isLoading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="h-6 w-6 animate-spin text-[#ff6600]" />
        </div>
      ) : (
        <>
          <section className="px-6 pb-12 pt-8 md:px-10 md:pt-12">
            <div className="mx-auto max-w-5xl">
              <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">

                {/* Left — identity */}
                <div className="flex items-center gap-6">
                  {/* Avatar */}
                  <div
                    className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl font-display text-2xl font-black text-black shadow-[0_0_40px_-8px_rgba(255,102,0,0.6)]"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                  >
                    {initials}
                  </div>
                  <div>
                    <h1 className="font-display text-3xl font-black leading-none tracking-tight md:text-4xl">
                      {name}
                    </h1>
                    <p className="mt-1.5 font-mono text-sm text-white/40">
                      @{id.slice(0, 8)}
                    </p>
                  </div>
                </div>

                {/* Right — big project count */}
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-display text-7xl font-black leading-none md:text-8xl"
                    style={{ color: "#ff6600" }}
                  >
                    {allProjects.length}
                  </span>
                  <span className="font-display text-xl font-semibold text-white/30">
                    {allProjects.length === 1 ? "project" : "projects"}
                  </span>
                </div>
              </div>

              {/* Orange rule */}
              <div className="mt-10 h-px w-full bg-gradient-to-r from-[#ff6600] via-[#ff6600]/40 to-transparent" />
            </div>
          </section>

          {/* ── Filter tabs ── */}
          {categories.length > 1 && (
            <div className="px-6 pb-8 md:px-10">
              <div className="mx-auto max-w-5xl flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                      activeCategory === cat
                        ? "bg-[#ff6600] text-black"
                        : "border border-white/10 bg-white/5 text-white/50 hover:border-[#ff6600]/40 hover:text-white"
                    }`}
                  >
                    {cat}
                    {cat !== "All" && (
                      <span className={`ml-1.5 text-[10px] ${activeCategory === cat ? "opacity-60" : "opacity-40"}`}>
                        {allProjects.filter((p) => p.category === cat).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Projects grid ── */}
          <section className="px-6 pb-24 md:px-10">
            <div className="mx-auto max-w-5xl">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 py-20 text-center text-white/30">
                  <span className="font-display text-4xl font-black text-white/10">∅</span>
                  <p className="text-sm">No public projects yet.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((p, i) => (
                    <ProjectCard key={p.id} project={p} index={i} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Footer ── */}
          <footer className="border-t border-white/5 px-6 py-8 md:px-10">
            <div className="mx-auto max-w-5xl flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between">
              <p className="text-xs text-white/25">
                Built with{" "}
                <Link to="/" className="text-[#ff6600]/60 hover:text-[#ff6600] transition-colors">
                  ProjectAtlas
                </Link>
                {" "}— one link for all your projects.
              </p>
              <Link
                to="/submit"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#ff6600] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-black transition-all hover:scale-105 hover:shadow-[0_0_20px_-4px_rgba(255,102,0,0.7)]"
              >
                <ExternalLink className="h-3 w-3" />
                Get yours free
              </Link>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
