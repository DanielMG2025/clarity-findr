CREATE FUNCTION public.new_referral_code() RETURNS text LANGUAGE sql VOLATILE SET search_path = public AS $$
 SELECT substr(translate(encode(uuid_send(gen_random_uuid()), 'base64'), '+/=', 'kmq'), 1, 8)
$$;
REVOKE ALL ON FUNCTION public.new_referral_code() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.new_referral_code() TO service_role;

CREATE TABLE public.referral_codes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 code text NOT NULL UNIQUE CHECK (code ~ '^[A-Za-z0-9_-]{4,32}$'),
 owner_label text NOT NULL,
 owner_email text CHECK (owner_email IS NULL OR owner_email = lower(trim(owner_email))),
 type text NOT NULL DEFAULT 'tester' CHECK (type IN ('tester','ambassador','association','partner')),
 seats_cap integer CHECK (seats_cap IS NULL OR seats_cap >= 0),
 seats_used integer NOT NULL DEFAULT 0,
 parent_code text,
 revshare_note text,
 active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referral_codes TO authenticated;
GRANT ALL ON public.referral_codes TO service_role;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage referral codes" ON public.referral_codes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX referral_codes_parent_idx ON public.referral_codes (parent_code);
CREATE INDEX referral_codes_owner_email_idx ON public.referral_codes (owner_email);

CREATE TABLE public.referral_settings (
 id boolean PRIMARY KEY DEFAULT true CHECK (id),
 paused boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.referral_settings TO authenticated;
GRANT ALL ON public.referral_settings TO service_role;
ALTER TABLE public.referral_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage referral settings" ON public.referral_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.referral_settings (id, paused) VALUES (true, false) ON CONFLICT DO NOTHING;

CREATE TABLE public.referral_join_attempts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 email text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.referral_join_attempts TO service_role;
ALTER TABLE public.referral_join_attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX referral_join_attempts_email_idx ON public.referral_join_attempts (email, created_at DESC);

ALTER TABLE public.allowed_users ADD COLUMN referred_by_code text;

CREATE FUNCTION public.referral_code_info(p_code text)
RETURNS TABLE(owner_label text, type text, active boolean, has_capacity boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT c.owner_label, c.type, c.active, c.active AND (c.seats_cap IS NULL OR c.seats_used < c.seats_cap)
 FROM public.referral_codes c WHERE c.code = p_code
$$;
REVOKE ALL ON FUNCTION public.referral_code_info(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.referral_code_info(text) TO anon, authenticated, service_role;

CREATE FUNCTION public.my_referral_code()
RETURNS TABLE(code text, seats_cap integer, seats_used integer, active boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT c.code, c.seats_cap, c.seats_used, c.active
 FROM public.referral_codes c JOIN auth.users u ON lower(u.email) = c.owner_email
 WHERE u.id = auth.uid() AND public.current_user_has_access()
 ORDER BY c.created_at LIMIT 1
$$;
REVOKE ALL ON FUNCTION public.my_referral_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_referral_code() TO authenticated, service_role;

CREATE FUNCTION public.referral_join(p_code text, p_email text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
 inviter public.referral_codes%ROWTYPE;
 v_email text := lower(trim(p_email));
 v_new text;
BEGIN
 IF COALESCE((SELECT paused FROM public.referral_settings WHERE id), false) THEN
  RETURN jsonb_build_object('ok', false, 'reason', 'paused');
 END IF;
 SELECT * INTO inviter FROM public.referral_codes WHERE code = p_code FOR UPDATE;
 IF NOT FOUND OR NOT inviter.active THEN RETURN jsonb_build_object('ok', false, 'reason', 'invalid'); END IF;
 IF inviter.seats_cap IS NOT NULL AND inviter.seats_used >= inviter.seats_cap THEN
  RETURN jsonb_build_object('ok', false, 'reason', 'full');
 END IF;
 INSERT INTO public.allowed_users (email, active, referred_by_code) VALUES (v_email, true, p_code)
 ON CONFLICT (email) DO NOTHING;
 IF NOT FOUND THEN RETURN jsonb_build_object('ok', true, 'already', true); END IF;
 LOOP
  v_new := public.new_referral_code();
  EXIT WHEN NOT EXISTS (SELECT 1 FROM public.referral_codes WHERE code = v_new);
 END LOOP;
 INSERT INTO public.referral_codes (code, owner_label, owner_email, type, seats_cap, parent_code)
 VALUES (v_new, split_part(v_email, '@', 1), v_email, 'tester', 5, p_code);
 UPDATE public.referral_codes SET seats_used = seats_used + 1 WHERE id = inviter.id;
 RETURN jsonb_build_object('ok', true, 'already', false, 'ownCode', v_new);
END;
$$;
REVOKE ALL ON FUNCTION public.referral_join(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.referral_join(text, text) TO service_role;

INSERT INTO public.referral_codes (code, owner_label, owner_email, type, seats_cap)
SELECT public.new_referral_code(), COALESCE(NULLIF(trim(a.name), ''), split_part(a.email, '@', 1)), a.email, 'tester', 5
FROM public.allowed_users a
WHERE a.active AND NOT EXISTS (SELECT 1 FROM public.referral_codes c WHERE c.owner_email = a.email);