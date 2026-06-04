import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { pickPalette } from "@/lib/auth";
import {
  Eye,
  Plus,
  ExternalLink,
  Loader2,
  BarChart3,
  Trash2,
  Pencil,
  Check,
  X,
  User,
  Copy,
  Link2,
  Globe,
  EyeOff,
} from "lucide-react";

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

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

function EditProfileCard({ profile, userId }: { profile: Profile | null; userId: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");

  const [from, to] = pickPalette(userId);
  const displayName = profile?.display_name || `dev-${userId.slice(0, 6)}`;
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const startEdit = () => {
    setName(profile?.display_name ?? "");
    setBio(profile?.bio ?? "");
    setEditing(true);
  };

  const { mutate: save, isPending } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: name.trim() || null, bio: bio.trim() || null })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile", userId] });
      qc.invalidateQueries({ queryKey: ["profile", userId] });
      setEditing(false);
    },
  });

  const cancel = () => {
    setName(profile?.display_name ?? "");
    setBio(profile?.bio ?? "");
    setEditing(false);
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elegant">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" /> Profile
        </span>
        {!editing && (
          <button
            onClick={startEdit}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full font-display text-lg font-bold text-primary-foreground shadow-glow"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") cancel(); }}
                placeholder="Display name"
                maxLength={40}
                className="w-full rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-sm font-medium outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short bio — what you build, where you work…"
                maxLength={160}
                rows={2}
                className="w-full resize-none rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-sm text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => save()}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary-glow hover:bg-primary/30 transition-all disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  Save
                </button>
                <button
                  onClick={cancel}
                  className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="font-display font-semibold truncate">{displayName}</p>
              {profile?.bio ? (
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{profile.bio}</p>
              ) : (
                <p className="text-xs text-muted-foreground">@{userId.slice(0, 8)}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/40">
        <Link
          to="/u/$id"
          params={{ id: userId }}
          className="inline-flex items-center gap-1.5 text-xs text-primary-glow hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          View public profile
        </Link>
      </div>
    </div>
  );
}

function ProfileLinkBanner({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false);
  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/u/${userId}`
    : `/u/${userId}`;

  const copy = () => {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4 shadow-elegant backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-primary shadow-glow">
          <Link2 className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-primary-glow">Your shareable profile link</p>
          <p className="truncate font-mono text-sm text-foreground/80">{profileUrl}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-card/60 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-md transition-all hover:border-primary/60 hover:bg-card"
        >
          {copied ? <Check className="h-4 w-4 text-primary-glow" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy link"}
        </button>
        <Link
          to="/u/$id"
          params={{ id: userId }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-all hover:scale-105"
        >
          <ExternalLink className="h-4 w-4" /> Open
        </Link>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  const { data: profileData } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, bio")
        .eq("id", user!.id)
        .maybeSingle();
      return data as Profile | null;
    },
  });

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

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await supabase.from("projects").delete().eq("id", id);
    refetch();
  };

  const onTogglePublish = async (id: string, current: boolean) => {
    setTogglingId(id);
    await supabase.from("projects").update({ published: !current }).eq("id", id);
    await refetch();
    setTogglingId(null);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
        </div>
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
              Welcome back,{" "}
              <span className="text-gradient">
                {profileData?.display_name || user.email?.split("@")[0]}
              </span>
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-smooth hover:scale-105"
            >
              <Plus className="h-4 w-4" /> New project
            </Link>
          </div>
        </div>

        <ProfileLinkBanner userId={user.id} />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <EditProfileCard profile={profileData ?? null} userId={user.id} />
          <Stat label="Projects" value={projects.length} icon={Eye} />
          <Stat label="Total views" value={totalViews} icon={BarChart3} />
          <Stat label="Published" value={projects.filter((p) => p.published).length} icon={ExternalLink} />
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold">Your projects</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-primary-glow" />
            </div>
          ) : projects.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
              <p className="text-muted-foreground">You haven't added any projects yet.</p>
              <Link
                to="/submit"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow"
              >
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
                    <th className="px-4 py-3 text-left">Visibility</th>
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
                        <button
                          onClick={() => onTogglePublish(p.id, p.published)}
                          disabled={togglingId === p.id}
                          title={p.published ? "Click to unpublish" : "Click to publish"}
                          className={`group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all disabled:opacity-50 ${
                            p.published
                              ? "bg-primary/15 text-primary-glow hover:bg-destructive/15 hover:text-destructive"
                              : "bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary-glow"
                          }`}
                        >
                          {togglingId === p.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : p.published ? (
                            <>
                              <Globe className="h-3 w-3" />
                              <span className="group-hover:hidden">Published</span>
                              <span className="hidden group-hover:inline">Unpublish</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              <span className="group-hover:hidden">Draft</span>
                              <span className="hidden group-hover:inline">Publish</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded p-1.5 text-muted-foreground hover:text-foreground"
                            aria-label="Open"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => onDelete(p.id)}
                            className="rounded p-1.5 text-muted-foreground hover:text-destructive"
                            aria-label="Delete"
                          >
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

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
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
