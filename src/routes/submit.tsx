import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { UrlSubmit } from "@/components/UrlSubmit";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit a project — ProjectAtlas" },
      { name: "description", content: "Add your project to ProjectAtlas. Paste a URL and we'll generate everything else." },
    ],
  }),
  component: Submit,
});

function Submit() {
  const steps = [
    "We crawl your homepage and key pages",
    "AI extracts features, use cases, and tech stack",
    "A clean project page goes live in the catalogue",
    "We re-scan weekly so your page never goes stale",
  ];

  return (
    <div className="min-h-screen">
      <SiteNav />
      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="text-center">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">
            Submit a <span className="text-gradient">project</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            One URL is all we need. The rest is on us.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <UrlSubmit />
        </div>

        <div className="mx-auto mt-14 max-w-xl rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-elegant">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-primary-glow">
            What happens next
          </h2>
          <ul className="mt-4 space-y-3">
            {steps.map((s) => (
              <li key={s} className="flex items-start gap-3 text-sm text-foreground/90">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-glow" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
