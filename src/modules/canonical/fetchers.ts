/**
 * Thin read-only fetchers over the existing pricing tables, mapped into the
 * canonical PriceRecord shape via the pure adapters in ./pricing.
 * Kept separate so the pure module stays free of I/O. Not used by any
 * existing consumer yet; RLS on each table still decides what is returned.
 */
import { supabase } from "@/integrations/supabase/client";
import {
  aggregatedToPriceRecord,
  scrapedToPriceRecord,
  userQuoteToPriceRecord,
  type PriceRecord,
} from "./pricing";
import { clinicToCentre, type Centre } from "./centres";
import { userQuoteToPatientQuote, type PatientQuote } from "./patientQuotes";

export async function fetchAggregatedAsPriceRecords(): Promise<PriceRecord[]> {
  const { data, error } = await supabase.from("aggregated_pricing").select("*");
  if (error) throw error;
  return (data ?? []).map(aggregatedToPriceRecord);
}

export async function fetchScrapedAsPriceRecords(): Promise<PriceRecord[]> {
  const { data, error } = await supabase.from("scraped_pricing").select("*");
  if (error) throw error;
  return (data ?? []).map(scrapedToPriceRecord);
}

export async function fetchUserQuotesAsPriceRecords(): Promise<PriceRecord[]> {
  const { data, error } = await supabase.from("user_submitted_quotes").select("*");
  if (error) throw error;
  return (data ?? []).map(userQuoteToPriceRecord);
}

export async function fetchClinicsAsCentres(): Promise<Centre[]> {
  const { data, error } = await supabase.from("clinics").select("*");
  if (error) throw error;
  return (data ?? []).map(clinicToCentre);
}

export async function fetchUserQuotesAsPatientQuotes(): Promise<PatientQuote[]> {
  const { data, error } = await supabase.from("user_submitted_quotes").select("*");
  if (error) throw error;
  return (data ?? []).map(userQuoteToPatientQuote);
}
