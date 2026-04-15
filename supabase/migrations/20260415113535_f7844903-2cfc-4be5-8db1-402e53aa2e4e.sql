
-- CRM Pipelines
CREATE TABLE public.crm_pipelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_pipelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth full access pipelines" ON public.crm_pipelines FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CRM Stages
CREATE TABLE public.crm_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pipeline_id UUID NOT NULL REFERENCES public.crm_pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  status_type TEXT NOT NULL DEFAULT 'open' CHECK (status_type IN ('open','won','lost')),
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth full access stages" ON public.crm_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CRM Tags
CREATE TABLE public.crm_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth full access tags" ON public.crm_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CRM Leads
CREATE TABLE public.crm_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pipeline_id UUID NOT NULL REFERENCES public.crm_pipelines(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.crm_stages(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  source TEXT,
  opportunity_value NUMERIC DEFAULT 0,
  billing_type TEXT DEFAULT 'one-time' CHECK (billing_type IN ('recurring','one-time')),
  notes TEXT,
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_stage_change_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth full access leads" ON public.crm_leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CRM Lead Tags (junction)
CREATE TABLE public.crm_lead_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.crm_tags(id) ON DELETE CASCADE,
  UNIQUE(lead_id, tag_id)
);
ALTER TABLE public.crm_lead_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth full access lead_tags" ON public.crm_lead_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CRM Activities (timeline)
CREATE TABLE public.crm_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL DEFAULT 'note' CHECK (activity_type IN ('note','stage_change','call','email','whatsapp','task','system')),
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth full access activities" ON public.crm_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CRM Tasks
CREATE TABLE public.crm_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth full access tasks" ON public.crm_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_crm_stages_pipeline ON public.crm_stages(pipeline_id, position);
CREATE INDEX idx_crm_leads_stage ON public.crm_leads(stage_id);
CREATE INDEX idx_crm_leads_pipeline ON public.crm_leads(pipeline_id);
CREATE INDEX idx_crm_activities_lead ON public.crm_activities(lead_id, created_at DESC);
CREATE INDEX idx_crm_tasks_lead ON public.crm_tasks(lead_id);
CREATE INDEX idx_crm_tasks_due ON public.crm_tasks(due_date) WHERE completed = false;
CREATE INDEX idx_crm_leads_stagnation ON public.crm_leads(last_stage_change_at) WHERE stage_id IS NOT NULL;

-- Enable realtime for leads and activities
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_activities;
