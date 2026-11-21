import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { applySiteMeta, SITE_META } from "./siteMeta";

describe("site title and description", () => {
  it("uses the new slogan in both languages", () => {
    expect(SITE_META.es.title).toBe("Fertility Compass — Entiende y prepara tu tratamiento de fertilidad");
    expect(SITE_META.en.title).toBe("Fertility Compass — Understand and prepare your fertility treatment");
    expect(SITE_META.es.description).toBe("Lo que tardarías meses en recopilar, condensado en un único sitio.");
  });
  it("index.html ships the English slogan, not the old engine tagline", () => {
    const html = readFileSync("index.html", "utf8");
    expect(html).toContain(`<title>${SITE_META.en.title}</title>`);
    expect(html).not.toMatch(/decision engine|real prices/i);
  });
  it("switches title, description and social tags with the language", () => {
    document.head.innerHTML = '<meta name="description" content="x"><meta property="og:title" content="x"><meta property="og:description" content="x">';
    applySiteMeta("es");
    expect(document.title).toBe(SITE_META.es.title);
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute("content")).toBe(SITE_META.es.title);
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(SITE_META.es.description);
  });
});
