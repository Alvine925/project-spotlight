import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/mockProjects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to="/project/$id"
      params={{ id: project.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-elegant transition-smooth hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
    >
      <div className={`relative mb-5 h-32 overflow-hidden rounded-xl bg-gradient-to-br ${project.color}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)]" />
        <div className="absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-lg bg-background/80 backdrop-blur-md font-display font-bold text-foreground">
          {project.name[0]}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-foreground backdrop-blur-md">
          {project.status}
        </div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight">{project.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{project.tagline}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-smooth group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary-glow">
          {project.category}
        </span>
        {project.tags.slice(0, 2).map((t) => (
          <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
        <span>Added {project.addedAt}</span>
        <span className="font-mono">{new URL(project.url).hostname.replace("www.", "")}</span>
      </div>
    </Link>
  );
}
