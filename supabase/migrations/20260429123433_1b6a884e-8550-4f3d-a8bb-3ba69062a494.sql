create table public.community_stories (
  id uuid primary key default gen_random_uuid(),
  age_band text not null,
  country text not null,
  treatment_type text not null,
  clinic_name text,
  estimated_price integer,
  outcome text,
  story text,
  rating integer,
  is_verified boolean not null default false,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.community_stories enable row level security;

create policy "Anyone can view non-flagged stories"
  on public.community_stories for select
  using (flagged = false);

create policy "Anyone can submit stories"
  on public.community_stories for insert
  with check (
    age_band = any (array['<25','25-29','30-34','35-39','40-44','45+']) and
    treatment_type = any (array['IVF','Egg Donation','Social Freezing','ICSI','Other']) and
    (rating is null or (rating between 1 and 5)) and
    (estimated_price is null or (estimated_price between 0 and 200000)) and
    (story is null or length(story) <= 1500) and
    is_verified = false and
    flagged = false
  );

create table public.community_discussions (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  prompt text not null,
  reply text not null,
  age_band text,
  country text,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.community_discussions enable row level security;

create policy "Anyone can view non-flagged replies"
  on public.community_discussions for select
  using (flagged = false);

create policy "Anyone can post replies"
  on public.community_discussions for insert
  with check (
    category = any (array['Trying to conceive','IVF journey','Egg freezing','Donor programs']) and
    length(reply) between 2 and 1500 and
    flagged = false
  );

create index community_stories_filters_idx on public.community_stories (treatment_type, country, age_band);
create index community_discussions_cat_idx on public.community_discussions (category, created_at desc);