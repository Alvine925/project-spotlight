import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, slugify } from "@/lib/auth";
import { analyzeProjectUrl } from "@/lib/projects.functions";
import { Sparkles, Loader2, CheckCircle2, ArrowRight, Wand2, RefreshCw } from "lucide-react";

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
    return () => { clearTimeout(t1); clearTimeout(t2); };
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
      try { host = new URL(extracted.url).hostname.replace("www.", ""); } catch {}
      const baseSlug = slugify(extracted.name || host);
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

      const { data, error } = await supabase.from("projects").insert({
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

      } as never).select("slug").single();

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
      <div className="min-h-screen">
        <SiteNav />
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary-glow" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <section className="mx-auto max-w-2xl px-6 py-16">
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary-glow">
            <Sparkles className="h-3.5 w-3.5" /> Auto-import
          </div>
          <h1 className="font-display text-4xl font-semibold md:text-5xl">
            Paste a link. <span className="text-gradient">We do the rest.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            We'll analyze the page and pull out what the site does, its features, and the best category.
          </p>
        </div>

        <form onSubmit={onAnalyze} className="mt-10 rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-elegant">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              required
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.com"
              className="flex-1 rounded-xl border border-border/60 bg-input/50 px-4 py-3 text-sm outline-none transition-smooth focus:border-primary/60"
            />
            <button
              type="submit"
              disabled={analyzing || !url}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-smooth hover:scale-[1.01] disabled:opacity-60"
            >
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {analyzing ? "Analyzing…" : "Analyze"}
            </button>
          </div>
          {analyzing && (
            <div className="mt-5 space-y-2 rounded-xl border border-border/40 bg-background/40 p-4">
              <StageRow active={stage >= 0} done={stage > 0} label="Scraping the page" />
              <StageRow active={stage >= 1} done={stage > 1} label="Extracting project details with AI" />
              <StageRow active={stage >= 2} done={false} label="Generating cover image" />
              <p className="pt-1 text-[11px] text-muted-foreground">This usually takes 15–25 seconds.</p>

            </div>
          )}
        </form>

        {err && (
          <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
            {err}
          </div>
        )}

        {extracted && (
          <div className="mt-8 space-y-5 rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-elegant">
            <div className="space-y-2">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Name</label>
              <input value={extracted.name} onChange={(e) => setExtracted({ ...extracted, name: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Tagline</label>
              <input value={extracted.tagline} onChange={(e) => setExtracted({ ...extracted, tagline: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Description</label>
              <textarea rows={4} value={extracted.description} onChange={(e) => setExtracted({ ...extracted, description: e.target.value })} className={inputCls} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Category</label>
                <input value={extracted.category} onChange={(e) => setExtracted({ ...extracted, category: e.target.value })} className={inputCls} />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Tags</label>
                <input
                  value={extracted.tags.join(", ")}
                  onChange={(e) => setExtracted({ ...extracted, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">What the site does</label>
              <input
                value={extracted.what_it_does.join(", ")}
                onChange={(e) => setExtracted({ ...extracted, what_it_does: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={runAnalyze}
                disabled={analyzing}
                className="flex items-center justify-center gap-2 rounded-xl border border-border/60 px-4 py-3 text-sm transition-smooth hover:border-primary/40 disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" /> Re-analyze
              </button>
              <button
                type="button"
                onClick={onPublish}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-medium text-primary-foreground shadow-glow transition-smooth hover:scale-[1.01] disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Publish project
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <Link to="/dashboard" className="mt-6 block text-center text-xs text-muted-foreground hover:text-foreground">
          Cancel and go to dashboard
        </Link>
      </section>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-border/60 bg-input/50 px-4 py-2.5 text-sm outline-none transition-smooth focus:border-primary/60";

function StageRow({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {done ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-primary-glow" />
      ) : active ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-glow" />
      ) : (
        <div className="h-3.5 w-3.5 rounded-full border border-border/60" />
      )}
      <span className={done || active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
