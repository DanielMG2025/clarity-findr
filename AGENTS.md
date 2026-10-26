# Architecture rules
- Every route is wrapped by AccessGate; verify identity with getUser and current_user_has_access on loads/navigation/focus, with admin bypass enforced in the database. Keep access-list reads/writes admin-only and magic-link credentials confined to admin responses and same-origin redemption.

- Keep `/report` and `/summary` as read-only aggregations of existing master-record, journey, evidence, pricing, and regulatory outputs so printed figures never diverge from patient pages.

- Both patient reports consume the shared `patientNarrative` presentation helper so their opening paragraphs cannot drift; keep it read-only.

- Localize display text through the context-aware JSX presentation boundary and exact-copy dictionaries in `src/i18n`; this keeps persisted form values, routes, clinical records and engine outputs untouched. Never mutate React-owned DOM text for translation.

- Learn pills are read from the `pills` table via `usePublishedPills`, which falls back to the static seed in `src/modules/content/pills.ts`, so /descubre never renders empty; writes are gated by the `admin` role in `user_roles` (RLS + `has_role`).

- Forum listening: `listen-ingest` (Reddit public feeds, anonymised, prototype-grade) and `listen-distil` (AI synthesis into draft `conversation_topics`) are manual-trigger edge functions gated by the admin role in code; /descubre reads only published topics and hides the section when none exist.
