import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function UrlSubmit() {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    navigate({ to: "/submit", search: { url } as never });
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl">
      <div className="group relative flex items-center gap-2 rounded-2xl border border-border/70 bg-card/60 p-2 shadow-elegant backdrop-blur-xl transition-smooth focus-within:border-primary/60 focus-within:shadow-glow">
        <div className="ml-2 grid place-items-center text-primary-glow">
          <Sparkles className="h-5 w-5" />
        </div>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type="url"
          required
          placeholder="https://your-project.com"
          className="flex-1 bg-transparent py-3 text-base text-foreground placeholder:text-muted-foreground/60 outline-none"
        />
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow transition-smooth hover:scale-[1.03]"
        >
          Add project <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
