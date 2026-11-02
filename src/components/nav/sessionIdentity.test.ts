import { describe, expect, it } from "vitest";
import { sessionBadge, sessionDisplayName } from "./sessionIdentity";

describe("sessionDisplayName", () => {
  it("prefers the access-list name", () => {
    expect(sessionDisplayName({ email: "maria@x.com", listName: "María", metadataName: "M" })).toBe("María");
  });
  it("uses the profile name when no list name", () => {
    expect(sessionDisplayName({ email: "f@x.com", listName: "  ", metadataName: "Fernanda" })).toBe("Fernanda");
  });
  it("falls back to the part before @", () => {
    expect(sessionDisplayName({ email: "fernanda.r@x.com" })).toBe("fernanda.r");
  });
  it("is empty without any identity", () => {
    expect(sessionDisplayName({})).toBe("");
  });
});

describe("sessionBadge", () => {
  it("labels admins in each language", () => {
    expect(sessionBadge(true, true)).toBe("Administrador");
    expect(sessionBadge(true, false)).toBe("Admin");
  });
  it("labels everyone else Beta", () => {
    expect(sessionBadge(false, true)).toBe("Beta");
  });
});
