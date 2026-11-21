# Journey v2 (`FEATURES.recorridoV2`)
- Everything sits behind `recorridoV2` (default on only for preview/local hosts via `isPreviewHost`); flag off renders the current routes unchanged and v2-only paths redirect, so production stays as it is until the flag is set deliberately.
- Journey paths in `paths.ts` open without an account (AccessGate lets them through only while the flag is on); admin/account routes stay gated, and no anonymous auth is used.
- Treatments, prices, age figures, rules and prepare modules link ONLY to existing content (articles, seed prices, `science.ts`, `regulation.ts`); a missing link renders "en preparación" and its block is omitted, never filled. Integrity tests check every link resolves.
- Basics answers live only in localStorage (`fc:basics-v2`, versioned with a migration); only country and treatment/goal are copied into the case, never the age band.
- "What brings you here" maps to the existing case goal and an existing treatment (`REASONS`); male focus (`maleFocus`) puts existing male content first and hides woman's-age figures.
- Journey copy must stay gender-neutral; `journeyV2.buildB.test.tsx` scans the journey files, with an explicit allow-list for wording given verbatim in the brief.
