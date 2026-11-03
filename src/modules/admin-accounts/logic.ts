export const MIN_PASSWORD_LENGTH = 8;

export type PasswordIssue = "too_short" | "mismatch" | null;

/** Validates a new admin password and its confirmation. */
export function validateNewPassword(password: string, confirm: string): PasswordIssue {
  if (password.length < MIN_PASSWORD_LENGTH) return "too_short";
  if (password !== confirm) return "mismatch";
  return null;
}

export type AdminEntry = { user_id: string; email: string | null; created_at: string | null };

export type ManageAdminsOutcome =
  | { kind: "list"; admins: AdminEntry[]; selfId: string | null }
  | { kind: "granted" | "already_admin" | "no_account"; email: string }
  | { kind: "revoked" | "last_admin" | "confirm_self" | "not_admin" }
  | { kind: "error" };

/** Turns a raw manage-admins response into a typed outcome; anything unexpected is an error. */
export function interpretManageAdmins(data: unknown): ManageAdminsOutcome {
  if (!data || typeof data !== "object") return { kind: "error" };
  const d = data as Record<string, unknown>;
  switch (d.status) {
    case "ok":
      if (!Array.isArray(d.admins)) return { kind: "error" };
      return {
        kind: "list",
        admins: d.admins.filter((a): a is AdminEntry => !!a && typeof (a as AdminEntry).user_id === "string"),
        selfId: typeof d.self_id === "string" ? d.self_id : null,
      };
    case "granted":
    case "already_admin":
    case "no_account":
      return { kind: d.status, email: typeof d.email === "string" ? d.email : "" };
    case "revoked":
    case "last_admin":
    case "confirm_self":
    case "not_admin":
      return { kind: d.status };
    default:
      return { kind: "error" };
  }
}
