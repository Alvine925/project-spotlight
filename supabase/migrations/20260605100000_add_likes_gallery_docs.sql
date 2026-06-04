
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS documentation_url TEXT,
  ADD COLUMN IF NOT EXISTS gallery_images TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shares_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS about TEXT;

CREATE TABLE IF NOT EXISTS public.project_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, visitor_id)
);
GRANT INSERT, SELECT ON public.project_likes TO anon, authenticated;
GRANT ALL ON public.project_likes TO service_role;
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can like" ON public.project_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read likes" ON public.project_likes FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS project_likes_project_idx ON public.project_likes(project_id);

CREATE TABLE IF NOT EXISTS public.project_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  platform TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.project_shares TO anon, authenticated;
GRANT ALL ON public.project_shares TO service_role;
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record a share" ON public.project_shares FOR INSERT WITH CHECK (true);
CREATE INDEX IF NOT EXISTS project_shares_project_idx ON public.project_shares(project_id);
