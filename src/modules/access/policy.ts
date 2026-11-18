/**
 * Mirrors public.current_user_has_access(): admins always, active list entries always,
 * and with open sign-up anyone signed in unless an admin deactivated their address.
 */
export function mayEnter(authenticated: boolean, admin: boolean, active: boolean, openSignup = false, deactivated = false) {
  return authenticated && (admin || active || (openSignup && !deactivated));
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Routes AccessGate renders without access: the invite-join page and the sign-in link's landing page. */
export const isOpenPath = (pathname: string) => pathname === "/unirse" || pathname === "/unirse/" || isAuthConfirmPath(pathname);

/** The emailed / admin-made sign-in link's landing page; verifies only on tap. */
export const AUTH_CONFIRM_PATH = "/auth/confirmar";
export const isAuthConfirmPath = (pathname: string) => pathname.replace(/\/+$/, "") === AUTH_CONFIRM_PATH;

/**
 * A 4xx from the auth server means the session is really gone. Network errors,
 * timeouts and 5xx do not: the stored session is kept and the check retried.
 */
export function isDefiniteRejection(error: unknown): boolean {
  const status = (error as { status?: unknown } | null)?.status;
  return typeof status === "number" && status >= 400 && status < 500;
}

/** Where to go back after Google or an emailed link (same-origin paths only, 30-minute expiry). */
export const RETURN_KEY = "fc:return-to";
const RETURN_TTL_MS = 30 * 60 * 1000;

export function safeReturnPath(path: unknown): string | null {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return null;
  return path;
}
export const encodeReturn = (path: string, now: number) => JSON.stringify({ path, at: now });
export function decodeReturn(raw: string | null, now: number): string | null {
  if (!raw) return null;
  try {
    const { path, at } = JSON.parse(raw) as { path?: unknown; at?: unknown };
    if (typeof at !== "number" || now < at || now - at > RETURN_TTL_MS) return null;
    return safeReturnPath(path);
  } catch {
    return null;
  }
}

/** Remember the current page before leaving to sign in. */
export function rememberReturn(path: string) {
  if (!safeReturnPath(path) || isAuthConfirmPath(path.split("?")[0])) return;
  try { localStorage.setItem(RETURN_KEY, encodeReturn(path, Date.now())); } catch { /* storage may be off */ }
}
/** Read and clear the remembered page. */
export function takeReturn(): string | null {
  try {
    const raw = localStorage.getItem(RETURN_KEY);
    if (raw) localStorage.removeItem(RETURN_KEY);
    return decodeReturn(raw, Date.now());
  } catch { return null; }
}
