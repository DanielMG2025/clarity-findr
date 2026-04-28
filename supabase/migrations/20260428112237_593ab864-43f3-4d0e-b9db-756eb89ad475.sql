
-- Restrict refresh function execution
REVOKE EXECUTE ON FUNCTION public.refresh_aggregated_pricing() FROM PUBLIC, anon, authenticated;

-- Replace permissive insert with a constrained one
DROP POLICY IF EXISTS "Anyone can submit quotes" ON public.user_submitted_quotes;
CREATE POLICY "Anyone can submit reasonable quotes"
ON public.user_submitted_quotes
FOR INSERT
WITH CHECK (
  base_price BETWEEN 100 AND 100000
  AND medication_cost BETWEEN 0 AND 50000
  AND extras_cost BETWEEN 0 AND 50000
  AND treatment_type IN ('IVF','Egg Donation','Social Freezing','ICSI','Other')
  AND is_verified = false
);
