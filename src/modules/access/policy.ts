/**
 * Mirrors public.current_user_has_access(): admins always, active list entries always,
 * and with open sign-up anyone signed in unless an admin deactivated their address.
 */
export function mayEnter(authenticated: boolean, admin: boolean, active: boolean, openSignup = false, deactivated = false) {
  return authenticated && (admin || active || (openSignup && !deactivated));
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Routes AccessGate renders without access: only the invite-join page. */
export const isOpenPath = (pathname: string) => pathname === "/unirse" || pathname === "/unirse/";
