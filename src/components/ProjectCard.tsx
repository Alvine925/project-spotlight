import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { pickPalette } from "@/lib/auth";

export type ProjectRow = {
  id: string;
  slug: string;
  url: string;
  name: string;
  tagline: string | null;
  category: string | null;
  tags: string[];
  status: string;
  created_at: string;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function ProjectCard({ project }: { project: ProjectRow }) {
  const [from, to] = pickPalette(project.slug);
  let host = project.url;
  try { host = new URL(project.url).hostname.replace("www.", ""); } catch {}

  return (
    <Link
      to="/project/$slug"
      params={{ slug: project.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-elegant transition-smooth hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
    >
      <div className={`relative mb-5 h-32 overflow-hidden rounded-xl bg-gradient-to-br from-${from} to-${to}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)]" />
        <div className="absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-lg bg-background/80 font-display font-bold backdrop-blur-md">
          {project.name[0]?.toUpperCase()}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider backdrop-blur-md">
          {project.status}
        </div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight">{project.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{project.tagline || "—"}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-smooth group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.category && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary-glow">
            {project.category}
          </span>
        )}
        {project.tags.slice(0, 2).map((t) => (
          <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">{t}</span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
        <span>Added {timeAgo(project.created_at)}</span>
        <span className="font-mono truncate max-w-[50%]">{host}</span>
      </div>
    </Link>
  );
}
