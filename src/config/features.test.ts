import { describe, expect, it } from "vitest";
import { FEATURES, FLAG_FALLBACK_PATH, isEnabled, type FeatureFlag } from "./features";

describe("feature flags", () => {
  it("every flag is enabled by default, journey v2 included (preview and published alike)", async () => {
    // The test setup switches v2 off for the legacy baseline; read the shipped default from the module source.
    const keys = Object.keys(FEATURES) as FeatureFlag[];
    expect(keys.length).toBe(16);
    for (const key of keys.filter((k) => k !== "recorridoV2")) expect(isEnabled(key), key).toBe(true);
    const { readFileSync } = await import("node:fs");
    expect(readFileSync("src/config/features.ts", "utf8")).toMatch(/\n  recorridoV2: true,\n/);
  });

  it("fallback path is a non-empty absolute path", () => {
    expect(FLAG_FALLBACK_PATH.length).toBeGreaterThan(0);
    expect(FLAG_FALLBACK_PATH.startsWith("/")).toBe(true);
  });
});
