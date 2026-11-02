import { supabase } from "@/integrations/supabase/client";
import { isEnabled } from "@/config/features";
import { isTrackedPath, sanitizeLabel, sanitizeMeta, sanitizePath, type BetaEventType } from "./sanitize";

const SESSION_KEY = "fc:beta-session";

export function getBetaSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/**
 * Logs one navigation event. Active only while `FEATURES.betaBanner` is on.
 * Identity (user id/email) is stamped by the database, not sent from here.
 * Fire-and-forget: analytics must never break the page.
 */
export function logBetaEvent(
  eventType: BetaEventType,
  { path, label, meta }: { path?: string; label?: string; meta?: Record<string, unknown> } = {},
): void {
  if (!isEnabled("betaBanner")) return;
  const cleanPath = sanitizePath(path ?? (typeof window !== "undefined" ? window.location.pathname : "/"));
  if (!isTrackedPath(cleanPath)) return;
  try {
    void supabase
      .from("beta_events")
      .insert({
        session_id: getBetaSessionId(),
        cohort: "beta",
        event_type: eventType,
        path: cleanPath,
        label: sanitizeLabel(label),
        meta: sanitizeMeta(meta),
      })
      .then(({ error }) => { if (error) console.debug("beta event not logged", error.message); });
  } catch { /* never block the UI */ }
}

/** Shorthand for instrumented clicks. */
export const logBetaClick = (label: string, meta?: Record<string, unknown>) =>
  logBetaEvent("click", { label, meta });
