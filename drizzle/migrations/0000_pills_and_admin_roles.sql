CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE TABLE public.pills (
  id text PRIMARY KEY,
  date date NOT NULL DEFAULT CURRENT_DATE,
  mold text NOT NULL CHECK (mold IN ('stat','myth','deep-dive','market','curiosity','glossary','pick')),
  audiences text[] NOT NULL DEFAULT '{}' CHECK (audiences <@ ARRAY['planners','first-steps','experienced','men','lgbt']::text[]),
  title_en text NOT NULL DEFAULT '',
  title_es text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  body_es text NOT NULL DEFAULT '',
  source_name text NOT NULL DEFAULT '',
  source_url text,
  source_date text,
  source_confidence text NOT NULL DEFAULT 'medium' CHECK (source_confidence IN ('high','medium','low')),
  source_note_en text,
  source_note_es text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pills TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pills TO authenticated;
GRANT ALL ON public.pills TO service_role;
ALTER TABLE public.pills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published pills" ON public.pills FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins view all pills" ON public.pills FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert pills" ON public.pills FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update pills" ON public.pills FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete pills" ON public.pills FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER pills_set_updated_at BEFORE UPDATE ON public.pills FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();