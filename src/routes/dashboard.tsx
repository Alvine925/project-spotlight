import React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SiteNav } from "@/components/SiteNav";
import { ProfileTypeOnboarding } from "@/components/ProfileTypeOnboarding";
import { ProfileItemsManager } from "@/components/ProfileItemsManager";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, pickPalette } from "@/lib/auth";

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
  Github,
  Twitter,
  Linkedin,
  MapPin,
  ChevronUp,
  LayoutDashboard,
  FolderOpen,
  Settings,
  LogOut,
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
  description: string | null;
  documentation_url: string | null;
  gallery_images: string[];
  tags: string[];
  tech_stack: string[];
  features: string[];
  use_cases: string[];
};

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  about: string | null;
  website: string | null;
  github: string | null;
  twitter: string | null;
  linkedin: string | null;
  location: string | null;
  profile_type: string | null;
  headline: string | null;
};


const CATEGORIES = ["App", "Website", "AI Tool", "Design", "Photography", "Branding", "Writing", "Architecture", "Video", "Marketing", "Other"];

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#ff6600]/50 focus:ring-1 focus:ring-[#ff6600]/15";

function EditProfileCard({ profile, userId }: { profile: Profile | null; userId: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [website, setWebsite] = useState(profile?.website ?? "");
  const [about, setAbout] = useState(profile?.about ?? "");
  const [github, setGithub] = useState(profile?.github ?? "");
  const [twitter, setTwitter] = useState(profile?.twitter ?? "");
  const [linkedin, setLinkedin] = useState(profile?.linkedin ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");

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
    setAbout(profile?.about ?? "");
    setWebsite(profile?.website ?? "");
    setGithub(profile?.github ?? "");
    setTwitter(profile?.twitter ?? "");
    setLinkedin(profile?.linkedin ?? "");
    setLocation(profile?.location ?? "");
    setEditing(true);
  };

  const { mutate: save, isPending } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: name.trim() || null,
          bio: bio.trim() || null,
          about: about.trim() || null,
          website: website.trim() || null,
          github: github.trim() || null,
          twitter: twitter.trim() || null,
          linkedin: linkedin.trim() || null,
          location: location.trim() || null,
        } as never)

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
    setAbout(profile?.about ?? "");
    setWebsite(profile?.website ?? "");
    setGithub(profile?.github ?? "");
    setTwitter(profile?.twitter ?? "");
    setLinkedin(profile?.linkedin ?? "");
    setLocation(profile?.location ?? "");
    setEditing(false);
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elegant col-span-full sm:col-span-2">
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
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Display name</label>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Display name"
                    maxLength={40}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="San Francisco, CA"
                      maxLength={80}
                      className={`${inputCls} pl-8`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Bio <span className="text-muted-foreground/50">(short tagline, shown in hero)</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short bio — what you build, where you work…"
                  maxLength={160}
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  About <span className="text-muted-foreground/50">(long-form, shown in the About tab)</span>
                </label>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Tell the world about yourself — your background, what you love to build, your journey…"
                  rows={4}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yoursite.com"
                      className={`${inputCls} pl-8`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">GitHub</label>
                  <div className="relative">
                    <Github className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="username"
                      className={`${inputCls} pl-8`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">Twitter / X</label>
                  <div className="relative">
                    <Twitter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="handle (no @)"
                      className={`${inputCls} pl-8`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">LinkedIn</label>
                  <div className="relative">
                    <Linkedin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="linkedin.com/in/username"
                      className={`${inputCls} pl-8`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => save()}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary-glow hover:bg-primary/30 transition-all disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  Save profile
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
              {profile?.location && (
                <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {profile.location}
                </p>
              )}
              {profile?.bio ? (
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{profile.bio}</p>
              ) : (
                <p className="text-xs text-muted-foreground">@{userId.slice(0, 8)}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {profile?.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-glow hover:underline">
                    <Globe className="h-3 w-3" /> Website
                  </a>
                )}
                {profile?.github && (
                  <a href={`https://github.com/${profile.github}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-glow hover:underline">
                    <Github className="h-3 w-3" /> GitHub
                  </a>
                )}
                {profile?.twitter && (
                  <a href={`https://x.com/${profile.twitter}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-glow hover:underline">
                    <Twitter className="h-3 w-3" /> Twitter
                  </a>
                )}
                {profile?.linkedin && (
                  <a href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-glow hover:underline">
                    <Linkedin className="h-3 w-3" /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {!editing && (
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
      )}
    </div>
  );
}

function EditProjectRow({ project, onDone }: { project: MyProject; onDone: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(project.name);
  const [tagline, setTagline] = useState(project.tagline ?? "");
  const [description, setDescription] = useState(project.description ?? "");
  const [url, setUrl] = useState(project.url);
  const [docUrl, setDocUrl] = useState(project.documentation_url ?? "");
  const [gallery, setGallery] = useState((project.gallery_images ?? []).join("\n"));
  const [category, setCategory] = useState(project.category ?? "");
  const [status, setStatus] = useState(project.status);
  const [tags, setTags] = useState(project.tags.join(", "));
  const [techStack, setTechStack] = useState(project.tech_stack.join(", "));
  const [features, setFeatures] = useState(project.features.join("\n"));
  const [useCases, setUseCases] = useState(project.use_cases.join("\n"));

  const { mutate: save, isPending } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("projects")
        .update({
          name: name.trim(),
          tagline: tagline.trim() || null,
          description: description.trim() || null,
          url: url.trim(),
          documentation_url: docUrl.trim() || null,
          gallery_images: gallery.split("\n").map((t) => t.trim()).filter(Boolean),
          category: category || null,
          status,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          tech_stack: techStack.split(",").map((t) => t.trim()).filter(Boolean),
          features: features.split("\n").map((t) => t.trim()).filter(Boolean),
          use_cases: useCases.split("\n").map((t) => t.trim()).filter(Boolean),
        })
        .eq("id", project.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-projects"] });
      onDone();
    },
  });

  const rowInput = `${inputCls} text-sm`;

  return (
    <tr>
      <td colSpan={5} className="px-4 py-5 bg-muted/20 border-t border-border/40">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Pencil className="h-3.5 w-3.5" /> Editing: {project.name}
            </span>
            <button onClick={onDone} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Project name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={rowInput} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={rowInput}
              >
                {["Live", "Beta", "In Development", "Archived"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Tagline</label>
              <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="One-line description" className={rowInput} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Live URL</label>
              <input value={url} onChange={(e) => setUrl(e.target.value)} type="url" placeholder="https://yourproject.com" className={rowInput} />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Documentation URL <span className="text-muted-foreground/50">(optional)</span></label>
              <input value={docUrl} onChange={(e) => setDocUrl(e.target.value)} type="url" placeholder="https://docs.yourproject.com" className={rowInput} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full description shown on the project page" className={`${rowInput} resize-none`} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={rowInput}>
                <option value="">— None —</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Tags <span className="text-muted-foreground/60">(comma-separated)</span></label>
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, saas, ai" className={rowInput} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Tech Stack <span className="text-muted-foreground/60">(comma-separated)</span></label>
              <input value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, TypeScript, Supabase" className={rowInput} />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Features <span className="text-muted-foreground/60">(one per line)</span></label>
              <textarea rows={4} value={features} onChange={(e) => setFeatures(e.target.value)} placeholder={"Real-time sync\nAI-powered search\nExport to CSV"} className={`${rowInput} resize-none`} />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Use Cases <span className="text-muted-foreground/60">(one per line)</span></label>
              <textarea rows={4} value={useCases} onChange={(e) => setUseCases(e.target.value)} placeholder={"Manage team projects\nTrack client work\nPersonal task list"} className={`${rowInput} resize-none`} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                Gallery images <span className="text-muted-foreground/60">(paste one image URL per line — these appear in the Gallery section of your project page)</span>
              </label>
              <textarea
                rows={3}
                value={gallery}
                onChange={(e) => setGallery(e.target.value)}
                placeholder={"https://example.com/screenshot1.png\nhttps://example.com/screenshot2.png\nhttps://example.com/screenshot3.png"}
                className={`${rowInput} resize-none font-mono text-xs`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => save()}
              disabled={isPending}
              className="flex items-center gap-1.5 rounded-lg bg-primary/20 px-4 py-2 text-xs font-medium text-primary-glow hover:bg-primary/30 transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Save changes
            </button>
            <button onClick={onDone} className="rounded-lg px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-all">
              Cancel
            </button>
          </div>
        </div>
      </td>
    </tr>
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
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  const { data: profileData } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, bio, about, website, github, twitter, linkedin, location, profile_type, headline")
        .eq("id", user!.id)
        .maybeSingle();
      return data as Profile | null;
    },
  });

  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (profileData && !profileData.profile_type) setShowOnboarding(true);
  }, [profileData]);



  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-projects", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: projects, error } = await supabase
        .from("projects")
        .select("id, slug, name, tagline, url, status, published, category, created_at, description, documentation_url, gallery_images, tags, tech_stack, features, use_cases")
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

  const sidebarLinks = [
    { to: "/dashboard" as const, icon: LayoutDashboard, label: "Dashboard", active: true },
    { to: "/submit" as const, icon: FolderOpen, label: "Add Work" },
    { to: "/settings" as const, icon: Settings, label: "Profile Settings" },
    { to: "/analytics" as const, icon: BarChart3, label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav />
      {showOnboarding && (
        <ProfileTypeOnboarding userId={user.id} onClose={() => setShowOnboarding(false)} />
      )}

      <div className="flex">
        {/* ── Sidebar ── */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-white px-4 py-8 md:flex" style={{ minHeight: "calc(100vh - 64px)" }}>
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

          <div className="border-t border-gray-100 pt-4 mt-4">
            <Link
              to="/u/$id"
              params={{ id: user.id }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <Eye className="h-4 w-4" />
              View public profile
            </Link>
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <section className="flex-1 min-w-0 px-6 py-10 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Dashboard
              {profileData?.profile_type && (
                <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary-glow">
                  {profileData.profile_type}
                </span>
              )}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
              Welcome back,{" "}
              <span className="text-gradient">
                {profileData?.display_name || user.email?.split("@")[0]}
              </span>
            </h1>
            {profileData?.headline && (
              <p className="mt-1 text-sm text-muted-foreground">{profileData.headline}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowOnboarding(true)}
              className="rounded-full border border-border/60 px-3 py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
            >
              Change profile type
            </button>
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 rounded-full bg-[#ff6600] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#e55a00]"
            >
              <Plus className="h-4 w-4" /> Add Work
            </Link>
          </div>
        </div>


        <ProfileLinkBanner userId={user.id} />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <EditProfileCard profile={profileData ?? null} userId={user.id} />
          <Stat label="Total work" value={projects.length} icon={Eye} />
          <Stat label="Total views" value={totalViews} icon={BarChart3} />
          <Stat label="Published" value={projects.filter((p) => p.published).length} icon={ExternalLink} />
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold">Your work</h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-primary-glow" />
            </div>
          ) : projects.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
              <p className="text-muted-foreground">You haven't added any work yet.</p>
              <Link
                to="/submit"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ff6600] px-4 py-2 text-sm font-medium text-white"
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
                    <React.Fragment key={p.id}>
                      <tr className={`border-t border-border/40 transition-smooth hover:bg-muted/20 ${editingProjectId === p.id ? "bg-muted/30" : ""}`}>
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
                            <button
                              onClick={() => setEditingProjectId(editingProjectId === p.id ? null : p.id)}
                              title="Edit project"
                              className={`rounded p-1.5 transition-colors ${editingProjectId === p.id ? "text-primary-glow" : "text-muted-foreground hover:text-foreground"}`}
                              aria-label="Edit"
                            >
                              {editingProjectId === p.id ? <ChevronUp className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                            </button>
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
                      {editingProjectId === p.id && (
                        <EditProjectRow
                          project={p}
                          onDone={() => {
                            setEditingProjectId(null);
                            refetch();
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-12">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold">Services, skills & qualifications</h2>
              <p className="text-sm text-muted-foreground">
                Add anything beyond project URLs — services you offer, skills you have, qualifications you've earned, and career highlights.
              </p>
            </div>
          </div>
          <ProfileItemsManager userId={user.id} profileType={profileData?.profile_type ?? null} />
        </div>
        </section>
        {/* end flex */}
      </div>

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
