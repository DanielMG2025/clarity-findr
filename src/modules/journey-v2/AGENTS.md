# Journey v2 (`FEATURES.recorridoV2`)
- Everything sits behind `recorridoV2`, on everywhere (preview and published); flag off is the rollback: the previous routes render unchanged and v2-only paths redirect. Tests run the legacy baseline with the flag off (`src/test/setup.ts`) and v2 tests switch it on.
- Journey paths in `paths.ts` open without an account (AccessGate lets them through only while the flag is on); admin/account routes stay gated, and no anonymous auth is used.
- Treatments, prices, age figures, rules and prepare modules link ONLY to existing content (articles, seed prices, `science.ts`, `regulation.ts`); a missing link renders "en preparación" and its block is omitted, never filled. Integrity tests check every link resolves.
- Basics answers live only in localStorage (`fc:basics-v2`, versioned with a migration); only country and treatment/goal are copied into the case, never the age band.
- "What brings you here" maps to the existing case goal and an existing treatment (`REASONS`); male focus (`maleFocus`) puts existing male content first and hides woman's-age figures.
- Journey copy must stay gender-neutral; `journeyV2.buildB.test.tsx` scans the journey files (allow-list only for words agreeing with a noun). Shared copy seen with the flag on uses the v2 vocabulary (Biblioteca, tratamiento, tu situación) even on legacy pages.
- "Lo básico" is one question per step (`?paso=1..5`), answers saved on tap so going back keeps them.
