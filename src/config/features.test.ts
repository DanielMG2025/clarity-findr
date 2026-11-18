import { describe, expect, it } from "vitest";
import { FEATURES, FLAG_FALLBACK_PATH, isEnabled, isPreviewHost, type FeatureFlag } from "./features";

describe("feature flags", () => {
  it("every flag except the preview-only journey v2 is enabled by default", () => {
    const keys = Object.keys(FEATURES) as FeatureFlag[];
    expect(keys.length).toBe(16);
    for (const key of keys.filter((k) => k !== "recorridoV2")) {
      expect(isEnabled(key), key).toBe(true);
    }
  });

  it("journey v2 is on only for the preview and local hosts, never the published site", () => {
    expect(isPreviewHost("id-preview--4fda3506-d608-461c-b6cf-e4e0499d7c41.lovable.app")).toBe(true);
    expect(isPreviewHost("localhost")).toBe(true);
    expect(isPreviewHost("clarity-findr.lovable.app")).toBe(false);
    expect(isPreviewHost("www.fertilitycompass.com")).toBe(false);
  });

  it("fallback path is a non-empty absolute path", () => {
    expect(FLAG_FALLBACK_PATH.length).toBeGreaterThan(0);
    expect(FLAG_FALLBACK_PATH.startsWith("/")).toBe(true);
  });
});
