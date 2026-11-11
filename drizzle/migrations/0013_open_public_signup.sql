CREATE TABLE public.access_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  open_signup boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.access_settings TO authenticated;
GRANT ALL ON public.access_settings TO service_role;
ALTER TABLE public.access_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read access settings" ON public.access_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update access settings" ON public.access_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.access_settings (id, open_signup) VALUES (true, true) ON CONFLICT (id) DO NOTHING;

-- Missing row means closed: the safe default.
CREATE FUNCTION public.open_signup_enabled() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT COALESCE((SELECT open_signup FROM public.access_settings WHERE id), false);
$$;
REVOKE ALL ON FUNCTION public.open_signup_enabled() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.open_signup_enabled() TO anon, authenticated, service_role;

-- Open sign-up admits anyone except an address an admin has deactivated.
CREATE FUNCTION public.access_email_open(candidate text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT public.open_signup_enabled() AND NOT EXISTS (SELECT 1 FROM public.allowed_users WHERE email = lower(trim(candidate)) AND NOT active);
$$;
REVOKE ALL ON FUNCTION public.access_email_open(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.access_email_open(text) TO service_role;

CREATE OR REPLACE FUNCTION public.current_user_has_access() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT auth.uid() IS NOT NULL AND (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (SELECT 1 FROM public.allowed_users a JOIN auth.users u ON lower(u.email) = a.email WHERE u.id = auth.uid() AND a.active)
  OR (public.open_signup_enabled() AND NOT EXISTS (SELECT 1 FROM public.allowed_users a JOIN auth.users u ON lower(u.email) = a.email WHERE u.id = auth.uid() AND NOT a.active))
 );
$$;