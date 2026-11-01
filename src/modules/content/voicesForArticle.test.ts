import { describe, expect, it } from "vitest";
import { getArticle } from "@/modules/education";
import { LIBRARY, primaryVoiceLink, VOICES, voicesForArticle } from "./resources";

const ids = (slug: string) => voicesForArticle(getArticle(slug)!).map((r) => r.id);

describe("voices for a guide", () => {
  it("the ICSI guide surfaces Fertility Docs Uncensored and Darren Bryk", () => {
    expect(ids("what-is-icsi")).toEqual(["fdu", "bryk"]);
  });

  it("the egg-donation guide puts the donation communities first", () => {
    expect(ids("what-is-egg-donation")).toEqual(["queerception", "family-equality", "fdu"]);
  });

  it("a guide with no topical overlap shows none", () => {
    expect(ids("how-a-treatment-is-financed")).toEqual([]);
  });

  it("never returns more than 3 voices, and institutions are never tagged", () => {
    expect(ids("what-is-vitrification").length).toBeLessThanOrEqual(3);
    expect(LIBRARY.every((r) => !r.topics)).toBe(true);
  });

  it("links to YouTube when the voice has a YouTube channel", () => {
    expect(primaryVoiceLink(VOICES.find((r) => r.id === "crawford")!)).toBe("https://www.youtube.com/@NatalieCrawfordMD");
    expect(primaryVoiceLink(VOICES.find((r) => r.id === "bryk")!)).toBe("https://cofertility.com/all-authors/darren-bryk");
  });
});
