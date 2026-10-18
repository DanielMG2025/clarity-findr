import { describe, expect, it, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "./LanguageContext";
import { initialLanguage, LANGUAGE_KEY, translate } from "./translate";

afterEach(() => { cleanup(); localStorage.clear(); });
describe("language selection", () => {
  it("defaults to English when no choice exists", () => {
    localStorage.clear();
    expect(initialLanguage()).toBe("en");
  });
  it("restores Spanish from localStorage", () => {
    localStorage.setItem(LANGUAGE_KEY, "es");
    expect(initialLanguage()).toBe("es");
  });
  it("updates html lang and persists Spanish", () => {
    function Pick() {
      const { setLanguage } = useLanguage();
      return <button onClick={() => setLanguage("es")}>ES</button>;
    }
    render(<LanguageProvider><Pick /></LanguageProvider>);
    fireEvent.click(screen.getByText("ES"));
    expect(document.documentElement.lang).toBe("es");
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe("es");
  });
  it("can return to English and remember that choice", () => {
    localStorage.setItem(LANGUAGE_KEY, "es");
    function PickEnglish() {
      const { setLanguage } = useLanguage();
      return <button onClick={() => setLanguage("en")}>EN</button>;
    }
    render(<LanguageProvider><PickEnglish /></LanguageProvider>);
    fireEvent.click(screen.getByText("EN"));
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe("en");
  });
  it("never translates brand or source figures", () => {
    expect(translate("Fertility Compass", "es")).toBe("Fertility Compass");
    expect(translate("€4,500–€7,000", "es")).toBe("€4,500–€7,000");
  });
});