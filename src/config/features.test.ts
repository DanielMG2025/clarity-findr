import { describe, expect, it } from "vitest";
import { FEATURES, FLAG_FALLBACK_PATH, isEnabled, type FeatureFlag } from "./features";

describe("feature flags", () => {
  it("every flag is enabled by default", () => {
    const keys = Object.keys(FEATURES) as FeatureFlag[];
    expect(keys.length).toBe(12);
    for (const key of keys) {
      expect(isEnabled(key), key).toBe(true);
    }
  });

  it("fallback path is a non-empty absolute path", () => {
    expect(FLAG_FALLBACK_PATH.length).toBeGreaterThan(0);
    expect(FLAG_FALLBACK_PATH.startsWith("/")).toBe(true);
  });
});
