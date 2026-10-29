CREATE TABLE public.feed_probes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  http_status int,
  content_type text,
  body_len int,
  is_feed boolean NOT NULL DEFAULT false,
  item_count int NOT NULL DEFAULT 0,
  sample_titles text[] NOT NULL DEFAULT '{}',
  error text,
  checked_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.feed_probes TO authenticated;
GRANT ALL ON public.feed_probes TO service_role;
ALTER TABLE public.feed_probes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read feed probes" ON public.feed_probes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));