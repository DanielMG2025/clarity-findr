import { z } from "npm:zod@3";

/** Request contract for manage-admins. Unknown actions are rejected with 400. */
export const manageAdminsBody = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }),
  z.object({ action: z.literal("grant"), email: z.string().trim().email().max(254).transform((v) => v.toLowerCase()) }),
  z.object({ action: z.literal("revoke"), user_id: z.string().uuid(), confirm_self: z.boolean().optional() }),
]);
export type ManageAdminsBody = z.infer<typeof manageAdminsBody>;

export type RevokeDecision = "revoke" | "last_admin" | "confirm_self" | "not_admin";

/**
 * Anti-lockout rule: never remove the last admin, and a self-revoke needs an
 * explicit confirmation flag. Pure so it can be tested without the backend.
 */
export function decideRevoke(input: { adminIds: string[]; targetId: string; callerId: string; confirmSelf?: boolean }): RevokeDecision {
  const { adminIds, targetId, callerId, confirmSelf } = input;
  if (!adminIds.includes(targetId)) return "not_admin";
  if (adminIds.length <= 1) return "last_admin";
  if (targetId === callerId && !confirmSelf) return "confirm_self";
  return "revoke";
}

/** Case-insensitive match of an auth user by email within one page of users. */
export function findUserByEmail<T extends { email?: string | null }>(users: T[], email: string): T | undefined {
  const wanted = email.trim().toLowerCase();
  return users.find((u) => (u.email ?? "").toLowerCase() === wanted);
}
