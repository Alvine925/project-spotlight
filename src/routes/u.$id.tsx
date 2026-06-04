import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { pickPalette } from "@/lib/auth";
import { Loader2, Copy, Check, ArrowUpRight, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/u/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.id.slice(0, 8)}'s Projects — ProjectAtlas` },
      { name: "description", content: "All projects from this developer, in one place." },
      { property: "og:title", content: `@${params.id.slice(0, 8)}'s Projects — ProjectAtlas` },
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

function ProjectCard({ project, index }: { project: PublicProject; index: number }) {
  let host = project.url;
  try { host = new URL(project.url).hostname.replace("www.", ""); } catch {}

  const num = String(index + 1).padStart(2, "0");

  return (
    <Link
      to="/project/$slug"
      params={{ slug: project.slug }}
      className="group relative block"
    >
      <article className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d0d0d] transition-all duration-500 hover:border-[#ff6600]/40 hover:shadow-[0_8px_40px_-12px_rgba(255,102,0,0.4)] hover:-translate-y-1">

        {/* Colored gradient header */}
        <div
          className="relative overflow-hidden"
          style={{
            height: "180px",
            background: `linear-gradient(135deg, ${project.color_from}, ${project.color_to})`,
          }}
        >
          {/* Diagonal texture */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 14px)",
            }}
          />
          {/* Shine */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,255,255,0.2),transparent_60%)]" />

          {/* Large letter watermark */}
          <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
            <span className="font-display text-[120px] font-black leading-none text-black/[0.15]">
              {project.name[0]?.toUpperCase()}
            </span>
          </div>

          {/* Card number */}
          <span className="absolute left-4 top-4 font-mono text-xs font-bold text-black/40">
            {num}
          </span>

          {/* Status */}
          <span className="absolute right-4 top-4 rounded-full bg-black/25 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/70 backdrop-blur-md">
            {project.status}
          </span>

          {/* Arrow hover target */}
          <div className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white/60 backdrop-blur-sm transition-all duration-300 group-hover:bg-[#ff6600] group-hover:text-black">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Body */}
        <div className="p-5 pt-4">
          <h3 className="font-display text-[18px] font-bold leading-snug text-white transition-colors duration-200 group-hover:text-[#ff6600]">
            {project.name}
          </h3>

          {project.tagline && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/40">
              {project.tagline}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {project.category && (
                <span className="rounded-full border border-[#ff6600]/20 bg-[#ff6600]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#ff6600]">
                  {project.category}
                </span>
              )}
              {project.tags.slice(0, 1).map((t) => (
                <span key={t} className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-[11px] text-white/30">
                  {t}
                </span>
              ))}
            </div>
            <span className="shrink-0 font-mono text-[11px] text-white/20 truncate max-w-[38%]">{host}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function Profile() {
  const { id } = Route.useParams();
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const [{ data: profile }, { data: projects }] = await Promise.all([
        supabase.from("profiles").select("id, display_name, avatar_url, bio, created_at").eq("id", id).maybeSingle(),
        supabase.from("projects")
          .select("id, slug, name, tagline, url, category, tags, status, color_from, color_to, tech_stack")
          .eq("owner_id", id).eq("published", true).order("created_at", { ascending: false }),
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

  const categories = ["All", ...Array.from(new Set(allProjects.map((p) => p.category).filter(Boolean) as string[]))];
  const filtered = activeCategory === "All" ? allProjects : allProjects.filter((p) => p.category === activeCategory);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-6 w-6 animate-spin text-[#ff6600]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link to="/" className="font-display text-sm font-bold tracking-tight text-white/30 hover:text-white transition-colors">
          ProjectAtlas
        </Link>
        <button
          onClick={copy}
          className="group inline-flex items-center gap-2 rounded-full border border-white/8 px-4 py-2 text-xs font-medium text-white/40 transition-all hover:border-[#ff6600]/50 hover:text-white"
        >
          {copied
            ? <><Check className="h-3.5 w-3.5 text-[#ff6600]" />Copied</>
            : <><Copy className="h-3.5 w-3.5" />Copy link</>}
        </button>
      </div>

      {/* ── Hero ── */}
      <section className="relative px-6 pb-16 pt-10 md:px-12 md:pt-14">
        {/* Soft glow behind avatar */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[200px] w-[200px] -translate-x-1/2 rounded-full opacity-10 blur-[60px]"
          style={{ background: `radial-gradient(circle, ${from}, transparent 70%)` }}
        />

        <div className="relative mx-auto max-w-2xl text-center">
          {/* Avatar */}
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl font-display text-lg font-black text-black"
            style={{
              background: `linear-gradient(135deg, ${from}, ${to})`,
              boxShadow: `0 0 0 3px #000, 0 0 0 4px rgba(255,102,0,0.25), 0 12px 40px -8px ${from}66`,
            }}
          >
            {initials}
          </div>

          {/* Name */}
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
            {name}
          </h1>

          {/* Handle */}
          <p className="mt-3 font-mono text-sm text-white/30">@{id.slice(0, 8)}</p>

          {/* Bio */}
          {data?.profile?.bio && (
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/50">
              {data.profile.bio}
            </p>
          )}

          {/* Stats */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/[0.06] bg-white/[0.03] px-5 py-2.5">
            <span className="font-display text-2xl font-black text-[#ff6600] leading-none">
              {allProjects.length}
            </span>
            <span className="text-sm text-white/30">
              {allProjects.length === 1 ? "project" : "projects"}
            </span>
            {allProjects.length > 0 && categories.length > 2 && (
              <>
                <span className="h-3 w-px bg-white/10" />
                <span className="text-xs text-white/25">
                  {categories.length - 1} {categories.length - 1 === 1 ? "category" : "categories"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Orange rule */}
        <div className="mx-auto mt-12 max-w-2xl">
          <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #ff6600 30%, #ff6600 70%, transparent)" }} />
        </div>
      </section>

      {/* ── Filter pills ── */}
      {categories.length > 2 && (
        <div className="px-6 pb-8 md:px-12">
          <div className="mx-auto flex max-w-5xl flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-[#ff6600] text-black shadow-[0_0_20px_-4px_rgba(255,102,0,0.6)]"
                    : "border border-white/8 text-white/40 hover:border-[#ff6600]/30 hover:text-white"
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

      {/* ── Projects ── */}
      <section className="px-6 pb-28 md:px-12">
        <div className="mx-auto max-w-5xl">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-5 py-24 text-center">
              <div className="text-[64px] leading-none opacity-10 select-none">◎</div>
              <p className="text-sm text-white/20">No public projects yet.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.05] px-6 py-7 md:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-white/20">
            Powered by{" "}
            <Link to="/" className="text-[#ff6600]/50 transition-colors hover:text-[#ff6600]">
              ProjectAtlas
            </Link>
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#ff6600] px-5 py-2 text-xs font-bold uppercase tracking-wider text-black transition-all hover:shadow-[0_0_24px_-4px_rgba(255,102,0,0.7)] hover:scale-105"
          >
            <ExternalLink className="h-3 w-3" />
            Get your free page
          </Link>
        </div>
      </footer>
    </div>
  );
}
