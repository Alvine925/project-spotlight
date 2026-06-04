import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, slugify } from "@/lib/auth";
import { Sparkles, Loader2, CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit a project — ProjectAtlas" },
      { name: "description", content: "Add your project to ProjectAtlas in seconds." },
    ],
  }),
  component: Submit,
});

const CATEGORIES = ["Productivity", "AI", "Developer Tools", "Finance", "Marketing", "Other"];

function Submit() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Developer Tools");
  const [tags, setTags] = useState("");
  const [techStack, setTechStack] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErr(null);
    setBusy(true);
    try {
      let host = name;
      try { host = new URL(url).hostname.replace("www.", ""); } catch {}
      const baseSlug = slugify(name || host);
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

      const { data, error } = await supabase.from("projects").insert({
        owner_id: user.id,
        slug,
        url,
        name,
        tagline,
        description,
        category,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        tech_stack: techStack.split(",").map((t) => t.trim()).filter(Boolean),
        status: "Live",
        published: true,
      }).select("slug").single();

      if (error) throw error;
      navigate({ to: "/project/$slug", params: { slug: data.slug } });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not save project");
    } finally {
      setBusy(false);
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
            <Sparkles className="h-3.5 w-3.5" /> New project
          </div>
          <h1 className="font-display text-4xl font-semibold md:text-5xl">
            Submit a <span className="text-gradient">project</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Tell us about what you built. You can edit anything later from your dashboard.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-10 space-y-4 rounded-2xl border border-border/60 bg-gradient-card p-8 shadow-elegant">
          <Field label="Project URL *">
            <input required type="url" value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.com" className={inputCls} />
          </Field>
          <Field label="Project name *">
            <input required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="TaskFlow" className={inputCls} />
          </Field>
          <Field label="Tagline">
            <input value={tagline} onChange={(e) => setTagline(e.target.value)}
              placeholder="AI-powered task management for teams" className={inputCls} />
          </Field>
          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={4} placeholder="What does it do? Who is it for?" className={inputCls} />
          </Field>
          <Field label="Category">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => setCategory(c)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-smooth ${
                    category === c ? "border-primary bg-primary text-primary-foreground" : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Tags (comma separated)">
              <input value={tags} onChange={(e) => setTags(e.target.value)}
                placeholder="SaaS, AI, Productivity" className={inputCls} />
            </Field>
            <Field label="Tech stack (comma separated)">
              <input value={techStack} onChange={(e) => setTechStack(e.target.value)}
                placeholder="React, Postgres, OpenAI" className={inputCls} />
            </Field>
          </div>

          {err && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
              {err}
            </div>
          )}

          <button type="submit" disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-medium text-primary-foreground shadow-glow transition-smooth hover:scale-[1.01] disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Publish project
            <ArrowRight className="h-4 w-4" />
          </button>

          <Link to="/dashboard" className="block text-center text-xs text-muted-foreground hover:text-foreground">
            Cancel and go to dashboard
          </Link>
        </form>
      </section>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-border/60 bg-input/50 px-4 py-2.5 text-sm outline-none transition-smooth focus:border-primary/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
