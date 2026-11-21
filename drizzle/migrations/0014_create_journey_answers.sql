CREATE TABLE public.journey_answers (
  user_id uuid PRIMARY KEY,
  basics jsonb NOT NULL DEFAULT '{}'::jsonb,
  case_record jsonb NOT NULL DEFAULT '{}'::jsonb,
  answered_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.journey_answers TO authenticated;
GRANT ALL ON public.journey_answers TO service_role;

ALTER TABLE public.journey_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own answers: read" ON public.journey_answers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own answers: insert" ON public.journey_answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own answers: update" ON public.journey_answers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own answers: delete" ON public.journey_answers FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_journey_answers()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;

CREATE TRIGGER journey_answers_touch BEFORE UPDATE ON public.journey_answers
FOR EACH ROW EXECUTE FUNCTION public.touch_journey_answers();