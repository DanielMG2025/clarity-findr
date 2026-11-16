import { describe, expect, it, afterEach, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { LANGUAGE_KEY } from "@/i18n/translate";

vi.mock("@/modules/content/conversation", () => ({
  usePublishedTopics: () => [
    { id: "w1", period: "week", source_platform: "RAO", source_forum: "RAO", question_en: "Beta wait?", question_es: "¿Espera beta?" },
    { id: "m1", period: "3m", source_platform: "Mumsnet", source_forum: "Mumsnet", question_en: "Old topic", question_es: "Tema antiguo" },
  ],
}));

import Landing from "./Landing";

const renderLanding = () =>
  render(<LanguageProvider><MemoryRouter><Landing /></MemoryRouter></LanguageProvider>);

afterEach(() => { cleanup(); localStorage.clear(); });

describe("landing: Discover + Prepare", () => {
  it("routes Discover to /descubre, Prepare's case CTA to /situacion, demo to /demo", () => {
    renderLanding();
    expect(screen.getByRole("link", { name: /^Go to Discover/ }).getAttribute("href")).toBe("/descubre");
    expect(screen.getByRole("link", { name: /^Check your case/ }).getAttribute("href")).toBe("/situacion");
    expect(screen.getByRole("link", { name: /Example cases/ }).getAttribute("href")).toBe("/demo");
  });

  it("hot this week shows only week-period topics", () => {
    renderLanding();
    expect(screen.getByText("Beta wait?")).toBeTruthy();
    expect(screen.queryByText("Old topic")).toBeNull();
  });

  it("opens in Spanish with the benefit headline and the approved supporting line verbatim", () => {
    localStorage.setItem(LANGUAGE_KEY, "es");
    renderLanding();
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.textContent).toBe("Entiende y prepara tu tratamiento de fertilidad,sin perder meses.");
    expect(
      screen.getByText(
        "Fertility Compass reúne en un sitio, de forma independiente, lo que normalmente te llevaría meses: precios reales comparables por país, qué permite la ley de cada sitio, qué dice la ciencia y lo que se cuenta en foros y comunidades — cada dato con su fuente y su fecha. Y luego te ayuda a dar el paso: encontrar la clínica que encaja, la financiación, el viaje y la recuperación.",
      ),
    ).toBeTruthy();
  });

  it("keeps the 'from uncertainty to clarity' frame, but not as the first headline", () => {
    localStorage.setItem(LANGUAGE_KEY, "es");
    renderLanding();
    expect(screen.getByRole("heading", { level: 1 }).textContent).not.toMatch(/incertidumbre/);
    expect(screen.getByRole("heading", { level: 2, name: /De la incertidumbre a la claridad/ })).toBeTruthy();
  });

  it("Descubre and Prepara list the agreed items; unbuilt Prepara items are not links", () => {
    localStorage.setItem(LANGUAGE_KEY, "es");
    renderLanding();
    const discover = screen.getByRole("region", { name: "Descubre" });
    const d = within(discover);
    expect(d.getByRole("link", { name: "Píldoras" }).getAttribute("href")).toBe("/descubre#pildoras");
    expect(d.getByRole("link", { name: "Voces de confianza" }).getAttribute("href")).toBe("/descubre#voces");
    expect(d.getByRole("link", { name: "Evidencia científica" }).getAttribute("href")).toBe("/descubre#evidencia");
    expect(d.getByRole("link", { name: "Regulación por país" }).getAttribute("href")).toBe("/descubre/regulacion");
    expect(d.getByRole("link", { name: "Precios de referencia" }).getAttribute("href")).toBe("/costes");
    expect(d.getByRole("link", { name: "La conversación de los foros" }).getAttribute("href")).toBe("/descubre#conversacion");

    const p = within(screen.getByRole("region", { name: "Prepara" }));
    expect(p.getByRole("link", { name: "Encontrar la clínica que encaja" }).getAttribute("href")).toBe("/situacion");
    expect(p.getByRole("link", { name: /^Estudia tu caso/ }).getAttribute("href")).toBe("/situacion");
    for (const label of ["Financiación", "Viaje", "Recuperación"]) {
      expect(p.queryByRole("link", { name: new RegExp(label) })).toBeNull();
      expect(p.getByText(label)).toBeTruthy();
    }
  });

  it("keeps the 'no sustituye consulta médica' notice", () => {
    localStorage.setItem(LANGUAGE_KEY, "es");
    renderLanding();
    expect(screen.getAllByText(/No sustituye una consulta médica/).length).toBeGreaterThan(0);
  });
});
