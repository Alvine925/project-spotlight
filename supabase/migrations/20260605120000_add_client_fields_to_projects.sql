ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS client_url TEXT,
  ADD COLUMN IF NOT EXISTS client_testimonial TEXT;
