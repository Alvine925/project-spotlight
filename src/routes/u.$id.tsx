import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { pickPalette } from "@/lib/auth";
import {
  Loader2,
  Copy,
  Check,
  ArrowUpRight,
  Globe,
  ExternalLink,
  Twitter,
  Linkedin,
  Link2,
  QrCode,
  MessageCircle,
  Github,
  MapPin,
} from "lucide-react";
import { QrModal } from "@/components/QrModal";

export const Route = createFileRoute("/u/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.id.slice(0, 8)}'s Profile — ProjectAtlas` },
      { name: "description", content: "All projects and work from this profile, in one place." },
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
  cover_image_url?: string | null;
};

type ProfileData = {
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
  created_at: string;
  profile_type?: string | null;
  headline?: string | null;
};

type PublicProfileItem = {
  id: string;
  type: "service" | "highlight" | "skill" | "qualification";
  title: string;
  subtitle: string | null;
  body: string | null;
  meta: Record<string, unknown>;
  tags: string[];
};

type TabKey = "projects" | "services" | "skills" | "qualifications" | "highlights" | "about";

function ProjectCard({ project, index }: { project: PublicProject; index: number }) {
  let host = project.url;
  try {
    host = new URL(project.url).hostname.replace("www.", "");
  } catch {}

  const num = String(index + 1).padStart(2, "0");
  const isLive = project.status?.toLowerCase() === "live";
  const letter = project.name[0]?.toUpperCase() ?? "P";
  const hasCover = !!project.cover_image_url;

  return (
    <div className="rounded-xl border border-gray-100 bg-white">
      {hasCover ? (
        <div>
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="font-mono text-xs font-semibold text-gray-300">{num}</span>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-green-500" : "bg-gray-300"}`} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {isLive ? "Live" : project.status || "Live"}
              </span>
            </div>
          </div>
          <div className="flex items-stretch gap-3 px-4 pb-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base font-bold leading-snug text-gray-900">{project.name}</h3>
              {project.tagline && (
                <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{project.tagline}</p>
              )}
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#ff6600] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe className="h-3 w-3" />
                {host}
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
              <div className="mt-2 flex flex-wrap gap-1">
                {project.category && (
                  <span className="rounded-full bg-[#ff6600]/10 px-2 py-0.5 text-[10px] font-semibold text-[#ff6600]">
                    {project.category}
                  </span>
                )}
                {project.tags.slice(0, 2).map((t) => (
                  <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative w-28 shrink-0 overflow-hidden rounded-lg border border-gray-100">
              <img
                src={project.cover_image_url!}
                alt={`${project.name} preview`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <Link
                to="/project/$slug"
                params={{ slug: project.slug }}
                className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff6600] text-white shadow transition-all hover:scale-105"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-semibold text-gray-300">{num}</span>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-green-500" : "bg-gray-300"}`} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {isLive ? "Live" : project.status || "Live"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base font-bold leading-snug text-gray-900">{project.name}</h3>
              {project.tagline && (
                <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{project.tagline}</p>
              )}
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#ff6600] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe className="h-3 w-3" />
                {host}
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
              <div className="mt-2 flex flex-wrap gap-1">
                {project.category && (
                  <span className="rounded-full bg-[#ff6600]/10 px-2 py-0.5 text-[10px] font-semibold text-[#ff6600]">
                    {project.category}
                  </span>
                )}
                {project.tags.slice(0, 2).map((t) => (
                  <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
              <span className="select-none font-display text-5xl font-black text-gray-100">
                {letter}
              </span>
              <Link
                to="/project/$slug"
                params={{ slug: project.slug }}
                className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff6600] text-white shadow transition-all hover:scale-105"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Profile() {
  const { id } = Route.useParams();
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<TabKey>("projects");
  const [showQr, setShowQr] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const [{ data: profile }, { data: projects }, { data: items }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, display_name, avatar_url, bio, about, website, github, twitter, linkedin, location, created_at, profile_type, headline")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("projects")
          .select("id, slug, name, tagline, url, category, tags, status, color_from, color_to, tech_stack, cover_image_url")
          .eq("owner_id", id)
          .eq("published", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("profile_items")
          .select("id, type, title, subtitle, body, meta, tags")
          .eq("owner_id", id)
          .eq("published", true)
          .order("position", { ascending: true }),
      ]);
      return {
        profile: profile as ProfileData | null,
        projects: (projects ?? []) as PublicProject[],
        items: ((items ?? []) as unknown) as PublicProfileItem[],
      };
    },
  });

  const name = data?.profile?.display_name || `dev-${id.slice(0, 6)}`;
  const allProjects = data?.projects ?? [];
  const allItems = data?.items ?? [];
  const services = allItems.filter((i) => i.type === "service");
  const skills = allItems.filter((i) => i.type === "skill");
  const qualifications = allItems.filter((i) => i.type === "qualification");
  const highlights = allItems.filter((i) => i.type === "highlight");
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const [from, to] = pickPalette(id);
  const profileUrl = typeof window !== "undefined" ? window.location.href : "";
  const profileUrlClean = profileUrl.replace(/^https?:\/\//, "");
  const categories = Array.from(new Set(allProjects.map((p) => p.category).filter(Boolean)));
  const profile = data?.profile;

  const availableTabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "projects", label: "Projects", count: allProjects.length },
    ...(services.length ? [{ key: "services" as TabKey, label: "Services", count: services.length }] : []),
    ...(skills.length ? [{ key: "skills" as TabKey, label: "Skills", count: skills.length }] : []),
    ...(qualifications.length ? [{ key: "qualifications" as TabKey, label: "Credentials", count: qualifications.length }] : []),
    ...(highlights.length ? [{ key: "highlights" as TabKey, label: "Highlights", count: highlights.length }] : []),
    { key: "about", label: "About" },
  ];

  const copy = () => {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const shareItems = [
    {
      icon: Twitter,
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=Check+out+my+projects+on+ProjectAtlas`,
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`Check out my projects on ProjectAtlas: ${profileUrl}`)}`,
    },
    { icon: Link2, label: "Link", onClick: copy },
    { icon: QrCode, label: "QR", onClick: () => setShowQr(true) },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-[#ff6600]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="font-display text-base font-bold text-[#ff6600]">
            ProjectAtlas
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-[#ff6600]/40 hover:text-[#ff6600]"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#ff6600]" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:py-10">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-12">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="mb-8 lg:mb-0 lg:sticky lg:top-24 lg:h-fit">
            {/* Avatar + identity */}
            <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={name}
                  className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-gray-100 lg:h-20 lg:w-20"
                />
              ) : (
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-black text-white lg:h-20 lg:w-20 lg:text-2xl"
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                >
                  {initials}
                </div>
              )}

              <div className="min-w-0 lg:w-full">
                <h1 className="font-display text-xl font-bold text-gray-900 lg:text-2xl">{name}</h1>
                <p className="font-mono text-xs text-gray-400">@{id.slice(0, 8)}</p>
                {profile?.profile_type && (
                  <span className="mt-1 inline-block rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {profile.profile_type}
                  </span>
                )}
              </div>
            </div>

            {/* Bio / headline */}
            {(profile?.headline || profile?.bio) && (
              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                {profile.headline || profile.bio}
              </p>
            )}

            {/* Location */}
            {profile?.location && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {profile.location}
              </p>
            )}

            {/* Stats pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
                <span className="font-bold text-gray-900">{allProjects.length}</span>{" "}
                {allProjects.length === 1 ? "Project" : "Projects"}
              </span>
              {categories.length > 0 && (
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
                  <span className="font-bold text-gray-900">{categories.length}</span>{" "}
                  {categories.length === 1 ? "Category" : "Categories"}
                </span>
              )}
            </div>

            {/* Social links */}
            {(profile?.website || profile?.github || profile?.twitter || profile?.linkedin) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-[#ff6600]/30 hover:text-[#ff6600]"
                  >
                    <Globe className="h-3.5 w-3.5" /> Website
                  </a>
                )}
                {profile.github && (
                  <a
                    href={`https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-[#ff6600]/30 hover:text-[#ff6600]"
                  >
                    <Github className="h-3.5 w-3.5" /> GitHub
                  </a>
                )}
                {profile.twitter && (
                  <a
                    href={`https://x.com/${profile.twitter}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-[#ff6600]/30 hover:text-[#ff6600]"
                  >
                    <Twitter className="h-3.5 w-3.5" /> Twitter
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={
                      profile.linkedin.startsWith("http")
                        ? profile.linkedin
                        : `https://${profile.linkedin}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-[#ff6600]/30 hover:text-[#ff6600]"
                  >
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                )}
              </div>
            )}

            {/* Share */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Share profile
              </p>

              <div className="mb-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1 pl-3">
                <span className="flex-1 truncate font-mono text-xs text-gray-400">
                  {profileUrlClean}
                </span>
                <button
                  onClick={copy}
                  className="shrink-0 rounded-md bg-[#ff6600] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#e55a00]"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {shareItems.map(({ icon: Icon, label, href, onClick }) =>
                  href ? (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      title={label}
                      className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#ff6600]/30 hover:text-[#ff6600]"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      key={label}
                      onClick={onClick}
                      title={label}
                      className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-[#ff6600]/30 hover:text-[#ff6600]"
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  )
                )}
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main>
            {/* Tab bar */}
            <div className="mb-6 flex overflow-x-auto border-b border-gray-200">
              {availableTabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative mr-5 shrink-0 pb-3 pt-1 text-sm font-semibold transition-colors ${
                    tab === t.key ? "text-[#ff6600]" : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {t.label}
                  {typeof t.count === "number" && (
                    <span className="ml-1 font-mono text-[10px] text-gray-300">{t.count}</span>
                  )}
                  {tab === t.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#ff6600]" />
                  )}
                </button>
              ))}
            </div>

            {/* Projects tab */}
            {tab === "projects" && (
              <div className="space-y-3">
                {allProjects.length === 0 ? (
                  <div className="py-16 text-center text-sm text-gray-400">
                    No public projects yet.
                  </div>
                ) : (
                  allProjects.map((p, i) => (
                    <ProjectCard key={p.id} project={p} index={i} />
                  ))
                )}
              </div>
            )}

            {/* Services tab */}
            {tab === "services" && (
              <div className="space-y-3">
                {services.map((s) => (
                  <div key={s.id} className="rounded-xl border border-gray-100 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-base font-bold text-gray-900">{s.title}</h3>
                      {typeof s.meta.price === "string" && (
                        <span className="shrink-0 rounded-full bg-[#ff6600]/10 px-2.5 py-0.5 text-xs font-semibold text-[#ff6600]">
                          {String(s.meta.price)}
                        </span>
                      )}
                    </div>
                    {s.subtitle && <p className="mt-1 text-sm text-gray-500">{s.subtitle}</p>}
                    {s.body && (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                        {s.body}
                      </p>
                    )}
                    {s.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {s.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-500"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Skills tab */}
            {tab === "skills" && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {skills.map((s) => {
                  const level = Number(s.meta.level ?? 0);
                  return (
                    <div key={s.id} className="rounded-xl border border-gray-100 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-900">{s.title}</span>
                        {level > 0 && (
                          <span className="text-xs text-gray-300">
                            {"●".repeat(level)}
                            <span className="text-gray-100">{"●".repeat(5 - level)}</span>
                          </span>
                        )}
                      </div>
                      {s.subtitle && (
                        <p className="mt-0.5 text-xs text-gray-500">{s.subtitle}</p>
                      )}
                      {typeof s.meta.years === "number" && (
                        <p className="mt-0.5 text-[11px] text-gray-400">
                          {String(s.meta.years)} yrs experience
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Qualifications / Credentials tab */}
            {tab === "qualifications" && (
              <div className="space-y-2">
                {qualifications.map((q) => (
                  <div key={q.id} className="rounded-xl border border-gray-100 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900">{q.title}</h3>
                        {typeof q.meta.issuer === "string" && (
                          <p className="text-xs text-gray-500">{String(q.meta.issuer)}</p>
                        )}
                      </div>
                      {typeof q.meta.date === "string" && (
                        <span className="shrink-0 text-xs text-gray-400">
                          {String(q.meta.date)}
                        </span>
                      )}
                    </div>
                    {typeof q.meta.url === "string" && q.meta.url && (
                      <a
                        href={String(q.meta.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#ff6600] hover:underline"
                      >
                        Verify <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Highlights tab */}
            {tab === "highlights" && (
              <div className="space-y-3">
                {highlights.map((h) => (
                  <div key={h.id} className="rounded-xl border border-gray-100 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900">{h.title}</h3>
                        {(h.subtitle || typeof h.meta.org === "string") && (
                          <p className="text-xs text-gray-500">
                            {h.subtitle}
                            {h.subtitle && h.meta.org ? " · " : ""}
                            {typeof h.meta.org === "string" ? String(h.meta.org) : ""}
                          </p>
                        )}
                      </div>
                      {typeof h.meta.period === "string" && (
                        <span className="shrink-0 text-xs text-gray-400">
                          {String(h.meta.period)}
                        </span>
                      )}
                    </div>
                    {h.body && (
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">{h.body}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* About tab */}
            {tab === "about" && (
              <div className="space-y-6">
                {profile?.about ? (
                  <div className="rounded-xl border border-gray-100 bg-white p-5">
                    <h2 className="font-display text-base font-bold text-gray-900">About</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                      {profile.about}
                    </p>
                  </div>
                ) : (
                  <div className="py-10 text-center text-sm text-gray-400">
                    No about section yet.
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 border-t border-gray-100 py-6 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-gray-400">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#ff6600]">
            <span className="text-[8px] font-black text-white">PA</span>
          </div>
          Made with{" "}
          <Link to="/" className="font-semibold text-gray-600 hover:text-[#ff6600]">
            ProjectAtlas
          </Link>
        </div>
      </footer>

      {showQr && <QrModal url={profileUrl} title={name} onClose={() => setShowQr(false)} />}
    </div>
  );
}
