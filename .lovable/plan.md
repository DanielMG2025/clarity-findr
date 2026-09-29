# Personalized report summary

## Build
- Add `/report` as a read-only patient report page using the existing master record, journey output, pricing estimate, evidence citations, and regulatory orientation.
- Present the requested sections in one cohesive document: patient situation, orientation factors, both evidence tables with inline caveats, costs, regulatory framework, and dated source footer.
- Add a print action that opens the browser print dialog, plus a calm empty state linking back to My situation.

## Entry points
- Add a report button near the summary on My situation.
- Add a report button in the Sources dossier header.
- Register the new route without changing existing routes or patient logic.

## Print treatment
- Add print-only CSS for A4 margins, hidden app navigation/header/actions, legible tables, and cards that avoid splitting across pages.
- Keep the existing ivory, sage, apricot, typography, badges, and card language on screen.

## Verification
- Type-check with `bunx tsgo --noEmit`.
- Open the report from both entry points and verify populated and empty-profile states, desktop/mobile layout, and print media behavior.

## Technical boundaries
- No changes to engines, scoring, prices, regulatory rules, backend, or existing calculations.
- The report will read the same computed pricing estimate path already used by Costs and Sources; no figures will be recalculated or invented.
