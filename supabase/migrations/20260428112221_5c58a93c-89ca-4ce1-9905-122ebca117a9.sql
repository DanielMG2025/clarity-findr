
-- =======================
-- TABLES
-- =======================

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  age int CHECK (age BETWEEN 18 AND 60),
  gender text CHECK (gender IN ('female','male','couple','other')),
  trying_duration text CHECK (trying_duration IN ('<6 months','6-12 months','1-2 years','>2 years','not trying')),
  previous_treatments text[] NOT NULL DEFAULT '{}',
  diagnosis text[] NOT NULL DEFAULT '{}',
  treatment_interest text CHECK (treatment_interest IN ('IVF','Egg Donation','Social Freezing','ICSI','Other')),
  budget_range text CHECK (budget_range IN ('<5k','5k-8k','8k-12k','>12k','unsure')),
  country_preference text NOT NULL DEFAULT 'Spain',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  country text NOT NULL DEFAULT 'Spain',
  city text,
  treatments_available text[] NOT NULL DEFAULT '{}',
  base_price_ivf integer,
  base_price_egg_donation integer,
  base_price_freezing integer,
  medication_estimate integer,
  extras_estimate integer,
  total_estimated_price integer GENERATED ALWAYS AS (
    COALESCE(base_price_ivf,0) + COALESCE(medication_estimate,0) + COALESCE(extras_estimate,0)
  ) STORED,
  success_rate_estimate numeric CHECK (success_rate_estimate BETWEEN 0 AND 100),
  rating_score numeric CHECK (rating_score BETWEEN 0 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_submitted_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name text NOT NULL,
  country text NOT NULL,
  treatment_type text NOT NULL,
  base_price integer NOT NULL,
  medication_cost integer NOT NULL DEFAULT 0,
  extras_cost integer NOT NULL DEFAULT 0,
  total_price integer GENERATED ALWAYS AS (base_price + medication_cost + extras_cost) STORED,
  date_received date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_verified boolean NOT NULL DEFAULT false
);

CREATE TABLE public.aggregated_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name text NOT NULL,
  treatment_type text NOT NULL,
  avg_price numeric NOT NULL,
  min_price integer NOT NULL,
  max_price integer NOT NULL,
  sample_size integer NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (clinic_name, treatment_type)
);

CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  match_score numeric CHECK (match_score BETWEEN 0 AND 100),
  estimated_price integer,
  explanation text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =======================
-- RLS
-- =======================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_submitted_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aggregated_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- profiles: owner only
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- clinics: public read
CREATE POLICY "Anyone can view clinics" ON public.clinics FOR SELECT USING (true);

-- user_submitted_quotes: anyone insert, anyone read
CREATE POLICY "Anyone can submit quotes" ON public.user_submitted_quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view quotes" ON public.user_submitted_quotes FOR SELECT USING (true);

-- aggregated_pricing: public read
CREATE POLICY "Anyone can view aggregated pricing" ON public.aggregated_pricing FOR SELECT USING (true);

-- matches: owner only
CREATE POLICY "Users view own matches" ON public.matches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own matches" ON public.matches FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =======================
-- updated_at trigger for profiles
-- =======================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =======================
-- SEED CLINICS (20)
-- =======================
INSERT INTO public.clinics (name, country, city, treatments_available, base_price_ivf, base_price_egg_donation, base_price_freezing, medication_estimate, extras_estimate, success_rate_estimate, rating_score) VALUES
('IVI Madrid','Spain','Madrid','{IVF,"Egg Donation","Social Freezing",ICSI}',5800,7200,2900,1500,800,62,4.7),
('IVI Barcelona','Spain','Barcelona','{IVF,"Egg Donation","Social Freezing",ICSI}',5900,7300,2950,1500,800,61,4.6),
('Ginemed Sevilla','Spain','Sevilla','{IVF,"Egg Donation",ICSI}',4800,6400,2400,1200,700,58,4.5),
('Eugin Barcelona','Spain','Barcelona','{IVF,"Egg Donation","Social Freezing"}',5500,6900,2700,1400,750,60,4.6),
('Instituto Bernabeu','Spain','Alicante','{IVF,"Egg Donation","Social Freezing",ICSI}',5400,6800,2650,1350,750,63,4.8),
('Clinica Tambre','Spain','Madrid','{IVF,"Egg Donation",ICSI}',5100,6500,2500,1300,700,59,4.4),
('Vida Fertility','Spain','Madrid','{IVF,"Egg Donation","Social Freezing"}',4900,6300,2400,1250,650,57,4.3),
('Fertty International','Spain','Barcelona','{IVF,"Egg Donation"}',4700,6100,2350,1200,650,55,4.2),
('Equipo Juana Crespo','Spain','Valencia','{IVF,"Egg Donation",ICSI}',6200,7600,3000,1600,900,65,4.9),
('Reproclinic','Spain','Barcelona','{IVF,"Egg Donation","Social Freezing"}',4600,6000,2300,1150,600,54,4.1),
('Fakih IVF','Spain','Madrid','{IVF,ICSI}',4400,NULL,2200,1100,600,52,4.0),
('Procrear','Spain','Valencia','{IVF,"Egg Donation"}',4300,5900,2250,1100,600,53,4.0),
('Quironsalud Dexeus','Spain','Barcelona','{IVF,"Egg Donation","Social Freezing",ICSI}',5700,7000,2800,1450,800,64,4.7),
('Clinica Eva','Spain','Madrid','{IVF,"Social Freezing"}',4500,NULL,2300,1150,650,55,4.2),
('UR Vistahermosa','Spain','Alicante','{IVF,"Egg Donation",ICSI}',5200,6600,2600,1300,700,60,4.5),
('Kinderwunsch Berlin','Germany','Berlin','{IVF,ICSI,"Social Freezing"}',5000,NULL,2700,1400,800,58,4.4),
('Create Fertility','UK','London','{IVF,"Social Freezing",ICSI}',7000,NULL,3200,1800,1000,55,4.3),
('Wessex Fertility','UK','Southampton','{IVF,ICSI}',6500,NULL,3000,1700,950,53,4.2),
('Centro Bahceci','Portugal','Lisbon','{IVF,"Egg Donation",ICSI}',4800,6200,2400,1250,700,57,4.4),
('Ferticentro','Portugal','Coimbra','{IVF,"Egg Donation","Social Freezing"}',4600,5950,2350,1200,650,56,4.3);

-- =======================
-- SEED USER QUOTES (~50)
-- =======================
INSERT INTO public.user_submitted_quotes (clinic_name, country, treatment_type, base_price, medication_cost, extras_cost, date_received, is_verified, notes) VALUES
('IVI Madrid','Spain','IVF',5700,1450,750,'2026-02-10',true,'Included blastocyst culture'),
('IVI Madrid','Spain','IVF',5950,1600,900,'2026-03-04',true,NULL),
('IVI Madrid','Spain','IVF',6100,1500,800,'2026-01-22',true,NULL),
('IVI Madrid','Spain','Egg Donation',7100,1500,850,'2026-02-18',true,NULL),
('IVI Madrid','Spain','Egg Donation',7400,1600,900,'2026-03-12',true,NULL),
('IVI Barcelona','Spain','IVF',5850,1500,800,'2026-02-20',true,NULL),
('IVI Barcelona','Spain','IVF',6000,1550,820,'2026-03-15',true,NULL),
('IVI Barcelona','Spain','Egg Donation',7250,1500,900,'2026-02-01',true,NULL),
('Ginemed Sevilla','Spain','IVF',4750,1200,700,'2026-02-25',true,NULL),
('Ginemed Sevilla','Spain','IVF',4900,1250,720,'2026-03-08',true,NULL),
('Ginemed Sevilla','Spain','IVF',4850,1180,680,'2026-01-30',true,NULL),
('Ginemed Sevilla','Spain','Egg Donation',6350,1200,750,'2026-02-14',true,NULL),
('Eugin Barcelona','Spain','IVF',5450,1400,780,'2026-03-01',true,NULL),
('Eugin Barcelona','Spain','IVF',5600,1450,800,'2026-02-22',true,NULL),
('Eugin Barcelona','Spain','Egg Donation',6850,1400,800,'2026-03-09',true,NULL),
('Eugin Barcelona','Spain','Social Freezing',2700,800,400,'2026-02-05',true,NULL),
('Instituto Bernabeu','Spain','IVF',5350,1350,750,'2026-02-12',true,NULL),
('Instituto Bernabeu','Spain','IVF',5500,1400,780,'2026-03-18',true,NULL),
('Instituto Bernabeu','Spain','Egg Donation',6750,1350,800,'2026-01-25',true,NULL),
('Clinica Tambre','Spain','IVF',5050,1280,700,'2026-02-28',true,NULL),
('Clinica Tambre','Spain','IVF',5200,1320,720,'2026-03-10',true,NULL),
('Clinica Tambre','Spain','Egg Donation',6450,1300,720,'2026-02-08',true,NULL),
('Vida Fertility','Spain','IVF',4900,1250,650,'2026-03-02',true,NULL),
('Vida Fertility','Spain','IVF',5000,1280,680,'2026-02-19',true,NULL),
('Fertty International','Spain','IVF',4700,1200,650,'2026-02-15',true,NULL),
('Fertty International','Spain','Egg Donation',6100,1200,680,'2026-03-05',true,NULL),
('Equipo Juana Crespo','Spain','IVF',6200,1600,900,'2026-02-26',true,NULL),
('Equipo Juana Crespo','Spain','IVF',6400,1650,950,'2026-03-14',true,NULL),
('Equipo Juana Crespo','Spain','Egg Donation',7600,1600,950,'2026-02-09',true,NULL),
('Reproclinic','Spain','IVF',4600,1150,600,'2026-02-23',true,NULL),
('Reproclinic','Spain','Egg Donation',6000,1150,620,'2026-03-11',true,NULL),
('Quironsalud Dexeus','Spain','IVF',5700,1450,800,'2026-02-16',true,NULL),
('Quironsalud Dexeus','Spain','IVF',5850,1500,830,'2026-03-06',true,NULL),
('Quironsalud Dexeus','Spain','Egg Donation',7000,1450,820,'2026-02-04',true,NULL),
('Clinica Eva','Spain','IVF',4500,1150,650,'2026-03-07',true,NULL),
('Clinica Eva','Spain','Social Freezing',2300,750,380,'2026-02-21',true,NULL),
('UR Vistahermosa','Spain','IVF',5200,1300,700,'2026-02-27',true,NULL),
('UR Vistahermosa','Spain','Egg Donation',6650,1300,720,'2026-03-13',true,NULL),
('Kinderwunsch Berlin','Germany','IVF',5000,1400,800,'2026-02-11',true,NULL),
('Kinderwunsch Berlin','Germany','IVF',5150,1450,820,'2026-03-03',true,NULL),
('Kinderwunsch Berlin','Germany','Social Freezing',2700,900,420,'2026-02-17',true,NULL),
('Create Fertility','UK','IVF',7050,1800,1000,'2026-02-13',true,NULL),
('Create Fertility','UK','IVF',7200,1850,1050,'2026-03-16',true,NULL),
('Create Fertility','UK','Social Freezing',3200,1100,500,'2026-02-06',true,NULL),
('Wessex Fertility','UK','IVF',6500,1700,950,'2026-03-04',true,NULL),
('Wessex Fertility','UK','IVF',6650,1750,980,'2026-02-24',true,NULL),
('Centro Bahceci','Portugal','IVF',4800,1250,700,'2026-02-07',true,NULL),
('Centro Bahceci','Portugal','Egg Donation',6250,1250,720,'2026-03-19',true,NULL),
('Ferticentro','Portugal','IVF',4600,1200,650,'2026-03-01',true,NULL),
('Ferticentro','Portugal','Egg Donation',5950,1200,680,'2026-02-28',true,NULL);

-- =======================
-- AGGREGATED PRICING refresh function
-- =======================
CREATE OR REPLACE FUNCTION public.refresh_aggregated_pricing()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.aggregated_pricing;
  INSERT INTO public.aggregated_pricing (clinic_name, treatment_type, avg_price, min_price, max_price, sample_size)
  SELECT clinic_name, treatment_type,
         ROUND(AVG(total_price)::numeric, 0) AS avg_price,
         MIN(total_price) AS min_price,
         MAX(total_price) AS max_price,
         COUNT(*)::int AS sample_size
  FROM public.user_submitted_quotes
  GROUP BY clinic_name, treatment_type;
END;
$$;

SELECT public.refresh_aggregated_pricing();
