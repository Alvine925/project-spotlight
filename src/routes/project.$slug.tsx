import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/integrations/supabase/client";
import { pickPalette } from "@/lib/auth";
import { ExternalLink, Loader2, Sparkles, Layers, Target, Tag } from "lucide-react";

export const Route = createFileRoute("/project/$slug")({
  head: () => ({
    meta: [
      { title: "Project — ProjectAtlas" },
      { name: "description", content: "A project on ProjectAtlas." },
    ],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  // Track view
  useEffect(() => {
    if (project?.id) {
      supabase.from("project_views").insert({
        project_id: project.id,
        referrer: typeof document !== "undefined" ? document.referrer || null : null,
      }).then(() => {});
    }
  }, [project?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen"><SiteNav />
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary-glow" /></div>
      </div>
    );
  }
  if (error || !project) {
    return (
      <div className="min-h-screen"><SiteNav />
        <div className="mx-auto max-w-md px-6 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold">Project not found</h1>
          <Link to="/" className="mt-6 inline-flex rounded-full bg-gradient-primary px-4 py-2 text-sm text-primary-foreground shadow-glow">Back to catalogue</Link>
        </div>
      </div>
    );
  }

  const [from, to] = pickPalette(project.slug);
  let host = project.url;
  try { host = new URL(project.url).hostname.replace("www.", ""); } catch {}

  return (
    <div className="min-h-screen">
      <SiteNav />

      <section
        className="relative overflow-hidden border-b border-border/40"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        {(project as unknown as { cover_image_url?: string | null }).cover_image_url && (
          <img
            src={(project as unknown as { cover_image_url: string }).cover_image_url}
            alt={`${project.name} cover`}
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

        <div className="relative mx-auto max-w-5xl px-6 py-16">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-5">
              <div
                className="grid h-16 w-16 place-items-center rounded-2xl font-display text-2xl font-bold text-primary-foreground shadow-glow"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
              >
                {project.name[0]?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-4xl font-semibold md:text-5xl">{project.name}</h1>
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-glow">
                    {project.status}
                  </span>
                </div>
                <p className="mt-2 max-w-xl text-lg text-muted-foreground">{project.tagline}</p>
              </div>
            </div>

            <a href={project.url} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition-smooth hover:scale-105">
              Visit {host} <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.category && (
              <span className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs text-primary-glow">{project.category}</span>
            )}
            {project.tags?.map((t: string) => (
              <span key={t} className="rounded-full bg-card/70 px-3 py-1 text-xs text-muted-foreground">{t}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2 space-y-10">
            {project.description && (
              <Block icon={Sparkles} title="Overview">
                <p className="text-foreground/90 leading-relaxed">{project.description}</p>
              </Block>
            )}

            {project.features?.length > 0 && (
              <Block icon={Layers} title="Features">
                <ul className="space-y-2">
                  {project.features.map((f: string) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-glow" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            {project.use_cases?.length > 0 && (
              <Block icon={Target} title="Use cases">
                <ul className="space-y-2">
                  {project.use_cases.map((u: string) => (
                    <li key={u} className="flex items-start gap-3 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-glow" />
                      <span>{u}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            )}
          </div>

          <aside className="space-y-6">
            {project.tech_stack?.length > 0 && (
              <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elegant">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" /> What it does
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech_stack.map((t: string) => (
                    <span key={t} className="rounded-full border border-border/60 bg-card/70 px-2.5 py-1 text-xs">{t}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elegant">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">External links</h3>
              <a href={project.url} target="_blank" rel="noreferrer"
                className="flex items-center justify-between rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-sm transition-smooth hover:border-primary/40">
                <span className="truncate">{host}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function Block({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
        <Icon className="h-5 w-5 text-primary-glow" />
        {title}
      </h2>
      {children}
    </div>
  );
}
