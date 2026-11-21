import { describe, expect, it, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { LANGUAGE_KEY } from "@/i18n/translate";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FEATURES } from "@/config/features";

// Charts on the costs page measure themselves.
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;

vi.mock("@/integrations/supabase/client", () => {
  const chain: Record<string, unknown> = {};
  for (const m of ["select", "eq", "order", "limit", "in"]) chain[m] = () => chain;
  chain.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(ok);
  return { supabase: { from: () => chain, rpc: () => Promise.resolve({ data: null, error: null }), auth: { getSession: () => Promise.resolve({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } } };
});

import Basics from "./Basics";
import GuideV2 from "./GuideV2";
import PrepareV2 from "./PrepareV2";
import Clinics from "@/pages/Clinics";
import PricingLab from "@/pages/PricingLab";
import { useBasics } from "@/modules/journey-v2/basics";
import { useMasterRecord } from "@/modules/master-record";
import { bindAnswers } from "@/modules/journey-v2/answers";

function at(path: string, routes: Record<string, React.ReactNode>) {
  return render(
    <QueryClientProvider client={new QueryClient()}><LanguageProvider><TooltipProvider><MemoryRouter initialEntries={[path]}>
      <Routes>{Object.entries(routes).map(([p, el]) => <Route key={p} path={p} element={el} />)}</Routes>
    </MemoryRouter></TooltipProvider></LanguageProvider></QueryClientProvider>,
  );
}
const ANSWERED = { who: "mujer", age: "35-37", reason: "embarazo", residence: "ES", destination: "same", treatment: "fiv" } as const;

let unbind = () => {};
beforeEach(() => { localStorage.setItem(LANGUAGE_KEY, "es"); useBasics.getState().reset(); useMasterRecord.getState().reset(); FEATURES.recorridoV2 = true; unbind = bindAnswers(); });
afterEach(() => { unbind(); cleanup(); localStorage.clear(); FEATURES.recorridoV2 = false; });

describe("nothing already answered is asked again", () => {
  it("Preparar: with answers, the confirmable summary comes first, one line per answer", () => {
    useBasics.setState(ANSWERED);
    at("/tu-tratamiento", { "/tu-tratamiento": <PrepareV2 /> });
    const box = screen.getByTestId("answers-summary");
    expect(within(box).getByText("Esto es lo que nos has contado")).toBeTruthy();
    for (const k of ["who", "age", "reason", "residence", "destination", "treatment"]) expect(within(box).getByTestId(`answer-${k}`)).toBeTruthy();
    expect(within(box).getByTestId("answer-residence").textContent).toMatch(/España/);
    expect(screen.queryByText("Datos básicos")).toBeNull();
  });
  it("Preparar: after «Sí, seguir», «Datos básicos» no longer asks country or treatment", () => {
    useBasics.setState(ANSWERED);
    at("/tu-tratamiento", { "/tu-tratamiento": <PrepareV2 /> });
    fireEvent.click(screen.getByTestId("answers-confirm"));
    expect(screen.queryByTestId("answers-summary")).toBeNull();
    expect(screen.queryByText("País de residencia")).toBeNull();
    expect(screen.queryByText("Tratamiento de interés")).toBeNull();
    expect(screen.queryByTestId("missing-answers")).toBeNull();
    expect(screen.getByTestId("prepare-from-basics").textContent).toMatch(/España · FIV/);
  });
  it("Preparar without answers: no summary, and only the country is asked (once)", () => {
    at("/tu-tratamiento", { "/tu-tratamiento": <PrepareV2 /> });
    expect(screen.queryByTestId("answers-summary")).toBeNull();
    expect(screen.getByTestId("missing-answers")).toBeTruthy();
    expect(screen.queryByText("País de residencia")).toBeNull();
    expect(screen.queryByTestId("missing-age-35-37")).toBeNull();
  });
  it("«lo básico» with answers opens on the summary, not on question 1", () => {
    useBasics.setState(ANSWERED);
    at("/empezar/lo-basico", { "/empezar/lo-basico": <Basics /> });
    expect(screen.getByTestId("answers-summary")).toBeTruthy();
    expect(screen.queryByText("¿Para quién buscas información?")).toBeNull();
  });
  it("«lo básico» partly answered resumes at the first missing question", () => {
    useBasics.setState({ who: "pareja", age: "30-34" });
    at("/empezar/lo-basico", { "/empezar/lo-basico": <Basics /> });
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("¿Qué te trae aquí?");
  });
  it("guide, clinics and costs with the answers given: no inline questions", () => {
    useBasics.setState(ANSWERED);
    at("/guia/fiv", { "/guia/:tratamiento": <GuideV2 /> });
    expect(screen.queryByTestId("missing-answers")).toBeNull();
    cleanup();
    at("/clinicas", { "/clinicas": <Clinics /> });
    expect(screen.queryByTestId("missing-answers")).toBeNull();
    cleanup();
    at("/costes", { "/costes": <PricingLab /> });
    expect(screen.queryByTestId("missing-answers")).toBeNull();
  });
  it("clinics and costs reached directly: only country and age band, inline", () => {
    at("/clinicas", { "/clinicas": <Clinics /> });
    const box = screen.getByTestId("missing-answers");
    expect(within(box).getByTestId("missing-country-ES")).toBeTruthy();
    expect(within(box).getByTestId("missing-age-35-37")).toBeTruthy();
    expect(screen.queryByText("¿Para quién buscas información?")).toBeNull();
    fireEvent.click(screen.getByTestId("missing-country-ES"));
    fireEvent.click(screen.getByTestId("missing-age-38-40"));
    expect(screen.queryByTestId("missing-answers")).toBeNull();
    expect(useMasterRecord.getState().identity.country_of_residence).toBe("ES");
    cleanup();
    at("/costes", { "/costes": <PricingLab /> });
    expect(screen.queryByTestId("missing-answers")).toBeNull();
  });
});

describe("«cambiar» opens only that question and comes back", () => {
  it("from Preparar: change the age, save, and land back on Preparar with the new value", () => {
    useBasics.setState(ANSWERED);
    at("/tu-tratamiento", { "/tu-tratamiento": <PrepareV2 />, "/empezar/lo-basico": <Basics /> });
    fireEvent.click(screen.getByTestId("answers-edit"));
    const link = screen.getByTestId("change-age");
    expect(link.getAttribute("href")).toBe("/empezar/lo-basico?paso=2&solo=1&volver=%2Ftu-tratamiento");
    fireEvent.click(link);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("¿Qué edad tiene la persona que se trataría?");
    expect(screen.queryByText(/Lo básico · \d\/5/)).toBeNull();
    expect(screen.queryByTestId("basics-next")).toBeNull();
    fireEvent.click(screen.getByTestId("age-41-42"));
    fireEvent.click(screen.getByTestId("basics-save-return"));
    expect(screen.getByTestId("answers-summary")).toBeTruthy();
    expect(screen.getByTestId("answer-age").textContent).toMatch(/41–42 años/);
    expect(useBasics.getState()).toMatchObject({ ...ANSWERED, age: "41-42" });
  });
  it("guide header: «[Tratamiento] · [país] · [edad] · [situación] · cambiar», each part opening its own question", () => {
    useBasics.setState(ANSWERED);
    at("/guia/fiv", { "/guia/:tratamiento": <GuideV2 /> });
    const bar = screen.getByTestId("guide-casebar");
    expect(bar.textContent).toBe("FIV · para España · 35–37 años · Busco un embarazo con ayuda de un tratamiento · cambiar");
    expect(within(bar).getByRole("link", { name: "35–37 años" }).getAttribute("href")).toBe("/empezar/lo-basico?paso=2&solo=1&volver=%2Fguia%2Ffiv");
    expect(within(bar).getByRole("link", { name: "para España" }).getAttribute("href")).toBe("/empezar/lo-basico?paso=4&solo=1&volver=%2Fguia%2Ffiv");
    expect(within(bar).getByTestId("guide-casebar-change").getAttribute("href")).toBe("/empezar/lo-basico?volver=%2Fguia%2Ffiv");
  });
  it("«Empezar de cero» in «lo básico» clears every answer", () => {
    useBasics.setState(ANSWERED);
    useMasterRecord.getState().patchClinical({ amh: 2 });
    at("/empezar/lo-basico", { "/empezar/lo-basico": <Basics /> });
    fireEvent.click(screen.getByTestId("basics-start-over"));
    fireEvent.click(screen.getByTestId("basics-start-over-confirm"));
    expect(useBasics.getState().residence).toBeUndefined();
    expect(useMasterRecord.getState().clinical.amh).toBeUndefined();
    expect(screen.getByText("¿Para quién buscas información?")).toBeTruthy();
  });
});
