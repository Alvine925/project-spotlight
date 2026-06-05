import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Trash2, Pencil, X, Check, Briefcase, Award, Lightbulb, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type ProfileItem = {
  id: string;
  owner_id: string;
  type: "service" | "highlight" | "skill" | "qualification";
  title: string;
  subtitle: string | null;
  body: string | null;
  meta: Record<string, unknown>;
  tags: string[];
  position: number;
  published: boolean;
  created_at: string;
};

const TYPE_META = {
  service: { label: "Service", icon: Briefcase, blurb: "Offer a paid or freelance service." },
  highlight: { label: "Highlight", icon: Lightbulb, blurb: "A role, case study, or career milestone." },
  skill: { label: "Skill", icon: Star, blurb: "Something you're good at." },
  qualification: { label: "Qualification", icon: Award, blurb: "Cert, degree, course, or award." },
} as const;

const inputCls =
  "w-full rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-sm outline-none focus:border-primary/50";

type ItemType = ProfileItem["type"];

function suggestKind(t: ItemType): "skill" | "service" | "credential" | "topic" {
  if (t === "skill") return "skill";
  if (t === "service") return "service";
  if (t === "qualification") return "credential";
  return "topic";
}

function ItemForm({
  userId,
  type,
  initial,
  onDone,
}: {
  userId: string;
  type: ItemType;
  initial?: ProfileItem;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const meta = (initial?.meta ?? {}) as Record<string, string | number | undefined>;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  // meta fields per type
  const [price, setPrice] = useState(String(meta.price ?? ""));
  const [level, setLevel] = useState(String(meta.level ?? "3"));
  const [years, setYears] = useState(String(meta.years ?? ""));
  const [issuer, setIssuer] = useState(String(meta.issuer ?? ""));
  const [date, setDate] = useState(String(meta.date ?? ""));
  const [url, setUrl] = useState(String(meta.url ?? ""));
  const [org, setOrg] = useState(String(meta.org ?? ""));
  const [period, setPeriod] = useState(String(meta.period ?? ""));

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);

      const metaObj: Record<string, string | number> = {};
      if (type === "service" && price) metaObj.price = price;
      if (type === "skill") {
        if (level) metaObj.level = Number(level);
        if (years) metaObj.years = Number(years);
      }
      if (type === "qualification") {
        if (issuer) metaObj.issuer = issuer;
        if (date) metaObj.date = date;
        if (url) metaObj.url = url;
      }
      if (type === "highlight") {
        if (org) metaObj.org = org;
        if (period) metaObj.period = period;
      }

      const payload = {
        owner_id: userId,
        type,
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        body: body.trim() || null,
        meta: metaObj,
        tags: tagList,
        published: true,
      };

      if (initial) {
        const { error } = await supabase
          .from("profile_items")
          .update(payload as never)
          .eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("profile_items").insert(payload as never);
        if (error) throw error;
      }

      // Persist tags for future autocomplete
      if (tagList.length) {
        const kind = suggestKind(type);
        await supabase.from("profile_tags").upsert(
          tagList.map((label) => ({ owner_id: userId, kind, label })) as never,
          { onConflict: "owner_id,kind,label", ignoreDuplicates: true }
        );
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile-items", userId] });
      qc.invalidateQueries({ queryKey: ["profile-items", userId] });
      qc.invalidateQueries({ queryKey: ["profile-tags", userId] });
      onDone();
    },
  });

  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">
            {type === "skill" ? "Skill name" : type === "qualification" ? "Credential" : "Title"}
          </label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
        </div>

        {type === "service" && (
          <>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Short pitch</label>
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputCls} placeholder="What you'll deliver in 1 line" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Starting price</label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} placeholder="e.g. From $500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Details</label>
              <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} className={`${inputCls} resize-none`} placeholder="What's included, timeline, deliverables…" />
            </div>
          </>
        )}

        {type === "highlight" && (
          <>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Role / subtitle</label>
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputCls} placeholder="e.g. Senior Designer" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Organisation</label>
              <input value={org} onChange={(e) => setOrg(e.target.value)} className={inputCls} placeholder="e.g. Acme Inc" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Period</label>
              <input value={period} onChange={(e) => setPeriod(e.target.value)} className={inputCls} placeholder="e.g. 2022 — Present" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Summary</label>
              <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} className={`${inputCls} resize-none`} />
            </div>
          </>
        )}

        {type === "skill" && (
          <>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Level (1–5)</label>
              <input type="number" min={1} max={5} value={level} onChange={(e) => setLevel(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Years of experience</label>
              <input type="number" min={0} value={years} onChange={(e) => setYears(e.target.value)} className={inputCls} placeholder="e.g. 3" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Notes</label>
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputCls} placeholder="e.g. React, Vue, TanStack" />
            </div>
          </>
        )}

        {type === "qualification" && (
          <>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Issuer</label>
              <input value={issuer} onChange={(e) => setIssuer(e.target.value)} className={inputCls} placeholder="e.g. AWS, Stanford" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Date</label>
              <input value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} placeholder="e.g. 2024" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Verification URL <span className="text-muted-foreground/60">(optional)</span></label>
              <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputCls} placeholder="https://…" />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">
            Tags <span className="text-muted-foreground/60">(comma-separated — used for filtering)</span>
          </label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls} placeholder="e.g. react, frontend, ui-design" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => mutate()}
          disabled={isPending || !title.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary/20 px-4 py-2 text-xs font-medium text-primary-glow hover:bg-primary/30 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          {initial ? "Save changes" : `Add ${TYPE_META[type].label.toLowerCase()}`}
        </button>
        <button onClick={onDone} className="rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </div>
    </div>
  );
}

function ItemRow({ item, userId }: { item: ProfileItem; userId: string }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const onDelete = async () => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await supabase.from("profile_items").delete().eq("id", item.id);
    qc.invalidateQueries({ queryKey: ["my-profile-items", userId] });
    qc.invalidateQueries({ queryKey: ["profile-items", userId] });
  };

  if (editing) {
    return <ItemForm userId={userId} type={item.type} initial={item} onDone={() => setEditing(false)} />;
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border/40 bg-background/30 p-3">
      <div className="min-w-0">
        <div className="font-medium text-sm">{item.title}</div>
        {item.subtitle && <div className="text-xs text-muted-foreground line-clamp-1">{item.subtitle}</div>}
        {item.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {item.tags.slice(0, 4).map((t) => (
              <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{t}</span>
            ))}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button onClick={() => setEditing(true)} className="rounded p-1.5 text-muted-foreground hover:text-foreground" aria-label="Edit">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={onDelete} className="rounded p-1.5 text-muted-foreground hover:text-destructive" aria-label="Delete">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function TypeSection({ userId, type, items }: { userId: string; type: ItemType; items: ProfileItem[] }) {
  const [adding, setAdding] = useState(false);
  const meta = TYPE_META[type];
  const Icon = meta.icon;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary-glow">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold">{meta.label}s</h3>
            <p className="text-xs text-muted-foreground">{meta.blurb}</p>
          </div>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary-glow hover:bg-primary/25"
        >
          {adding ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {adding ? "Close" : "Add"}
        </button>
      </div>

      {adding && (
        <div className="mb-3">
          <ItemForm userId={userId} type={type} onDone={() => setAdding(false)} />
        </div>
      )}

      {items.length === 0 ? (
        !adding && (
          <p className="rounded-xl border border-dashed border-border/40 bg-background/20 p-4 text-center text-xs text-muted-foreground">
            No {meta.label.toLowerCase()}s yet.
          </p>
        )
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <ItemRow key={it.id} item={it} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProfileItemsManager({ userId, profileType }: { userId: string; profileType: string | null }) {
  const { data: items, isLoading } = useQuery({
    queryKey: ["my-profile-items", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_items")
        .select("*")
        .eq("owner_id", userId)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ProfileItem[];
    },
  });

  // Choose which types to surface based on profile type
  const allTypes: ItemType[] = ["service", "highlight", "skill", "qualification"];
  const orderByType: Record<string, ItemType[]> = {
    freelancer: ["service", "highlight", "skill", "qualification"],
    developer: ["skill", "highlight", "qualification", "service"],
    designer: ["highlight", "skill", "service", "qualification"],
    creator: ["highlight", "skill", "qualification", "service"],
  };
  const order = orderByType[profileType ?? "creator"] ?? allTypes;
  const grouped = (items ?? []).reduce<Record<ItemType, ProfileItem[]>>(
    (acc, it) => {
      acc[it.type] = acc[it.type] ? [...acc[it.type], it] : [it];
      return acc;
    },
    { service: [], highlight: [], skill: [], qualification: [] }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary-glow" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {order.map((t) => (
        <TypeSection key={t} userId={userId} type={t} items={grouped[t]} />
      ))}
    </div>
  );
}
