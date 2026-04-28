
ALTER TABLE public.scraped_pricing
  ADD COLUMN IF NOT EXISTS raw_text text,
  ADD COLUMN IF NOT EXISTS raw_price integer,
  ADD COLUMN IF NOT EXISTS pricing_type text NOT NULL DEFAULT 'base',
  ADD COLUMN IF NOT EXISTS detected_keywords text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS base_price integer,
  ADD COLUMN IF NOT EXISTS medication_estimate integer,
  ADD COLUMN IF NOT EXISTS extras_estimate integer,
  ADD COLUMN IF NOT EXISTS normalization_rule text,
  ADD COLUMN IF NOT EXISTS country text;

-- pricing_type allowed values: 'package' | 'base' | 'range' | 'inferred'
-- normalization_rule example: 'package_split_70_15_15'
