import { describe, expect, it } from "vitest";
import { getArticle } from "@/modules/education";
import { conversationLink, forumSearchTerm, forumTopicsForArticle } from "./forumLinks";

const topic = (id: string, treatment: string, treatment_en: string, created_at: string, audiences: string[] = [], q = "") =>
  ({ id, treatment, treatment_en, question_en: q, question_es: q, audiences, created_at });

const TOPICS = [
  topic("donation", "ovodonación", "egg donation", "2026-10-01"),
  topic("tandem", "ovodonación / tándem", "egg donation / tandem", "2026-09-01"),
  topic("male", "factor masculino", "male factor", "2026-10-02"),
  topic("mtese", "mTESE", "mTESE", "2026-08-01"),
  topic("freeze", "vitrificación", "egg freezing", "2026-10-03"),
  topic("ropa", "FIV recíproca (ROPA)", "reciprocal IVF (ROPA)", "2026-10-04", ["lgbt"]),
  topic("wait", "espera beta", "beta wait", "2026-10-05", [], "How long is the wait?"),
  topic("era", "fallo de implantación / ERA", "implantation failure / ERA", "2026-07-01"),
];
const ids = (slug: string) => forumTopicsForArticle(getArticle(slug)!, TOPICS).map((t) => t.id);

describe("forum topics for a guide", () => {
  it("an egg-donation topic matches the egg-donation guide, strongest match first", () => {
    expect(ids("what-is-egg-donation")).toEqual(["tandem", "donation"]);
  });

  it("a male-factor topic matches both the ICSI guide and male-factor topics", () => {
    expect(ids("what-is-icsi")).toEqual(["male", "mtese"]);
  });

  it("a financing guide matches nothing", () => {
    expect(ids("how-a-treatment-is-financed")).toEqual([]);
  });

  it("ERA counts as a whole word only, so 'espera' doesn't match the transfer guide", () => {
    expect(ids("fresh-vs-frozen-transfer")).toEqual(["era"]);
  });

  it("caps at the limit", () => {
    expect(forumTopicsForArticle({ tags: ["egg-donation", "ropa", "icsi"] }, TOPICS, 2)).toHaveLength(2);
  });

  it("'See more' deep-links into Conversación with the guide's best term", () => {
    expect(forumSearchTerm(getArticle("what-is-icsi")!)?.es).toBe("factor masculino");
    expect(forumSearchTerm(getArticle("what-is-ropa-method")!)?.es).toBe("ROPA");
    expect(conversationLink("ovodonación")).toBe("/descubre?q=ovodonaci%C3%B3n#conversacion");
  });
});
