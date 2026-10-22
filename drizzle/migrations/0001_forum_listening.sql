CREATE TABLE public.raw_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'reddit',
  subreddit text NOT NULL,
  external_id text NOT NULL,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  created_utc timestamptz,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, external_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.raw_signals TO authenticated;
GRANT ALL ON public.raw_signals TO service_role;
ALTER TABLE public.raw_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage raw signals" ON public.raw_signals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.listening_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  signals_fetched integer NOT NULL DEFAULT 0,
  topics_created integer NOT NULL DEFAULT 0,
  note text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listening_runs TO authenticated;
GRANT ALL ON public.listening_runs TO service_role;
ALTER TABLE public.listening_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage listening runs" ON public.listening_runs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.conversation_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES public.listening_runs(id) ON DELETE SET NULL,
  audiences text[] NOT NULL DEFAULT '{}',
  question_en text NOT NULL DEFAULT '',
  question_es text NOT NULL DEFAULT '',
  answer_en text NOT NULL DEFAULT '',
  answer_es text NOT NULL DEFAULT '',
  mentions_estimate integer NOT NULL DEFAULT 0,
  trend text NOT NULL DEFAULT 'steady' CHECK (trend IN ('up','steady')),
  source_forum text NOT NULL DEFAULT '',
  source_url text,
  confidence text NOT NULL DEFAULT 'low' CHECK (confidence IN ('high','medium','low')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (audiences <@ ARRAY['planners','first-steps','experienced','men','lgbt']::text[])
);
GRANT SELECT ON public.conversation_topics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_topics TO authenticated;
GRANT ALL ON public.conversation_topics TO service_role;
ALTER TABLE public.conversation_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published topics" ON public.conversation_topics FOR SELECT TO anon, authenticated
  USING (status = 'published');
CREATE POLICY "Admins view all topics" ON public.conversation_topics FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert topics" ON public.conversation_topics FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update topics" ON public.conversation_topics FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete topics" ON public.conversation_topics FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));