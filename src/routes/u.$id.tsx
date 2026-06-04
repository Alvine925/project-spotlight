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
  Globe,
  ExternalLink,
  Twitter,
  Linkedin,
  Link2,
  MoreHorizontal,
} from "lucide-react";

export const Route = createFileRoute("/u/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.id.slice(0, 8)}'s Projects — ProjectAtlas` },
      { name: "description", content: "All projects from this developer, in one place." },
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

/* ── Single project card (list style) ── */
function ProjectCard({ project, index }: { project: PublicProject; index: number }) {
  let host = project.url;
  try { host = new URL(project.url).hostname.replace("www.", ""); } catch {}

  const num = String(index + 1).padStart(2, "0");
  const isLive = project.status?.toLowerCase() === "live";
  const letter = project.name[0]?.toUpperCase() ?? "P";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      {/* Background watermark letter */}
      <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 select-none font-display text-[100px] font-black leading-none text-gray-100">
        {letter}
      </div>

      <div className="relative p-5">
        {/* Top row: number + status */}
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-xs font-semibold text-gray-400">{num}</span>
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isLive ? "bg-green-500" : "bg-gray-300"}`} />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              {project.status || "Live"}
            </span>
          </div>
        </div>

        {/* Content + arrow */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-xl font-bold leading-tight text-gray-900">
              {project.name}
            </h3>
            {project.tagline && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.tagline}</p>
            )}

            {/* Domain */}
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#ff6600] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="h-3.5 w-3.5" />
              {host}
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>

            {/* Category + tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#ff6600]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#ff6600]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600]" />
                  {project.category}
                </span>
              )}
              {project.tags.slice(0, 2).map((t) => (
                <span key={t} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-500">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Arrow button */}
          <Link
            to="/project/$slug"
            params={{ slug: project.slug }}
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff6600] text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
          >
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Main Profile ── */
function Profile() {
  const { id } = Route.useParams();
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"projects" | "about">("projects");

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
  const categories = Array.from(new Set(allProjects.map((p) => p.category).filter(Boolean)));

  const copy = () => {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-[#ff6600]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg">

        {/* ── Top bar ── */}
        <header className="flex items-center justify-between bg-white px-5 py-4 shadow-sm">
          <Link to="/" className="font-display text-base font-bold text-[#ff6600]">
            ProjectAtlas
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-[#ff6600]/40 hover:text-[#ff6600]"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#ff6600]" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-white px-5 pb-5 pt-6">
          {/* Decorative floating shapes (top right) */}
          <div className="pointer-events-none absolute right-4 top-4 select-none">
            <div className="relative h-24 w-24">
              <div
                className="absolute right-0 top-0 flex h-14 w-14 items-center justify-center rounded-2xl font-display text-2xl font-black text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})`, transform: "rotate(10deg)" }}
              >
                {initials[0]}
              </div>
              <div className="absolute bottom-0 left-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 font-display text-xs font-black text-white shadow-md" style={{ transform: "rotate(-8deg)" }}>
                AI
              </div>
            </div>
          </div>

          {/* Avatar + info */}
          <div className="flex items-start gap-4 pr-28">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-black text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-xl font-bold leading-tight text-gray-900">{name}</h1>
              <p className="font-mono text-xs text-gray-400">@{id.slice(0, 8)}</p>
              {data?.profile?.bio && (
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{data.profile.bio}</p>
              )}
            </div>
          </div>

          {/* Stats pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
              <span className="font-bold text-gray-900">{allProjects.length}</span>
              {allProjects.length === 1 ? "Project" : "Projects"}
            </div>
            {categories.length > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                <span className="font-bold text-gray-900">{categories.length}</span>
                {categories.length === 1 ? "Category" : "Categories"}
              </div>
            )}
          </div>
        </section>

        {/* ── Tab bar ── */}
        <div className="flex border-b border-gray-200 bg-white px-5">
          {(["projects", "about"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative pb-3 pt-3 text-sm font-semibold capitalize transition-colors mr-6 ${
                tab === t ? "text-[#ff6600]" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {t}
              {tab === t && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#ff6600]" />
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="px-4 py-4">
          {tab === "projects" ? (
            <div className="space-y-4">
              {allProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-400">
                  <p className="text-sm">No public projects yet.</p>
                </div>
              ) : (
                allProjects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              {data?.profile?.bio ? (
                <>
                  <h2 className="font-display text-lg font-bold text-gray-900">About</h2>
                  <p className="mt-3 leading-relaxed text-gray-600">{data.profile.bio}</p>
                </>
              ) : (
                <p className="py-8 text-center text-sm text-gray-400">No bio added yet.</p>
              )}
            </div>
          )}
        </div>

        {/* ── Share section ── */}
        <div className="mx-4 mb-4 rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="font-display text-base font-bold text-gray-900">Share this profile</h3>
          <p className="mt-1 text-xs text-gray-400">Share your projects with the world.</p>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1 pl-3">
            <span className="flex-1 truncate font-mono text-xs text-gray-500">
              {profileUrl.replace(/^https?:\/\//, "")}
            </span>
            <button
              onClick={copy}
              className="shrink-0 rounded-lg bg-[#ff6600] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#e55a00]"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Social share icons */}
          <div className="mt-5 flex items-center justify-around">
            {[
              { icon: Twitter, label: "Twitter", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}` },
              { icon: Linkedin, label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}` },
              { icon: Link2, label: "Link", onClick: copy },
            ].map(({ icon: Icon, label, href, onClick }) => (
              href ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 transition-all hover:border-[#ff6600]/30 hover:text-[#ff6600]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] text-gray-400">{label}</span>
                </a>
              ) : (
                <button
                  key={label}
                  onClick={onClick}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 transition-all hover:border-[#ff6600]/30 hover:text-[#ff6600]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] text-gray-400">{label}</span>
                </button>
              )
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="py-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-gray-400">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#ff6600]">
              <span className="text-[9px] font-black text-white">PA</span>
            </div>
            Made with{" "}
            <Link to="/" className="font-semibold text-gray-600 hover:text-[#ff6600]">
              ProjectAtlas
            </Link>
          </div>
          <p className="mt-1 text-[10px] text-gray-300">© {new Date().getFullYear()} All rights reserved.</p>
        </footer>

      </div>
    </div>
  );
}
