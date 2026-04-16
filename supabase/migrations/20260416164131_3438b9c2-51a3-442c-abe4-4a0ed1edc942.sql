
-- Forms table
CREATE TABLE public.forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  pipeline_id UUID REFERENCES public.crm_pipelines(id) ON DELETE SET NULL,
  stage_id UUID REFERENCES public.crm_stages(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  theme_config JSONB NOT NULL DEFAULT '{"primaryColor":"#FBBF24","backgroundColor":"#0a0a0a","mode":"dark"}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read published forms" ON public.forms FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Auth full access forms" ON public.forms FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Form fields table
CREATE TABLE public.form_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'text',
  label TEXT NOT NULL,
  placeholder TEXT,
  required BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  options JSONB DEFAULT '[]'::jsonb,
  validation JSONB DEFAULT '{}'::jsonb,
  conditional_logic JSONB DEFAULT NULL,
  field_mapping TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read fields of published forms" ON public.form_fields FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM public.forms WHERE forms.id = form_fields.form_id AND forms.status = 'published')
);
CREATE POLICY "Auth full access form_fields" ON public.form_fields FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Form submissions table
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  dropped_at_field TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert submissions" ON public.form_submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Auth full access submissions" ON public.form_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable realtime for submissions
ALTER PUBLICATION supabase_realtime ADD TABLE public.form_submissions;

-- Index for slug lookups
CREATE INDEX idx_forms_slug ON public.forms (slug);
CREATE INDEX idx_form_fields_form_id ON public.form_fields (form_id);
CREATE INDEX idx_form_submissions_form_id ON public.form_submissions (form_id);
