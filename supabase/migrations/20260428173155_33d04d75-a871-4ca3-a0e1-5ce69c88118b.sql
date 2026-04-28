REVOKE EXECUTE ON FUNCTION public.refresh_aggregated_pricing() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_clinic_insights() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_quote_inserted() FROM PUBLIC, anon, authenticated;