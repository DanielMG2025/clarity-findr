CREATE TABLE public.beta_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  session_id text NOT NULL,
  user_id uuid NULL,
  user_email text NULL,
  cohort text NOT NULL DEFAULT 'beta',
  event_type text NOT NULL,
  path text NOT NULL,
  label text NULL,
  meta jsonb NULL,
  CONSTRAINT beta_events_event_type_chk CHECK (event_type IN ('page_view', 'click')),
  CONSTRAINT beta_events_cohort_chk CHECK (cohort IN ('demo', 'beta', 'real')),
  CONSTRAINT beta_events_session_len CHECK (char_length(session_id) BETWEEN 8 AND 64),
  CONSTRAINT beta_events_path_len CHECK (char_length(path) BETWEEN 1 AND 300),
  CONSTRAINT beta_events_label_len CHECK (label IS NULL OR char_length(label) <= 80),
  CONSTRAINT beta_events_meta_size CHECK (meta IS NULL OR (jsonb_typeof(meta) = 'object' AND pg_column_size(meta) <= 1024))
);

GRANT INSERT ON public.beta_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.beta_events TO authenticated;
GRANT ALL ON public.beta_events TO service_role;

ALTER TABLE public.beta_events ENABLE ROW LEVEL SECURITY;

-- Identity is stamped server-side so nobody can log events as someone else.
CREATE OR REPLACE FUNCTION public.stamp_beta_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.user_id := auth.uid();
  NEW.user_email := CASE WHEN auth.uid() IS NULL THEN NULL ELSE nullif(auth.jwt() ->> 'email', '') END;
  NEW.created_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER stamp_beta_event_before_insert
BEFORE INSERT ON public.beta_events
FOR EACH ROW EXECUTE FUNCTION public.stamp_beta_event();

CREATE POLICY "Anyone can log beta navigation events"
ON public.beta_events FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins read beta events"
ON public.beta_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update beta events"
ON public.beta_events FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete beta events"
ON public.beta_events FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX beta_events_created_at_idx ON public.beta_events (created_at DESC);
CREATE INDEX beta_events_session_id_idx ON public.beta_events (session_id);
CREATE INDEX beta_events_path_idx ON public.beta_events (path);