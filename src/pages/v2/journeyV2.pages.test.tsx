import { describe, expect, it, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { LANGUAGE_KEY } from "@/i18n/translate";

vi.mock("@/integrations/supabase/client", () => {
  const chain: Record<string, unknown> = {};
  for (const m of ["select", "eq", "order", "limit", "in"]) chain[m] = () => chain;
  chain.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(ok);
  return { supabase: { from: () => chain, rpc: () => Promise.resolve({ data: null, error: null }), auth: { getSession: () => Promise.resolve({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } } };
});

import LandingV2 from "./LandingV2";
import HowItWorks from "./HowItWorks";
import WhatYouNeed from "./WhatYouNeed";
import GuideV2 from "./GuideV2";
import PrepareV2 from "./PrepareV2";
import { useBasics } from "@/modules/journey-v2/basics";

function at(path: string, el: React.ReactNode, pattern = "*") {
  return render(
    <QueryClientProvider client={new QueryClient()}><LanguageProvider><MemoryRouter initialEntries={[path]}>
      <Routes><Route path={pattern} element={el} /></Routes>
    </MemoryRouter></LanguageProvider></QueryClientProvider>,
  );
}

beforeEach(() => { localStorage.setItem(LANGUAGE_KEY, "es"); useBasics.setState({ residence: undefined, destination: undefined, age: undefined, stage: undefined, treatment: undefined }); });
afterEach(() => { cleanup(); localStorage.clear(); });

describe("v2 landing and start", () => {
  it("landing: approved title and paragraph, one Start button to /empezar, no-account micro-copy", () => {
    at("/", <LandingV2 />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Entiende y prepara tu tratamiento de fertilidad, sin perder meses.");
    expect(screen.getByText(/^Fertility Compass reúne, de forma independiente, lo que normalmente tardarías meses en juntar/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Empezar/ }).getAttribute("href")).toBe("/empezar");
    expect(screen.getByText("Sin cuenta. Tus respuestas se quedan en tu navegador.")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Qué encontrarás/ })).toBeTruthy();
  });
  it("how it works: trust line, 'Empezar por ti' to the basics, skip to the library", () => {
    at("/empezar", <HowItWorks />);
    expect(screen.getByText("Somos independientes: no hay posiciones pagadas, y de cada clínica te decimos qué hemos podido comprobar.")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Empezar por ti/ }).getAttribute("href")).toBe("/empezar/lo-basico");
    expect(screen.getByRole("link", { name: /Saltar e ir a las guías/ }).getAttribute("href")).toBe("/biblioteca");
  });
  it("what you need: Understand opens the chosen guide, or the library when none was chosen", () => {
    at("/empezar/que-necesitas", <WhatYouNeed />);
    expect(screen.getByRole("link", { name: /Entender/ }).getAttribute("href")).toBe("/biblioteca");
    cleanup();
    useBasics.setState({ treatment: "ovodonacion" });
    at("/empezar/que-necesitas", <WhatYouNeed />);
    expect(screen.getByRole("link", { name: /Entender/ }).getAttribute("href")).toBe("/guia/ovodonacion");
    expect(screen.getByRole("link", { name: /Preparar mi tratamiento/ }).getAttribute("href")).toBe("/tu-tratamiento");
  });
});

describe("v2 guide", () => {
  it("without a country: clear notice with a button to choose it", () => {
    at("/guia/fiv", <GuideV2 />, "/guia/:tratamiento");
    expect(screen.getByTestId("no-country-notice")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Elegir mi país" }).getAttribute("href")).toBe("/empezar/lo-basico?volver=%2Fguia%2Ffiv");
  });
  it("Spain, 35–37: shows the Spanish price range with its source and the HFEA age row labelled as UK data", () => {
    useBasics.setState({ residence: "ES", age: "35-37", stage: "entendiendo" });
    at("/guia/fiv", <GuideV2 />, "/guia/:tratamiento");
    expect(screen.queryByTestId("no-country-notice")).toBeNull();
    expect(screen.getByTestId("guide-price").textContent).toMatch(/4\.?000\s€\s–\s6\.?000\s€/);
    expect(screen.getByTestId("guide-age").textContent).toMatch(/Reino Unido/);
    expect(screen.getByTestId("guide-casebar").textContent).toMatch(/FIV · para España · 35–37 años · Empezando a entender/);
  });
  it("no sourced price for the country: the price block says so instead of inventing one", () => {
    useBasics.setState({ residence: "UK" });
    at("/guia/fiv", <GuideV2 />, "/guia/:tratamiento");
    expect(screen.getByTestId("guide-price").textContent).toMatch(/Aún no tenemos un precio de referencia con fuente/);
  });
  it("insemination has no age block (no sourced content for it)", () => {
    useBasics.setState({ residence: "ES", age: "35-37" });
    at("/guia/inseminacion", <GuideV2 />, "/guia/:tratamiento");
    expect(screen.queryByTestId("guide-age")).toBeNull();
  });
  it("embryo adoption: 'en preparación' and treatment buttons that open guides", () => {
    useBasics.setState({ residence: "ES" });
    at("/guia/adopcion-embriones", <GuideV2 />, "/guia/:tratamiento");
    expect(screen.getByText(/todavía no está escrita/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "FIV" }).getAttribute("href")).toBe("/guia/fiv");
  });
  it("an unknown treatment never dead-ends: it lists every guide", () => {
    at("/guia/xyz", <GuideV2 />, "/guia/:tratamiento");
    expect(screen.getByTestId("guide-unknown")).toBeTruthy();
    expect(screen.getAllByRole("link").every((a) => a.getAttribute("href")?.startsWith("/guia/"))).toBe(true);
  });
});

describe("v2 prepare", () => {
  it("starts with 'Cuéntanos un poco más', each existing question block says what it is for", () => {
    at("/tu-tratamiento", <PrepareV2 />);
    expect(screen.getByText("Si nos cuentas un poco más, te podemos ofrecer información más enfocada. Cuanto más nos cuentes, más personal.")).toBeTruthy();
    for (const k of ["basic", "medical", "history", "preferences", "documents", "quotes"]) expect(screen.getByTestId(`purpose-${k}`)).toBeTruthy();
  });
  it("steps are skippable in order and end in the report with an optional account", () => {
    at("/tu-tratamiento?paso=clinica", <PrepareV2 />);
    for (const id of ["prepare-clinica", "prepare-financiacion", "prepare-viaje", "prepare-despues", "prepare-consulta", "prepare-informe"]) {
      expect(screen.getByTestId(id)).toBeTruthy();
      const skip = screen.queryByTestId("prepare-skip");
      if (skip) fireEvent.click(skip);
    }
    expect(screen.getByTestId("create-account").getAttribute("href")).toBe("/cuenta");
  });
});
