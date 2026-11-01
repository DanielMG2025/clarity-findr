import { describe, expect, it } from "vitest";
import { branchTotal, CODE_PATTERN, descendants, directJoins, hasCapacity, mintReferralCode, seatsLeft } from "./referrals";

describe("mintReferralCode", () => {
  it("produces 8-character URL-safe codes", () => {
    for (let i = 0; i < 200; i++) {
      const code = mintReferralCode();
      expect(code).toHaveLength(8);
      expect(CODE_PATTERN.test(code)).toBe(true);
      expect(encodeURIComponent(code)).toBe(code);
    }
  });
  it("skips codes that are already taken", () => {
    let call = 0;
    const random = (n: number) => new Uint8Array(n).fill(call++ === 0 ? 0 : 1);
    expect(mintReferralCode(new Set(["AAAAAAAA"]), 8, random)).toBe("BBBBBBBB");
  });
  it("gives distinct codes across many mints", () => {
    const codes = new Set(Array.from({ length: 1000 }, () => mintReferralCode()));
    expect(codes.size).toBe(1000);
  });
});

describe("hasCapacity", () => {
  it("blocks once seats_used reaches the cap of 5", () => {
    expect(hasCapacity({ seats_cap: 5, seats_used: 4 })).toBe(true);
    expect(hasCapacity({ seats_cap: 5, seats_used: 5 })).toBe(false);
    expect(hasCapacity({ seats_cap: 5, seats_used: 6 })).toBe(false);
  });
  it("never blocks when the cap is null (unlimited)", () => {
    expect(hasCapacity({ seats_cap: null, seats_used: 10_000 })).toBe(true);
    expect(seatsLeft({ seats_cap: null, seats_used: 3 })).toBeNull();
  });
  it("blocks inactive codes", () => {
    expect(hasCapacity({ active: false, seats_cap: null, seats_used: 0 })).toBe(false);
  });
  it("reports seats left out of 5", () => {
    expect(seatsLeft({ seats_cap: 5, seats_used: 2 })).toBe(3);
  });
});

describe("invite tree", () => {
  // root → a, b ; a → c, d ; c → e ; other root x → y
  const rows = [
    { code: "root", parent_code: null }, { code: "a", parent_code: "root" }, { code: "b", parent_code: "root" },
    { code: "c", parent_code: "a" }, { code: "d", parent_code: "a" }, { code: "e", parent_code: "c" },
    { code: "x", parent_code: null }, { code: "y", parent_code: "x" },
  ];
  it("counts direct joins", () => {
    expect(directJoins("root", rows)).toBe(2);
    expect(directJoins("a", rows)).toBe(2);
    expect(directJoins("e", rows)).toBe(0);
  });
  it("counts every descendant in the branch", () => {
    expect(branchTotal("root", rows)).toBe(5);
    expect(branchTotal("a", rows)).toBe(3);
    expect(branchTotal("x", rows)).toBe(1);
    expect(descendants("a", rows).sort()).toEqual(["c", "d", "e"]);
  });
  it("is safe against cycles", () => {
    const loop = [{ code: "p", parent_code: "q" }, { code: "q", parent_code: "p" }];
    expect(branchTotal("p", loop)).toBe(1);
  });
});
