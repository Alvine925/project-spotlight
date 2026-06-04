import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { pickPalette } from "@/lib/auth";
import {
  ArrowLeft, Copy, Check, ExternalLink, Globe, Loader2,
  MoreHorizontal, Twitter, Linkedin, Link2, QrCode, MessageCircle,
  Calendar,
} from "lucide-react";

export const Route = createFileRoute("/project/$slug")({
  head: () => ({
    meta: [
      { title: "Project — ProjectAtlas" },
      { name: "description", content: "A project on ProjectAtlas." },
    ],
  }),
  component: ProjectDetail,
});

/* deterministic fake counts from slug */
function pseudoCount(seed: string, offset: number): number {
  let h = offset;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return (h % 180) + 8;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* tech stack icon colour map */
const TECH_COLORS: Record<string, string> = {
  typescript: "#3178c6", javascript: "#f7df1e", react: "#61dafb",
  "node.js": "#339933", nodejs: "#339933", python: "#3776ab",
  postgresql: "#4169e1", postgres: "#4169e1", mysql: "#4479a1",
  "tailwind css": "#06b6d4", tailwindcss: "#06b6d4", tailwind: "#06b6d4",
  nextjs: "#000000", "next.js": "#000000", vue: "#4fc08d",
  svelte: "#ff3e00", go: "#00add8", rust: "#dea584",
  docker: "#2496ed", aws: "#ff9900", firebase: "#ffca28",
  supabase: "#3ecf8e", vercel: "#000000", prisma: "#2d3748",
};

function TechBadge({ name }: { name: string }) {
  const color = TECH_COLORS[name.toLowerCase()] ?? "#ff6600";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm">
      <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: color }} />
      {name}
    </span>
  );
}

function ProjectDetail() {
  const { slug } = Route.useParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

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

  /* Track view */
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-[#ff6600]" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
        <p className="font-display text-xl font-bold text-gray-900">Project not found</p>
        <Link to="/" className="rounded-full bg-[#ff6600] px-5 py-2 text-sm font-semibold text-white">
          Back to catalogue
        </Link>
      </div>
    );
  }

  const [from, to] = pickPalette(project.slug);
  let host = project.url;
  try { host = new URL(project.url).hostname.replace("www.", ""); } catch {}

  const coverUrl = (project as unknown as { cover_image_url?: string | null }).cover_image_url;
  const isLive = project.status?.toLowerCase() === "live";
  const stars = pseudoCount(project.slug, 7);
  const forks = pseudoCount(project.slug, 13);
  const projectUrl = typeof window !== "undefined" ? window.location.href : "";
  const projectUrlClean = projectUrl.replace(/^https?:\/\//, "");

  const copy = () => {
    navigator.clipboard.writeText(projectUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const openQr = () => {
    window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(projectUrl)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg">

        {/* ── Top bar ── */}
        <header className="flex items-center justify-between bg-white px-4 py-4 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.history.back()}
              className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <Link to="/" className="font-display text-base font-bold text-[#ff6600]">
              ProjectAtlas
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-[#ff6600]/40 hover:text-[#ff6600]"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#ff6600]" /> : <Copy className="h-3.5 w-3.5" />}
              Copy Link
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ── Project header ── */}
        <section className="bg-white px-5 pb-5 pt-5">
          {/* Number + status */}
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-gray-400">01</span>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${isLive ? "bg-green-500" : "bg-gray-300"}`} />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                {isLive ? "Live" : (project.status || "Live")}
              </span>
            </div>
          </div>

          {/* Title + tagline */}
          <h1 className="font-display text-3xl font-black leading-tight text-gray-900">{project.name}</h1>
          {project.tagline && (
            <p className="mt-1.5 text-sm text-gray-500">{project.tagline}</p>
          )}

          {/* Domain */}
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#ff6600] hover:underline"
          >
            <Globe className="h-3.5 w-3.5" />
            {host}
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>

          {/* Category + tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#ff6600]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#ff6600]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600]" />
                {project.category}
              </span>
            )}
            {project.tags?.map((t: string) => (
              <span key={t} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] text-gray-500">{t}</span>
            ))}
          </div>
        </section>

        {/* ── Cover image ── */}
        <div className="mx-4 mt-4 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`${project.name} cover`}
              className="w-full object-cover"
              style={{ aspectRatio: "16/9" }}
            />
          ) : (
            /* Placeholder gradient cover when no image */
            <div
              className="flex items-center justify-center"
              style={{
                aspectRatio: "16/9",
                background: `linear-gradient(135deg, ${from}, ${to})`,
              }}
            >
              <span className="font-display text-[80px] font-black text-white/20 select-none">
                {project.name[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* ── Stats row ── */}
        <div className="mx-4 mt-3 flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {stars}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="12" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" />
              <path d="M6 9v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9" />
              <line x1="12" y1="12" x2="12" y2="15" />
            </svg>
            {forks}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(project.created_at)}
          </span>
        </div>

        {/* ── Sections ── */}
        <div className="mt-4 space-y-4 px-4 pb-4">

          {/* About */}
          {project.description && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-display text-base font-bold text-gray-900">About</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{project.description}</p>
            </div>
          )}

          {/* Tech Stack */}
          {project.tech_stack?.length > 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-display text-base font-bold text-gray-900">Tech Stack</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.tech_stack.map((t: string) => (
                  <TechBadge key={t} name={t} />
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-display text-base font-bold text-gray-900">Links</h2>
            <div className="mt-3 space-y-2">
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 transition-all hover:border-[#ff6600]/30"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-green-100">
                    <Globe className="h-3.5 w-3.5 text-green-600" />
                  </span>
                  <span className="text-sm font-medium text-gray-700">Live Site</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
              </a>
              {/* Features list re-used as documentation link if available */}
              {project.features?.length > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100">
                      <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-gray-700">Documentation</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Features / What it does */}
          {project.features?.length > 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-display text-base font-bold text-gray-900">Features</h2>
              <ul className="mt-3 space-y-2">
                {project.features.map((f: string) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6600]" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Use cases */}
          {project.use_cases?.length > 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-display text-base font-bold text-gray-900">Use Cases</h2>
              <ul className="mt-3 space-y-2">
                {project.use_cases.map((u: string) => (
                  <li key={u} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6600]" />
                    {u}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gallery — shown when a cover image exists (uses variations) */}
          {coverUrl && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="font-display text-base font-bold text-gray-900">Gallery</h2>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[coverUrl, coverUrl, coverUrl].map((src, i) => (
                  <div key={i} className="aspect-video overflow-hidden rounded-xl border border-gray-100">
                    <img src={src} alt={`${project.name} screenshot ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="font-display text-base font-bold text-gray-900">Share this project</h3>
            <p className="mt-1 text-xs text-gray-400">Anyone with this link can view the live site.</p>

            <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1 pl-3">
              <span className="flex-1 truncate font-mono text-xs text-gray-500">
                {projectUrlClean}
              </span>
              <button
                onClick={copy}
                className="shrink-0 rounded-lg bg-[#ff6600] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#e55a00]"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="mt-5 flex items-center justify-around">
              {[
                { icon: Twitter, label: "Twitter", href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(projectUrl)}&text=Check+out+${encodeURIComponent(project.name)}+on+ProjectAtlas` },
                { icon: Linkedin, label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(projectUrl)}` },
                { icon: MessageCircle, label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`Check out ${project.name}: ${projectUrl}`)}` },
                { icon: Link2, label: "Link", onClick: copy },
                { icon: QrCode, label: "QR Code", onClick: openQr },
              ].map(({ icon: Icon, label, href, onClick }) =>
                href ? (
                  <a key={label} href={href} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5">
                    <div className="grid h-11 w-11 place-items-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 transition-all hover:border-[#ff6600]/30 hover:text-[#ff6600]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] text-gray-400">{label}</span>
                  </a>
                ) : (
                  <button key={label} onClick={onClick} className="flex flex-col items-center gap-1.5">
                    <div className="grid h-11 w-11 place-items-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 transition-all hover:border-[#ff6600]/30 hover:text-[#ff6600]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] text-gray-400">{label}</span>
                  </button>
                )
              )}
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <footer className="py-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-gray-400">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#ff6600]">
              <span className="text-[9px] font-black text-white">PA</span>
            </div>
            Made with{" "}
            <Link to="/" className="font-semibold text-gray-600 hover:text-[#ff6600]">
              ProjectAtlas
            </Link>
          </div>
          <p className="mt-1 text-[10px] text-gray-300">© {new Date().getFullYear()} All rights reserved.</p>
        </footer>

      </div>
    </div>
  );
}
