-- Seed price data — verified snapshot (Tier A market guides, public_report).
-- Generated from src/modules/provenance/seedPrices.ts. Curated, cited, medium/low
-- confidence — designed to be superseded by B2B/crowd. Idempotent (re-appliable).
--
-- min/mid/max are distributed across each row's DISTINCT cited sources so the
-- engine's per-source dedup keeps a real range instead of collapsing to a point.

alter table public.sources add column if not exists key text;
create unique index if not exists sources_key_uidx on public.sources (key);

-- Clean any prior seed observations so re-applying replaces cleanly.
delete from public.price_observations
where source_id in (select id from public.sources where key in ('ovu_we_2026', 'edf_2026', 'fca_2026', 'froad_2026', 'fconsult_2026', 'sef_local_2025'));

insert into public.sources (key, kind, label, url, market, as_of, weight, allowlisted, usage_note) values
  ('ovu_we_2026','public_report','OVU — Guía de costes de fertilidad (Europa Occidental/Oriental), 2026','https://ovu.com/fertility-insights/','EU','2026-01-01',0.5,true,'Agregador; verificar antes de publicar. Reemplazar por B2B/crowd.'),
  ('edf_2026','public_report','EggDonationFriends — Egg donation costs worldwide, 2026','https://www.eggdonationfriends.com/','EU','2026-01-01',0.5,true,null),
  ('fca_2026','public_report','FertilityClinicsAbroad — Cheapest IVF in Europe, 2026','https://www.fertilityclinicsabroad.com/','EU','2026-01-01',0.5,true,null),
  ('froad_2026','public_report','FertilityRoad — IVF cost explained, 2026','https://fertilityroad.com/','EU','2026-01-01',0.5,true,null),
  ('fconsult_2026','public_report','Fertility Consultancy — Donor egg IVF costs worldwide, 2026','https://www.fertilityconsultancy.com/','EU','2026-01-01',0.5,true,null),
  ('sef_local_2025','public_report','Sociedad Española de Fertilidad / The Local ES, 2025','https://www.thelocal.es/','ES','2025-01-01',0.6,true,null)
on conflict (key) do nothing;

insert into public.price_observations (treatment, market, amount_eur, currency_original, source_id, source_kind, parse_confidence, inclusions, observed_at)
select v.treatment, v.market, v.amount_eur, 'EUR', s.id, 'public_report', v.parse_confidence, '"unknown"'::jsonb, '2026-05-01'
from (values
  ('ivf','Spain',4000,0.7,'sef_local_2025'),
  ('ivf','Spain',4900,0.7,'ovu_we_2026'),
  ('ivf','Spain',6000,0.7,'edf_2026'),
  ('ivf','Czech Republic',2500,0.7,'fca_2026'),
  ('ivf','Czech Republic',3500,0.7,'edf_2026'),
  ('ivf','Greece',3000,0.7,'edf_2026'),
  ('ivf','Greece',4000,0.7,'fca_2026'),
  ('ivf','Portugal',3500,0.7,'ovu_we_2026'),
  ('ivf','Portugal',5000,0.7,'fca_2026'),
  ('ivf','Denmark',4700,0.5,'ovu_we_2026'),
  ('ivf','Cyprus',2500,0.5,'fca_2026'),
  ('ivf','Cyprus',3500,0.5,'froad_2026'),
  ('donor','Spain',6000,0.7,'edf_2026'),
  ('donor','Spain',7200,0.7,'fconsult_2026'),
  ('donor','Spain',9000,0.7,'sef_local_2025'),
  ('donor','Czech Republic',4200,0.7,'edf_2026'),
  ('donor','Czech Republic',6000,0.7,'fconsult_2026'),
  ('donor','Greece',5000,0.7,'edf_2026'),
  ('donor','Greece',7000,0.7,'fconsult_2026'),
  ('donor','Portugal',7000,0.7,'fconsult_2026'),
  ('donor','Denmark',7000,0.5,'froad_2026'),
  ('donor','Cyprus',5000,0.5,'edf_2026'),
  ('donor','Cyprus',7500,0.5,'fconsult_2026'),
  ('freezing','Spain',2900,0.7,'fca_2026'),
  ('freezing','Czech Republic',2200,0.7,'fca_2026'),
  ('freezing','Greece',2300,0.7,'fca_2026'),
  ('freezing','Portugal',3000,0.5,'ovu_we_2026'),
  ('freezing','Denmark',3000,0.5,'ovu_we_2026'),
  ('freezing','Cyprus',2400,0.5,'fca_2026')
) as v(treatment, market, amount_eur, parse_confidence, src_key)
join public.sources s on s.key = v.src_key;
