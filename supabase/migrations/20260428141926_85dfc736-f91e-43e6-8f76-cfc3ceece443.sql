-- 1. Add tier column to clinics
ALTER TABLE public.clinics
  ADD COLUMN IF NOT EXISTS tier text;

-- Backfill tier based on total_estimated_price
UPDATE public.clinics
SET tier = CASE
  WHEN total_estimated_price IS NULL THEN 'mid'
  WHEN total_estimated_price >= 9000 THEN 'premium'
  WHEN total_estimated_price <= 5500 THEN 'budget'
  ELSE 'mid'
END
WHERE tier IS NULL;

ALTER TABLE public.clinics
  ALTER COLUMN tier SET DEFAULT 'mid',
  ALTER COLUMN tier SET NOT NULL,
  ADD CONSTRAINT clinics_tier_check CHECK (tier IN ('premium','mid','budget'));

-- 2. Add price_volatility to aggregated_pricing
ALTER TABLE public.aggregated_pricing
  ADD COLUMN IF NOT EXISTS price_volatility numeric NOT NULL DEFAULT 0;

-- 3. Update refresh function to compute volatility (coefficient of variation)
CREATE OR REPLACE FUNCTION public.refresh_aggregated_pricing()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.aggregated_pricing;
  INSERT INTO public.aggregated_pricing (clinic_name, treatment_type, avg_price, min_price, max_price, sample_size, price_volatility)
  SELECT
    clinic_name,
    treatment_type,
    ROUND(AVG(total_price)::numeric, 0) AS avg_price,
    MIN(total_price) AS min_price,
    MAX(total_price) AS max_price,
    COUNT(*)::int AS sample_size,
    CASE
      WHEN COUNT(*) > 1 AND AVG(total_price) > 0
      THEN ROUND((STDDEV_SAMP(total_price) / AVG(total_price))::numeric, 4)
      ELSE 0
    END AS price_volatility
  FROM public.user_submitted_quotes
  GROUP BY clinic_name, treatment_type;
END;
$$;

-- 4. Create clinic_insights table
CREATE TABLE IF NOT EXISTS public.clinic_insights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_name text NOT NULL UNIQUE,
  avg_user_rating numeric NOT NULL DEFAULT 0,
  pricing_percentile numeric NOT NULL DEFAULT 50,
  demand_score numeric NOT NULL DEFAULT 0,
  availability_score numeric NOT NULL DEFAULT 0,
  confidence_level text NOT NULL DEFAULT 'low' CHECK (confidence_level IN ('low','medium','high')),
  sample_size integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clinic_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clinic insights"
  ON public.clinic_insights
  FOR SELECT
  USING (true);

-- 5. Refresh function for clinic_insights
CREATE OR REPLACE FUNCTION public.refresh_clinic_insights()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.clinic_insights;

  WITH per_clinic AS (
    SELECT
      clinic_name,
      AVG(total_price)::numeric AS avg_price,
      COUNT(*)::int AS sample_size
    FROM public.user_submitted_quotes
    GROUP BY clinic_name
  ),
  global_stats AS (
    SELECT
      MIN(avg_price) AS min_avg,
      MAX(avg_price) AS max_avg
    FROM per_clinic
  )
  INSERT INTO public.clinic_insights (
    clinic_name, avg_user_rating, pricing_percentile, demand_score,
    availability_score, confidence_level, sample_size
  )
  SELECT
    c.name,
    COALESCE(c.rating_score, 0),
    CASE
      WHEN gs.max_avg = gs.min_avg OR pc.avg_price IS NULL THEN 50
      ELSE ROUND(((pc.avg_price - gs.min_avg) / NULLIF(gs.max_avg - gs.min_avg, 0) * 100)::numeric, 1)
    END AS pricing_percentile,
    -- Demand score: blend of rating and quote volume
    LEAST(100, ROUND((COALESCE(c.rating_score,0) * 15 + COALESCE(pc.sample_size,0) * 8)::numeric, 1)) AS demand_score,
    -- Availability score: inverse of demand, simulated
    GREATEST(20, 100 - LEAST(100, COALESCE(pc.sample_size,0) * 6)) AS availability_score,
    CASE
      WHEN COALESCE(pc.sample_size,0) >= 8 THEN 'high'
      WHEN COALESCE(pc.sample_size,0) >= 3 THEN 'medium'
      ELSE 'low'
    END AS confidence_level,
    COALESCE(pc.sample_size, 0)
  FROM public.clinics c
  LEFT JOIN per_clinic pc ON pc.clinic_name = c.name
  CROSS JOIN global_stats gs;
END;
$$;

-- 6. Run both refreshes now
SELECT public.refresh_aggregated_pricing();
SELECT public.refresh_clinic_insights();