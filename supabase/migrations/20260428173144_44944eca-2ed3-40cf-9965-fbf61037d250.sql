-- Auto-refresh aggregated pricing & clinic insights when a new quote is submitted
CREATE OR REPLACE FUNCTION public.on_quote_inserted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.refresh_aggregated_pricing();
  PERFORM public.refresh_clinic_insights();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_refresh_on_quote ON public.user_submitted_quotes;

CREATE TRIGGER trg_refresh_on_quote
AFTER INSERT ON public.user_submitted_quotes
FOR EACH ROW
EXECUTE FUNCTION public.on_quote_inserted();

-- Backfill once so current data is consistent
SELECT public.refresh_aggregated_pricing();
SELECT public.refresh_clinic_insights();