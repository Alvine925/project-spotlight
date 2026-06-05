import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav } from "@/components/SiteNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, slugify } from "@/lib/auth";
import { analyzeProjectUrl } from "@/lib/projects.functions";
import { Loader2, CheckCircle2, ArrowRight, RefreshCw, Wand2, PenLine } from "lucide-react";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit a project — ProjectAtlas" },
      { name: "description", content: "Add your project to ProjectAtlas." },
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

type Manual = {
  url: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  tags: string;
  tech_stack: string;
  features: string;
  use_cases: string;
  cover_image_url: string;
  status: string;
};

const EMPTY_MANUAL: Manual = {
  url: "",
  name: "",
  tagline: "",
  description: "",
  category: "",
  tags: "",
  tech_stack: "",
  features: "",
  use_cases: "",
  cover_image_url: "",
  status: "Live",
};

const CATEGORIES = ["App", "Website", "AI Tool", "Design", "Photography", "Branding", "Writing", "Architecture", "Video", "Marketing", "Other"];
const STATUS_OPTIONS = ["Live", "WIP", "Beta", "Archived"];

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600]/20";

const labelCls = "block text-xs font-semibold uppercase tracking-wider text-gray-400";

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className={labelCls}>
        {label}{required && <span className="ml-1 text-[#ff6600]">*</span>}
        {hint && <span className="ml-2 normal-case font-normal text-gray-300">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

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

function FreelancePanel({
  isFreelance, setIsFreelance,
  clientName, setClientName,
  clientUrl, setClientUrl,
  clientTestimonial, setClientTestimonial,
}: {
  isFreelance: boolean; setIsFreelance: (v: boolean) => void;
  clientName: string; setClientName: (v: string) => void;
  clientUrl: string; setClientUrl: (v: string) => void;
  clientTestimonial: string; setClientTestimonial: (v: string) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex cursor-pointer items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">Freelance / client work?</p>
          <p className="mt-0.5 text-xs text-gray-400">Optionally credit the client and add their testimonial.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isFreelance}
          onClick={() => setIsFreelance(!isFreelance)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
            isFreelance ? "bg-[#ff6600]" : "bg-gray-300"
          }`}
        >
          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
            isFreelance ? "translate-x-5" : "translate-x-0"
          }`} />
        </button>
      </div>

      {isFreelance && (
        <div className="mt-4 space-y-3">
          <Field label="Client name" required>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Acme Corp" className={inputCls} />
          </Field>
          <Field label="Client website" hint="(optional)">
            <input value={clientUrl} onChange={(e) => setClientUrl(e.target.value)} placeholder="https://acme.com" type="url" className={inputCls} />
          </Field>
          <Field label="Client testimonial" hint="(optional)">
            <textarea value={clientTestimonial} onChange={(e) => setClientTestimonial(e.target.value)} placeholder="What the client said about working with you…" rows={3} className={`${inputCls} resize-none`} />
          </Field>
        </div>
      )}
    </div>
  );
}

function Submit() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeProjectUrl);

  const [mode, setMode] = useState<"auto" | "manual">("auto");

  /* ── Auto mode state ── */
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);
  const [extracted, setExtracted] = useState<Extracted | null>(null);

  /* ── Manual mode state ── */
  const [manual, setManual] = useState<Manual>(EMPTY_MANUAL);
  const setM = (k: keyof Manual) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setManual((prev) => ({ ...prev, [k]: e.target.value }));

  /* ── Shared state ── */
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isFreelance, setIsFreelance] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientUrl, setClientUrl] = useState("");
  const [clientTestimonial, setClientTestimonial] = useState("");

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

  const clientFields = isFreelance && clientName.trim()
    ? { client_name: clientName.trim(), client_url: clientUrl.trim() || null, client_testimonial: clientTestimonial.trim() || null }
    : {};

  const saveProject = async (fields: object) => {
    if (!user) return;
    setErr(null);
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({ ...fields, ...clientFields } as never)
        .select("slug")
        .single();
      if (error) throw error;
      navigate({ to: "/project/$slug", params: { slug: (data as { slug: string }).slug } });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not save project");
    } finally {
      setSaving(false);
    }
  };

  const onPublishAuto = async () => {
    if (!extracted) return;
    let host = extracted.name;
    try { host = new URL(extracted.url).hostname.replace("www.", ""); } catch {}
    const slug = `${slugify(extracted.name || host)}-${Math.random().toString(36).slice(2, 6)}`;
    await saveProject({
      owner_id: user!.id, slug,
      url: extracted.url, name: extracted.name, tagline: extracted.tagline,
      description: extracted.description, category: extracted.category,
      tags: extracted.tags, tech_stack: extracted.what_it_does,
      features: extracted.features, use_cases: extracted.use_cases,
      cover_image_url: extracted.cover_image_url,
      status: "Live", published: true,
    });
  };

  const onPublishManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = `${slugify(manual.name || manual.url)}-${Math.random().toString(36).slice(2, 6)}`;
    const splitTrim = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
    const splitLines = (s: string) => s.split(/\n|,/).map((x) => x.trim()).filter(Boolean);
    await saveProject({
      owner_id: user!.id, slug,
      url: manual.url, name: manual.name, tagline: manual.tagline,
      description: manual.description, category: manual.category,
      tags: splitTrim(manual.tags), tech_stack: splitTrim(manual.tech_stack),
      features: splitLines(manual.features), use_cases: splitLines(manual.use_cases),
      cover_image_url: manual.cover_image_url || null,
      status: manual.status, published: true,
    });
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

        {/* ── Header ── */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900 md:text-4xl">
            Add your work
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
            Paste a URL for instant AI analysis, or fill in all the details yourself.
          </p>
        </div>

        {/* ── Mode tabs ── */}
        <div className="mb-6 flex rounded-xl border border-gray-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setMode("auto")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              mode === "auto"
                ? "bg-[#ff6600] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Wand2 className="h-4 w-4" />
            Auto-analyze URL
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              mode === "manual"
                ? "bg-[#ff6600] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <PenLine className="h-4 w-4" />
            Fill in manually
          </button>
        </div>

        {/* ══════════════════════════════════════
            AUTO MODE
        ══════════════════════════════════════ */}
        {mode === "auto" && (
          <>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <form onSubmit={(e) => { e.preventDefault(); void runAnalyze(); }}>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    required type="url" value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-project.com"
                    className={`${inputCls} flex-1`}
                  />
                  <button
                    type="submit"
                    disabled={analyzing || !url}
                    className="flex items-center justify-center gap-2 rounded-lg bg-[#ff6600] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e55a00] disabled:opacity-60"
                  >
                    {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    {analyzing ? "Analyzing…" : "Analyze"}
                  </button>
                </div>

                {analyzing && (
                  <div className="mt-5 space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <StageRow active={stage >= 0} done={stage > 0} label="Scraping the page" />
                    <StageRow active={stage >= 1} done={stage > 1} label="Extracting project details with AI" />
                    <StageRow active={stage >= 2} done={false} label="Generating cover image" />
                    <p className="pt-1 text-xs text-gray-400">This usually takes 15–25 seconds.</p>
                  </div>
                )}
              </form>
            </div>

            {err && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{err}</div>
            )}

            {extracted && (
              <div className="mt-6 space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  {extracted.cover_image_url
                    ? <img src={extracted.cover_image_url} alt="cover" className="aspect-video w-full object-cover" />
                    : <div className="aspect-video w-full bg-gray-100" />
                  }
                </div>

                <Field label="Project URL" required>
                  <input value={extracted.url} onChange={(e) => setExtracted({ ...extracted, url: e.target.value })} type="url" className={inputCls} />
                </Field>
                <Field label="Name" required>
                  <input value={extracted.name} onChange={(e) => setExtracted({ ...extracted, name: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Tagline">
                  <input value={extracted.tagline} onChange={(e) => setExtracted({ ...extracted, tagline: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Description">
                  <textarea rows={4} value={extracted.description} onChange={(e) => setExtracted({ ...extracted, description: e.target.value })} className={`${inputCls} resize-none`} />
                </Field>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Category">
                    <select value={extracted.category} onChange={(e) => setExtracted({ ...extracted, category: e.target.value })} className={inputCls}>
                      <option value="">— Select —</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Tags" hint="comma-separated">
                    <input value={extracted.tags.join(", ")} onChange={(e) => setExtracted({ ...extracted, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} className={inputCls} />
                  </Field>
                </div>
                <Field label="Tech stack" hint="comma-separated">
                  <input value={extracted.what_it_does.join(", ")} onChange={(e) => setExtracted({ ...extracted, what_it_does: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} className={inputCls} />
                </Field>

                <FreelancePanel
                  isFreelance={isFreelance} setIsFreelance={setIsFreelance}
                  clientName={clientName} setClientName={setClientName}
                  clientUrl={clientUrl} setClientUrl={setClientUrl}
                  clientTestimonial={clientTestimonial} setClientTestimonial={setClientTestimonial}
                />

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button type="button" onClick={runAnalyze} disabled={analyzing}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:opacity-60"
                  >
                    <RefreshCw className="h-4 w-4" /> Re-analyze
                  </button>
                  <button type="button" onClick={onPublishAuto}
                    disabled={saving || (isFreelance && !clientName.trim())}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#ff6600] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e55a00] disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Publish project <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════
            MANUAL MODE
        ══════════════════════════════════════ */}
        {mode === "manual" && (
          <form onSubmit={onPublishManual}>
            <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

              {/* Cover preview */}
              {manual.cover_image_url && (
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <img src={manual.cover_image_url} alt="cover preview" className="aspect-video w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                </div>
              )}

              {/* Required fields */}
              <Field label="Project URL" required>
                <input required type="url" value={manual.url} onChange={setM("url")} placeholder="https://your-project.com" className={inputCls} />
              </Field>
              <Field label="Project name" required>
                <input required value={manual.name} onChange={setM("name")} placeholder="My Awesome App" className={inputCls} />
              </Field>

              <div className="border-t border-gray-100 pt-4">
                <p className={`${labelCls} mb-4`}>Optional details</p>

                <div className="space-y-5">
                  <Field label="Tagline" hint="one-liner">
                    <input value={manual.tagline} onChange={setM("tagline")} placeholder="The fastest way to ship side-projects" className={inputCls} />
                  </Field>
                  <Field label="Description">
                    <textarea rows={4} value={manual.description} onChange={setM("description")} placeholder="Describe what your project does, who it's for, and why it matters…" className={`${inputCls} resize-none`} />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Category">
                      <select value={manual.category} onChange={setM("category")} className={inputCls}>
                        <option value="">— Select —</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Status">
                      <select value={manual.status} onChange={setM("status")} className={inputCls}>
                        {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </Field>
                  </div>

                  <Field label="Tags" hint="comma-separated">
                    <input value={manual.tags} onChange={setM("tags")} placeholder="React, Open Source, CLI" className={inputCls} />
                  </Field>
                  <Field label="Tech stack" hint="comma-separated">
                    <input value={manual.tech_stack} onChange={setM("tech_stack")} placeholder="TypeScript, Node.js, Tailwind CSS" className={inputCls} />
                  </Field>
                  <Field label="Features" hint="one per line or comma-separated">
                    <textarea rows={3} value={manual.features} onChange={setM("features")} placeholder={"Real-time sync\nOffline support\nOne-click deploy"} className={`${inputCls} resize-none`} />
                  </Field>
                  <Field label="Use cases" hint="one per line or comma-separated">
                    <textarea rows={3} value={manual.use_cases} onChange={setM("use_cases")} placeholder={"Teams managing remote projects\nFreelancers tracking billable hours"} className={`${inputCls} resize-none`} />
                  </Field>
                  <Field label="Cover image URL" hint="optional — direct image link">
                    <input value={manual.cover_image_url} onChange={setM("cover_image_url")} placeholder="https://..." className={inputCls} />
                  </Field>
                </div>
              </div>

              <FreelancePanel
                isFreelance={isFreelance} setIsFreelance={setIsFreelance}
                clientName={clientName} setClientName={setClientName}
                clientUrl={clientUrl} setClientUrl={setClientUrl}
                clientTestimonial={clientTestimonial} setClientTestimonial={setClientTestimonial}
              />

              {err && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{err}</div>
              )}

              <button
                type="submit"
                disabled={saving || !manual.url || !manual.name || (isFreelance && !clientName.trim())}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff6600] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e55a00] disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Publish project <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
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
