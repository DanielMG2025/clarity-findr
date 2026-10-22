import { describe, it, expect } from "vitest";
import { topKeywords } from "./conversation";
describe("topKeywords", () => {
  it("counts a word once per post and drops stop words", () => {
    const r = topKeywords(["IVF ivf transfer and the", "transfer failed", "embryo transfer"]);
    expect(r[0]).toEqual({ word: "transfer", count: 3 });
    expect(r.find((k) => k.word === "ivf")?.count).toBe(1);
    expect(r.find((k) => k.word === "the")).toBeUndefined();
  });
});
