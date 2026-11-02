/** Pure helpers for the header session chip: who is signed in and which badge to show. */

export interface SessionIdentityInput {
  email?: string | null;
  /** Name from the access list, when the session is allowed to read it. */
  listName?: string | null;
  /** Name from the auth profile metadata, if any. */
  metadataName?: string | null;
}

/** Display name preference: access-list name, then profile name, then the part of the email before "@". */
export function sessionDisplayName({ email, listName, metadataName }: SessionIdentityInput): string {
  const clean = (s?: string | null) => (s ?? "").trim();
  if (clean(listName)) return clean(listName);
  if (clean(metadataName)) return clean(metadataName);
  const e = clean(email);
  if (!e) return "";
  const local = e.split("@")[0];
  return local || e;
}

export function sessionBadge(isAdmin: boolean, es: boolean): string {
  if (isAdmin) return es ? "Administrador" : "Admin";
  return "Beta";
}
