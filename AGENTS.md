# Architecture rules
- Every route is wrapped by AccessGate; verify identity with getUser and current_user_has_access on loads/navigation/focus, with admin bypass enforced in the database. Keep access-list reads/writes admin-only and magic-link credentials confined to admin responses and same-origin redemption.

- Keep `/report` and `/summary` as read-only aggregations of existing master-record, journey, evidence, pricing, and regulatory outputs so printed figures never diverge from patient pages.

- Both patient reports consume the shared `patientNarrative` presentation helper so their opening paragraphs cannot drift; keep it read-only.

- Localize display text through the context-aware JSX presentation boundary and exact-copy dictionaries in `src/i18n`; this keeps persisted form values, routes, clinical records and engine outputs untouched. Never mutate React-owned DOM text for translation.

- Learn pills are read from the `pills` table via `usePublishedPills`, which falls back to the static seed in `src/modules/content/pills.ts`, so /descubre never renders empty; writes are gated by the `admin` role in `user_roles` (RLS + `has_role`).

- Forum listening uses active database-configured RSS sources, neutral thematic intake and structured metadata only; manual admin-only ingest/distil reuse existing tables, with item-date freshness and validated support IDs. /descubre reads published topics and an authorized aggregate source count, never the admin-only source configuration.
- `/descubre` is the single content hub (conversation, pills, trusted voices, Basics guides via `BasicsSection`); `/aprende` redirects to `/descubre#basicos` while `/aprende/:slug` stays the article route for glossary deep links.
