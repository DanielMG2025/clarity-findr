import { describe, expect, it, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
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

describe("landing two-door fork", () => {
  it("routes Discover to /descubre and Check your case to /situacion, demo to /demo", () => {
    renderLanding();
    const explore = screen.getAllByRole("link", { name: /^Discover/ });
    const study = screen.getAllByRole("link", { name: /^Check your case/ });
    expect(explore[0].getAttribute("href")).toBe("/descubre");
    expect(study[0].getAttribute("href")).toBe("/situacion");
    expect(screen.getByRole("link", { name: /Example cases/ }).getAttribute("href")).toBe("/demo");
  });

  it("hot this week shows only week-period topics", () => {
    renderLanding();
    expect(screen.getByText("Beta wait?")).toBeTruthy();
    expect(screen.queryByText("Old topic")).toBeNull();
  });

  it("renders Spanish doors when Spanish is chosen", () => {
    localStorage.setItem(LANGUAGE_KEY, "es");
    renderLanding();
    expect(screen.getAllByRole("link", { name: /^Descubre/ })[0].getAttribute("href")).toBe("/descubre");
    expect(screen.getAllByRole("link", { name: /^Estudia tu caso/ })[0].getAttribute("href")).toBe("/situacion");
    expect(screen.getByText("¿Espera beta?")).toBeTruthy();
  });
});
