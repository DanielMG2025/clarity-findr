# Compact orientation summary

## Goal
Add a new `/summary` page that turns the patient’s existing situation, evidence, pricing, and regulatory outputs into a warm, plain-language 2–3 page handout. The detailed `/report` remains unchanged apart from a reciprocal link.

## What will change
- Create `OrientationSummary.tsx` inside the existing patient layout.
- Add `/summary` to the app routes.
- Add “Get my orientation summary →” on My situation and My orientation while keeping their existing detailed-report/source actions.
- Add reciprocal quiet links between the short summary and the full detailed report.
- Reuse the existing print action and print classes so navigation and controls disappear on A4.
- Update the project architecture note to state that both report views are read-only aggregations of existing outputs.

## Summary content
- **Your situation:** one natural paragraph from age, country, family situation, and treatment interest.
- **What this usually means:** the patient’s real age-band citation, expressed in one short sentence with its per-transfer and population-average caveat; at most one additional relevant existing figure.
- **Your most likely options:** up to three concise options derived only from the selected treatment and existing regulatory results, including existing alternative-country guidance when local access is blocked.
- **What it might cost:** the same computed/seed estimate used by the detailed report, with range, confidence, and the medication/per-cycle caveat in prose.
- **Good next steps:** two or three gentle actions and a link to the detailed evidence report.
- Show a calm empty state when the patient has not shared enough basic information.

## Technical details
- Read from `useMasterRecord()`, `usePatientJourney()`, `usePricingConfigurator()`, `ownEggCitationForAge()`, and `seedEstimateForProfile()`; do not recalculate or alter any engine output.
- Keep the page compact with a narrow reading column, short paragraphs, restrained cards, and print-safe `report-page`, `report-card`, and `no-print` classes.
- Do not add tables, interactive evidence popovers, new data, or new pricing/regulatory rules.

## Verification
- Run `bunx tsgo --noEmit` and confirm the preview build is green.
- Open `/summary` from both `/situacion` and `/orientacion` with a loaded demo patient.
- Verify the empty-profile state.
- Verify the reciprocal `/summary` ↔ `/report` links.
- Print to A4 and confirm only the handout prints in 2–3 pages.
