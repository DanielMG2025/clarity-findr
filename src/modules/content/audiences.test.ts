import { describe, expect, it } from "vitest";
import { AUDIENCE_LABEL, type Audience } from "./types";
import { LIBRARY, VOICES } from "./resources";

/** The Learn page filter row must cover every audience key, in this order, with these labels. */
const FILTER_ROW: (Audience | "all")[] = ["all", "planners", "first-steps", "experienced", "men", "lgbt"];

describe("Learn page audience filters", () => {
  it("shows every audience chip in the requested order", () => {
    const keys = Object.keys(AUDIENCE_LABEL) as Audience[];
    expect(FILTER_ROW.slice(1)).toEqual(keys);
  });

  it("labels the two new chips as requested", () => {
    expect(AUDIENCE_LABEL.experienced).toEqual({ en: "Experienced", es: "Experimentadas" });
    expect(AUDIENCE_LABEL.lgbt).toEqual({ en: "LGBTI+ couples", es: "Parejas LGTBI+" });
  });

  /** Filtering Learn by an audience must never leave the "Trusted voices" grid empty. */
  it.each(FILTER_ROW.slice(1) as Audience[])(
    "the %s filter shows at least one trusted voice",
    (audience) => {
      const voices = VOICES.filter((r) => r.audiences.includes(audience));
      expect(voices.length).toBeGreaterThan(0);
    },
  );
});

describe("Discover hub source split", () => {
  it("the scientific library holds the institutional sources", () => {
    const ids = LIBRARY.map((r) => r.id);
    for (const id of ["hfea", "eshre", "asrm", "cdc-sart", "sef", "rao", "pet"]) expect(ids).toContain(id);
  });

  it("trusted voices include the creators and no institutions", () => {
    const ids = VOICES.map((r) => r.id);
    for (const id of ["crawford", "fdu", "eyvazzadeh", "bryk", "queerception"]) expect(ids).toContain(id);
    expect(VOICES.some((r) => r.kind === "institution")).toBe(false);
  });
});
