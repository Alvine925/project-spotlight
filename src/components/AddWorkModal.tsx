import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, slugify } from "@/lib/auth";
import { analyzeProjectUrl } from "@/lib/projects.functions";
import { X, Loader2, CheckCircle2, Wand2, PenLine, RefreshCw, ArrowRight } from "lucide-react";

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

type Extracted = {
  name: string; tagline: string; description: string; category: string;
  tags: string[]; what_it_does: string[]; features: string[];
  use_cases: string[]; cover_image_url: string | null; url: string;
};

type Manual = {
  url: string; name: string; tagline: string; description: string;
  category: string; tags: string; tech_stack: string; features: string;
  use_cases: string; cover_image_url: string; status: string;
};

const EMPTY_MANUAL: Manual = {
  url: "", name: "", tagline: "", description: "", category: "",
  tags: "", tech_stack: "", features: "", use_cases: "",
  cover_image_url: "", status: "Live",
};

export function AddWorkModal({ onClose, onSuccess }: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const analyze = useServerFn(analyzeProjectUrl);

  const [mode, setMode] = useState<"auto" | "manual">("auto");

  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);
  const [extracted, setExtracted] = useState<Extracted | null>(null);

  const [manual, setManual] = useState<Manual>(EMPTY_MANUAL);
  const setM = (k: keyof Manual) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setManual((prev) => ({ ...prev, [k]: e.target.value }));

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not analyze that URL");
    } finally {
      setAnalyzing(false);
    }
  };

  const saveProject = async (fields: object) => {
    if (!user) return;
    setErr(null);
    setSaving(true);
    try {
      const { error } = await supabase
        .from("projects")
        .insert(fields as never);
      if (error) throw error;
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (e) {
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold text-gray-900">Add work</h2>
            <p className="text-xs text-gray-400">Paste a URL for instant AI fill, or enter details manually.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Success state */}
        {done && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-6">
            <CheckCircle2 className="h-10 w-10 text-[#ff6600]" />
            <p className="font-display text-lg font-bold text-gray-900">Added!</p>
            <p className="text-sm text-gray-400">Your work has been published to your profile.</p>
          </div>
        )}

        {!done && (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Mode toggle */}
            <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setMode("auto")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${mode === "auto" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
              >
                <Wand2 className="h-4 w-4" /> AI Fill
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors ${mode === "manual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-700"}`}
              >
                <PenLine className="h-4 w-4" /> Manual
              </button>
            </div>

            {err && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{err}</div>
            )}

            {/* ── AUTO MODE ── */}
            {mode === "auto" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourproject.com"
                    className={inputCls + " flex-1"}
                    onKeyDown={(e) => e.key === "Enter" && !analyzing && url && runAnalyze()}
                    disabled={analyzing}
                  />
                  <button
                    type="button"
                    onClick={runAnalyze}
                    disabled={analyzing || !url}
                    className="flex items-center gap-2 rounded-lg bg-[#ff6600] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e55a00] disabled:opacity-50"
                  >
                    {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    Analyze
                  </button>
                </div>

                {analyzing && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2.5">
                    {["Fetching page content…", "Running AI analysis…", "Building your project page…"].map((label, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm">
                        {stage > i ? (
                          <CheckCircle2 className="h-4 w-4 text-[#ff6600]" />
                        ) : stage === i ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[#ff6600]" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-200" />
                        )}
                        <span className={stage >= i ? "text-gray-800" : "text-gray-400"}>{label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {extracted && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-[#ff6600]/20 bg-[#ff6600]/5 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-sm font-bold text-gray-900">{extracted.name}</p>
                          {extracted.tagline && (
                            <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{extracted.tagline}</p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {extracted.category && (
                              <span className="rounded-full bg-[#ff6600]/10 px-2 py-0.5 text-[10px] font-semibold text-[#ff6600]">
                                {extracted.category}
                              </span>
                            )}
                            {extracted.tags?.slice(0, 3).map((t) => (
                              <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">{t}</span>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={runAnalyze}
                          className="rounded-full p-1.5 text-gray-400 hover:bg-white hover:text-gray-700"
                          title="Re-analyze"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Field label="Category">
                        <select value={extracted.category} onChange={(e) => setExtracted({ ...extracted, category: e.target.value })} className={inputCls}>
                          <option value="">— Select —</option>
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </Field>
                      <Field label="Name" required>
                        <input value={extracted.name} onChange={(e) => setExtracted({ ...extracted, name: e.target.value })} className={inputCls} />
                      </Field>
                      <Field label="Tagline">
                        <input value={extracted.tagline} onChange={(e) => setExtracted({ ...extracted, tagline: e.target.value })} className={inputCls} />
                      </Field>
                      <Field label="Description">
                        <textarea rows={3} value={extracted.description} onChange={(e) => setExtracted({ ...extracted, description: e.target.value })} className={`${inputCls} resize-none`} />
                      </Field>
                    </div>

                    <button
                      type="button"
                      onClick={onPublishAuto}
                      disabled={saving}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6600] py-3 text-sm font-bold text-white transition-colors hover:bg-[#e55a00] disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Publish to profile
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── MANUAL MODE ── */}
            {mode === "manual" && (
              <form onSubmit={onPublishManual} className="space-y-4">
                <Field label="URL" required>
                  <input value={manual.url} onChange={setM("url")} placeholder="https://yourproject.com" type="url" className={inputCls} required />
                </Field>
                <Field label="Name" required>
                  <input value={manual.name} onChange={setM("name")} placeholder="My Project" className={inputCls} required />
                </Field>
                <Field label="Tagline">
                  <input value={manual.tagline} onChange={setM("tagline")} placeholder="One sentence pitch" className={inputCls} />
                </Field>
                <Field label="Description">
                  <textarea rows={3} value={manual.description} onChange={setM("description")} placeholder="What does it do, who is it for?" className={`${inputCls} resize-none`} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
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
                  <input value={manual.tags} onChange={setM("tags")} placeholder="saas, productivity, ai" className={inputCls} />
                </Field>
                <Field label="Tech stack" hint="comma-separated">
                  <input value={manual.tech_stack} onChange={setM("tech_stack")} placeholder="React, Node.js, PostgreSQL" className={inputCls} />
                </Field>
                <Field label="Cover image URL" hint="optional">
                  <input value={manual.cover_image_url} onChange={setM("cover_image_url")} placeholder="https://..." type="url" className={inputCls} />
                </Field>
                <Field label="Key features" hint="one per line or comma-separated">
                  <textarea rows={3} value={manual.features} onChange={setM("features")} placeholder="Real-time collaboration&#10;Export to PDF&#10;Team workspaces" className={`${inputCls} resize-none`} />
                </Field>

                <button
                  type="submit"
                  disabled={saving || !manual.name || !manual.url}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6600] py-3 text-sm font-bold text-white transition-colors hover:bg-[#e55a00] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Publish to profile
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}
