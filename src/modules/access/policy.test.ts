import { describe, expect, it } from "vitest";
import { isOpenPath, mayEnter, normalizeEmail } from "./policy";

describe("access rules", () => {
  it("blocks signed-out visitors even if their email is allowed", () => expect(mayEnter(false, false, true)).toBe(false));
  it("allows an active authorized user", () => expect(mayEnter(true, false, true)).toBe(true));
  it("blocks a deactivated or missing user", () => expect(mayEnter(true, false, false)).toBe(false));
  it("always allows authenticated admins even after revocation", () => expect(mayEnter(true, true, false)).toBe(true));
  it("normalizes email to lowercase", () => expect(normalizeEmail(" DanielMunoz2005@gmail.com ")).toBe("danielmunoz2005@gmail.com"));
  it("lets only the invite-join page through without access", () => {
    expect(isOpenPath("/unirse")).toBe(true);
    for (const p of ["/", "/descubre", "/admin", "/account", "/unirse-x"]) expect(isOpenPath(p)).toBe(false);
  });
});
