-- Provenance cold-start data model.
--
-- Two tables that back the pricing provenance engine:
--   * sources            — reviewed catalogue of where a price can come from.
--   * price_observations — normalized price points, each tied to a source.
--
-- Guardrails baked into the schema (see the cold-start spec, §2 & §8):
--   * Nothing is ever crawled from a source with allowlisted = false. The
--     column defaults to false, so a freshly-inserted source is inert until a
--     human reviews robots.txt + terms and flips it.
--   * Neither table is publicly readable. RLS is enabled with NO anon/authenticated
--     policies, so only the service role (server-side) can read them. The client
--     only ever receives an already-aggregated PriceEstimate, never raw rows.

-- ---------------------------------------------------------------------------
-- sources
-- ---------------------------------------------------------------------------
create table if not exists public.sources (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('public_report','scraped_web','crowd','b2b','aggregator')),
  label        text not null,
  url          text,
  domain       text,
  market       text,
  as_of        date,
  -- Trust weight; the base scraped layer is deliberately low (0.3).
  weight       numeric not null default 0.3 check (weight >= 0 and weight <= 1),
  usage_note   text,
  -- Hard guardrail: no source is crawled until a person reviews it.
  allowlisted  boolean not null default false,
  reviewed_by  text,
  created_at   timestamptz not null default now()
);

comment on table public.sources is
  'Reviewed catalogue of price sources. Nothing is crawled while allowlisted = false. Not publicly readable (RLS, no policies).';

alter table public.sources enable row level security;
-- Intentionally NO policies: service-role only (server-side reads).

-- ---------------------------------------------------------------------------
-- price_observations
-- ---------------------------------------------------------------------------
create table if not exists public.price_observations (
  id                uuid primary key default gen_random_uuid(),
  treatment         text not null,             -- canonical TreatmentKey (ivf/icsi/donor/freezing/iui/study)
  market            text not null,             -- canonical market label / ISO
  amount_eur        numeric not null check (amount_eur >= 0),
  currency_original text not null default 'EUR',
  source_id         uuid references public.sources(id) on delete set null,
  source_kind       text not null check (source_kind in ('public_report','scraped_web','crowd','b2b','aggregator')),
  parse_confidence  numeric not null default 0.5 check (parse_confidence >= 0 and parse_confidence <= 1),
  -- "unknown" (a JSON string) or an object of captured inclusion components.
  inclusions        jsonb not null default '"unknown"'::jsonb,
  observed_at       timestamptz not null,
  created_at        timestamptz not null default now()
);

comment on table public.price_observations is
  'Normalized price points feeding aggregatePrices(). Not publicly readable (RLS, no policies) — the engine reads server-side and exposes only PriceEstimate.';

alter table public.price_observations enable row level security;
-- Intentionally NO policies: service-role only (server-side reads).

create index if not exists price_observations_treatment_market_idx
  on public.price_observations (treatment, market);
create index if not exists price_observations_source_idx
  on public.price_observations (source_id);
create index if not exists price_observations_observed_at_idx
  on public.price_observations (observed_at);
