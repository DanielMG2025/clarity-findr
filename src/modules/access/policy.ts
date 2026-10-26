export function mayEnter(authenticated: boolean, admin: boolean, active: boolean) {
  return authenticated && (admin || active);
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();