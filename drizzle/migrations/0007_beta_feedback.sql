ALTER TABLE public.allowed_users ADD COLUMN IF NOT EXISTS segment text;

CREATE TABLE public.beta_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  user_email text NOT NULL,
  category text CHECK (category IS NULL OR category IN ('improve','missing','excess','broken','idea')),
  message text NOT NULL CHECK (length(btrim(message)) > 0 AND length(message) <= 5000),
  page_path text,
  lang text CHECK (lang IS NULL OR lang IN ('es','en')),
  segment text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewed','actioned'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.beta_feedback TO authenticated;
GRANT ALL ON public.beta_feedback TO service_role;

ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own feedback" ON public.beta_feedback FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users read own feedback, admins read all" ON public.beta_feedback FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update feedback" ON public.beta_feedback FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete feedback" ON public.beta_feedback FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX beta_feedback_created_at_idx ON public.beta_feedback (created_at DESC);
CREATE INDEX beta_feedback_user_id_idx ON public.beta_feedback (user_id);

-- Stamp identity and tester segment server-side: testers cannot read allowed_users,
-- and this keeps email/segment trustworthy. New rows always start as 'new'.
CREATE OR REPLACE FUNCTION public.stamp_beta_feedback()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_email text;
BEGIN
  SELECT lower(u.email) INTO v_email FROM auth.users u WHERE u.id = NEW.user_id;
  IF v_email IS NOT NULL THEN NEW.user_email := v_email; END IF;
  NEW.segment := (SELECT a.segment FROM public.allowed_users a WHERE a.email = lower(NEW.user_email) LIMIT 1);
  NEW.status := 'new';
  NEW.created_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER beta_feedback_stamp BEFORE INSERT ON public.beta_feedback
  FOR EACH ROW EXECUTE FUNCTION public.stamp_beta_feedback();