CREATE POLICY "Anon can read public scripts"
ON public.admin_scripts
FOR SELECT
TO anon
USING (script_key IN ('meta_pixel', 'gtm_script', 'custom_head', 'custom_body'));