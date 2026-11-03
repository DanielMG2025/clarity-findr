import { describe, expect, it } from "vitest";
import { interpretManageAdmins, validateNewPassword } from "./logic";

describe("validateNewPassword", () => {
  it("requires at least 8 characters", () => {
    expect(validateNewPassword("1234567", "1234567")).toBe("too_short");
    expect(validateNewPassword("12345678", "12345678")).toBeNull();
  });
  it("requires the confirmation to match", () => {
    expect(validateNewPassword("abcdefgh", "abcdefgX")).toBe("mismatch");
  });
});

describe("interpretManageAdmins", () => {
  it("reads the admin list", () => {
    const r = interpretManageAdmins({ status: "ok", self_id: "a", admins: [{ user_id: "a", email: "a@x.com", created_at: "2026-01-01" }] });
    expect(r).toEqual({ kind: "list", selfId: "a", admins: [{ user_id: "a", email: "a@x.com", created_at: "2026-01-01" }] });
  });
  it("reports a person without an account so they are not promoted", () => {
    expect(interpretManageAdmins({ status: "no_account", email: "b@x.com" })).toEqual({ kind: "no_account", email: "b@x.com" });
  });
  it("passes through the anti-lockout answers", () => {
    expect(interpretManageAdmins({ status: "last_admin" })).toEqual({ kind: "last_admin" });
    expect(interpretManageAdmins({ status: "confirm_self" })).toEqual({ kind: "confirm_self" });
  });
  it("treats errors and unknown shapes as errors", () => {
    expect(interpretManageAdmins({ error: "Admin role required" })).toEqual({ kind: "error" });
    expect(interpretManageAdmins(null)).toEqual({ kind: "error" });
    expect(interpretManageAdmins({ status: "ok" })).toEqual({ kind: "error" });
  });
});
