import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { it } from "vitest";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { BasicsSection } from "@/modules/content/BasicsSection";
import LearnArticle from "@/pages/LearnArticle";
import Descubre from "@/pages/Descubre";
it("renders spanish", () => {
  localStorage.setItem("fertility-compass-language", "es");
  const { container } = render(<LanguageProvider><MemoryRouter><BasicsSection /></MemoryRouter></LanguageProvider>);
  console.log("BASICS:", container.textContent?.slice(0, 1200));
  const r2 = render(<LanguageProvider><MemoryRouter initialEntries={["/aprende/how-egg-freezing-is-paid"]}><Routes><Route path="/aprende/:slug" element={<LearnArticle />} /></Routes></MemoryRouter></LanguageProvider>);
  console.log("ARTICLE:", r2.container.textContent?.slice(0, 2500));
  const r3 = render(<QueryClientProvider client={new QueryClient()}><LanguageProvider><MemoryRouter><Descubre /></MemoryRouter></LanguageProvider></QueryClientProvider>);
  const txt = r3.container.textContent ?? "";
  const i = txt.indexOf("Biblioteca"); console.log("DESCUBRE-LIB:", txt.slice(i, i + 1500));
  const j = txt.indexOf("Voces"); console.log("DESCUBRE-VOCES:", txt.slice(j, j + 1500));
});
