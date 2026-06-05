import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Loader2, BarChart3, Eye, Share2, Heart,
  LayoutDashboard, FolderOpen, Settings, LogOut, TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — ProjectAtlas" },
      { name: "description", content: "See who's viewing your profile and projects." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name, slug, tagline")
        .eq("owner_id", user!.id)
        .eq("published", true)
        .order("created_at", { ascending: false });

      const ids = (projects ?? []).map((p) => p.id);
      let viewMap: Record<string, number> = {};
      let likeMap: Record<string, number> = {};
      let shareMap: Record<string, number> = {};

      if (ids.length) {
        const [{ data: views }, { data: likes }, { data: shares }] = await Promise.all([
          supabase.from("project_views").select("project_id").in("project_id", ids),
          supabase.from("project_likes").select("project_id").in("project_id", ids),
          supabase.from("project_shares").select("project_id").in("project_id", ids),
        ]);

        viewMap = (views ?? []).reduce<Record<string, number>>((a, v) => {
          a[v.project_id] = (a[v.project_id] || 0) + 1; return a;
        }, {});
        likeMap = (likes ?? []).reduce<Record<string, number>>((a, v) => {
          a[v.project_id] = (a[v.project_id] || 0) + 1; return a;
        }, {});
        shareMap = (shares ?? []).reduce<Record<string, number>>((a, v) => {
          a[v.project_id] = (a[v.project_id] || 0) + 1; return a;
        }, {});
      }

      return { projects: projects ?? [], viewMap, likeMap, shareMap };
    },
  });

  const totalViews = Object.values(data?.viewMap ?? {}).reduce((a, b) => a + b, 0);
  const totalLikes = Object.values(data?.likeMap ?? {}).reduce((a, b) => a + b, 0);
  const totalShares = Object.values(data?.shareMap ?? {}).reduce((a, b) => a + b, 0);

  const sortedProjects = [...(data?.projects ?? [])].sort(
    (a, b) => (data?.viewMap[b.id] ?? 0) - (data?.viewMap[a.id] ?? 0)
  );

  const sidebarLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/submit", icon: FolderOpen, label: "Add Work" },
    { to: "/settings", icon: Settings, label: "Settings" },
    { to: "/analytics", icon: BarChart3, label: "Analytics", active: true },
  ];

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-[#ff6600]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* ── Sidebar ── */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-white px-4 py-8 md:flex min-h-screen">
          <Link to="/" className="mb-8 flex items-center gap-2 px-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#ff6600]">
              <span className="text-[10px] font-black text-white">PA</span>
            </div>
            <span className="font-display text-base font-bold text-gray-900">
              Project<span className="text-[#ff6600]">Atlas</span>
            </span>
          </Link>

          <nav className="flex flex-1 flex-col gap-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  link.active
                    ? "bg-[#ff6600]/10 text-[#ff6600]"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 px-6 py-10 md:px-10">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Analytics</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-gray-900 md:text-3xl">
              Your profile performance
            </h1>
            <p className="mt-1 text-sm text-gray-500">Track views, likes, and shares across all your work.</p>
          </div>

          {/* Totals */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Total views", value: totalViews, icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Total likes", value: totalLikes, icon: Heart, color: "text-red-500", bg: "bg-red-50" },
              { label: "Total shares", value: totalShares, icon: Share2, color: "text-[#ff6600]", bg: "bg-[#ff6600]/10" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{s.label}</span>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                </div>
                <div className="mt-2 font-display text-3xl font-bold text-gray-900">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Per-project breakdown */}
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-gray-900">Performance by project</h2>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <TrendingUp className="h-3.5 w-3.5" /> Sorted by views
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-[#ff6600]" />
              </div>
            ) : sortedProjects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
                <BarChart3 className="mx-auto mb-3 h-8 w-8 text-gray-200" />
                <p className="text-sm font-medium text-gray-900">No published work yet</p>
                <p className="mt-1 text-xs text-gray-400">Add and publish your first project to start tracking analytics.</p>
                <Link
                  to="/submit"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ff6600] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e55a00]"
                >
                  Add your first project
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400">
                    <tr>
                      <th className="px-5 py-3 text-left">Project</th>
                      <th className="px-5 py-3 text-right">Views</th>
                      <th className="px-5 py-3 text-right">Likes</th>
                      <th className="px-5 py-3 text-right">Shares</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProjects.map((p, i) => (
                      <tr key={p.id} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="px-5 py-3">
                          <Link to="/project/$slug" params={{ slug: p.slug }} className="group">
                            <div className="font-medium text-gray-900 group-hover:text-[#ff6600] transition-colors">{p.name}</div>
                            {p.tagline && <div className="text-xs text-gray-400 truncate max-w-xs">{p.tagline}</div>}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-semibold text-gray-900">
                          {data?.viewMap[p.id] ?? 0}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-gray-600">
                          {data?.likeMap[p.id] ?? 0}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-gray-600">
                          {data?.shareMap[p.id] ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Coming soon note */}
          <div className="mt-8 rounded-xl border border-[#ff6600]/20 bg-[#ff6600]/5 p-5">
            <div className="flex items-start gap-3">
              <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-[#ff6600]" />
              <div>
                <p className="text-sm font-semibold text-gray-900">More analytics coming soon</p>
                <p className="mt-1 text-sm text-gray-500">
                  Charts, time-range filters, referrer tracking, and click-through rates per project are on the roadmap.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
