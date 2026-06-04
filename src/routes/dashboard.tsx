import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Eye, Plus, ExternalLink, Loader2, BarChart3, Trash2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ProjectAtlas" },
      { name: "description", content: "Manage your projects and see their views." },
    ],
  }),
  component: Dashboard,
});

type MyProject = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  url: string;
  status: string;
  published: boolean;
  category: string | null;
  created_at: string;
};

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-projects", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: projects, error } = await supabase
        .from("projects")
        .select("id, slug, name, tagline, url, status, published, category, created_at")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const ids = (projects ?? []).map((p) => p.id);
      let viewMap: Record<string, number> = {};
      if (ids.length) {
        const { data: views } = await supabase
          .from("project_views")
          .select("project_id")
          .in("project_id", ids);
        viewMap = (views ?? []).reduce<Record<string, number>>((acc, v) => {
          acc[v.project_id] = (acc[v.project_id] || 0) + 1;
          return acc;
        }, {});
      }
      return { projects: (projects ?? []) as MyProject[], viewMap };
    },
  });

  const onDelete = async (id: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await supabase.from("projects").delete().eq("id", id);
    refetch();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen"><SiteNav />
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary-glow" /></div>
      </div>
    );
  }

  const projects = data?.projects ?? [];
  const viewMap = data?.viewMap ?? {};
  const totalViews = Object.values(viewMap).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Dashboard</p>
            <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
              Welcome back, <span className="text-gradient">{user.email?.split("@")[0]}</span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/u/$id" params={{ id: user.id }}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-sm font-medium backdrop-blur-md transition-smooth hover:border-primary/40">
              <ExternalLink className="h-4 w-4" /> View my profile
            </Link>
            <Link to="/submit"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-smooth hover:scale-105">
              <Plus className="h-4 w-4" /> New project
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Projects" value={projects.length} icon={Eye} />
          <Stat label="Total views" value={totalViews} icon={BarChart3} />
          <Stat label="Published" value={projects.filter((p) => p.published).length} icon={ExternalLink} />
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold">Your projects</h2>
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary-glow" /></div>
          ) : projects.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
              <p className="text-muted-foreground">You haven't added any projects yet.</p>
              <Link to="/submit" className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow">
                <Plus className="h-4 w-4" /> Add your first project
              </Link>
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl border border-border/60 bg-card/40 shadow-elegant">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Project</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-right">Views</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} className="border-t border-border/40 transition-smooth hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <Link to="/project/$slug" params={{ slug: p.slug }} className="block">
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{p.tagline}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.category || "—"}</td>
                      <td className="px-4 py-3 text-right font-mono">{viewMap[p.id] || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                          p.published ? "bg-primary/15 text-primary-glow" : "bg-muted text-muted-foreground"
                        }`}>
                          {p.published ? p.status : "Draft"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a href={p.url} target="_blank" rel="noreferrer"
                            className="rounded p-1.5 text-muted-foreground hover:text-foreground" aria-label="Open">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button onClick={() => onDelete(p.id)}
                            className="rounded p-1.5 text-muted-foreground hover:text-destructive" aria-label="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elegant">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary-glow" />
      </div>
      <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
    </div>
  );
}
