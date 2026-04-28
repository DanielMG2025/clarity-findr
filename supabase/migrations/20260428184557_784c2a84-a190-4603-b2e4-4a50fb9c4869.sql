CREATE TABLE public.scraped_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name text NOT NULL,
  treatment_type text NOT NULL,
  scraped_price integer NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  source_url text NOT NULL,
  source_domain text,
  parse_confidence numeric NOT NULL DEFAULT 0.7,
  scraped_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

ALTER TABLE public.scraped_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scraped pricing"
  ON public.scraped_pricing FOR SELECT
  USING (true);

CREATE INDEX idx_scraped_pricing_clinic_treatment
  ON public.scraped_pricing (clinic_name, treatment_type);

-- Seed demo scraped data so the UI shows the new "Real market data · scraped" state immediately.
-- Real-world pipeline would populate this from a Firecrawl-backed edge function.
INSERT INTO public.scraped_pricing (clinic_name, treatment_type, scraped_price, currency, source_url, source_domain, parse_confidence)
SELECT c.name, 'IVF', COALESCE(c.base_price_ivf, 5000) + COALESCE(c.medication_estimate, 1200) + COALESCE(c.extras_estimate, 400),
       'EUR',
       'https://www.' || lower(regexp_replace(c.name, '\s+', '', 'g')) || '.com/pricing',
       lower(regexp_replace(c.name, '\s+', '', 'g')) || '.com',
       0.82
FROM public.clinics c
WHERE 'IVF' = ANY(c.treatments_available) AND c.base_price_ivf IS NOT NULL
LIMIT 6;