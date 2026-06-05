import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Code2, Palette, Briefcase, Sparkles, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TYPES = [
  {
    id: "developer",
    label: "Developer",
    icon: Code2,
    blurb: "Showcase projects, repos, side-builds, and demos.",
  },
  {
    id: "designer",
    label: "Designer",
    icon: Palette,
    blurb: "Show off case studies, portfolio pieces, and visual work.",
  },
  {
    id: "freelancer",
    label: "Freelancer",
    icon: Briefcase,
    blurb: "Offer services, list past work, highlight your experience.",
  },
  {
    id: "creator",
    label: "Creator / Other",
    icon: Sparkles,
    blurb: "A mix — projects, skills, qualifications, anything you've built.",
  },
] as const;

export function ProfileTypeOnboarding({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string>("creator");
  const [headline, setHeadline] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          profile_type: selected,
          headline: headline.trim() || null,
        } as never)
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile", userId] });
      qc.invalidateQueries({ queryKey: ["profile", userId] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-elegant">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Skip"
        >
          <X className="h-4 w-4" />
        </button>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary-glow">
            Welcome
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            What kind of profile are you building?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick the closest match — we'll tailor your dashboard and public page. You can change this later.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {TYPES.map((t) => {
            const active = selected === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`group flex items-start gap-3 rounded-xl border p-4 text-left transition-smooth ${
                  active
                    ? "border-primary/60 bg-primary/10 shadow-glow"
                    : "border-border/60 bg-background/40 hover:border-primary/30"
                }`}
              >
                <div
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                    active ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <t.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-sm font-semibold">{t.label}</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.blurb}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <label className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            One-line headline <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Full-stack dev shipping AI side-projects"
            maxLength={120}
            className="mt-1.5 w-full rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/50"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
          <button
            onClick={() => mutate()}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-60"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
