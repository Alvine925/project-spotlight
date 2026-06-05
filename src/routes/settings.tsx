import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Loader2, Check, User, Lock, Palette, ArrowLeft,
  Globe, Github, Twitter, Linkedin, MapPin,
  LayoutDashboard, FolderOpen, Settings, BarChart3, LogOut,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ProjectAtlas" },
      { name: "description", content: "Manage your profile, account, and page settings." },
    ],
  }),
  component: SettingsPage,
});

const ROLE_OPTIONS = ["Developer", "Designer", "Freelancer", "Founder", "Photographer", "Writer", "Illustrator", "Architect", "Creator", "Other"];

const inputCls = "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600]/20";
const labelCls = "block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1";

type Tab = "profile" | "account" | "page";

function SettingsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, bio, about, website, github, twitter, linkedin, location, profile_type, headline")
        .eq("id", user!.id)
        .maybeSingle();
      return data as {
        id: string; display_name: string | null; avatar_url: string | null;
        bio: string | null; about: string | null; website: string | null;
        github: string | null; twitter: string | null; linkedin: string | null;
        location: string | null; profile_type: string | null; headline: string | null;
      } | null;
    },
  });

  /* ── Profile form state ── */
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [about, setAbout] = useState("");
  const [role, setRole] = useState("");
  const [headline, setHeadline] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [github, setGithub] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setAbout(profile.about ?? "");
      setRole(profile.profile_type ?? "");
      setHeadline(profile.headline ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
      setLocation(profile.location ?? "");
      setWebsite(profile.website ?? "");
      setGithub(profile.github ?? "");
      setTwitter(profile.twitter ?? "");
      setLinkedin(profile.linkedin ?? "");
    }
  }, [profile]);

  const { mutate: saveProfile, isPending: savingProfile } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: name.trim() || null,
          bio: bio.trim() || null,
          about: about.trim() || null,
          profile_type: role || null,
          headline: headline.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          location: location.trim() || null,
          website: website.trim() || null,
          github: github.trim() || null,
          twitter: twitter.trim() || null,
          linkedin: linkedin.trim() || null,
        } as never)
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile", user?.id] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  /* ── Password change state ── */
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [pwSaved, setPwSaved] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwErr(null);
    if (newPassword !== confirmPassword) { setPwErr("Passwords don't match"); return; }
    if (newPassword.length < 6) { setPwErr("Password must be at least 6 characters"); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPw(false);
    if (error) { setPwErr(error.message); return; }
    setPwSaved(true);
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPwSaved(false), 2500);
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-[#ff6600]" />
      </div>
    );
  }

  const sidebarLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/submit", icon: FolderOpen, label: "Add Work" },
    { to: "/settings", icon: Settings, label: "Settings", active: true },
    { to: "/analytics", icon: BarChart3, label: "Analytics" },
  ];

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
          <div className="mb-6 flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </div>

          <h1 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your profile, account, and page preferences.</p>

          {/* Tab bar */}
          <div className="mt-6 flex gap-1 rounded-xl border border-gray-200 bg-white p-1 w-fit">
            {([
              { key: "profile" as Tab, icon: User, label: "Profile" },
              { key: "account" as Tab, icon: Lock, label: "Account" },
              { key: "page" as Tab, icon: Palette, label: "Page" },
            ] as const).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === t.key
                    ? "bg-[#ff6600] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Profile Settings ── */}
          {tab === "profile" && (
            <div className="mt-6 max-w-2xl space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-gray-900">Profile Settings</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Display name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
                    <option value="">— Select role —</option>
                    {ROLE_OPTIONS.map((r) => <option key={r} value={r.toLowerCase()}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="San Francisco, CA" className={`${inputCls} pl-10`} />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Headline <span className="normal-case font-normal text-gray-300">(shown under your name)</span></label>
                  <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Full-stack developer shipping AI tools" maxLength={120} className={inputCls} />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Short bio <span className="normal-case font-normal text-gray-300">(2-3 lines)</span></label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} maxLength={160} placeholder="Brief intro shown on your profile…" className={`${inputCls} resize-none`} />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>About <span className="normal-case font-normal text-gray-300">(long-form, shown in About tab)</span></label>
                  <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={5} placeholder="Tell the world about your background, what you create, and what drives you…" className={`${inputCls} resize-none`} />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Profile image URL <span className="normal-case font-normal text-gray-300">(optional)</span></label>
                  <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/photo.jpg" className={inputCls} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Social links</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yoursite.com" className={`${inputCls} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>GitHub</label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="username" className={`${inputCls} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Twitter / X</label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="handle (no @)" className={`${inputCls} pl-10`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>LinkedIn</label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/username" className={`${inputCls} pl-10`} />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => saveProfile()}
                disabled={savingProfile}
                className="flex items-center gap-2 rounded-lg bg-[#ff6600] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e55a00] disabled:opacity-60"
              >
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
                {saved ? "Saved!" : "Save profile"}
              </button>
            </div>
          )}

          {/* ── Account Settings ── */}
          {tab === "account" && (
            <div className="mt-6 max-w-2xl space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="font-display text-lg font-semibold text-gray-900">Account</h2>
                <div className="mt-4">
                  <label className={labelCls}>Email address</label>
                  <input
                    value={user.email ?? ""}
                    readOnly
                    className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`}
                  />
                  <p className="mt-1 text-xs text-gray-400">Contact support to change your email address.</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="font-display text-lg font-semibold text-gray-900">Change password</h2>
                <form onSubmit={changePassword} className="mt-4 space-y-3">
                  <div>
                    <label className={labelCls}>New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Confirm password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className={inputCls}
                    />
                  </div>
                  {pwErr && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{pwErr}</div>
                  )}
                  <button
                    type="submit"
                    disabled={savingPw || !newPassword}
                    className="flex items-center gap-2 rounded-lg bg-[#ff6600] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e55a00] disabled:opacity-60"
                  >
                    {savingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : pwSaved ? <Check className="h-4 w-4" /> : null}
                    {pwSaved ? "Password updated!" : "Update password"}
                  </button>
                </form>
              </div>

              <div className="rounded-xl border border-red-100 bg-white p-6 shadow-sm">
                <h2 className="font-display text-lg font-semibold text-gray-900">Sign out</h2>
                <p className="mt-1 text-sm text-gray-500">Sign out of your account on this device.</p>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="mt-4 rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}

          {/* ── Page Settings ── */}
          {tab === "page" && (
            <div className="mt-6 max-w-2xl space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="font-display text-lg font-semibold text-gray-900">Page Settings</h2>

                <div className="mt-4">
                  <label className={labelCls}>Your profile URL</label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                    <span className="text-sm text-gray-400">projectatlas.app/u/</span>
                    <span className="text-sm font-medium text-gray-900">{user.id.slice(0, 8)}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Custom usernames are coming soon.</p>
                </div>

                <div className="mt-5">
                  <label className={labelCls}>Theme</label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div className="cursor-default rounded-xl border-2 border-[#ff6600] bg-white p-4 text-center shadow-sm">
                      <div className="mx-auto mb-2 h-8 w-full rounded-lg bg-white border border-gray-200" />
                      <span className="text-xs font-semibold text-gray-700">Light</span>
                      <p className="text-[10px] text-gray-400">Current</p>
                    </div>
                    <div className="cursor-not-allowed rounded-xl border-2 border-gray-200 bg-gray-50 p-4 text-center opacity-50">
                      <div className="mx-auto mb-2 h-8 w-full rounded-lg bg-gray-900" />
                      <span className="text-xs font-semibold text-gray-700">Dark</span>
                      <p className="text-[10px] text-gray-400">Coming soon</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <label className={labelCls}>Custom domain</label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                    <span className="text-sm text-gray-400">e.g. portfolio.yourname.com</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Custom domains are coming soon.</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="font-display text-lg font-semibold text-gray-900">Public profile</h2>
                <p className="mt-1 text-sm text-gray-500">Preview how your profile looks to visitors.</p>
                <Link
                  to="/u/$id"
                  params={{ id: user.id }}
                  target="_blank"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <Globe className="h-4 w-4" />
                  View public profile
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
