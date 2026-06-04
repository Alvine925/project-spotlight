import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/integrations/supabase/client";
import { gradientFor } from "@/lib/auth";
import { ExternalLink, Loader2, Globe } from "lucide-react";

export const Route = createFileRoute("/u/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Projects by @${params.id.slice(0, 8)} — ProjectAtlas` },
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
};

function Profile() {
  const { id } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const [{ data: profile }, { data: projects }] = await Promise.all([
        supabase.from("profiles").select("id, display_name, avatar_url, created_at").eq("id", id).maybeSingle(),
        supabase
          .from("projects")
          .select("id, slug, name, tagline, url, category, tags")
          .eq("owner_id", id)
          .eq("published", true)
          .order("created_at", { ascending: false }),
      ]);
      return { profile, projects: (projects ?? []) as PublicProject[] };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen"><SiteNav />
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary-glow" /></div>
      </div>
    );
  }

  const name = data?.profile?.display_name || `dev-${id.slice(0, 6)}`;
  const projects = data?.projects ?? [];
  const initials = name.slice(0, 2).toUpperCase();
  const [from, to] = gradientFor(id);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <section className="mx-auto max-w-2xl px-6 py-12">
        <div className="flex flex-col items-center text-center">
          <div
            className="grid h-24 w-24 place-items-center rounded-full font-display text-2xl font-bold text-primary-foreground shadow-glow"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            {initials}
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold">{name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">@{id.slice(0, 8)} · {projects.length} {projects.length === 1 ? "project" : "projects"}</p>
        </div>

        <div className="mt-10 space-y-3">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center text-muted-foreground">
              No public projects yet.
            </div>
          ) : (
            projects.map((p) => {
              const [pFrom, pTo] = gradientFor(p.id);
              return (
                <Link
                  key={p.id}
                  to="/project/$slug"
                  params={{ slug: p.slug }}
                  className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-elegant backdrop-blur-md transition-smooth hover:scale-[1.01] hover:border-primary/40"
                >
                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-primary-foreground"
                    style={{ background: `linear-gradient(135deg, ${pFrom}, ${pTo})` }}
                  >
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-display text-base font-semibold">{p.name}</h3>
                      {p.category && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-glow">
                          {p.category}
                        </span>
                      )}
                    </div>
                    {p.tagline && <p className="mt-0.5 truncate text-sm text-muted-foreground">{p.tagline}</p>}
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-smooth group-hover:text-primary-glow" />
                </Link>
              );
            })
          )}
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Built with <Link to="/" className="text-primary-glow hover:underline">ProjectAtlas</Link> — one link for all your projects.
        </p>
      </section>
    </div>
  );
}
