import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
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
    <form onSubmit={onSubmit} className="w-full max-w-xl">
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm focus-within:border-[#ff6600]/50 focus-within:shadow-[0_0_0_3px_rgba(255,102,0,0.08)]">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type="url"
          required
          placeholder="https://your-project.com"
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
        />
        <button
          type="submit"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-[#ff6600] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e55a00]"
        >
          Add project <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
