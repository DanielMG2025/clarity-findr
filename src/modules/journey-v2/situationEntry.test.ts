import { describe, expect, it } from "vitest";
import { situationEntryPath } from "./paths";
import { translate } from "@/i18n/translate";

describe("Tell us about your situation buttons", () => {
  it("go to the v2 Basics with the journey on, and to the old form with it off", () => {
    expect(situationEntryPath(true)).toBe("/empezar/lo-basico");
    expect(situationEntryPath(false)).toBe("/situacion");
  });
  it("read «Cuéntanos tu situación» in Spanish", () => {
    expect(translate("Tell us about your situation", "es")).toBe("Cuéntanos tu situación");
  });
});
