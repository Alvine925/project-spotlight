// Avatar gradient pairs — all orange-on-black, consistent with the brand palette.
const gradients: Array<[string, string]> = [
  ["#ff6600", "#ff4400"],
  ["#ff6600", "#ff8800"],
  ["#ff5500", "#ff6600"],
  ["#ff4400", "#ff6600"],
  ["#ff7700", "#ff5500"],
  ["#ff6600", "#cc4400"],
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
