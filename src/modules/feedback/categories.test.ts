import { describe, expect, it } from "vitest";
import { countByCategory, filterFeedback, FEEDBACK_CATEGORIES, showsFeedbackLauncher } from "./categories";

const rows = [
  { category: "broken", status: "new", user_email: "a@x.com", message: "El botón de costes no funciona" },
  { category: "idea", status: "reviewed", user_email: "b@x.com", message: "Add a glossary search" },
  { category: null, status: "new", user_email: "a@x.com", message: "Me encanta la sección de descubre" },
];
const all = { category: "all", status: "all", email: "all", query: "" } as const;

describe("beta feedback", () => {
  it("stores exactly the five stable category keys", () => {
    expect([...FEEDBACK_CATEGORIES]).toEqual(["improve", "missing", "excess", "broken", "idea"]);
  });
  it("filters by category, tester, status and accent-insensitive search", () => {
    expect(filterFeedback(rows, { ...all, category: "broken" })).toHaveLength(1);
    expect(filterFeedback(rows, { ...all, email: "a@x.com" })).toHaveLength(2);
    expect(filterFeedback(rows, { ...all, status: "reviewed" })[0].user_email).toBe("b@x.com");
    expect(filterFeedback(rows, { ...all, query: "SECCIÓN" })).toHaveLength(1);
  });
  it("counts per category, ignoring uncategorised rows", () => {
    expect(countByCategory(rows)).toEqual({ improve: 0, missing: 0, excess: 0, broken: 1, idea: 1 });
  });
  it("hides the launcher only on chromeless embeds", () => {
    expect(showsFeedbackLauncher("/descubre")).toBe(true);
    expect(showsFeedbackLauncher("/widgets/fiv-madrid")).toBe(false);
  });
});
