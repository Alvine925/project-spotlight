import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, slugify } from "@/lib/auth";
import { analyzeProjectUrl } from "@/lib/projects.functions";
import { Loader2, CheckCircle2, ArrowRight, RefreshCw, Wand2 } from "lucide-react";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit a project — ProjectAtlas" },
      { name: "description", content: "Paste your project URL. We'll handle the rest." },
    ],
  }),
  component: Submit,
});

type Extracted = {
  name: string;
  tagline: string;
  description: string;
  category: string;
  tags: string[];
  what_it_does: string[];
  features: string[];
  use_cases: string[];
  cover_image_url: string | null;
  url: string;
};

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600]/20";

function StageRow({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      {done ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#ff6600]" />
      ) : active ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#ff6600]" />
      ) : (
        <div className="h-4 w-4 shrink-0 rounded-full border-2 border-gray-200" />
      )}
      <span className={done || active ? "text-gray-800" : "text-gray-400"}>{label}</span>
    </div>
  );
}

function Submit() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeProjectUrl);

  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<Extracted | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!analyzing) return;
    setStage(0);
    const t1 = setTimeout(() => setStage(1), 4000);
    const t2 = setTimeout(() => setStage(2), 10000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [analyzing]);

  const runAnalyze = async () => {
    setErr(null);
    setExtracted(null);
    setAnalyzing(true);
    try {
      const data = await analyze({ data: { url } });
      setExtracted(data);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not analyze that URL");
    } finally {
      setAnalyzing(false);
    }
  };

  const onAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    void runAnalyze();
  };

  const onPublish = async () => {
    if (!user || !extracted) return;
    setErr(null);
    setSaving(true);
    try {
      let host = extracted.name;
      try {
        host = new URL(extracted.url).hostname.replace("www.", "");
      } catch {}
      const baseSlug = slugify(extracted.name || host);
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

      const { data, error } = await supabase
        .from("projects")
        .insert({
          owner_id: user.id,
          slug,
          url: extracted.url,
          name: extracted.name,
          tagline: extracted.tagline,
          description: extracted.description,
          category: extracted.category,
          tags: extracted.tags,
          tech_stack: extracted.what_it_does,
          features: extracted.features,
          use_cases: extracted.use_cases,
          cover_image_url: extracted.cover_image_url,
          status: "Live",
          published: true,
        } as never)
        .select("slug")
        .single();

      if (error) throw error;
      navigate({ to: "/project/$slug", params: { slug: data.slug } });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not save project");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white">
        <SiteNav />
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#ff6600]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteNav />
      <section className="mx-auto max-w-2xl px-6 py-14">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900 md:text-4xl">
            Paste a link.{" "}
            <span className="text-[#ff6600]">We do the rest.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
            We'll analyze the page and pull out what the site does, its features, and the best
            category.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={onAnalyze}>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                required
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.com"
                className={`${inputCls} flex-1`}
              />
              <button
                type="submit"
                disabled={analyzing || !url}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#ff6600] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e55a00] disabled:opacity-60"
              >
                {analyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {analyzing ? "Analyzing…" : "Analyze"}
              </button>
            </div>

            {analyzing && (
              <div className="mt-5 space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <StageRow active={stage >= 0} done={stage > 0} label="Scraping the page" />
                <StageRow
                  active={stage >= 1}
                  done={stage > 1}
                  label="Extracting project details with AI"
                />
                <StageRow active={stage >= 2} done={false} label="Generating cover image" />
                <p className="pt-1 text-xs text-gray-400">This usually takes 15–25 seconds.</p>
              </div>
            )}
          </form>
        </div>

        {err && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {err}
          </div>
        )}

        {extracted && (
          <div className="mt-6 space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="overflow-hidden rounded-lg border border-gray-100">
              {extracted.cover_image_url ? (
                <img
                  src={extracted.cover_image_url}
                  alt="cover"
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="aspect-video w-full bg-gray-100" />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Name
              </label>
              <input
                value={extracted.name}
                onChange={(e) => setExtracted({ ...extracted, name: e.target.value })}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Tagline
              </label>
              <input
                value={extracted.tagline}
                onChange={(e) => setExtracted({ ...extracted, tagline: e.target.value })}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Description
              </label>
              <textarea
                rows={4}
                value={extracted.description}
                onChange={(e) => setExtracted({ ...extracted, description: e.target.value })}
                className={`${inputCls} resize-none`}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Category
                </label>
                <input
                  value={extracted.category}
                  onChange={(e) => setExtracted({ ...extracted, category: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Tags
                </label>
                <input
                  value={extracted.tags.join(", ")}
                  onChange={(e) =>
                    setExtracted({
                      ...extracted,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  className={inputCls}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                Tech stack / what it does
              </label>
              <input
                value={extracted.what_it_does.join(", ")}
                onChange={(e) =>
                  setExtracted({
                    ...extracted,
                    what_it_does: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={runAnalyze}
                disabled={analyzing}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" /> Re-analyze
              </button>
              <button
                type="button"
                onClick={onPublish}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#ff6600] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e55a00] disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Publish project
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/dashboard" className="text-xs text-gray-400 hover:text-gray-600">
            Cancel and go to dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
