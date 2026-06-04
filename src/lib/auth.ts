// Deterministic gradient picker — returns hex pairs so we can use inline styles
// (avoids Tailwind class purging issues with dynamic class names).
const gradients: Array<[string, string]> = [
  ["#f97316", "#fbbf24"], // orange-500 -> amber-400
  ["#f59e0b", "#fdba74"], // amber-500 -> orange-300
  ["#ea580c", "#fb7185"], // orange-600 -> rose-400
  ["#facc15", "#f97316"], // yellow-400 -> orange-500
  ["#fb923c", "#f87171"], // orange-400 -> red-400
  ["#fbbf24", "#ea580c"], // amber-400 -> orange-600
];

export function pickPalette(seed: string): [string, string] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return gradients[h % gradients.length];
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || `p-${Math.random().toString(36).slice(2, 8)}`;
}

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  return { user, loading };
}
