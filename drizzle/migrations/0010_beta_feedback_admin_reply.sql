ALTER TABLE public.beta_feedback ADD COLUMN IF NOT EXISTS admin_reply text;
ALTER TABLE public.beta_feedback ADD COLUMN IF NOT EXISTS admin_reply_at timestamptz;
ALTER TABLE public.beta_feedback ADD CONSTRAINT beta_feedback_admin_reply_length_check
  CHECK (admin_reply IS NULL OR length(admin_reply) <= 5000);

-- Senders can also read their own rows by session email (in addition to user_id); admins keep full access.
CREATE POLICY "Senders read own feedback by email" ON public.beta_feedback FOR SELECT TO authenticated
  USING (lower(user_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Reply timestamp is stamped server-side whenever the reply text changes.
CREATE OR REPLACE FUNCTION public.stamp_beta_feedback_reply()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.admin_reply IS NOT NULL AND length(btrim(NEW.admin_reply)) = 0 THEN NEW.admin_reply := NULL; END IF;
  IF NEW.admin_reply IS DISTINCT FROM OLD.admin_reply THEN
    NEW.admin_reply_at := CASE WHEN NEW.admin_reply IS NULL THEN NULL ELSE now() END;
  ELSE
    NEW.admin_reply_at := OLD.admin_reply_at;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER beta_feedback_reply_stamp BEFORE UPDATE ON public.beta_feedback
  FOR EACH ROW EXECUTE FUNCTION public.stamp_beta_feedback_reply();