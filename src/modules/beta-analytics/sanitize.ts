/**
 * Privacy guard for beta navigation events: only navigation metadata ever leaves the browser.
 * Never pass anything the person typed (answers, free text, case data, search terms).
 */
export type BetaEventType = "page_view" | "click";

/** Only these meta keys survive, and only as short strings/numbers/booleans. */
export const ALLOWED_META_KEYS = ["module", "from", "target"] as const;

/** Path without query string or hash (search boxes put typed text in `?q=`). */
export function sanitizePath(path: string): string {
  const clean = (path || "/").split(/[?#]/)[0] || "/";
  return clean.slice(0, 300);
}

/** Labels are identifiers like `contact_clinic_blocked`, never free text. */
export function sanitizeLabel(label?: string | null): string | null {
  if (!label) return null;
  const clean = label.toLowerCase().replace(/[^a-z0-9_:-]/g, "_").slice(0, 80);
  return clean || null;
}

export function sanitizeMeta(meta?: Record<string, unknown> | null): Record<string, string | number | boolean> | null {
  if (!meta) return null;
  const out: Record<string, string | number | boolean> = {};
  for (const key of ALLOWED_META_KEYS) {
    const v = meta[key];
    if (typeof v === "string") out[key] = v.slice(0, 60);
    else if (typeof v === "number" && Number.isFinite(v)) out[key] = v;
    else if (typeof v === "boolean") out[key] = v;
  }
  return Object.keys(out).length ? out : null;
}

export const isTrackedPath = (path: string) => !sanitizePath(path).startsWith("/widgets");
