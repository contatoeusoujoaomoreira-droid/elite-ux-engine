-- Pageviews table for tracking
CREATE TABLE public.pageviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  page_path TEXT NOT NULL DEFAULT '/',
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plan click events
CREATE TABLE public.plan_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin scripts/pixels persistence
CREATE TABLE public.admin_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  script_key TEXT NOT NULL UNIQUE,
  script_value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pageviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_scripts ENABLE ROW LEVEL SECURITY;

-- Pageviews: anyone can insert (anonymous tracking), only authenticated can read
CREATE POLICY "Anyone can insert pageviews" ON public.pageviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can read pageviews" ON public.pageviews FOR SELECT TO authenticated USING (true);

-- Plan clicks: anyone can insert, only authenticated can read
CREATE POLICY "Anyone can insert plan clicks" ON public.plan_clicks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can read plan clicks" ON public.plan_clicks FOR SELECT TO authenticated USING (true);

-- Admin scripts: authenticated can CRUD
CREATE POLICY "Authenticated can read scripts" ON public.admin_scripts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert scripts" ON public.admin_scripts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update scripts" ON public.admin_scripts FOR UPDATE TO authenticated USING (true);

-- Seed default script keys
INSERT INTO public.admin_scripts (script_key, script_value) VALUES
  ('meta_pixel', ''),
  ('gtm_script', ''),
  ('custom_head', ''),
  ('custom_body', '');

-- Indexes for performance
CREATE INDEX idx_pageviews_created_at ON public.pageviews (created_at DESC);
CREATE INDEX idx_pageviews_utm_source ON public.pageviews (utm_source);
CREATE INDEX idx_plan_clicks_plan_name ON public.plan_clicks (plan_name);
CREATE INDEX idx_plan_clicks_created_at ON public.plan_clicks (created_at DESC);