-- 1. Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_type TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- 2. profile_items
CREATE TABLE IF NOT EXISTS public.profile_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('service','highlight','skill','qualification')),
  title TEXT NOT NULL,
  subtitle TEXT,
  body TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}',
  position INT NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profile_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_items TO authenticated;
GRANT ALL ON public.profile_items TO service_role;

ALTER TABLE public.profile_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published items are public" ON public.profile_items;
CREATE POLICY "Published items are public"
  ON public.profile_items FOR SELECT
  USING (published = true OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can insert items" ON public.profile_items;
CREATE POLICY "Owners can insert items"
  ON public.profile_items FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update items" ON public.profile_items;
CREATE POLICY "Owners can update items"
  ON public.profile_items FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete items" ON public.profile_items;
CREATE POLICY "Owners can delete items"
  ON public.profile_items FOR DELETE
  USING (auth.uid() = owner_id);

DROP TRIGGER IF EXISTS update_profile_items_updated_at ON public.profile_items;
CREATE TRIGGER update_profile_items_updated_at
  BEFORE UPDATE ON public.profile_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_profile_items_owner ON public.profile_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_profile_items_type ON public.profile_items(type);

-- 3. profile_tags
CREATE TABLE IF NOT EXISTS public.profile_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('skill','service','credential','topic')),
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, kind, label)
);

GRANT SELECT ON public.profile_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_tags TO authenticated;
GRANT ALL ON public.profile_tags TO service_role;

ALTER TABLE public.profile_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tags are public" ON public.profile_tags;
CREATE POLICY "Tags are public"
  ON public.profile_tags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners can insert tags" ON public.profile_tags;
CREATE POLICY "Owners can insert tags"
  ON public.profile_tags FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update tags" ON public.profile_tags;
CREATE POLICY "Owners can update tags"
  ON public.profile_tags FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete tags" ON public.profile_tags;
CREATE POLICY "Owners can delete tags"
  ON public.profile_tags FOR DELETE
  USING (auth.uid() = owner_id);