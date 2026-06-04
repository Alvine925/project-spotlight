import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteNav } from "@/components/SiteNav";
import { ProjectCard } from "@/components/ProjectCard";
import { UrlSubmit } from "@/components/UrlSubmit";
import { mockProjects, categories } from "@/lib/mockProjects";
import heroGlow from "@/assets/hero-glow.jpg";
import { Search, Globe, Brain, Sparkles, Layers, Radar } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProjectAtlas — AI-powered catalogue of developer projects" },
      {
        name: "description",
        content:
          "Drop a URL. ProjectAtlas crawls, understands, and showcases your project automatically — searchable, shareable, always up to date.",
      },
      { property: "og:title", content: "ProjectAtlas" },
      { property: "og:description", content: "An AI-powered catalogue for the projects developers actually build." },
    ],
  }),
  component: Home,
});

function Home() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(() => {
    return mockProjects.filter((p) => {
      const matchCat = cat === "All" || p.category === cat;
      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.techStack.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [query, cat]);

  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-50"
          style={{
            backgroundImage: `url(${heroGlow})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            maskImage: "linear-gradient(to bottom, black 30%, transparent 95%)",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />

        <div className="mx-auto max-w-7xl px-6 pb-24 pt-24 md:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary-glow backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered project catalogue
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Drop a URL.<br />
              <span className="text-gradient">Get a beautiful project page.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
              ProjectAtlas crawls, understands, and showcases your work automatically — so you can keep building while the world finds it.
            </p>

            <div className="mt-10 flex justify-center">
              <UrlSubmit />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-primary-glow" /> Crawls homepage + key pages</span>
              <span className="inline-flex items-center gap-1.5"><Brain className="h-3.5 w-3.5 text-primary-glow" /> AI summary & features</span>
              <span className="inline-flex items-center gap-1.5"><Radar className="h-3.5 w-3.5 text-primary-glow" /> Weekly auto-refresh</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border/40 bg-background/60">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">From URL to publishable project page in under 60 seconds.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Globe, title: "1. Submit a URL", body: "Paste your project link. We crawl the homepage and key internal pages." },
              { icon: Brain, title: "2. AI understands it", body: "We extract features, tech stack, use cases, and write a clean summary." },
              { icon: Layers, title: "3. Publish & be found", body: "A polished project page goes live in our searchable catalogue." },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-elegant transition-smooth hover:border-primary/40">
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary shadow-glow">
                  <s.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalogue */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">Discover projects</h2>
            <p className="mt-2 text-muted-foreground">A growing catalogue of indie builds, AI tools, and weekend experiments.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, tags, tech…"
              className="w-full rounded-xl border border-border/60 bg-card/60 py-2.5 pl-9 pr-3 text-sm outline-none backdrop-blur-md transition-smooth focus:border-primary/60"
            />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-smooth ${
                cat === c
                  ? "border-primary bg-primary text-primary-foreground shadow-glow"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-card/40 p-12 text-center text-muted-foreground">
            No projects match that search yet.
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border/40">
        <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-70" />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="font-display text-4xl font-semibold md:text-5xl">
            Stop writing portfolio pages.<br />
            <span className="text-gradient">Start shipping.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Add your first project in seconds. We'll keep it fresh, indexed, and shareable.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/submit"
              className="rounded-full bg-gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-smooth hover:scale-105"
            >
              Add your project →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-10 text-center text-xs text-muted-foreground">
        ProjectAtlas · An AI-powered home for the projects developers actually build.
      </footer>
    </div>
  );
}
