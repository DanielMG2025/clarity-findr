export function mayEnter(authenticated: boolean, admin: boolean, active: boolean) {
  return authenticated && (admin || active);
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Routes AccessGate renders without access: only the invite-join page. */
export const isOpenPath = (pathname: string) => pathname === "/unirse" || pathname === "/unirse/";
