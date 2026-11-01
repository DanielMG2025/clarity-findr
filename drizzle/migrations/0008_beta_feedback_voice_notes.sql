ALTER TABLE public.beta_feedback ADD COLUMN IF NOT EXISTS audio_path text;
ALTER TABLE public.beta_feedback ADD COLUMN IF NOT EXISTS audio_duration_seconds integer;

-- A submission needs text OR a voice note; voice-only rows store an empty message.
ALTER TABLE public.beta_feedback DROP CONSTRAINT IF EXISTS beta_feedback_message_check;
ALTER TABLE public.beta_feedback ADD CONSTRAINT beta_feedback_message_check
  CHECK (length(message) <= 5000 AND (length(btrim(message)) > 0 OR audio_path IS NOT NULL));
ALTER TABLE public.beta_feedback ADD CONSTRAINT beta_feedback_audio_duration_check
  CHECK (audio_duration_seconds IS NULL OR audio_duration_seconds BETWEEN 0 AND 600);

-- Same server-side stamp, now also guarding the audio path: it must live in the
-- sender's own folder of the private bucket.
CREATE OR REPLACE FUNCTION public.stamp_beta_feedback()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_email text;
BEGIN
  SELECT lower(u.email) INTO v_email FROM auth.users u WHERE u.id = NEW.user_id;
  IF v_email IS NOT NULL THEN NEW.user_email := v_email; END IF;
  NEW.segment := (SELECT a.segment FROM public.allowed_users a WHERE a.email = lower(NEW.user_email) LIMIT 1);
  NEW.status := 'new';
  NEW.created_at := now();
  IF NEW.audio_path IS NOT NULL AND (NEW.user_id IS NULL OR split_part(NEW.audio_path, '/', 1) <> NEW.user_id::text) THEN
    RAISE EXCEPTION 'audio_path must be inside the sender''s own folder';
  END IF;
  IF NEW.audio_path IS NULL THEN NEW.audio_duration_seconds := NULL; END IF;
  RETURN NEW;
END;
$$;

-- Storage: testers upload/read/remove only in their own folder; admins read and delete all.
CREATE POLICY "Testers upload own feedback audio" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'beta-feedback-audio' AND (storage.foldername(name))[1] = auth.uid()::text AND public.current_user_has_access());
CREATE POLICY "Testers read own feedback audio, admins read all" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'beta-feedback-audio' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));
CREATE POLICY "Testers remove own feedback audio, admins remove all" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'beta-feedback-audio' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));