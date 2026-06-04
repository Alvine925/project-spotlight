import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/integrations/supabase/client";
import { pickPalette } from "@/lib/auth";
import {
  ExternalLink,
  Loader2,
  Globe,
  Copy,
  Check,
  Layers,
  ArrowUpRight,
  Tag,
} from "lucide-react";

export const Route = createFileRoute("/u/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.id.slice(0, 8)}'s Projects — ProjectAtlas` },
      {
        name: "description",
        content:
          "All projects from this developer, in one place. Powered by ProjectAtlas.",
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

function copyToClipboard(text: string, setCopied: (v: boolean) => void) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  });
}

function ProjectCard({ project }: { project: PublicProject }) {
  let host = project.url;
  try {
    host = new URL(project.url).hostname.replace("www.", "");
  } catch {}

  return (
    <Link
      to="/project/$slug"
      params={{ slug: project.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-elegant backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
    >
      <div
        className="relative h-28 w-full shrink-0 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${project.color_from}, ${project.color_to})`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-xl bg-background/80 font-display text-base font-bold backdrop-blur-md">
          {project.name[0]?.toUpperCase()}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider backdrop-blur-md">
          {project.status}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-semibold leading-tight">
              {project.name}
            </h3>
            {project.tagline && (
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                {project.tagline}
              </p>
            )}
          </div>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary-glow" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {project.category && (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary-glow">
              {project.category}
            </span>
          )}
          {project.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-1.5 border-t border-border/40 pt-3 text-xs text-muted-foreground">
          <Globe className="h-3 w-3 shrink-0" />
          <span className="truncate font-mono">{host}</span>
        </div>
      </div>
    </Link>
  );
}

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
          .select(
            "id, slug, name, tagline, url, category, tags, status, color_from, color_to, tech_stack"
          )
          .eq("owner_id", id)
          .eq("published", true)
          .order("created_at", { ascending: false }),
      ]);
      return { profile, projects: (projects ?? []) as PublicProject[] };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
        </div>
      </div>
    );
  }

  const name = data?.profile?.display_name || `dev-${id.slice(0, 6)}`;
  const allProjects = data?.projects ?? [];
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const [from, to] = pickPalette(id);

  const profileUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const categories = [
    "All",
    ...Array.from(
      new Set(allProjects.map((p) => p.category).filter(Boolean) as string[])
    ),
  ];

  const filtered =
    activeCategory === "All"
      ? allProjects
      : allProjects.filter((p) => p.category === activeCategory);

  const techAll = allProjects.flatMap((p) => p.tech_stack);
  const topTech = Array.from(new Set(techAll)).slice(0, 6);

  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* Hero gradient */}
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${from}, transparent)`,
          }}
        />

        <section className="relative mx-auto max-w-3xl px-6 pb-10 pt-16 text-center">
          {/* Avatar */}
          <div
            className="mx-auto grid h-24 w-24 place-items-center rounded-full font-display text-2xl font-bold text-primary-foreground shadow-glow ring-4 ring-background"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            {initials}
          </div>

          {/* Name & handle */}
          <h1 className="mt-5 font-display text-3xl font-semibold md:text-4xl">
            {name}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            @{id.slice(0, 8)}
          </p>

          {/* Stats row */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary-glow" />
              <strong className="text-foreground">{allProjects.length}</strong>
              &nbsp;{allProjects.length === 1 ? "project" : "projects"}
            </span>
            {topTech.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-primary-glow" />
                <span className="truncate max-w-xs">{topTech.join(" · ")}</span>
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => copyToClipboard(profileUrl, setCopied)}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm font-medium backdrop-blur-md transition-all hover:border-primary/40 hover:bg-card/80"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-primary-glow" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy profile link
                </>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Projects grid */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        {/* Category filter */}
        {categories.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "border border-border/60 bg-card/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat}
                {cat !== "All" && (
                  <span className="ml-1.5 opacity-70 text-[11px]">
                    {allProjects.filter((p) => p.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-14 text-center text-muted-foreground">
            No public projects yet.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 flex flex-col items-center gap-3 border-t border-border/40 pt-10 text-center">
          <p className="text-xs text-muted-foreground">
            Built with{" "}
            <Link to="/" className="text-primary-glow hover:underline">
              ProjectAtlas
            </Link>{" "}
            — one link for all your projects.
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-glow transition-all hover:scale-105"
          >
            <ExternalLink className="h-3 w-3" />
            Create your own profile
          </Link>
        </div>
      </section>
    </div>
  );
}
