REVOKE ALL ON FUNCTION public.refresh_aggregated_pricing() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.refresh_clinic_insights() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.refresh_aggregated_pricing() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_clinic_insights() TO anon, authenticated;