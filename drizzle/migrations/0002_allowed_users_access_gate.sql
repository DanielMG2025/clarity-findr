CREATE TABLE public.allowed_users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 email text NOT NULL UNIQUE CHECK (email = lower(trim(email))),
 name text,
 active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 last_link_sent_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.allowed_users TO authenticated;
GRANT ALL ON public.allowed_users TO service_role;
ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage allowed users" ON public.allowed_users FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE FUNCTION public.access_email_allowed(candidate text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT EXISTS (SELECT 1 FROM public.allowed_users WHERE email = lower(trim(candidate)) AND active)
 OR EXISTS (SELECT 1 FROM auth.users u JOIN public.user_roles r ON r.user_id = u.id WHERE lower(u.email) = lower(trim(candidate)) AND r.role = 'admin');
$$;
REVOKE ALL ON FUNCTION public.access_email_allowed(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.access_email_allowed(text) TO service_role;
CREATE FUNCTION public.current_user_has_access() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT auth.uid() IS NOT NULL AND (public.has_role(auth.uid(), 'admin') OR EXISTS (
 SELECT 1 FROM public.allowed_users a JOIN auth.users u ON lower(u.email) = a.email WHERE u.id = auth.uid() AND a.active));
$$;
REVOKE ALL ON FUNCTION public.current_user_has_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_has_access() TO authenticated, service_role;