import { decideRevoke, findUserByEmail, manageAdminsBody } from "./logic.ts";

const eq = (a: unknown, b: unknown, msg: string) => { if (a !== b) throw new Error(`${msg}: expected ${b}, got ${a}`); };
const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";

Deno.test("rejects revoking the last remaining admin", () => {
  eq(decideRevoke({ adminIds: [A], targetId: A, callerId: A, confirmSelf: true }), "last_admin", "last admin");
});
Deno.test("asks for confirmation before an admin revokes themself", () => {
  eq(decideRevoke({ adminIds: [A, B], targetId: A, callerId: A }), "confirm_self", "self without confirm");
  eq(decideRevoke({ adminIds: [A, B], targetId: A, callerId: A, confirmSelf: true }), "revoke", "self with confirm");
});
Deno.test("revokes another admin when at least one admin remains", () => {
  eq(decideRevoke({ adminIds: [A, B], targetId: B, callerId: A }), "revoke", "other admin");
});
Deno.test("reports a target that is not an admin", () => {
  eq(decideRevoke({ adminIds: [A, B], targetId: "33333333-3333-4333-8333-333333333333", callerId: A }), "not_admin", "non admin");
});
Deno.test("validates action bodies and normalizes emails", () => {
  const g = manageAdminsBody.parse({ action: "grant", email: " Ana@Example.COM " });
  if (g.action !== "grant" || g.email !== "ana@example.com") throw new Error("email not normalized");
  eq(manageAdminsBody.safeParse({ action: "grant", email: "nope" }).success, false, "bad email");
  eq(manageAdminsBody.safeParse({ action: "revoke", user_id: "x" }).success, false, "bad uuid");
  eq(manageAdminsBody.safeParse({ action: "delete_everything" }).success, false, "unknown action");
});
Deno.test("matches auth users by email case-insensitively", () => {
  eq(findUserByEmail([{ id: "1", email: "Ana@Example.com" }], "ana@example.com")?.email, "Ana@Example.com", "match");
  eq(findUserByEmail([{ id: "1", email: null }], "ana@example.com"), undefined, "no match");
});
