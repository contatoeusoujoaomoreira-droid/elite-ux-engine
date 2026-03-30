-- Admin users/profiles table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer', -- viewer, editor, admin
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive, pending
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin activity logs
CREATE TABLE public.admin_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "Authenticated can read admin users" ON public.admin_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can insert admin users" ON public.admin_users FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.user_id = auth.uid() AND au.role = 'admin'
  )
);
CREATE POLICY "Admin can update admin users" ON public.admin_users FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.user_id = auth.uid() AND au.role = 'admin'
  )
);
CREATE POLICY "Admin can delete admin users" ON public.admin_users FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.admin_users au
    WHERE au.user_id = auth.uid() AND au.role = 'admin'
  )
);

-- Activity logs policies
CREATE POLICY "Authenticated can read activity logs" ON public.admin_activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert activity logs" ON public.admin_activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes
CREATE INDEX idx_admin_users_user_id ON public.admin_users (user_id);
CREATE INDEX idx_admin_users_email ON public.admin_users (email);
CREATE INDEX idx_admin_users_role ON public.admin_users (role);
CREATE INDEX idx_admin_users_status ON public.admin_users (status);
CREATE INDEX idx_admin_activity_logs_admin_user_id ON public.admin_activity_logs (admin_user_id);
CREATE INDEX idx_admin_activity_logs_created_at ON public.admin_activity_logs (created_at DESC);
CREATE INDEX idx_admin_activity_logs_action ON public.admin_activity_logs (action);
