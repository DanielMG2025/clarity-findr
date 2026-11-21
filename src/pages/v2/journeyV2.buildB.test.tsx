import { describe, expect, it, afterEach, beforeEach, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { LANGUAGE_KEY } from "@/i18n/translate";
import { TooltipProvider } from "@/components/ui/tooltip";

vi.mock("@/integrations/supabase/client", () => {
  const chain: Record<string, unknown> = {};
  for (const m of ["select", "eq", "order", "limit", "in"]) chain[m] = () => chain;
  chain.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(ok);
  return { supabase: { from: () => chain, rpc: () => Promise.resolve({ data: null, error: null }), auth: { getSession: () => Promise.resolve({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } } };
});

import Basics from "./Basics";
import WhatYouNeed from "./WhatYouNeed";
import GuideV2 from "./GuideV2";
import PrepareV2 from "./PrepareV2";
import { REASONS, maleFocus, migrateBasics, pickReason, useBasics } from "@/modules/journey-v2/basics";
import { PICKER_TREATMENTS, treatmentById } from "@/modules/journey-v2/treatments";
import { ageForGuide } from "@/modules/journey-v2/guide";

function at(path: string, el: React.ReactNode, pattern = "*") {
  return render(
    <QueryClientProvider client={new QueryClient()}><LanguageProvider><TooltipProvider><MemoryRouter initialEntries={[path]}>
      <Routes><Route path={pattern} element={el} /></Routes>
    </MemoryRouter></TooltipProvider></LanguageProvider></QueryClientProvider>,
  );
}
beforeEach(() => { localStorage.setItem(LANGUAGE_KEY, "es"); useBasics.getState().reset(); });
afterEach(() => { cleanup(); localStorage.clear(); });

describe("basics · starts with who it's for", () => {
  it("asks the five questions in the agreed order", () => {
    at("/empezar/lo-basico", <Basics />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "¿Para quién buscas información?",
      "¿Qué edad tiene la persona que se trataría?",
      "¿Qué te trae aquí?",
      "¿Dónde vives?",
      "¿Sabes qué tratamiento te interesa?",
    ]);
    for (const id of ["mujer", "hombre", "pareja", "otra-persona"]) expect(screen.getByTestId(`who-${id}`)).toBeTruthy();
  });
  it("for a couple asks for the woman's age, and explains why", () => {
    at("/empezar/lo-basico", <Basics />);
    expect(screen.queryByTestId("age-couple")).toBeNull();
    fireEvent.click(screen.getByTestId("who-pareja"));
    expect(screen.getByTestId("age-couple").textContent).toBe("Indica la edad de la mujer: es la que más cambia las probabilidades.");
  });
  it("the treatment picker does not offer the male-fertility page as a treatment", () => {
    expect(PICKER_TREATMENTS.map((t) => t.id)).toEqual(["fiv", "icsi", "inseminacion", "ovodonacion", "preservacion", "adopcion-embriones"]);
  });
});

describe("'¿Qué te trae aquí?' maps onto the existing situation and treatment", () => {
  it("each answer has the agreed label, case goal and (if any) treatment", () => {
    expect(REASONS.map((r) => [r.label.es, r.goal, r.treatment ?? null, !!r.male])).toEqual([
      ["Quiero un tratamiento para quedarme embarazada", "treatment", null, false],
      ["Congelar óvulos / preservar", "preserve", "preservacion", false],
      ["Fertilidad masculina", "treatment", null, true],
      ["Donación (óvulos / embriones)", "treatment", "ovodonacion", false],
      ["Ya estoy en tratamiento", "treatment", null, false],
      ["Tras un intento fallido", "treatment", null, false],
      ["Solo quiero entender", "unsure", null, false],
    ]);
  });
  it("preselects the mapped treatment, replaces it when the answer changes, and never overrides the person's own choice", () => {
    expect(pickReason({}, "preservar")).toEqual({ reason: "preservar", treatment: "preservacion", treatmentFromReason: true });
    expect(pickReason({ treatment: "preservacion", treatmentFromReason: true }, "donacion")).toEqual({ reason: "donacion", treatment: "ovodonacion", treatmentFromReason: true });
    expect(pickReason({ treatment: "preservacion", treatmentFromReason: true }, "entender")).toEqual({ reason: "entender", treatment: undefined, treatmentFromReason: false });
    expect(pickReason({ treatment: "fiv", treatmentFromReason: false }, "donacion")).toEqual({ reason: "donacion" });
  });
  it("answers saved by the previous version carry over", () => {
    expect(migrateBasics({ residence: "ES", stage: "entendiendo" }, 1)).toEqual({ residence: "ES", reason: "entender" });
    expect(migrateBasics({ stage: "masculina" }, 1)).toEqual({ reason: "masculina" });
  });
});

describe("male focus puts the existing male content first", () => {
  it("is on for a man or for male fertility", () => {
    expect(maleFocus({ who: "hombre" })).toBe(true);
    expect(maleFocus({ who: "pareja", reason: "masculina" })).toBe(true);
    expect(maleFocus({ who: "mujer", reason: "embarazo" })).toBe(false);
  });
  it("never shows the woman's-age figures for a man", () => {
    expect(ageForGuide(treatmentById("fiv")!, { who: "hombre", age: "35-37" })).toBeNull();
    expect(ageForGuide(treatmentById("fiv")!, { who: "pareja", age: "35-37" })).not.toBeNull();
  });
  it("'Entender' with no treatment opens the male-fertility page", () => {
    useBasics.setState({ who: "hombre" });
    at("/empezar/que-necesitas", <WhatYouNeed />);
    expect(screen.getByTestId("door-understand").getAttribute("href")).toBe("/guia/fertilidad-masculina");
  });
  it("in the IVF guide the male block comes before 'Qué es' and the age block is left out", () => {
    useBasics.setState({ who: "hombre", residence: "ES", age: "35-37" });
    at("/guia/fiv", <GuideV2 />, "/guia/:tratamiento");
    const male = screen.getByTestId("guide-male");
    expect(male.compareDocumentPosition(screen.getByTestId("guide-what")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByTestId("guide-age")).toBeNull();
  });
  it("the male-fertility page says the guide is 'en preparación' and shows what exists", () => {
    useBasics.setState({ residence: "ES", reason: "masculina" });
    at("/guia/fertilidad-masculina", <GuideV2 />, "/guia/:tratamiento");
    expect(screen.getByText(/La guía de fertilidad masculina todavía no está escrita/)).toBeTruthy();
    expect(screen.getByText(/seminograma/)).toBeTruthy();
    expect(screen.getByText("La ICSI solo aporta cuando hay factor masculino")).toBeTruthy();
  });
  it("Prepare's first consultation puts the male content first", () => {
    useBasics.setState({ who: "hombre" });
    at("/tu-tratamiento?paso=consulta", <PrepareV2 />);
    expect(screen.getByTestId("prepare-male")).toBeTruthy();
  });
});

describe("no gendered forms in the journey copy", () => {
  // Wording given verbatim in the brief; everything else must stay gender-neutral.
  const ALLOWED = ["Para nosotros, en pareja", "Para alguien cercano", "quedarme embarazada", "gente cercana", "Tu enlace está listo"];
  const GENDERED = /\b(amig[ao]s?|bienvenid[ao]s?|interesad[ao]s?|preparad[ao]s?|informad[ao]s?|segur[ao]s?|list[ao]s?|cansad[ao]s?|perdid[ao]s?|agobiad[ao]s?|tranquil[ao]s?|nervios[ao]s?|decidid[ao]s?|embarazad[ao]s?|cercan[ao]s?|nosotr[ao]s|vosotr[ao]s|ell[ao]s|tod[ao]s|sol[ao]s? (?:o|y|con|ante)|girlfriends?|ladies|guys)\b/i;
  const root = process.cwd();
  const files = [
    ...readdirSync(join(root, "src/pages/v2")).map((f) => `src/pages/v2/${f}`),
    ...readdirSync(join(root, "src/modules/journey-v2")).map((f) => `src/modules/journey-v2/${f}`),
    "src/modules/access/AuthConfirm.tsx",
  ].filter((f) => /\.tsx?$/.test(f) && !/\.test\./.test(f));
  it("covers every journey file", () => expect(files.length).toBeGreaterThan(10));
  it.each(files)("%s", (f) => {
    let text = readFileSync(join(root, f), "utf8");
    for (const a of ALLOWED) text = text.split(a).join("");
    const hit = text.split("\n").find((line) => GENDERED.test(line));
    expect(hit, hit).toBeUndefined();
  });
  it("catches a gendered form if one is added", () => {
    expect(GENDERED.test("hablas con amigas")).toBe(true);
    expect(GENDERED.test("¿Estás preparada?")).toBe(true);
  });
});
