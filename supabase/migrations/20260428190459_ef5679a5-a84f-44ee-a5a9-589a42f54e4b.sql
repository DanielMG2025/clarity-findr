
UPDATE public.scraped_pricing SET
  country = 'Spain',
  raw_text = 'IVF complete package from €8,100 — all fees and consultations included. Medication not included.',
  raw_price = 8100,
  pricing_type = 'package',
  detected_keywords = ARRAY['package','from','medication not included','all fees included'],
  base_price = 5800, medication_estimate = 1500, extras_estimate = 800,
  normalization_rule = 'package_excl_meds → base 71% / meds 18% / extras 11%'
WHERE clinic_name = 'IVI Madrid';

UPDATE public.scraped_pricing SET
  country = 'Spain',
  raw_text = 'IVF treatment package: €8,200 (medication and bloodwork extra).',
  raw_price = 8200,
  pricing_type = 'package',
  detected_keywords = ARRAY['package','medication extra','bloodwork extra'],
  base_price = 5900, medication_estimate = 1500, extras_estimate = 800,
  normalization_rule = 'package_excl_meds → base 72% / meds 18% / extras 10%'
WHERE clinic_name = 'IVI Barcelona';

UPDATE public.scraped_pricing SET
  country = 'Spain',
  raw_text = 'IVF from €4,800 — additional costs may apply for medication and anesthesia.',
  raw_price = 4800,
  pricing_type = 'base',
  detected_keywords = ARRAY['from','additional costs','medication','anesthesia'],
  base_price = 4800, medication_estimate = 1200, extras_estimate = 700,
  normalization_rule = 'base_only → +meds €1,200 +extras €700 (country defaults)'
WHERE clinic_name = 'Ginemed Sevilla';

UPDATE public.scraped_pricing SET
  country = 'Spain',
  raw_text = 'IVF program €7,650 including initial consultation and embryo transfer.',
  raw_price = 7650,
  pricing_type = 'package',
  detected_keywords = ARRAY['program','including','consultation','embryo transfer'],
  base_price = 5500, medication_estimate = 1400, extras_estimate = 750,
  normalization_rule = 'package_incl_extras → base 72% / meds 18% / extras 10%'
WHERE clinic_name = 'Eugin Barcelona';

UPDATE public.scraped_pricing SET
  country = 'Spain',
  raw_text = 'IVF cost: between €5,400 and €7,500 depending on protocol.',
  raw_price = 7500,
  pricing_type = 'range',
  detected_keywords = ARRAY['between','depending on','protocol'],
  base_price = 5400, medication_estimate = 1350, extras_estimate = 750,
  normalization_rule = 'range → upper bound used as headline, base = lower bound'
WHERE clinic_name = 'Instituto Bernabeu';

UPDATE public.scraped_pricing SET
  country = 'Spain',
  raw_text = 'IVF — contact us for personalized quote (estimated €6,800–€7,400).',
  raw_price = 7100,
  pricing_type = 'inferred',
  detected_keywords = ARRAY['contact us','estimated','personalized quote'],
  base_price = 5100, medication_estimate = 1300, extras_estimate = 700,
  normalization_rule = 'inferred → midpoint of estimated range, low confidence'
WHERE clinic_name = 'Clinica Tambre';
