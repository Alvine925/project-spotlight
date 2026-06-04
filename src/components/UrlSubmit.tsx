import { useState } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

export function UrlSubmit({ size = "lg" }: { size?: "lg" | "md" }) {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<"idle" | "scanning" | "done">("idle");

  const stages = [
    "Crawling homepage…",
    "Reading features & pricing…",
    "Generating AI summary…",
    "Classifying & tagging…",
  ];
  const [stageIdx, setStageIdx] = useState(0);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setStage("scanning");
    setStageIdx(0);
    let i = 0;
    const t = setInterval(() => {
      i++;
      if (i >= stages.length) {
        clearInterval(t);
        setStage("done");
      } else {
        setStageIdx(i);
      }
    }, 900);
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl">
      <div
        className={`group relative flex items-center gap-2 rounded-2xl border border-border/70 bg-card/60 p-2 shadow-elegant backdrop-blur-xl transition-smooth focus-within:border-primary/60 focus-within:shadow-glow ${
          size === "lg" ? "" : "p-1.5"
        }`}
      >
        <div className="ml-2 grid place-items-center text-primary-glow">
          <Sparkles className="h-5 w-5" />
        </div>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type="url"
          required
          placeholder="https://your-project.com"
          className={`flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/60 outline-none ${
            size === "lg" ? "py-3 text-base" : "py-2 text-sm"
          }`}
        />
        <button
          type="submit"
          disabled={stage === "scanning"}
          className={`flex items-center gap-2 rounded-xl bg-gradient-primary font-medium text-primary-foreground shadow-glow transition-smooth hover:scale-[1.03] disabled:opacity-60 ${
            size === "lg" ? "px-5 py-3 text-sm" : "px-4 py-2 text-sm"
          }`}
        >
          {stage === "scanning" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing
            </>
          ) : stage === "done" ? (
            <>Done</>
          ) : (
            <>
              Generate <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {stage === "scanning" && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/50 bg-card/40 px-4 py-3 text-sm text-muted-foreground backdrop-blur-md">
          <Loader2 className="h-4 w-4 animate-spin text-primary-glow" />
          <span>{stages[stageIdx]}</span>
        </div>
      )}
      {stage === "done" && (
        <div className="mt-4 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary-glow backdrop-blur-md">
          ✓ Project draft ready — review and publish in the dashboard (coming next).
        </div>
      )}
    </form>
  );
}
