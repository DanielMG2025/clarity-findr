ALTER TABLE public.conversation_topics
  ADD COLUMN IF NOT EXISTS source_platform text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS treatment text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS treatment_en text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS geography text,
  ADD COLUMN IF NOT EXISTS period text NOT NULL DEFAULT 'week';
UPDATE public.conversation_topics SET source_platform = source_forum WHERE source_platform = '';
ALTER TABLE public.conversation_topics ADD CONSTRAINT conversation_topics_period_check CHECK (period IN ('week','3m'));