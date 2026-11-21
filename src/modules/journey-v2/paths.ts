// Journey v2 routes. While FEATURES.recorridoV2 is on, these open without an
// account: answers stay in the browser and the account is optional, at the end.

export const START_PATH = "/empezar";
export const BASICS_PATH = "/empezar/lo-basico";
export const NEEDS_PATH = "/empezar/que-necesitas";
export const PREPARE_PATH = "/tu-tratamiento";
export const LIBRARY_PATH = "/biblioteca";
export const ACCOUNT_PATH = "/cuenta";
/** Where "Tell us about your situation" buttons go: v2 Basics, or the legacy form when v2 is off. */
export const situationEntryPath = (v2: boolean, back?: string) => (v2 ? (back ? reviewPath(back) : BASICS_PATH) : "/situacion");
/** Open one question of "lo básico" on its own and come back to `back` when it is saved. */
export const changePath = (step: number, back: string) => `${BASICS_PATH}?paso=${step}&solo=1&volver=${encodeURIComponent(back)}`;
/** "Lo básico" as a confirmable summary (or the first missing question), returning to `back`. */
export const reviewPath = (back: string) => `${BASICS_PATH}?volver=${encodeURIComponent(back)}`;
export const guidePath = (id: string) => `/guia/${id}`;

/** Exact paths and path prefixes ("x/" = anything below x) open in v2. */
const OPEN_EXACT = ["/", START_PATH, BASICS_PATH, NEEDS_PATH, PREPARE_PATH, LIBRARY_PATH, "/descubre", "/descubre/regulacion", "/descubre/ciencia", "/clinicas", "/costes", "/summary", "/report", "/demo"];
const OPEN_PREFIX = ["/guia/", "/aprende/"];

export function isJourneyPath(pathname: string): boolean {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return OPEN_EXACT.includes(p) || OPEN_PREFIX.some((prefix) => p.startsWith(prefix) && p.length > prefix.length);
}
