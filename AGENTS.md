# Architecture rules

- Keep `/report` and `/summary` as read-only aggregations of existing master-record, journey, evidence, pricing, and regulatory outputs so printed figures never diverge from patient pages.

- Both patient reports consume the shared `patientNarrative` presentation helper so their opening paragraphs cannot drift; keep it read-only.
